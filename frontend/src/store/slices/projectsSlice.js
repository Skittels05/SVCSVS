import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async ({ page = 1, limit = 10, sort } = {}, { rejectWithValue }) => {
        try {
            let url = '/projects';
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);
            if (sort) params.append('sort', sort);

            url += `?${params.toString()}`;
            const response = await api.get(url);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const createProject = createAsyncThunk(
    'projects/createProject',
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await api.post('/projects', projectData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const updateProject = createAsyncThunk(
    'projects/updateProject',
    async ({ id, projectData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/projects/${id}`, projectData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/projects/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

const projectsSlice = createSlice({
    name: 'projects',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
            })
            .addCase(fetchProjects.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                const index = state.list.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.list = state.list.filter(p => p.id !== action.payload);
            });
    },
});

export default projectsSlice.reducer;