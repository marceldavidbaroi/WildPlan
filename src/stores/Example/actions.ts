import type { ProjectState, Project, ProjectPayload } from './types';

export default {
  async addProject(this: ProjectState, payload: ProjectPayload): Promise<Project> {
    const newProject: Project = {
      id: Date.now().toString(),
      title: payload.title,
      description: payload.description,
      createdAt: new Date(),
    };
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
    this.projects.push(newProject);
    return newProject;
  },

  selectProject(this: ProjectState, projectId: string) {
    this.selectedProject = this.projects.find((p) => p.id === projectId) || null;
  },

  clearSelection(this: ProjectState) {
    this.selectedProject = null;
  },
};
