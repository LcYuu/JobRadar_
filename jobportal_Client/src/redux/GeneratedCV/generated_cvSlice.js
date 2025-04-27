import { createSlice } from "@reduxjs/toolkit";
import { createCV, deleteCV, getGenCVById, getGenCVBySeeker, updateCV } from "./generated_cv.thunk";

const initialState = {
  genCvs: [],
  genCv: null,
  loading: false,
  error: null,
};

const generated_cvSlice = createSlice({
  name: "genCV",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
    },
    resetGenCv: (state) => {
      state.genCv = null; // Reset genCv
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGenCVBySeeker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGenCVBySeeker.fulfilled, (state, action) => {
        state.loading = false;
        state.genCvs = action.payload;
        state.error = null;
      })
      .addCase(getGenCVBySeeker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getGenCVById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGenCVById.fulfilled, (state, action) => {

        console.log("🚀 ~ getGenCVById.fulfilled, action.payload:", action.payload);
        state.loading = false;
        state.genCv = action.payload;
        state.error = null;
      })
      .addCase(getGenCVById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCV.fulfilled, (state, action) => {
        state.loading = false;
        state.genCvs = state.genCvs.filter((cvs) => cvs.generatedCvId !== action.payload);

      })
      .addCase(deleteCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCV.fulfilled, (state, action) => {
        state.loading = false;
        state.genCvs = [...state.genCvs, action.payload];
      })
      .addCase(createCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCV.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, resetGenCv } = generated_cvSlice.actions;
export default generated_cvSlice.reducer;

