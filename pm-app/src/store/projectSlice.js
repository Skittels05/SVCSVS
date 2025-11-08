import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: '1',
      title: 'Веб-приложение',
      description: 'Разработка веб-приложения для управления проектами',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Мобильное приложение', 
      description: 'Создание мобильной версии приложения',
      createdAt: new Date().toISOString(),
    }
  ],
  loading: false,
  error: null,
  sortBy: 'createdAt',
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action) => {
      const newProject = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      
      if (!newProject.title || !newProject.description) {
        state.error = 'Title and description are required';
        return;
      }
      
      state.items.push(newProject);
      state.error = null;
    },
    
    updateProject: (state, action) => {
      const { id, updates } = action.payload;
      const projectIndex = state.items.findIndex(project => project.id === id);
      
      if (projectIndex !== -1) {
        state.items[projectIndex] = { ...state.items[projectIndex], ...updates };
        state.error = null;
      }
    },
    
    deleteProject: (state, action) => {
      state.items = state.items.filter(project => project.id !== action.payload);
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addProject,
  updateProject,
  deleteProject,
  setSortBy,
  setError,
  clearError,
} = projectsSlice.actions;

export const selectAllProjects = (state) => state.projects.items;
export const selectProjectById = (state, projectId) => 
  state.projects.items.find(project => project.id === projectId);
export const selectProjectsSortBy = (state) => state.projects.sortBy;
export const selectProjectsError = (state) => state.projects.error;

export const selectFilteredProjects = (state) => {
  const projects = selectAllProjects(state);
  const sortBy = selectProjectsSortBy(state);
  
  return [...projects].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

export default projectsSlice.reducer;