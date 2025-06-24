import type { FieldValue } from 'firebase/firestore'; // Make sure to import FieldValue

export interface ItineraryEvent {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  category: ItineraryEventCategory;
  icon?: string;
  assignedTo?: string[];
  isCompleted?: boolean;
  packingItemsNeeded?: string[];
  budgetImpact?: {
    estimatedCost?: number;
  };
  notes?: string;
  createdAt: number | FieldValue;
  updatedAt: number | FieldValue;
}

/**
 * Represents a single day's itinerary within a trip.
 * This will be a document in the `itinerary` subcollection.
 */
export interface TripDayItinerary {
  id: string;
  tripId: string;
  date: string;
  events: ItineraryEvent[];
  weatherForecast?: DayWeatherForecast;
  dailyNotes?: string;
  createdAt: number | FieldValue;
  updatedAt: number | FieldValue;
}

/**
 * Interface for a new Itinerary Event when creating/editing,
 * where `id`, `createdAt`, `updatedAt`, `isCompleted` might not be present yet.
 */
export type NewItineraryEvent = Omit<
  ItineraryEvent,
  'id' | 'createdAt' | 'updatedAt' | 'isCompleted'
>;

/**
 * Interface for the state of the Itinerary Pinia store.
 */
export interface ItineraryStoreState {
  currentTripId: string | null;
  itineraryDays: TripDayItinerary[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Enum for event categories for better type safety and autocompletion.
 */
export enum ItineraryEventCategory {
  Activity = 'activity',
  Meal = 'meal',
  Travel = 'travel',
  Lodging = 'lodging',
  CampChore = 'campChore',
  Meeting = 'meeting',
  Relaxation = 'relaxation',
  Other = 'other',
}

/**
 * Interface for storing a simplified daily weather forecast.
 */
export interface DayWeatherForecast {
  date: string;
  temperatureMinC?: number;
  temperatureMaxC?: number;
  temperatureMinF?: number;
  temperatureMaxF?: number;
  conditions: string;
  iconCode: string;
}

/**
 * Interface for an Itinerary Event Template.
 * Allows users to create reusable event configurations.
 */
export interface ItineraryEventTemplate {
  id: string;
  name: string;
  description?: string;
  category: ItineraryEventCategory;
  defaultStartTime?: string;
  defaultDurationMinutes?: number;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | undefined;
  errorCode?: string | undefined; // Already fixed this one, keep it as is
  errorDetails?: string | undefined; // Already fixed this one, keep it as is
}
