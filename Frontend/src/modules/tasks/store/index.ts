// src/modules/tasks/index.ts

import { defineStore } from 'pinia';
import type { TaskState } from './types';
import * as actionFns from './action';

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    loading: false,
    error: null,
  }),

  actions: { ...actionFns },

  persist: true,
});
