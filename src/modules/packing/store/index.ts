import { defineStore } from 'pinia';
import type { PackingState } from './types';
import * as actionFns from './action';

export const useItineraryStore = defineStore('packing', {
  state: (): PackingState => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: { ...actionFns },

  persist: true,
});
