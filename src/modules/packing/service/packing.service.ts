// src/services/packing-service.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  FirestoreError,
  writeBatch,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';

import type {
  PackingItemCreate,
  PackingItem,
  PackingItemDoc,
  PackingResponse,
  PackingFetchOptions,
} from '../store/types';

// 🔗 Collection ref: packing items under a trip
const getPackingCollection = (tripId: string) => collection(db, 'trips', tripId, 'packing');

// ✅ Centralized error handler
function handlePackingError<T>(fn: string, error: unknown): PackingResponse<T> {
  console.error(`[PackingService.${fn}] Error:`, error);

  let message = `Failed to ${fn}.`;
  let errorCode: string | undefined;
  let errorDetails: string | undefined;

  if (error instanceof FirestoreError) {
    message = error.message;
    errorCode = error.code;
    errorDetails = error.message;
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = error.message;
  } else {
    errorDetails = String(error);
  }

  const response: PackingResponse<T> = {
    success: false,
    message,
  };

  // ✅ Only add if actually set
  if (errorCode) {
    response.errorCode = errorCode;
  }
  if (errorDetails) {
    response.errorDetails = errorDetails;
  }

  return response;
}

// 📦 Get all packing items (with simple filters)
export async function getPackingItems(
  options: PackingFetchOptions,
): Promise<PackingResponse<PackingItem[]>> {
  try {
    let q = query(getPackingCollection(options.tripId));

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options.ownerId) {
      q = query(q, where('ownerId', '==', options.ownerId));
    }
    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }
    if (typeof options.packedStatus === 'boolean') {
      q = query(q, where('isPacked', '==', options.packedStatus));
    }

    const snapshot = await getDocs(q);
    const items: PackingItem[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as PackingItemDoc;
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      };
    });

    return { success: true, message: 'Packing items fetched.', data: items };
  } catch (error) {
    return handlePackingError<PackingItem[]>('getPackingItems', error);
  }
}

// ➕ Add new packing item
export async function addPackingItem(
  tripId: string,
  data: PackingItemCreate,
): Promise<PackingResponse<void>> {
  try {
    const now = serverTimestamp();
    const newItem = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await addDoc(getPackingCollection(tripId), newItem);

    return { success: true, message: 'Packing item added.' };
  } catch (error) {
    return handlePackingError<void>('addPackingItem', error);
  }
}

// ✏️ Update packing item by ID
export async function updatePackingItem(
  tripId: string,
  itemId: string,
  updates: Partial<PackingItemCreate>,
): Promise<PackingResponse<void>> {
  try {
    const ref = doc(getPackingCollection(tripId), itemId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Packing item updated.' };
  } catch (error) {
    return handlePackingError<void>('updatePackingItem', error);
  }
}

// ✅ Toggle packed status
export async function togglePackedStatus(
  tripId: string,
  itemId: string,
  isPacked: boolean,
): Promise<PackingResponse<void>> {
  return updatePackingItem(tripId, itemId, { isPacked });
}

// ❌ Delete packing item by ID
export async function deletePackingItem(
  tripId: string,
  itemId: string,
): Promise<PackingResponse<void>> {
  try {
    const ref = doc(getPackingCollection(tripId), itemId);
    await deleteDoc(ref);

    return { success: true, message: 'Packing item deleted.' };
  } catch (error) {
    return handlePackingError<void>('deletePackingItem', error);
  }
}

// 📥 Get single packing item by ID
export async function getPackingItemById(
  tripId: string,
  itemId: string,
): Promise<PackingResponse<PackingItem>> {
  try {
    const ref = doc(getPackingCollection(tripId), itemId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return {
        success: false,
        message: 'Packing item not found.',
        errorCode: 'NOT_FOUND',
      };
    }

    const data = snap.data() as PackingItemDoc;

    return {
      success: true,
      message: 'Packing item fetched.',
      data: {
        id: snap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      },
    };
  } catch (error) {
    return handlePackingError<PackingItem>('getPackingItemById', error);
  }
}

// ❌ Delete ALL packing items for a given trip
export async function deleteAllPackingItems(tripId: string): Promise<PackingResponse<void>> {
  try {
    const colRef = getPackingCollection(tripId);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return { success: true, message: 'No packing items to delete.' };
    }

    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();

    return { success: true, message: 'All packing items deleted.' };
  } catch (error) {
    return handlePackingError<void>('deleteAllPackingItems', error);
  }
}
