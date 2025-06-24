/**
 * Service functions for managing Itinerary data in Firestore.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  FirestoreError,
  orderBy,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

import type { TripDayItinerary, ItineraryEvent, ServiceResponse } from '../store/types';

/**
 * Helper for consistent error handling across service functions.
 */
function handleServiceError<T>(functionName: string, error: unknown): ServiceResponse<T> {
  console.error(`[ItineraryService.${functionName}] Error:`, error);
  let errorMessage = `Failed to ${functionName.replace('fetch', 'load').replace('Itinerary', 'itinerary')}. Please try again.`;
  let errorCode: string | undefined;
  let errorDetails: string | undefined;

  if (error instanceof FirestoreError) {
    errorMessage = `Firestore Error: ${error.message}`;
    errorCode = error.code;
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. You are not authorized to perform this action.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Network issue. Please check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Document not found.';
    }
    errorDetails = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.message;
  } else {
    errorDetails = String(error);
  }

  return {
    success: false,
    data: undefined,
    message: errorMessage,
    errorCode: errorCode,
    errorDetails: errorDetails,
  };
}

/**
 * Gets a reference to the 'itinerary' subcollection for a specific trip.
 */
const getItineraryCollectionRef = (tripId: string) => {
  return collection(db, 'trips', tripId, 'itinerary');
};

/**
 * Gets a DocumentReference for a specific day's itinerary document within a trip.
 */
const getItineraryDayDocRef = (tripId: string, date: string) => {
  return doc(getItineraryCollectionRef(tripId), date);
};

/**
 * Fetches all itinerary days for a given trip, ordered by date.
 */
export async function fetchItineraryDaysForTrip(
  tripId: string,
): Promise<ServiceResponse<TripDayItinerary[]>> {
  try {
    const q = query(getItineraryCollectionRef(tripId), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);

    const itineraryDays: TripDayItinerary[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toMillis()
          : data.createdAt || Date.now();
      const updatedAt =
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toMillis()
          : data.updatedAt || Date.now();

      return {
        id: docSnap.id,
        ...data,
        createdAt,
        updatedAt,
      } as TripDayItinerary;
    });

    return {
      success: true,
      data: itineraryDays,
      message: 'Itinerary days fetched successfully.',
    };
  } catch (error: unknown) {
    return handleServiceError<TripDayItinerary[]>('fetchItineraryDaysForTrip', error);
  }
}

/**
 * Adds a new event or updates an existing event within a specific day's itinerary.
 * If the day's itinerary document does not exist, it will be created.
 */
export async function addOrUpdateItineraryEvent(
  tripId: string,
  date: string,
  event: ItineraryEvent,
): Promise<ServiceResponse<void>> {
  try {
    const dayDocRef = getItineraryDayDocRef(tripId, date);
    const dayDocSnap = await getDoc(dayDocRef);

    if (dayDocSnap.exists()) {
      const existingDay = dayDocSnap.data() as TripDayItinerary;
      const eventIndex = existingDay.events.findIndex((e) => e.id === event.id);

      const updatedEvent = {
        ...event,
        updatedAt: serverTimestamp(),
      };

      if (eventIndex > -1) {
        const updatedEvents = [...existingDay.events];
        updatedEvents[eventIndex] = updatedEvent;
        await updateDoc(dayDocRef, { events: updatedEvents, updatedAt: serverTimestamp() });
      } else {
        const newEvent = {
          ...event,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await updateDoc(dayDocRef, { events: arrayUnion(newEvent), updatedAt: serverTimestamp() });
      }
    } else {
      const newEventWithTimestamps = {
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const newDayItinerary: Omit<TripDayItinerary, 'id'> = {
        tripId: tripId,
        date: date,
        events: [newEventWithTimestamps as ItineraryEvent],
        dailyNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(dayDocRef, newDayItinerary);
    }

    return {
      success: true,
      message: event.id
        ? 'Itinerary event updated successfully!'
        : 'Itinerary event added successfully!',
    };
  } catch (error: unknown) {
    return handleServiceError<void>('addOrUpdateItineraryEvent', error);
  }
}

/**
 * Deletes a specific event from a specific day's itinerary.
 */
export async function deleteItineraryEvent(
  tripId: string,
  date: string,
  eventToDelete: ItineraryEvent,
): Promise<ServiceResponse<void>> {
  try {
    const dayDocRef = getItineraryDayDocRef(tripId, date);

    await updateDoc(dayDocRef, {
      events: arrayRemove(eventToDelete),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Itinerary event deleted successfully!',
    };
  } catch (error: unknown) {
    return handleServiceError<void>('deleteItineraryEvent', error);
  }
}

/**
 * Updates the daily notes for a specific day's itinerary.
 * If the day's itinerary document does not exist, it will be created with just notes.
 */
export async function updateItineraryDayNotes(
  tripId: string,
  date: string,
  notes: string,
): Promise<ServiceResponse<void>> {
  try {
    const dayDocRef = getItineraryDayDocRef(tripId, date);
    const dayDocSnap = await getDoc(dayDocRef);

    if (dayDocSnap.exists()) {
      await updateDoc(dayDocRef, {
        dailyNotes: notes,
        updatedAt: serverTimestamp(),
      });
    } else {
      const newDayItinerary: Omit<TripDayItinerary, 'id'> = {
        tripId: tripId,
        date: date,
        events: [],
        dailyNotes: notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(dayDocRef, newDayItinerary);
    }

    return {
      success: true,
      message: 'Daily notes updated successfully!',
    };
  } catch (error: unknown) {
    return handleServiceError<void>('updateItineraryDayNotes', error);
  }
}

/**
 * Fetches a single itinerary day document by its date.
 */
export async function fetchItineraryDay(
  tripId: string,
  date: string,
): Promise<ServiceResponse<TripDayItinerary>> {
  try {
    const dayDocRef = getItineraryDayDocRef(tripId, date);
    const snap = await getDoc(dayDocRef);

    if (!snap.exists()) {
      return {
        success: false,
        data: undefined,
        message: 'Itinerary day not found',
        errorCode: 'NOT_FOUND',
      };
    }

    const data = snap.data();
    const createdAt =
      data?.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : data?.createdAt || Date.now();
    const updatedAt =
      data?.updatedAt instanceof Timestamp
        ? data.updatedAt.toMillis()
        : data?.updatedAt || Date.now();

    const itineraryDay: TripDayItinerary = {
      id: snap.id,
      ...data,
      createdAt,
      updatedAt,
    } as TripDayItinerary;

    return {
      success: true,
      data: itineraryDay,
      message: 'Itinerary day fetched successfully',
    };
  } catch (error: unknown) {
    return handleServiceError<TripDayItinerary>('fetchItineraryDay', error);
  }
}
