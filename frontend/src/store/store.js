import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import tasksReducer from './slices/tasksSlice';
import projectsReducer from './slices/projectsSlice';


export const store = configureStore({
  reducer: {
    users: usersReducer,
    tasks: tasksReducer,
    projects: projectsReducer,
  },
});