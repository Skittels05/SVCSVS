import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchIterations = createAsyncThunk(
    'iterations/fetchIterations',
    async (params = {}, { rejectWithValue }) => {
        try {
            let url = '/iterations';
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.project_id) queryParams.append('project_id', params.project_id);
            if (params.type) queryParams.append('type', params.type);

            if (queryParams.toString()) url += `?${queryParams.toString()}`;

            const response = await api.get(url);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const createIteration = createAsyncThunk(
    'iterations/createIteration',
    async (iterationData, { rejectWithValue }) => {
        try {
            const response = await api.post('/iterations', iterationData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const updateIteration = createAsyncThunk(
    'iterations/updateIteration',
    async ({ id, iterationData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/iterations/${id}`, iterationData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const deleteIteration = createAsyncThunk(
    'iterations/deleteIteration',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/iterations/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

const iterationsSlice = createSlice({
    name: 'iterations',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchIterations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchIterations.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
            })
            .addCase(fetchIterations.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createIteration.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(updateIteration.fulfilled, (state, action) => {
                const index = state.list.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            })
            .addCase(deleteIteration.fulfilled, (state, action) => {
                state.list = state.list.filter(i => i.id !== action.payload);
            });
    },
});

export default iterationsSlice.reducer;