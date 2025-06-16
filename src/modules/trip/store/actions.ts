import type {
  Trip,
  TripState,
  ServiceResponse,
  PaginatedTripsResponse,
  FetchTripsOptions,
  TripCreateData,
  TripFromFirestore,
} from './types';
import * as TripsService from '../services/trips.service';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

/**
 * Helper to convert Firestore Timestamps to numbers (milliseconds) for client-side use.
 */
function convertTimestampsToNumbers(trip: TripFromFirestore | TripCreateData | Trip): Trip {
  return {
    ...trip,
    createdAt:
      (trip as TripFromFirestore).createdAt instanceof Timestamp
        ? (trip as TripFromFirestore).createdAt.toMillis()
        : (trip as Trip).createdAt,
    updatedAt:
      (trip as TripFromFirestore).updatedAt instanceof Timestamp
        ? (trip as TripFromFirestore).updatedAt.toMillis()
        : (trip as Trip).updatedAt,
  } as Trip;
}

export async function createTrip(
  this: TripState,
  tripData: TripCreateData,
): Promise<ServiceResponse<Trip>> {
  this.loading = true;
  this.error = null;

  const response = await TripsService.createTrip(tripData);

  if (response.success && response.data) {
    // Service returns a client-ready Trip object after creation.
    this.trips.push(response.data);
  } else {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

export async function fetchTrip(this: TripState, tripId: string): Promise<ServiceResponse<Trip>> {
  this.loading = true;
  this.error = null;

  const response = await TripsService.fetchTrip(tripId);

  if (response.success && response.data) {
    const fetchedTrip = convertTimestampsToNumbers(response.data);
    this.activeTrip = fetchedTrip;
    // Overwrite the data property with the converted trip for the action's return.
    response.data = fetchedTrip;
  } else {
    this.activeTrip = null;
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

export async function fetchTrips(
  this: TripState,
  options: FetchTripsOptions,
): Promise<PaginatedTripsResponse> {
  this.loading = true;
  this.error = null;

  const response = await TripsService.fetchTrips(options);

  if (response.success && response.data) {
    const fetchedTrips = response.data.map(convertTimestampsToNumbers);

    if (options.lastVisible) {
      // Append new trips for infinite scroll/load more.
      this.trips.push(...fetchedTrips);
    } else {
      // Replace existing trips for a fresh query.
      this.trips = fetchedTrips;
    }
    // Update the data property of the response with the converted trips for the action's return.
    response.data = fetchedTrips;
  } else {
    this.trips = []; // Clear trips on error.
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

export async function updateTrip(
  this: TripState,
  tripId: string,
  tripData: Partial<TripCreateData>,
): Promise<ServiceResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await TripsService.updateTrip(tripId, tripData);

  if (response.success) {
    const index = this.trips.findIndex((trip) => trip.id === tripId);
    if (index !== -1) {
      // Update the local state with the partial data.
      // Note: server-generated timestamps (updatedAt) won't reflect here without re-fetching.
      this.trips[index] = {
        ...this.trips[index],
        ...tripData,
      } as Trip;

      if (this.activeTrip?.id === tripId) {
        this.activeTrip = {
          ...this.activeTrip,
          ...tripData,
        } as Trip;
      }
    }
  } else {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}

export async function deleteTrip(this: TripState, tripId: string): Promise<ServiceResponse<void>> {
  this.loading = true;
  this.error = null;

  const response = await TripsService.deleteTrip(tripId);

  if (response.success) {
    this.trips = this.trips.filter((trip) => trip.id !== tripId);
    if (this.activeTrip?.id === tripId) {
      this.activeTrip = null; // Clear active trip if it was the one deleted.
    }
  } else {
    this.error = response.message;
  }

  this.loading = false;
  return response;
}
