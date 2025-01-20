import { createSlice } from "@reduxjs/toolkit";
import { countReviewByCompany, createReview, deleteReview, getReviewByCompany } from "./review.thunk";

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
      reviews: [],
      countReview: 0,
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Get Reviews By Company
        .addCase(getReviewByCompany.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getReviewByCompany.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = action.payload;
        })
        .addCase(getReviewByCompany.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Count Reviews By Company
        .addCase(countReviewByCompany.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(countReviewByCompany.fulfilled, (state, action) => {
          state.loading = false;
          state.countReview = action.payload;
        })
        .addCase(countReviewByCompany.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Create Review
        .addCase(createReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createReview.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = [...state.reviews, action.payload];
        })
        .addCase(createReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Delete Review
        .addCase(deleteReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteReview.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = state.reviews.filter(
            (review) => review.id !== action.meta.arg
          );
        })
        .addCase(deleteReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export default reviewSlice.reducer;