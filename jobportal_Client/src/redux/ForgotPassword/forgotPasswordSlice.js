import { createSlice } from "@reduxjs/toolkit";
import { changePassword, forgotPassword, verifyOtp } from "./forgotPassword.thunk";

const forgotPasswordSlice = createSlice({
    name: "forgotPassword",
    initialState: {
      loading: false,
      message: null,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      // Forgot Password
      builder
        .addCase(forgotPassword.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(forgotPassword.fulfilled, (state, action) => {
          state.loading = false;
          state.message = action.payload;
        })
        .addCase(forgotPassword.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(changePassword.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(changePassword.fulfilled, (state, action) => {
          state.loading = false;
          state.message = action.payload;
        })
        .addCase(changePassword.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(verifyOtp.pending, (state) => {
          state.loading = true;
          state.message = false;
          state.error = null;
        })
        .addCase(verifyOtp.fulfilled, (state, action) => {
          state.loading = false;
          state.message = action.payload;
        })
        .addCase(verifyOtp.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export default forgotPasswordSlice.reducer;
  