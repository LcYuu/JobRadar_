import { createSlice } from "@reduxjs/toolkit";
import { createEducation, deleteEducation, getEduByUser, getEduCandidate, updateEducation } from "./edu.thunk";

const educationSlice = createSlice({
    name: 'education',
    initialState: {
      edu: [],
      loading: false,
      error: null,
      eduCandidate: null
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Get education by user
        .addCase(getEduByUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getEduByUser.fulfilled, (state, action) => {
          state.loading = false;
          state.edu = action.payload;
        })
        .addCase(getEduByUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Delete education
        .addCase(deleteEducation.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteEducation.fulfilled, (state, action) => {
          state.loading = false;
          state.edu = state.edu.filter(
            (edu) => edu.id !== action.payload
          );
        })
        .addCase(deleteEducation.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Create education
        .addCase(createEducation.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createEducation.fulfilled, (state, action) => {
          state.loading = false;
          state.edu = [...state.edu, action.payload];
        })
        .addCase(createEducation.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Update education
        .addCase(updateEducation.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateEducation.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(updateEducation.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Get education by candidate
        .addCase(getEduCandidate.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getEduCandidate.fulfilled, (state, action) => {
          state.loading = false;
          state.eduCandidate = action.payload;
        })
        .addCase(getEduCandidate.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export default educationSlice.reducer;