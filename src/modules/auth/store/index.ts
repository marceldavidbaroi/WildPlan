// src/stores/auth/index.ts
import { defineStore } from 'pinia';
import type { AuthState } from './types';
import * as actionFns from './actions';
export const useAuthStore = defineStore<'auth', AuthState, Record<string, never>, typeof actionFns>(
  'auth',
  {
    state: (): AuthState => ({
      user: null,
      profile: null,
    }),
    actions: { ...actionFns },
  },
);
