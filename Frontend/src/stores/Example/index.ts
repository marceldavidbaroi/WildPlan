import { defineStore } from 'pinia';
import type { ProjectState } from './types';
import actions from './actions';

export const useProjectStore = defineStore<
  'project',
  ProjectState,
  Record<string, never>,
  typeof actions
>('project', {
  state: (): ProjectState => ({
    projects: [],
    selectedProject: null,
  }),
  actions,
});
