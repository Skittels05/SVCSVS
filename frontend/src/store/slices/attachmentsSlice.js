import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAttachments = createAsyncThunk(
    'attachments/fetchAttachments',
    async (params = {}, { rejectWithValue }) => {
        try {
            let url = '/attachments';
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.task_id) queryParams.append('task_id', params.task_id);
            if (params.user_id) queryParams.append('user_id', params.user_id);

            if (queryParams.toString()) url += `?${queryParams.toString()}`;

            const response = await api.get(url);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const createAttachments = createAsyncThunk(
    'attachments/createAttachments',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/attachments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const updateAttachment = createAsyncThunk(
    'attachments/updateAttachment',
    async ({ id, attachmentData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/attachments/${id}`, attachmentData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const deleteAttachment = createAsyncThunk(
    'attachments/deleteAttachment',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/attachments/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

const attachmentsSlice = createSlice({
    name: 'attachments',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttachments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAttachments.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
            })
            .addCase(fetchAttachments.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createAttachments.fulfilled, (state, action) => {
                state.list.unshift(...action.payload);
            })
            .addCase(updateAttachment.fulfilled, (state, action) => {
                const index = state.list.findIndex(a => a.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            })
            .addCase(deleteAttachment.fulfilled, (state, action) => {
                state.list = state.list.filter(a => a.id !== action.payload);
            });
    },
});

export default attachmentsSlice.reducer;