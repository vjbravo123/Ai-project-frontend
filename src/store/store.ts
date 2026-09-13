import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth-slice';
import chatReducer from './features/chat-slice';
import visionReducer from './features/vision-slice';
import newsAgentReducer from './features/news-agent-slice';
import healthReducer from './features/health-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    vision: visionReducer,
    newsAgent: newsAgentReducer,
    health: healthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors with file objects/blobs in actions (e.g. Vision uploads)
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;