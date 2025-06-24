import type {
  ItineraryEvent,
  TripDayItinerary,
  ItineraryStoreState,
  ServiceResponse,
  NewItineraryEvent,
} from './types';
import * as ItineraryService from '../services/itinerary.service';
import { Timestamp } from 'firebase/firestore';

/**
 * Convert Firestore Timestamps to number (ms) for consistent client use.
 */
function normalizeTimestamps(day: TripDayItinerary): TripDayItinerary {
  return {
    ...day,
    createdAt: day.createdAt instanceof Timestamp ? day.createdAt.toMillis() : day.createdAt,
    updatedAt: day.updatedAt instanceof Timestamp ? day.updatedAt.toMillis() : day.updatedAt,
  };
}

export async function fetchItineraryDaysForTrip(
  this: ItineraryStoreState,
  tripId: string,
): Promise<ServiceResponse<TripDayItinerary[]>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.fetchItineraryDaysForTrip(tripId);

  if (response.success && response.data) {
    const normalizedDays = response.data.map(normalizeTimestamps);
    this.itineraryDays = normalizedDays;
    response.data = normalizedDays;
  } else {
    this.itineraryDays = [];
    this.error = response.message;
  }

  this.isLoading = false;
  return response;
}

export async function fetchItineraryDay(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
): Promise<ServiceResponse<TripDayItinerary>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.fetchItineraryDay(tripId, date);

  if (response.success && response.data) {
    const normalizedDay = normalizeTimestamps(response.data);
    const existingIndex = this.itineraryDays.findIndex((day) => day.id === normalizedDay.id);

    if (existingIndex !== -1) {
      this.itineraryDays[existingIndex] = normalizedDay;
    } else {
      this.itineraryDays.push(normalizedDay);
    }

    response.data = normalizedDay;
  } else {
    this.error = response.message;
  }
  this.selectedDay = response.data || null;

  this.isLoading = false;
  return response;
}

export async function createItineraryEvent(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  event?: NewItineraryEvent,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.addItineraryEvent(tripId, date, event);

  if (response.success) {
    // Re-fetch day to ensure local state reflects changes

    await ItineraryService.fetchItineraryDay(tripId, date);
  } else {
    this.error = response.message;
  }
  console.log(response.success);

  this.isLoading = false;
  return response;
}

export async function updateItineraryEvent(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  event: ItineraryEvent,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.addItineraryEvent(tripId, date, event);

  if (response.success) {
    // Re-fetch day to ensure local state reflects changes
    await ItineraryService.fetchItineraryDay(tripId, date);
  } else {
    this.error = response.message;
  }

  this.isLoading = false;
  return response;
}

export async function deleteItineraryEvent(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  event: ItineraryEvent,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.deleteItineraryEvent(tripId, date, event);

  if (response.success) {
    // Re-fetch day to reflect the deletion in local state
    await ItineraryService.fetchItineraryDay(tripId, date);
  } else {
    this.error = response.message;
  }

  this.isLoading = false;
  return response;
}

export async function updateItineraryDayNotes(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  notes: string,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.updateItineraryDayNotes(tripId, date, notes);

  if (response.success) {
    const index = this.itineraryDays?.findIndex((day) => day.date === date);
    if (index !== -1 && index !== undefined) {
      this.itineraryDays[index]!.dailyNotes = notes;
    }
  } else {
    this.error = response.message;
  }

  this.isLoading = false;
  return response;
}
