import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

interface User {
  id?: string;
  email: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('ai_auth_token') : null,
  user: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('ai_auth_token') : false,
  isLoading: false,
  error: null,
  authModalOpen: false,
  authModalMode: 'login',
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: { email: string; password: string; name?: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/auth/register', payload);
      const { accessToken, user } = response.data;
      if (accessToken && typeof window !== 'undefined') {
        localStorage.setItem('ai_auth_token', accessToken);
      }
      return { token: accessToken, user };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/auth/login', payload);
      const { accessToken, user } = response.data;
      if (accessToken && typeof window !== 'undefined') {
        localStorage.setItem('ai_auth_token', accessToken);
      }
      return { token: accessToken, user };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthModalOpen: (state, action) => {
      state.authModalOpen = action.payload;
    },
    setAuthModalMode: (state, action: { payload: 'login' | 'register' }) => {
      state.authModalMode = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ai_auth_token');
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authModalOpen = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authModalOpen = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAuthModalOpen, setAuthModalMode, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;