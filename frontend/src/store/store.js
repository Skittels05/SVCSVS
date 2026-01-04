import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import tasksReducer from './slices/tasksSlice';


export const store = configureStore({
  reducer: {
    users: usersReducer,
    tasks: tasksReducer,
  },
});