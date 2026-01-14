import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ page = 1, limit = 10, sort, project_id, status } = {}, { rejectWithValue }) => {
    try {
      let url = '/tasks';
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (sort) params.append('sort', sort);
      if (project_id) params.append('project_id', project_id);
      if (status) params.append('status', status);

      url += `?${params.toString()}`;

      const response = await api.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const uploadAttachments = createAsyncThunk(
  'tasks/uploadAttachments',
  async ({ taskId, files, userId = null }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('task_id', taskId);
      if (userId) formData.append('user_id', userId);

      const response = await api.post('/attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { taskId, attachments: response.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  'tasks/deleteAttachment',
  async ({ attachmentId, taskId }, { rejectWithValue }) => {
    try {
      await api.delete(`/attachments/${attachmentId}`);
      return { attachmentId, taskId };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload);
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        const task = state.list.find(t => t.id === action.payload.taskId);
        if (task) {
          task.Attachments = [...(task.Attachments || []), ...action.payload.attachments];
        }
      })
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        const task = state.list.find(t => t.id === action.payload.taskId);
        if (task) {
          task.Attachments = task.Attachments.filter(a => a.id !== action.payload.attachmentId);
        }
      });
  },
});

export default tasksSlice.reducer;