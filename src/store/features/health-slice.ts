import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

interface HealthState {
  status: 'online' | 'offline' | 'checking';
  lastChecked: string | null;
  serverInfo: any;
}

const initialState: HealthState = {
  status: 'checking',
  lastChecked: null,
  serverInfo: null,
};

export const checkHealth = createAsyncThunk('health/check', async (_, thunkAPI) => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue('Backend offline');
  }
});

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkHealth.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(checkHealth.fulfilled, (state, action) => {
        state.status = 'online';
        state.lastChecked = new Date().toISOString();
        state.serverInfo = action.payload;
      })
      .addCase(checkHealth.rejected, (state) => {
        state.status = 'offline';
        state.lastChecked = new Date().toISOString();
      });
  },
});

export default healthSlice.reducer;