import { createSlice } from "@reduxjs/toolkit";
import { createExperience, deleteExperience, getExpByUser, getExpCandidate, updateExperience } from "./exp.thunk";

const experienceSlice = createSlice({
    name: 'experience',
    initialState: {
      exp: [],
      expCandidate: 0,
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Get experience by user
        .addCase(getExpByUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getExpByUser.fulfilled, (state, action) => {
          state.loading = false;
          state.exp = action.payload;
        })
        .addCase(getExpByUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Delete experience
        .addCase(deleteExperience.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteExperience.fulfilled, (state, action) => {
          state.loading = false;
          state.exp = state.exp.filter(
            (exp) => exp.id !== action.payload
          );
        })
        .addCase(deleteExperience.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Create experience
        .addCase(createExperience.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createExperience.fulfilled, (state, action) => {
          state.loading = false;
          state.exp = [...state.exp, action.payload];
        })
        .addCase(createExperience.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Update experience
        .addCase(updateExperience.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateExperience.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(updateExperience.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Get experience by candidate
        .addCase(getExpCandidate.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getExpCandidate.fulfilled, (state, action) => {
          state.loading = false;
          state.expCandidate = action.payload;
        })
        .addCase(getExpCandidate.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export default experienceSlice.reducer;
  