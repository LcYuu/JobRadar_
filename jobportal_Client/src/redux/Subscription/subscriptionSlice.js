import { createSlice } from "@reduxjs/toolkit";
import { createSubscription, deleteSubscription, findSubscriptionBySeekerId, updateSubscription } from "./subscriptionthunk";


const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    currentSubscription: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.message = action.payload;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.message = action.payload;
      })
      .addCase(findSubscriptionBySeekerId.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
      });
  },
});

export const { clearMessage } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;