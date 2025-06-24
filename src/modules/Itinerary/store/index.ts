import { defineStore } from 'pinia';
import type { ItineraryStoreState } from './types';
import * as actionFns from './actions';

export const useTripStore = defineStore('trips', {
  state: (): ItineraryStoreState => ({
    currentTripId: null,
    itineraryDays: [],
    isLoading: false,
    error: null,
  }),

  actions: { ...actionFns },

  persist: true,
});
