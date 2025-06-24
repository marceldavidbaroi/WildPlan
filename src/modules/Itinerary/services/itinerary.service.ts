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

import type {
  TripDayItinerary,
  ItineraryEvent,
  ServiceResponse,
  NewItineraryEvent,
} from '../store/types';

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
export async function addItineraryEvent(
  tripId: string,
  date: string,
  newEventData?: NewItineraryEvent,
): Promise<ServiceResponse<void>> {
  try {
    const dayDocRef = getItineraryDayDocRef(tripId, date);
    const dayDocSnap = await getDoc(dayDocRef);

    // 🚫 Exit early if the itinerary day already exists
    if (dayDocSnap.exists()) {
      return {
        success: false,
        message: 'Itinerary day already exists. Skipping creation.',
      };
    }

    const now = Timestamp.now();

    // 🔄 Prepare base day doc
    const newDayItinerary: Omit<TripDayItinerary, 'id'> = {
      tripId,
      date,
      events: [],
      dailyNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(dayDocRef, newDayItinerary);

    // ✅ Optionally add event if provided
    if (newEventData) {
      const newEventId = doc(collection(db, 'tempCollectionForId')).id;
      const fullNewEvent: ItineraryEvent = {
        ...newEventData,
        id: newEventId,
        isCompleted: false,
        createdAt: now.toMillis(),
        updatedAt: now.toMillis(),
      };

      await updateDoc(dayDocRef, {
        events: arrayUnion(fullNewEvent),
      });
    }
    return {
      success: true,
      message: 'Itinerary day created successfully!',
    };
  } catch (error: unknown) {
    return handleServiceError<void>('addItineraryEvent', error);
  }
}

/**
 * Updates an existing itinerary event for a specific trip and date.
 * Requires the ID of the event to be updated.
 *
 * @param tripId The ID of the trip.
 * @param date The date string (e.g., 'YYYY-MM-DD') of the event.
 * @param eventId The unique ID of the itinerary event to be updated.
 * @param updates An object containing the fields to update for the event.
 * @returns A ServiceResponse indicating success or failure.
 */
export async function updateItineraryEvent(
  tripId: string,
  date: string,
  eventId: string,
  updates: ItineraryEvent, // Uses the new update payload type
): Promise<ServiceResponse<void>> {
  try {
    const dayDocRef = getItineraryDayDocRef(tripId, date);
    const dayDocSnap = await getDoc(dayDocRef);

    if (!dayDocSnap.exists()) {
      // If the itinerary day doesn't exist, we can't update an event within it.
      return { success: false, message: 'Itinerary day not found.' };
    }

    const existingDay = dayDocSnap.data() as TripDayItinerary;
    const eventIndex = existingDay.events.findIndex((e) => e.id === eventId);

    if (eventIndex === -1) {
      // If the event with the given ID is not found within the day's events.
      return { success: false, message: 'Itinerary event not found within the specified day.' };
    }

    // Create the updated event object by merging existing data with new updates
    const existingEvent = existingDay.events[eventIndex];
    const updatedEvent: ItineraryEvent = {
      ...existingEvent,
      ...updates, // Apply the partial updates
      updatedAt: serverTimestamp(), // Always update the timestamp on modification
    };

    // Create a new array of events with the updated event at its position
    const updatedEventsArray = [...existingDay.events];
    updatedEventsArray[eventIndex] = updatedEvent;

    // Update the Firestore document with the modified events array
    await updateDoc(dayDocRef, {
      events: updatedEventsArray,
      updatedAt: serverTimestamp(), // Update the day's last update timestamp
    });

    return {
      success: true,
      message: 'Itinerary event updated successfully!',
    };
  } catch (error: unknown) {
    return handleServiceError<void>('updateItineraryEvent', error);
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
