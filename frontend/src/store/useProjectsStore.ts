import { create } from 'zustand';
import api from '../lib/axios';

export interface Project {
  id: string;
  name: string;
  description: string;
  github_link: string | null;
  documentation: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectsState {
  projects: Project[];
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<boolean>;
  updateProject: (id: string, data: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  project: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/v1/projects');
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/v1/projects/${id}`);
      set({ project: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProject: async (data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/projects/', data);
      await get().fetchProjects();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/api/v1/projects/${id}`, data);
      await get().fetchProject(id);
      await get().fetchProjects();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/projects/${id}`);
      await get().fetchProjects();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));
