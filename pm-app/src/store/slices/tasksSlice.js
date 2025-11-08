import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: '1',
      title: 'Первая задача',
      description: 'Описание первой задачи',
      projectId: '1',
      status: 'pending',
      priority: 'high',
      assignee: '1',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      completed: false,
    }
  ],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    projectId: 'all',
  },
  sortBy: 'dueDate',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      const newTask = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
        ...action.payload,
      };
      
      if (!newTask.title || !newTask.projectId) {
        state.error = 'Title and project are required';
        return;
      }
      
      state.items.push(newTask);
      state.error = null;
    },
    
    updateTask: (state, action) => {
      const { id, updates } = action.payload;
      const taskIndex = state.items.findIndex(task => task.id === id);
      
      if (taskIndex !== -1) {
        if (!updates.title) {
          state.error = 'Title is required';
          return;
        }
        
        state.items[taskIndex] = { ...state.items[taskIndex], ...updates };
        state.error = null;
      }
    },
    
    deleteTask: (state, action) => {
      state.items = state.items.filter(task => task.id !== action.payload);
    },
    
    toggleTaskCompletion: (state, action) => {
      const task = state.items.find(task => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.status = task.completed ? 'completed' : 'in-progress';
      }
    },
    
    setTaskFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setTaskSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    setTaskError: (state, action) => {
      state.error = action.payload;
    },
    
    clearTaskError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  setTaskFilters,
  setTaskSortBy,
  setTaskError,
  clearTaskError,
} = tasksSlice.actions;

export const selectAllTasks = (state) => state.tasks.items;
export const selectTaskById = (state, taskId) => 
  state.tasks.items.find(task => task.id === taskId);
export const selectTasksByProjectId = (state, projectId) => 
  state.tasks.items.filter(task => task.projectId === projectId);
export const selectTasksFilters = (state) => state.tasks.filters;
export const selectTasksSortBy = (state) => state.tasks.sortBy;
export const selectTasksError = (state) => state.tasks.error;

export const selectFilteredTasks = (state) => {
  const tasks = selectAllTasks(state);
  const filters = selectTasksFilters(state);
  const sortBy = selectTasksSortBy(state);
  
  let filtered = tasks;
  
  if (filters.status !== 'all') {
    filtered = filtered.filter(task => task.status === filters.status);
  }
  
  if (filters.priority !== 'all') {
    filtered = filtered.filter(task => task.priority === filters.priority);
  }
  
  if (filters.projectId !== 'all') {
    filtered = filtered.filter(task => task.projectId === filters.projectId);
  }
  
  return [...filtered].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });
};

export default tasksSlice.reducer;