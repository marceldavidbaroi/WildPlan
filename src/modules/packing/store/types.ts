// src/types/packing-types.ts

import type { Timestamp } from 'firebase/firestore';

// ✅ Categories for easy filtering
export type PackingCategory =
  | 'clothing'
  | 'food'
  | 'campingGear'
  | 'cooking'
  | 'safety'
  | 'electronics'
  | 'personalCare'
  | 'misc';

// ✅ Who owns it: personal or shared
export type PackingType = 'personal' | 'shared';

// ✅ New item when creating
export interface PackingItemCreate {
  tripId: string;
  ownerId: string;
  name: string;
  quantity: number;
  category: PackingCategory;
  type: PackingType;
  isPacked: boolean;
  dueDate?: string; // Optional: pack by date (ISO)
  notes?: string;
}

// ✅ Firestore raw format (with Timestamps)
export interface PackingItemDoc {
  tripId: string;
  ownerId: string;
  name: string;
  quantity: number;
  category: PackingCategory;
  type: PackingType;
  isPacked: boolean;
  dueDate?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ✅ Final type used in app (converted)
export interface PackingItem {
  id: string;
  tripId: string;
  ownerId: string;
  name: string;
  quantity: number;
  category: PackingCategory;
  type: PackingType;
  isPacked: boolean;
  dueDate?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// ✅ Simple standard response
export interface PackingResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errorDetails?: string;
}

// ✅ Filter options when fetching (light, no pagination)
export interface PackingFetchOptions {
  tripId: string;
  type?: PackingType | null; // Filter: personal/shared
  ownerId?: string; // Filter: by user
  category?: PackingCategory | null; // Filter: category
  packedStatus?: boolean | null; // Filter: packed/unpacked
}

// ✅ Store state for Pinia
export interface PackingState {
  items: PackingItem[];
  loading: boolean;
  error: string | null;
}
