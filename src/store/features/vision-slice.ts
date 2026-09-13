import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

interface VisionState {
  imagePreviewUrl: string | null;
  instruction: string;
  resultDescription: string | null;
  isLoading: boolean;
  error: string | null;
  history: Array<{
    id: string;
    imageUrl: string;
    instruction: string;
    description: string;
    createdAt: string;
  }>;
}

const initialState: VisionState = {
  imagePreviewUrl: null,
  instruction: 'Describe this for an alt-text tag',
  resultDescription: null,
  isLoading: false,
  error: null,
  history: [],
};

export const describeImage = createAsyncThunk(
  'vision/describeImage',
  async (payload: { file: File; instruction?: string }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('image', payload.file);
      if (payload.instruction) {
        formData.append('instruction', payload.instruction);
      }

      const response = await apiClient.post('/vision/describe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const description =
        response.data?.description ||
        response.data?.result ||
        response.data?.text ||
        JSON.stringify(response.data);

      return {
        description,
        instruction: payload.instruction || 'Describe this for an alt-text tag',
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Vision analysis failed');
    }
  }
);

const visionSlice = createSlice({
  name: 'vision',
  initialState,
  reducers: {
    setImagePreview: (state, action) => {
      state.imagePreviewUrl = action.payload;
      state.resultDescription = null;
      state.error = null;
    },
    setVisionInstruction: (state, action) => {
      state.instruction = action.payload;
    },
    resetVisionState: (state) => {
      state.imagePreviewUrl = null;
      state.resultDescription = null;
      state.error = null;
      state.instruction = 'Describe this for an alt-text tag';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(describeImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(describeImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resultDescription = action.payload.description;
        if (state.imagePreviewUrl) {
          state.history.unshift({
            id: Date.now().toString(),
            imageUrl: state.imagePreviewUrl,
            instruction: action.payload.instruction,
            description: action.payload.description,
            createdAt: new Date().toISOString(),
          });
        }
      })
      .addCase(describeImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setImagePreview, setVisionInstruction, resetVisionState } = visionSlice.actions;
export default visionSlice.reducer;