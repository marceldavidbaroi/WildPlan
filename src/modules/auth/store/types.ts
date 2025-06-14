// src/modules/auth/store/types.ts
import type { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  address?: string;
  joinedTrips?: string[];
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
}
