import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";

// Thunk actions
export const getApplyJobByUser = createAsyncThunk(
  "applyJob/getApplyJobByUser",
  async ({ currentPage, size }, { rejectWithValue }) => {

    try {
      const response = await api.get(
        `/apply-job/get-apply-job-by-user?page=${currentPage}&size=${size}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOneApplyJob = createAsyncThunk(
  "applyJob/getOneApplyJob",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/apply-job/find/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createApply = createAsyncThunk(
  "applyJob/createApply",
  async ({ applyData, postId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/apply-job/create-apply/${postId}`,
        applyData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateApply = createAsyncThunk(
  "applyJob/updateApply",
  async ({ applyData, postId }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/apply-job/update-apply/${postId}`,
        applyData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkIfApplied = createAsyncThunk(
  "applyJob/checkIfApplied",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/apply-job/checkApply/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Async thunks
export const getApplyJobByCompany = createAsyncThunk(
  "applyJob/getApplyJobByCompany",
  async (
    { currentPage, size, fullName = "", isSave = null, title = "" },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        size: size,
        ...(fullName && { fullName }),
        ...(isSave !== null && { isSave }),
        ...(title && { title }),
      }).toString();

      const response = await api.get(
        `/apply-job/get-apply-job-by-company?${queryParams}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateApprove = createAsyncThunk(
  "applyJob/updateApprove",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/apply-job/setApprove/${postId}/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCandidateApplyInfo = createAsyncThunk(
  "applyJob/getCandidateApplyInfo",
  async ({ userId, postId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/apply-job/candidate-apply/${userId}/${postId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch candidate apply info"
      );
    }
  }
);

export const getNotificationViewJob = createAsyncThunk(
  "applyJob/getNotificationViewJob",
  async ({ userId, postId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/apply-job/viewApply/${userId}/${postId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch candidate apply info"
      );
    }
  }
);
