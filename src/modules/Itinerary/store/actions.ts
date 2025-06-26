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
 * 🔄 Normalize Firestore Timestamps to ms
 */
function normalizeTimestamps(day: TripDayItinerary): TripDayItinerary {
  return {
    ...day,
    createdAt: day.createdAt instanceof Timestamp ? day.createdAt.toMillis() : day.createdAt,
    updatedAt: day.updatedAt instanceof Timestamp ? day.updatedAt.toMillis() : day.updatedAt,
  };
}

/**
 * 🔍 Fetch all itinerary days for a trip
 */
export async function getAllDays(
  this: ItineraryStoreState,
  tripId: string,
): Promise<ServiceResponse<TripDayItinerary[]>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.getAllDays(tripId);

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

/**
 * 📅 Fetch a specific itinerary day by date
 */
export async function getDay(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
): Promise<ServiceResponse<TripDayItinerary>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.getDay(tripId, date);

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

/**
 * 🆕 Create a new itinerary day (optionally with a first event)
 */
export async function createDay(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  event?: NewItineraryEvent,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.createDay(tripId, date, event);

  // if (response.success) {
  //   // Refetch the day to update local state
  //   await getAllDays.call(this, tripId);
  // } else {
  //   this.error = response.message;
  // }

  this.isLoading = false;
  return response;
}

/**
 * ➕ Add a new event to an existing itinerary day
 */
export async function addEvent(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  event: NewItineraryEvent,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.addEvent(tripId, date, event);

  // if (response.success) {
  //   await getAllDays.call(this, tripId);
  // } else {
  //   this.error = response.message;
  // }

  this.isLoading = false;
  return response;
}

/**
 * ✏️ Edit an existing event in an itinerary day by event ID
 */
export async function editEventById(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  eventId: string,
  updates: Partial<ItineraryEvent>,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.editEventById(tripId, date, eventId, updates);

  // if (response.success) {
  //   await getAllDays.call(this, tripId);
  // } else {
  //   this.error = response.message;
  // }

  this.isLoading = false;
  return response;
}

/**
 * ❌ Delete an event by ID from an itinerary day
 */
export async function deleteAllEvent(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  event: ItineraryEvent,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.deleteAllEvent(tripId, date, event);

  // if (response.success) {
  //   await getAllDays.call(this, tripId);
  // } else {
  //   this.error = response.message;
  // }

  this.isLoading = false;
  return response;
}

export async function removeEventById(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  eventId: string,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.removeEventById(tripId, date, eventId);

  // if (response.success) {
  //   await getAllDays.call(this, tripId);
  // } else {
  //   this.error = response.message;
  // }

  this.isLoading = false;
  return response;
}

/**
 * 📝 Update the daily notes for a specific itinerary day
 */
export async function updateNotes(
  this: ItineraryStoreState,
  tripId: string,
  date: string,
  notes: string,
): Promise<ServiceResponse<void>> {
  this.isLoading = true;
  this.error = null;

  const response = await ItineraryService.updateNotes(tripId, date, notes);

  if (response.success) {
    const index = this.itineraryDays.findIndex((day) => day.date === date);
    if (index !== -1) {
      this.itineraryDays[index]!.dailyNotes = notes;
    }
  } else {
    this.error = response.message;
  }

  this.isLoading = false;
  return response;
}
