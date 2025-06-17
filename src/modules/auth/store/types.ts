// src/modules/auth/store/types.ts
import type { User } from 'firebase/auth';

export interface Contact {
  name: string;
  email: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  address?: string;

  // Trips
  joinedTrips?: string[];
  favouriteTrips?: string[]; // ⬅️ NEW

  // Contacts
  contacts?: Contact[]; // ⬅️ NEW

  // Preferences
  preferences?: {
    notifications?: boolean;
    theme?: string;
  };

  createdAt?: number;
  updatedAt?: number;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  allUsers: UserProfile[] | null | undefined;
  loading: boolean;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | undefined;
  errorCode?: string | undefined; // Already fixed this one, keep it as is
  errorDetails?: string | undefined; // Already fixed this one, keep it as is
}

export interface FetchUserOptions {
  searchQuery?: string; // Search by name or email
  sortBy?: 'displayName' | 'email' | 'createdAt'; // Sort field
  sortDirection?: 'asc' | 'desc'; // Sort order
}
