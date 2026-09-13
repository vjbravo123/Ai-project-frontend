import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

export interface AgentRunResult {
  subject: string;
  articleCount?: number;
  markdown: string;
  html: string;
  savedTo?: string;
}

interface NewsAgentState {
  goal: string;
  topic: string;
  currentRun: AgentRunResult | null;
  isLoading: boolean;
  progressStep: number;
  error: string | null;
  history: Array<AgentRunResult & { timestamp: string }>;
}

const initialState: NewsAgentState = {
  goal: 'Create a weekly newsletter on the latest AI agent news and send it to our subscribers.',
  topic: 'AI agents',
  currentRun: null,
  isLoading: false,
  progressStep: 0,
  error: null,
  history: [],
};

export const runNewsletterAgent = createAsyncThunk(
  'newsAgent/run',
  async (payload: { goal?: string; topic?: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/news-agent/run', payload);
      return response.data as AgentRunResult;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Newsletter generation failed');
    }
  }
);

const newsAgentSlice = createSlice({
  name: 'newsAgent',
  initialState,
  reducers: {
    setAgentGoal: (state, action) => {
      state.goal = action.payload;
    },
    setAgentTopic: (state, action) => {
      state.topic = action.payload;
    },
    resetAgentRun: (state) => {
      state.currentRun = null;
      state.error = null;
      state.progressStep = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runNewsletterAgent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.progressStep = 1;
      })
      .addCase(runNewsletterAgent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRun = action.payload;
        state.progressStep = 4;
        state.history.unshift({
          ...action.payload,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(runNewsletterAgent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.progressStep = 0;
      });
  },
});

export const { setAgentGoal, setAgentTopic, resetAgentRun } = newsAgentSlice.actions;
export default newsAgentSlice.reducer;