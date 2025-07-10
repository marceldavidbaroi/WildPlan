import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
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
  FirestoreError,
  limit,
  orderBy,
  startAfter,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

import type {
  Trip,
  ServiceResponse,
  TripCreateData,
  FetchTripsOptions,
  PaginatedTripsResponse,
  TripRoles,
} from '../store/types'; // Make sure this path is correct

const tripsCollection = collection(db, 'trips');

// --- Helper for consistent error handling ---
function handleServiceError<T>(functionName: string, error: unknown): ServiceResponse<T> {
  console.error(`[TripsService.${functionName}] Error:`, error);
  let errorMessage = `Failed to ${functionName.replace('fetch', 'load').replace('Trip', 'trip')}. Please try again.`;
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
    errorDetails = error.message; // Fix for no-base-to-string
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.message; // Fix for no-base-to-string
  } else {
    errorDetails = String(error);
  }

  return {
    success: false,
    data: undefined, // Always undefined for failed ServiceResponse
    message: errorMessage,
    errorCode: errorCode,
    errorDetails: errorDetails,
  };
}

// --- Service Functions ---

export async function createTrip(tripData: TripCreateData): Promise<ServiceResponse<Trip>> {
  try {
    const newTripDocRef = doc(tripsCollection);
    const clientSideTimestamp = Date.now();

    const involvedUsers = [...new Set([tripData.createdBy, ...tripData.members])];

    // Build roles object
    const roles: TripRoles[] = [];
    roles.push({
      uid: tripData.createdBy,
      role: ['admin'],
      adminestrator: true,
    });

    for (const memberId of tripData.members) {
      roles.push({ uid: memberId, role: ['member'], adminestrator: false });
    }

    const tripToSave = {
      ...tripData,
      name_lowercase: tripData.name.toLowerCase(), // Add this line
      involvedUsers: involvedUsers,
      archived: false,
      isPublic: false,
      roles: roles, // <-- set full roles map here
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newTripDocRef, tripToSave);

    const returnedTrip: Trip = {
      id: newTripDocRef.id,
      ...tripData,
      involvedUsers: involvedUsers,
      createdAt: clientSideTimestamp,
      updatedAt: clientSideTimestamp,
    };

    return {
      success: true,
      data: returnedTrip,
      message: 'Trip created successfully!',
    };
  } catch (error: unknown) {
    return handleServiceError<Trip>('createTrip', error);
  }
}

export async function fetchTrip(tripId: string): Promise<ServiceResponse<Trip>> {
  try {
    const tripDocRef = doc(tripsCollection, tripId);
    const snap = await getDoc(tripDocRef);

    if (!snap.exists()) {
      return {
        success: false,
        data: undefined,
        message: 'Trip not found',
        errorCode: 'NOT_FOUND',
      };
    }

    const trip = { id: snap.id, ...snap.data() } as Trip;

    return {
      success: true,
      data: trip,
      message: 'Trip fetched successfully',
    };
  } catch (error: unknown) {
    return handleServiceError<Trip>('fetchTrip', error); // Pass the generic type argument
  }
}

export async function updateTrip(
  tripId: string,
  tripData: Partial<TripCreateData>,
): Promise<ServiceResponse<void>> {
  try {
    const tripDocRef = doc(tripsCollection, tripId);

    await updateDoc(tripDocRef, {
      ...tripData,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Trip updated successfully',
    };
  } catch (error: unknown) {
    return handleServiceError<void>('updateTrip', error); // Pass the generic type argument
  }
}

export async function deleteTrip(tripId: string): Promise<ServiceResponse<void>> {
  try {
    const tripDocRef = doc(tripsCollection, tripId);
    await deleteDoc(tripDocRef);

    return {
      success: true,
      message: 'Trip deleted successfully',
    };
  } catch (error: unknown) {
    return handleServiceError<void>('deleteTrip', error); // Pass the generic type argument
  }
}

export async function fetchTrips(options: FetchTripsOptions): Promise<PaginatedTripsResponse> {
  const {
    userInvolvedId,
    sortBy = 'createdAt',
    sortDirection = 'asc',
    statusFilter = 'all',
    searchQuery = '',
    limit: fetchLimit = 10,
    lastVisible = null,
  } = options;

  let q = query(tripsCollection);

  if (userInvolvedId) {
    q = query(q, where('involvedUsers', 'array-contains', userInvolvedId));
  }

  if (statusFilter !== 'all') {
    q = query(q, where('status', '==', statusFilter));
  }

  // Apply search filter with correct ordering to avoid index error
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    q = query(
      q,
      where('name_lowercase', '>=', searchLower),
      where('name_lowercase', '<=', searchLower + '\uf8ff'),
      orderBy('name_lowercase'),
    );
  } else {
    q = query(q, orderBy(sortBy, sortDirection));
  }

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  q = query(q, limit(fetchLimit + 1));

  try {
    const snapshot = await getDocs(q);
    const fetchedDocs: QueryDocumentSnapshot<DocumentData>[] = [];

    snapshot.forEach((docSnap) => {
      fetchedDocs.push(docSnap);
    });

    const hasMore = fetchedDocs.length > fetchLimit;
    const documentsToReturn = hasMore ? fetchedDocs.slice(0, fetchLimit) : fetchedDocs;

    const trips: Trip[] = documentsToReturn.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as Trip,
    );

    const newLastVisible = hasMore ? fetchedDocs[fetchLimit - 1] : null;

    return {
      success: true,
      data: trips,
      message: 'Trips fetched successfully.',
      hasMore,
      lastVisibleDoc: newLastVisible,
    };
  } catch (error: unknown) {
    const errorResponse = handleServiceError<Trip[]>('fetchTrips', error);
    return {
      ...errorResponse,
      data: [],
      hasMore: false,
      lastVisibleDoc: null,
    };
  }
}
