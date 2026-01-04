import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjectMembers = createAsyncThunk(
    'projectMembers/fetchProjectMembers',
    async (params = {}, { rejectWithValue }) => {
        try {
            let url = '/project-members';
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.sort) queryParams.append('sort', params.sort);
            if (params.project_id) queryParams.append('project_id', params.project_id);

            if (queryParams.toString()) url += `?${queryParams.toString()}`;

            const response = await api.get(url);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const updateProjectMember = createAsyncThunk(
    'projectMembers/updateProjectMember',
    async ({ id, memberData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/project-members/${id}`, memberData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const deleteProjectMember = createAsyncThunk(
    'projectMembers/deleteProjectMember',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/project-members/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);
export const createProjectMember = createAsyncThunk(
    'projectMembers/createProjectMember',
    async (memberData, { rejectWithValue }) => {
        try {
            const response = await api.post('/project-members', memberData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

const projectMembersSlice = createSlice({
    name: 'projectMembers',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectMembers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
            })
            .addCase(fetchProjectMembers.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createProjectMember.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(updateProjectMember.fulfilled, (state, action) => {
                const index = state.list.findIndex(m => m.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            })
            .addCase(deleteProjectMember.fulfilled, (state, action) => {
                state.list = state.list.filter(m => m.id !== action.payload);
            });

    },
});

export default projectMembersSlice.reducer;