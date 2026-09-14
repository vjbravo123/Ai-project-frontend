import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

export interface ChatMessage {
  id?: string;
  _id?: string;
  role: 'user' | 'assistant' | 'human' | 'ai';
  content: string;
  createdAt?: string;
}

export interface ConversationItem {
  id?: string;
  _id?: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ChatState {
  activeConversationId: string | null;
  conversations: { data: ConversationItem[]; isLoading: boolean; error: string | null };
  currentMessages: { data: ChatMessage[]; isLoading: boolean; error: string | null };
  sendingMessage: boolean;
  deleteState: { isLoading: boolean; error: string | null };
}

const initialState: ChatState = {
  activeConversationId: null,
  conversations: { data: [], isLoading: false, error: null },
  currentMessages: { data: [], isLoading: false, error: null },
  sendingMessage: false,
  deleteState: { isLoading: false, error: null },
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get('/chat/conversations');
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to load conversations');
    }
  }
);

export const fetchConversationById = createAsyncThunk(
  'chat/fetchConversationById',
  async (conversationId: string, thunkAPI) => {
    try {
      const response = await apiClient.get(`/chat/conversations/${conversationId}`);
      return { conversationId, data: response.data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch conversation details');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: { message: string; conversationId?: string | null }, thunkAPI) => {
    try {
      const response = await apiClient.post('/chat/message', {
        message: payload.message,
        ...(payload.conversationId ? { conversationId: payload.conversationId } : {}),
      });
      return {
        userMessage: payload.message,
        reply: response.data.reply || response.data.response || response.data.message || response.data,
        conversationId: response.data.conversationId || payload.conversationId,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId: string, thunkAPI) => {
    try {
      await apiClient.delete(`/chat/conversations/${conversationId}`);
      return conversationId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete conversation');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startNewConversation: (state) => {
      state.activeConversationId = null;
      state.currentMessages.data = [];
      state.currentMessages.error = null;
    },
    setActiveConversationId: (state, action) => {
      state.activeConversationId = action.payload;
    },
    appendOptimisticUserMessage: (state, action) => {
      state.currentMessages.data.push({
        role: 'user',
        content: action.payload,
        createdAt: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    // fetchConversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversations.isLoading = true;
        state.conversations.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations.isLoading = false;
        const list = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || action.payload?.conversations || [];
        state.conversations.data = list;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversations.isLoading = false;
        state.conversations.error = action.payload as string;
      })
      // fetchConversationById
      .addCase(fetchConversationById.pending, (state) => {
        state.currentMessages.isLoading = true;
        state.currentMessages.error = null;
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.currentMessages.isLoading = false;
        state.activeConversationId = action.payload.conversationId;
        const raw = action.payload.data;
        const rawMessages = Array.isArray(raw?.messages)
          ? raw.messages
          : Array.isArray(raw)
          ? raw
          : [];
        // Normalize backend role 'human' -> 'user', 'ai' -> 'assistant'
        state.currentMessages.data = rawMessages.map((m: any) => ({
          id: m._id || m.id,
          role: (m.role === 'human' || m.role === 'user') ? 'user' : 'assistant',
          content: m.content,
          createdAt: m.createdAt,
        }));
      })
      .addCase(fetchConversationById.rejected, (state, action) => {
        state.currentMessages.isLoading = false;
        state.currentMessages.error = action.payload as string;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        state.activeConversationId = action.payload.conversationId;
        state.currentMessages.data.push({
          role: 'assistant',
          content: typeof action.payload.reply === 'string' ? action.payload.reply : JSON.stringify(action.payload.reply),
          createdAt: new Date().toISOString(),
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.currentMessages.error = action.payload as string;
      })
      // deleteConversation
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations.data = state.conversations.data.filter(
          (c) => (c._id || c.id) !== action.payload
        );
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = null;
          state.currentMessages.data = [];
        }
      });
  },
});

export const { startNewConversation, setActiveConversationId, appendOptimisticUserMessage } = chatSlice.actions;
export default chatSlice.reducer;