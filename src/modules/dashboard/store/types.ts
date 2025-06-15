export interface TripLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface Trip {
  id?: string;
  name: string;
  location: TripLocation;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: string[];
  inviteCode?: string;
  photoURL?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
}

export interface StateResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
