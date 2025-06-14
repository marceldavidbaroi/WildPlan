export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
}

export interface ProjectPayload {
  title: string;
  description: string;
}
