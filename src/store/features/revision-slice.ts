import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

export interface RevisionHistoryEntry {
  transcript: string;
  summary: string;
  keyPoints: string[];
  understandingScore: number;
  studiedAt: string;
}

export interface RevisionTopic {
  _id: string;
  userId?: string;
  title: string;
  normalizedTitle?: string;
  latestSummary?: string;
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  lastRevisedAt?: string;
  nextRevisionAt: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  history: RevisionHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

interface RevisionState {
  topics: RevisionTopic[];
  dueTopics: RevisionTopic[];
  isLoadingTopics: boolean;
  isLoadingDueTopics: boolean;
  isLogging: boolean;
  isReviewing: boolean;
  isDeleting: boolean;
  error: string | null;
  successNotification: string | null;
  activeTopicIdForReview: string | null;
}

const initialState: RevisionState = {
  topics: [],
  dueTopics: [],
  isLoadingTopics: false,
  isLoadingDueTopics: false,
  isLogging: false,
  isReviewing: false,
  isDeleting: false,
  error: null,
  successNotification: null,
  activeTopicIdForReview: null,
};

// 1. Fetch All Topics (GET /revision)
export const fetchRevisionTopics = createAsyncThunk(
  'revision/fetchTopics',
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get('/revision');
      return (Array.isArray(response.data) ? response.data : []) as RevisionTopic[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch revision topics');
    }
  }
);

// 2. Fetch Due Topics (GET /revision/due)
export const fetchDueRevisionTopics = createAsyncThunk(
  'revision/fetchDueTopics',
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get('/revision/due');
      return (Array.isArray(response.data) ? response.data : []) as RevisionTopic[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch due topics');
    }
  }
);

// 3. Log Study Session via Audio (POST /revision/log)
export const logStudyAudio = createAsyncThunk(
  'revision/logAudio',
  async (audioBlob: Blob | File, thunkAPI) => {
    try {
      const formData = new FormData();
      // Ensure file name with extension
      const fileName = audioBlob instanceof File ? audioBlob.name : 'study-recording.webm';
      formData.append('audio', audioBlob, fileName);

      const response = await apiClient.post('/revision/log', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data as RevisionTopic;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Audio study session analysis failed');
    }
  }
);

// 4. Log Study Session via Text (POST /revision/log-text)
export const logStudyText = createAsyncThunk(
  'revision/logText',
  async (text: string, thunkAPI) => {
    try {
      const response = await apiClient.post('/revision/log-text', { text });
      return response.data as RevisionTopic;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Text study session logging failed');
    }
  }
);

// 5. Review Topic (POST /revision/:id/review)
export const reviewTopic = createAsyncThunk(
  'revision/reviewTopic',
  async (payload: { topicId: string; quality: number }, thunkAPI) => {
    try {
      const response = await apiClient.post(`/revision/${payload.topicId}/review`, {
        quality: payload.quality,
      });
      return response.data as RevisionTopic;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to submit review');
    }
  }
);

// 6. Delete Topic (DELETE /revision/:id)
export const deleteTopic = createAsyncThunk(
  'revision/deleteTopic',
  async (topicId: string, thunkAPI) => {
    try {
      await apiClient.delete(`/revision/${topicId}`);
      return topicId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete revision topic');
    }
  }
);

const revisionSlice = createSlice({
  name: 'revision',
  initialState,
  reducers: {
    setActiveTopicForReview: (state, action) => {
      state.activeTopicIdForReview = action.payload;
    },
    clearRevisionNotifications: (state) => {
      state.error = null;
      state.successNotification = null;
    },
  },
  extraReducers: (builder) => {
    // fetchRevisionTopics
    builder
      .addCase(fetchRevisionTopics.pending, (state) => {
        state.isLoadingTopics = true;
        state.error = null;
      })
      .addCase(fetchRevisionTopics.fulfilled, (state, action) => {
        state.isLoadingTopics = false;
        state.topics = action.payload;
      })
      .addCase(fetchRevisionTopics.rejected, (state, action) => {
        state.isLoadingTopics = false;
        state.error = action.payload as string;
      });

    // fetchDueRevisionTopics
    builder
      .addCase(fetchDueRevisionTopics.pending, (state) => {
        state.isLoadingDueTopics = true;
      })
      .addCase(fetchDueRevisionTopics.fulfilled, (state, action) => {
        state.isLoadingDueTopics = false;
        state.dueTopics = action.payload;
      })
      .addCase(fetchDueRevisionTopics.rejected, (state) => {
        state.isLoadingDueTopics = false;
      });

    // logStudyAudio
    builder
      .addCase(logStudyAudio.pending, (state) => {
        state.isLogging = true;
        state.error = null;
        state.successNotification = null;
      })
      .addCase(logStudyAudio.fulfilled, (state, action) => {
        state.isLogging = false;
        state.successNotification = `Study session logged for "${action.payload.title}"!`;
        const updated = action.payload;
        const idx = state.topics.findIndex((t) => t._id === updated._id);
        if (idx >= 0) {
          state.topics[idx] = updated;
        } else {
          state.topics.unshift(updated);
        }
      })
      .addCase(logStudyAudio.rejected, (state, action) => {
        state.isLogging = false;
        state.error = action.payload as string;
      });

    // logStudyText
    builder
      .addCase(logStudyText.pending, (state) => {
        state.isLogging = true;
        state.error = null;
        state.successNotification = null;
      })
      .addCase(logStudyText.fulfilled, (state, action) => {
        state.isLogging = false;
        state.successNotification = `Study session logged for "${action.payload.title}"!`;
        const updated = action.payload;
        const idx = state.topics.findIndex((t) => t._id === updated._id);
        if (idx >= 0) {
          state.topics[idx] = updated;
        } else {
          state.topics.unshift(updated);
        }
      })
      .addCase(logStudyText.rejected, (state, action) => {
        state.isLogging = false;
        state.error = action.payload as string;
      });

    // reviewTopic
    builder
      .addCase(reviewTopic.pending, (state) => {
        state.isReviewing = true;
        state.error = null;
      })
      .addCase(reviewTopic.fulfilled, (state, action) => {
        state.isReviewing = false;
        state.activeTopicIdForReview = null;
        state.successNotification = `Scheduled next review for "${action.payload.title}"`;
        const updated = action.payload;
        const idx = state.topics.findIndex((t) => t._id === updated._id);
        if (idx >= 0) {
          state.topics[idx] = updated;
        }
        state.dueTopics = state.dueTopics.filter((t) => t._id !== updated._id);
      })
      .addCase(reviewTopic.rejected, (state, action) => {
        state.isReviewing = false;
        state.error = action.payload as string;
      });

    // deleteTopic
    builder
      .addCase(deleteTopic.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.isDeleting = false;
        const topicId = action.payload;
        state.topics = state.topics.filter((t) => t._id !== topicId);
        state.dueTopics = state.dueTopics.filter((t) => t._id !== topicId);
        state.successNotification = 'Topic deleted successfully';
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTopicForReview, clearRevisionNotifications } = revisionSlice.actions;
export default revisionSlice.reducer;
