import { defineStore } from 'pinia';
import type { AuthState } from './types';
import * as actionFns from './actions';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    profile: null,
  }),
  getters: {
    isAuthenticated(state): boolean {
      return !!state.user;
    },
  },
  actions: { ...actionFns },

  // Enable persistence for this store
  persist: true,
});
