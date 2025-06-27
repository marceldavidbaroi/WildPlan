/**
 * Service functions for managing itinerary data in Firestore.
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
  Timestamp,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

import type {
  TripDayItinerary,
  ItineraryEvent,
  ServiceResponse,
  NewItineraryEvent,
} from '../store/types';

// 🔧 Centralized error handling
function handleError<T>(functionName: string, error: unknown): ServiceResponse<T> {
  console.error(`[ItineraryService.${functionName}] Error:`, error);
  let message = `Failed to ${functionName}. Please try again.`;
  let errorCode: string | undefined;
  let errorDetails: string | undefined;

  if (error instanceof FirestoreError) {
    message = `Firestore Error: ${error.message}`;
    errorCode = error.code;
    if (error.code === 'permission-denied') message = 'Permission denied.';
    else if (error.code === 'unavailable') message = 'Network issue.';
    else if (error.code === 'not-found') message = 'Document not found.';
    errorDetails = error.message;
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = error.message;
  } else {
    errorDetails = String(error);
  }

  return { success: false, data: undefined, message, errorCode, errorDetails };
}

// 🔗 Firestore references
const getItineraryCollectionRef = (tripId: string) => collection(db, 'trips', tripId, 'itinerary');

const getDayDocRef = (tripId: string, date: string) => doc(getItineraryCollectionRef(tripId), date);

// 📥 Get all itinerary days
export async function getAllDays(tripId: string): Promise<ServiceResponse<TripDayItinerary[]>> {
  try {
    const q = query(getItineraryCollectionRef(tripId), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);

    const days: TripDayItinerary[] = snapshot.docs.map((docSnap) => {
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

    return { success: true, data: days, message: 'Itinerary days fetched.' };
  } catch (error) {
    return handleError<TripDayItinerary[]>('getAllDays', error);
  }
}

// 📥 Get a single day
export async function getDay(
  tripId: string,
  date: string,
): Promise<ServiceResponse<TripDayItinerary>> {
  try {
    const dayRef = getDayDocRef(tripId, date);
    const snap = await getDoc(dayRef);

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
      data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : data.createdAt || Date.now();
    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toMillis()
        : data.updatedAt || Date.now();

    return {
      success: true,
      data: {
        id: snap.id,
        ...data,
        createdAt,
        updatedAt,
      } as TripDayItinerary,
      message: 'Itinerary day fetched.',
    };
  } catch (error) {
    return handleError<TripDayItinerary>('getDay', error);
  }
}

// ➕ Create new day (optional: with one event)
export async function createDay(
  tripId: string,
  date: string,
  newEventData?: NewItineraryEvent,
): Promise<ServiceResponse<void>> {
  try {
    const dayRef = getDayDocRef(tripId, date);
    const snap = await getDoc(dayRef);

    if (snap.exists()) {
      return { success: false, message: 'Itinerary day already exists.' };
    }

    const now = Timestamp.now();
    const newDay: Omit<TripDayItinerary, 'id'> = {
      tripId,
      date,
      events: [],
      dailyNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(dayRef, newDay);

    if (newEventData) {
      const eventId = doc(collection(db, 'tempCollectionForId')).id;
      const newEvent: ItineraryEvent = {
        ...newEventData,
        id: eventId,
        isCompleted: false,
        createdAt: now.toMillis(),
        updatedAt: now.toMillis(),
      };

      await updateDoc(dayRef, {
        events: arrayUnion(newEvent),
      });
    }

    return { success: true, message: 'Itinerary day created.' };
  } catch (error) {
    return handleError<void>('createDay', error);
  }
}

// ➕ Add an event to a day
export async function addEvent(
  tripId: string,
  date: string,
  newEventData: NewItineraryEvent,
): Promise<ServiceResponse<void>> {
  try {
    const dayRef = getDayDocRef(tripId, date);
    const now = Timestamp.now();
    const eventId = doc(collection(db, 'tempCollectionForId')).id;

    const newEvent: ItineraryEvent = {
      ...newEventData,
      id: eventId,
      isCompleted: false,
      createdAt: now.toMillis(),
      updatedAt: now.toMillis(),
    };

    await updateDoc(dayRef, {
      events: arrayUnion(newEvent),
    });

    return { success: true, message: 'Event added to itinerary day.' };
  } catch (error) {
    return handleError<void>('addEvent', error);
  }
}

// 📝 Update daily notes
export async function updateNotes(
  tripId: string,
  date: string,
  notes: string,
): Promise<ServiceResponse<void>> {
  try {
    const dayRef = getDayDocRef(tripId, date);
    const snap = await getDoc(dayRef);

    if (snap.exists()) {
      await updateDoc(dayRef, {
        dailyNotes: notes,
        updatedAt: serverTimestamp(),
      });
    } else {
      const newDay: Omit<TripDayItinerary, 'id'> = {
        tripId,
        date,
        events: [],
        dailyNotes: notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(dayRef, newDay);
    }

    return { success: true, message: 'Daily notes updated.' };
  } catch (error) {
    return handleError<void>('updateNotes', error);
  }
}

// ✏️ Edit an event
export async function editEventById(
  tripId: string,
  date: string,
  eventId: string,
  updates: Partial<ItineraryEvent>,
): Promise<ServiceResponse<void>> {
  try {
    const dayRef = getDayDocRef(tripId, date);
    const snap = await getDoc(dayRef);

    if (!snap.exists()) {
      return { success: false, message: 'Itinerary day not found.' };
    }

    const dayData = snap.data() as TripDayItinerary;
    const index = dayData.events.findIndex((e) => e.id === eventId);

    if (index === -1) {
      return { success: false, message: 'Event not found.' };
    }

    const updatedEvent: ItineraryEvent = {
      ...dayData.events[index],
      ...updates,
      updatedAt: Date.now(),
    } as ItineraryEvent;

    const updatedEvents = [...dayData.events];
    updatedEvents[index] = updatedEvent;

    await updateDoc(dayRef, {
      events: updatedEvents,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Event updated.' };
  } catch (error) {
    return handleError<void>('editEventById', error);
  }
}

// ❌ Delete an event (by full object)
export async function deleteAllEvents(
  tripId: string,
  date: string,
): Promise<ServiceResponse<void>> {
  try {
    const dayRef = getDayDocRef(tripId, date);

    await updateDoc(dayRef, {
      events: [],
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'All events deleted.' };
  } catch (error) {
    return handleError<void>('deleteAllEvents', error);
  }
}

// ❌ Remove event by ID
export async function removeEventById(
  tripId: string,
  date: string,
  eventId: string,
): Promise<ServiceResponse<void>> {
  try {
    const dayRef = getDayDocRef(tripId, date);
    const snap = await getDoc(dayRef);

    if (!snap.exists()) {
      return { success: false, message: 'Itinerary day not found.' };
    }

    const dayData = snap.data() as TripDayItinerary;
    const remainingEvents = dayData.events.filter((e) => e.id !== eventId);

    if (remainingEvents.length === dayData.events.length) {
      return { success: false, message: 'Event not found.' };
    }

    await updateDoc(dayRef, {
      events: remainingEvents,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Event removed.' };
  } catch (error) {
    return handleError<void>('removeEventById', error);
  }
}
