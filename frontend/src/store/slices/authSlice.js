import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import axios from 'axios';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('current_user', JSON.stringify(user));

      return { user, access_token, refresh_token };
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

      return { user, access_token, refresh_token };
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
      console.warn('Ошибка при выходе на сервере');
    }
  }
  localStorage.clear();
  return null;
});

export const refreshToken = createAsyncThunk('auth/refreshToken', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const refresh_token = state.auth.refresh_token || localStorage.getItem('refresh_token');

  if (!refresh_token) {
    return rejectWithValue({ message: 'Нет refresh-токена' });
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/refresh', { refresh_token });
    const { access_token } = response.data;

    localStorage.setItem('access_token', access_token);

    return { access_token };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Ошибка обновления токена' });
  }
});

export const loadAuthFromStorage = createAsyncThunk('auth/loadFromStorage', async () => {
  const access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  const current_user = localStorage.getItem('current_user');

  if (access_token && refresh_token && current_user) {
    return {
      user: JSON.parse(current_user),
      access_token,
      refresh_token,
    };
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    access_token: null,
    refresh_token: null,
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
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка входа';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.access_token = null;
        state.refresh_token = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.access_token = action.payload.access_token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.access_token = null;
        state.refresh_token = null;
        localStorage.clear();
      })
      .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.access_token = action.payload.access_token;
          state.refresh_token = action.payload.refresh_token;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;