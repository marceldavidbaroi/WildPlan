import { defineStore } from 'pinia';
import type { TripState } from './types';
import * as actionFns from './actions';

export const useTripStore = defineStore('trips', {
  state: (): TripState => ({
    trips: [],
    activeTrip: null,
  }),

  actions: { ...actionFns },

  persist: true,
});
