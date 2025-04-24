import { createSlice } from "@reduxjs/toolkit";
import { countReviewByCompany, countReviewByStar, countStarByCompanyId, createReview, deleteReview, findAllReview, findReviewByCompany, findReviewByCompanyIdAndUserId, finđAllReview, getReviewByCompany } from "./review.thunk";

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
      reviews: [],
      countByStar: [],
      review: null,
      countReview: 0,
      loading: false,
      error: null,
      totalPages: null,
      totalElements: null,
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
        })
        .addCase(findReviewByCompany.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(findReviewByCompany.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = action.payload.content;
          state.totalPages = action.payload.page.totalPages;
          state.totalElements = action.payload.page.totalElements;
        })
        .addCase(findReviewByCompany.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(findAllReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(findAllReview.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = action.payload.content;
          state.totalPages = action.payload.page.totalPages;
          state.totalElements = action.payload.page.totalElements;
        })
        .addCase(findAllReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(findReviewByCompanyIdAndUserId.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(findReviewByCompanyIdAndUserId.fulfilled, (state, action) => {
          state.loading = false;
          state.review = action.payload;
        })
        .addCase(findReviewByCompanyIdAndUserId.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(countReviewByStar.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(countReviewByStar.fulfilled, (state, action) => {
          state.loading = false;
          state.countByStar = action.payload;
        })
        .addCase(countReviewByStar.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(countStarByCompanyId.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(countStarByCompanyId.fulfilled, (state, action) => {
          state.loading = false;
          state.countByStar = action.payload;
        })
        .addCase(countStarByCompanyId.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });
  
  export default reviewSlice.reducer;