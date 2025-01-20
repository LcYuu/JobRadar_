import { createSlice } from "@reduxjs/toolkit";
import {
  checkIfApplied,
  createApply,
  getApplyJobByCompany,
  getApplyJobByUser,
  getCandidateApplyInfo,
  getNotificationViewJob,
  getOneApplyJob,
  updateApply,
  updateApprove,
} from "./applyJob.thunk";

const applyJobSlice = createSlice({
  name: "applyJob",
  initialState: {
    applyJobByUser: [],
    oneApplyJob: null,
    updateApply: null,
    totalElements: null,
    loading: false,
    error: null,
    totalPages: null,
    hasApplied: null,
    applyJobByCompany: [],
    approveApply: null,
    candidateApplyInfo: null,
    viewedJobs: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get apply jobs by user
      .addCase(getApplyJobByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApplyJobByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.applyJobByUser = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
      })
      .addCase(getApplyJobByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get one apply job
      .addCase(getOneApplyJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOneApplyJob.fulfilled, (state, action) => {
        state.loading = false;
        state.oneApplyJob = action.payload;
      })
      .addCase(getOneApplyJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create apply
      .addCase(createApply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApply.fulfilled, (state, action) => {
        state.loading = false;
        state.applyJobByUser = [...state.applyJobByUser, action.payload];
        state.hasApplied = true;
      })
      .addCase(createApply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update apply
      .addCase(updateApply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApply.fulfilled, (state, action) => {
        state.loading = false;
        state.updateApply = action.payload;
      })
      .addCase(updateApply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check if applied
      .addCase(checkIfApplied.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIfApplied.fulfilled, (state, action) => {
        state.loading = false;
        state.hasApplied = action.payload;
      })
      .addCase(checkIfApplied.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getApplyJobByCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApplyJobByCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.applyJobByCompany = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
      })
      .addCase(getApplyJobByCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateApprove.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApprove.fulfilled, (state, action) => {
        state.loading = false;
        state.approveApply = action.payload;
      })
      .addCase(updateApprove.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getCandidateApplyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCandidateApplyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.candidateApplyInfo = action.payload;
      })
      .addCase(getCandidateApplyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getNotificationViewJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotificationViewJob.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedJobs = [...state.viewedJobs, action.payload];
      })
      .addCase(getNotificationViewJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default applyJobSlice.reducer;
