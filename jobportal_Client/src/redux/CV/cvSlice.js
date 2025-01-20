import { createSlice } from "@reduxjs/toolkit";
import { getCVBySeeker, updateCVIsMain, deleteCV, createCV } from "./cv.thunk";

const initialState = {
  cvs: [],
  loading: false,
  error: null,
  successMessage: null,
};

const cvSlice = createSlice({
  name: "cv",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCVBySeeker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCVBySeeker.fulfilled, (state, action) => {
        state.loading = false;
        state.cvs = action.payload;
        state.error = null;
      })
      .addCase(getCVBySeeker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCVIsMain.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCVIsMain.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "CV chính đã được cập nhật!";
      })
      .addCase(updateCVIsMain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCV.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCV.fulfilled, (state, action) => {
        state.loading = false;
        state.cvs = state.cvs.filter((cv) => cv.id !== action.payload);

      })
      .addCase(deleteCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCV.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCV.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = cvSlice.actions;

export default cvSlice.reducer;
