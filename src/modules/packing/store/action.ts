import type {
  PackingItem,
  PackingItemCreate,
  PackingState,
  PackingFetchOptions,
  PackingResponse,
} from './types';

import * as PackingService from '../service/packing.service';
import { Timestamp } from 'firebase/firestore';
interface PackingItemRaw extends Omit<PackingItem, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp | number;
  updatedAt: Timestamp | number;
}
/**
 * 🔄 Normalize Firestore Timestamps to ms
 */
function normalizePackingItem(item: PackingItemRaw): PackingItem {
  return {
    ...item,
    createdAt:
      typeof item.createdAt === 'number'
        ? item.createdAt
        : item.createdAt instanceof Timestamp
          ? item.createdAt.toMillis()
          : Date.now(),
    updatedAt:
      typeof item.updatedAt === 'number'
        ? item.updatedAt
        : item.updatedAt instanceof Timestamp
          ? item.updatedAt.toMillis()
          : Date.now(),
  };
}

/**
 * 📦 Fetch packing items with filters
 */
export async function getPackingItems(
  this: PackingState,
  options: PackingFetchOptions,
): Promise<PackingResponse<PackingItem[]>> {
  this.loading = true;
  this.error = null;

  const response = await PackingService.getPackingItems(options);

  if (response.success && response.data) {
    const normalized = response.data.map(normalizePackingItem);
    this.items = normalized;
    response.data = normalized;
  } else {
    this.items = [];
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ➕ Add a new packing item
 */
export async function addPackingItem(
  this: PackingState,
  tripId: string,
  data: PackingItemCreate,
): Promise<PackingResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await PackingService.addPackingItem(tripId, data);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ✏️ Update a packing item by ID
 */
export async function updatePackingItem(
  this: PackingState,
  tripId: string,
  itemId: string,
  updates: Partial<PackingItemCreate>,
): Promise<PackingResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await PackingService.updatePackingItem(tripId, itemId, updates);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ✅ Toggle packed status (calls updatePackingItem)
 */
export async function togglePackedStatus(
  this: PackingState,
  tripId: string,
  itemId: string,
  isPacked: boolean,
): Promise<PackingResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await PackingService.togglePackedStatus(tripId, itemId, isPacked);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ❌ Delete a packing item by ID
 */
export async function deletePackingItem(
  this: PackingState,
  tripId: string,
  itemId: string,
): Promise<PackingResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await PackingService.deletePackingItem(tripId, itemId);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

/**
 * ❌ Delete ALL packing items for a trip
 */
export async function deleteAllPackingItems(
  this: PackingState,
  tripId: string,
): Promise<PackingResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await PackingService.deleteAllPackingItems(tripId);

  if (!response.success) {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}
