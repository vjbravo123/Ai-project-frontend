import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  pendingOtpEmail: string | null;
  requiresOtp: boolean;
  authViewMode: 'login' | 'register' | 'otp';
  sidebarOpen: boolean;
}

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('ai_auth_token');
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ai_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialToken = getStoredToken();
const initialUser = getStoredUser();

const initialState: AuthState = {
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
  successMessage: null,
  pendingOtpEmail: null,
  requiresOtp: false,
  authViewMode: 'login',
  sidebarOpen: true,
};

// 1. Register User (Step 1 of 2: sends OTP to email)
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: { email: string; password: string; name?: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/auth/register', payload);
      return {
        message: response.data.message || 'Registration successful. Please verify the OTP sent to your email.',
        email: payload.email,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// 2. Verify OTP (Step 2 of 2: activates account and returns accessToken)
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { email: string; otp: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', payload);
      const { accessToken, user } = response.data;
      if (accessToken && typeof window !== 'undefined') {
        localStorage.setItem('ai_auth_token', accessToken);
        if (user) {
          localStorage.setItem('ai_auth_user', JSON.stringify(user));
        }
      }
      return { token: accessToken, user };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

// 3. Resend OTP
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (payload: { email: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/auth/resend-otp', payload);
      return response.data.message || 'A new verification code has been sent to your email.';
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to resend verification code');
    }
  }
);

// 4. Login User (for verified accounts)
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/auth/login', payload);
      const { accessToken, user } = response.data;
      if (accessToken && typeof window !== 'undefined') {
        localStorage.setItem('ai_auth_token', accessToken);
        if (user) {
          localStorage.setItem('ai_auth_user', JSON.stringify(user));
        }
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
    setAuthViewMode: (state, action: PayloadAction<'login' | 'register' | 'otp'>) => {
      state.authViewMode = action.payload;
      state.error = null;
      state.successMessage = null;
    },
    setPendingOtpEmail: (state, action: PayloadAction<string>) => {
      state.pendingOtpEmail = action.payload;
      state.requiresOtp = true;
      state.authViewMode = 'otp';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;
      state.pendingOtpEmail = null;
      state.requiresOtp = false;
      state.authViewMode = 'login';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ai_auth_token');
        localStorage.removeItem('ai_auth_user');
      }
    },
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingOtpEmail = action.payload.email;
        state.requiresOtp = true;
        state.authViewMode = 'otp';
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // verifyOtp
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.requiresOtp = false;
        state.pendingOtpEmail = null;
        state.successMessage = 'Verification successful! Welcome.';
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // resendOtp
    builder
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload as string;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        const errMsg = action.payload as string;
        state.error = errMsg;
        // If error indicates unverified email, allow immediate switch to OTP mode
        if (errMsg.toLowerCase().includes('verif') || errMsg.toLowerCase().includes('otp')) {
          state.requiresOtp = true;
        }
      });
  },
});

export const {
  setAuthViewMode,
  setPendingOtpEmail,
  toggleSidebar,
  setSidebarOpen,
  logout,
  clearAuthMessages,
} = authSlice.actions;

export default authSlice.reducer;