import { createSlice } from '@reduxjs/toolkit';
import { sendMessage } from './chatbot.thunk';

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    loading: false,
    messages: [],
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    addUserMessage(state, action) {
      state.messages = [...state.messages, action.payload];
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = [...state.messages, ...action.payload];
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, addUserMessage, clearMessages } = chatbotSlice.actions;
export default chatbotSlice.reducer;