import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('current_user', JSON.stringify(user));

      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Ошибка входа' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ full_name, email, password }, { rejectWithValue }) => {
    try {
      await api.post('/auth/register', { full_name, email, password });
      const loginResponse = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token, user } = loginResponse.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('current_user', JSON.stringify(user));

      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Ошибка регистрации' });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  if (refresh_token) {
    try {
      await api.post('/auth/logout', { refresh_token });
    } catch (err) {
      console.warn('Ошибка при логауте');
    }
  }
  localStorage.clear();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('current_user')) || null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка входа';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;