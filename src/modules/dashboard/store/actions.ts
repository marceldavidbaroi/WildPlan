import type { Trip, TripState, ServiceResponse } from './types';
import * as TripsService from '../services/trips.service';

export async function createTrip(this: TripState, tripData: Trip): Promise<ServiceResponse> {
  try {
    const response = await TripsService.createTrip(tripData);

    if (response.success && response.data) {
      // response.data might have an 'id' property, so ensure typing matches Trip (or extend Trip type)
      this.trips.push(response.data);
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: unknown) {
    console.error('[createTrip] Error:', error);
    return {
      success: false,
      message: 'Failed to create trip',
    };
  }
}

export async function fetchTrip(this: TripState, tripId: string): Promise<ServiceResponse> {
  try {
    const response = await TripsService.fetchTrip(tripId);

    if (response.success && response.data) {
      this.activeTrip = response.data;
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: unknown) {
    console.error('[fetchTrip] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch trip',
    };
  }
}

export async function fetchTrips(this: TripState, uid: string): Promise<ServiceResponse> {
  try {
    const response = await TripsService.fetchTripsByCreator(uid);

    if (response.success && response.data) {
      this.trips = response.data;
      return {
        success: true,
        message: response.message,
        data: this.trips,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: unknown) {
    console.error('[fetchTrips] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch trips',
    };
  }
}

export async function updateTrip(
  this: TripState,
  tripId: string,
  tripData: Partial<Trip>,
): Promise<ServiceResponse<Partial<Trip>>> {
  try {
    const response = await TripsService.updateTrip(tripId, tripData);

    if (response.success && response.data) {
      const index = this.trips.findIndex((trip) => trip.id === tripId);
      if (index !== -1) {
        this.trips[index] = {
          ...this.trips[index],
          ...response.data,
        } as Trip;
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message,
    };
  } catch (error: unknown) {
    console.error('[updateTrip] Error:', error);
    return {
      success: false,
      message: 'Failed to update trip',
    };
  }
}

export async function deleteTrip(this: TripState, tripId: string): Promise<ServiceResponse> {
  try {
    const response = await TripsService.deleteTrip(tripId);

    if (response.success) {
      this.trips = this.trips.filter((trip) => trip.id !== tripId);
      if (this.activeTrip?.id === tripId) {
        this.activeTrip = null;
      }
      return {
        success: true,
        message: response.message,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error: unknown) {
    console.error('[deleteTrip] Error:', error);
    return {
      success: false,
      message: 'Failed to delete trip',
    };
  }
}
