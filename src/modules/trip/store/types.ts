// src/types/trip-types.ts

import type { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

// Core Location Interface
export interface TripLocation {
  name: string;
  lat?: number | undefined;
  lng?: number | undefined;
}

// 1. Interface for Data when CREATING a trip
export interface TripCreateData {
  name: string;
  location: TripLocation;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: string[];
  inviteCode?: string | undefined;
  photoURL?: string | undefined;
  status: 'upcoming' | 'completed' | 'cancelled';
}

// NEW: Interface for a Trip document as RETRIEVED from Firestore, before timestamp conversion
export interface TripFromFirestore {
  id: string; // Firestore document ID
  name: string;
  location: TripLocation;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: string[];
  involvedUsers: string[];
  inviteCode?: string;
  photoURL?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: Timestamp; // This is the key difference
  updatedAt: Timestamp; // This is the key difference
}

// 2. Interface for a Trip document as RETRIEVED from Firestore
export interface Trip {
  id: string;
  name: string;
  location: TripLocation;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: string[];
  involvedUsers: string[]; // This array contains creator's UID + all member UIDs
  inviteCode?: string | undefined;
  photoURL?: string | undefined;
  status: 'upcoming' | 'completed' | 'cancelled';
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
}

// 3. Standardized Service Response (for all operations)
export interface ServiceResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | undefined;
  errorCode?: string | undefined; // Already fixed this one, keep it as is
  errorDetails?: string | undefined; // Already fixed this one, keep it as is
}

// 4. Options Interface for Fetching/Subscribing to Trips
export interface FetchTripsOptions {
  userInvolvedId?: string;
  sortBy?: 'name' | 'startDate' | 'createdAt' | 'status';
  sortDirection?: 'asc' | 'desc';
  statusFilter?: 'upcoming' | 'completed' | 'cancelled' | 'all';
  searchQuery?: string;
  limit?: number;
  lastVisible?: QueryDocumentSnapshot<DocumentData> | null;
}

// 5. Response Interface for Paginated Trip Queries
export interface PaginatedTripsResponse extends ServiceResponse<Trip[]> {
  hasMore: boolean;
  // FIX HERE: Explicitly allow 'undefined' for `lastVisibleDoc`
  lastVisibleDoc?: QueryDocumentSnapshot<DocumentData> | null | undefined;
}

// Define the shape for your global state management (e.g., Pinia store)
export interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  loading: boolean;
  error: string | null;
}
