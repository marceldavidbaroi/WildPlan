import { defineStore } from 'pinia';
import type { ItineraryStoreState } from './types';
import * as actionFns from './actions';

export const useItineraryStore = defineStore('itinerary', {
  state: (): ItineraryStoreState => ({
    currentTripId: null,
    itineraryDays: [],
    selectedDay: null,
    isLoading: false,
    error: null,
  }),

  actions: { ...actionFns },

  persist: true,
});
