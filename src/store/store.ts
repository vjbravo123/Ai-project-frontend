import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth-slice';
import chatReducer from './features/chat-slice';
import visionReducer from './features/vision-slice';
import newsAgentReducer from './features/news-agent-slice';
import healthReducer from './features/health-slice';
import revisionReducer from './features/revision-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    vision: visionReducer,
    newsAgent: newsAgentReducer,
    health: healthReducer,
    revision: revisionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors with file objects/blobs in actions (e.g. Vision/Audio uploads)
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;