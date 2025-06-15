import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
  query,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

import type { Trip } from '../store/types';

const tripsCollection = collection(db, 'trips');

// 🔹 Create Trip
export async function createTrip(tripData: Trip) {
  try {
    const newTripDocRef = doc(tripsCollection); // Auto-generated ID
    const tripWithMeta = {
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newTripDocRef, tripWithMeta);

    return {
      success: true,
      data: { id: newTripDocRef.id, ...tripData },
      message: 'Trip created successfully',
    };
  } catch (error) {
    console.error('[createTrip] Error:', error);
    return {
      success: false,
      data: null,
      message: 'Failed to create trip',
    };
  }
}

// 🔹 Fetch Trip by ID
export async function fetchTrip(tripId: string) {
  try {
    const tripDocRef = doc(tripsCollection, tripId);
    const snap = await getDoc(tripDocRef);

    if (!snap.exists()) {
      return {
        success: false,
        data: null,
        message: 'Trip not found',
      };
    }

    return {
      success: true,
      data: snap.data() as Trip,
      message: 'Trip fetched successfully',
    };
  } catch (error) {
    console.error('[fetchTrip] Error:', error);
    return {
      success: false,
      data: null,
      message: 'Failed to fetch trip',
    };
  }
}

// 🔹 Update Trip
export async function updateTrip(tripId: string, tripData: Partial<Trip>) {
  try {
    const tripDocRef = doc(tripsCollection, tripId);
    await updateDoc(tripDocRef, {
      ...tripData,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      data: tripData,
      message: 'Trip updated successfully',
    };
  } catch (error) {
    console.error('[updateTrip] Error:', error);
    return {
      success: false,
      data: null,
      message: 'Failed to update trip',
    };
  }
}

// 🔹 Delete Trip
export async function deleteTrip(tripId: string) {
  try {
    const tripDocRef = doc(tripsCollection, tripId);
    await deleteDoc(tripDocRef);

    return {
      success: true,
      data: null,
      message: 'Trip deleted successfully',
    };
  } catch (error) {
    console.error('[deleteTrip] Error:', error);
    return {
      success: false,
      data: null,
      message: 'Failed to delete trip',
    };
  }
}

// 🔹 (Optional) Fetch All Trips for a User
export async function fetchTripsForUser(userId: string) {
  try {
    const snap = await getDocs(tripsCollection);
    const trips: Trip[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Trip;
      if (data.members.includes(userId)) {
        trips.push(data);
      }
    });

    return {
      success: true,
      data: trips,
      message: 'Trips fetched successfully',
    };
  } catch (error) {
    console.error('[fetchTripsForUser] Error:', error);
    return {
      success: false,
      data: [],
      message: 'Failed to fetch user trips',
    };
  }
}

// 🔹 Fetch Trips by Creator (createdBy)
export async function fetchTripsByCreator(userId: string) {
  try {
    const q = query(tripsCollection, where('createdBy', '==', userId));
    const snap = await getDocs(q);

    const trips: Trip[] = [];
    snap.forEach((docSnap) => {
      trips.push(docSnap.data() as Trip);
    });

    return {
      success: true,
      data: trips,
      message: 'Trips fetched successfully by creator',
    };
  } catch (error) {
    console.error('[fetchTripsByCreator] Error:', error);
    return {
      success: false,
      data: [],
      message: 'Failed to fetch trips by creator',
    };
  }
}
