import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import tasksReducer from './slices/tasksSlice';
import projectsReducer from './slices/projectsSlice';
import projectMembersReducer from './slices/projectMembersSlice';
import attachmentsReducer from './slices/attachmentsSlice';
import iterationsReducer from './slices/iterationsSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    tasks: tasksReducer,
    projects: projectsReducer,
    projectMembers: projectMembersReducer,
    attachments: attachmentsReducer,
    iterations: iterationsReducer,
  },
});