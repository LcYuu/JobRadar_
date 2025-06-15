import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";

// Async Thunks

export const createSubscription = createAsyncThunk(
  "subscription/create",
  async (subscription, { rejectWithValue }) => {
    try {
      const response = await api.post("/subscription/create", subscription);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Cập nhật Subscription
export const updateSubscription = createAsyncThunk(
  "subscription/update",
  async ({ subId, email, emailFrequency }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/subscription/update/${subId}`, {
        email,
        emailFrequency // Gửi cả email và emailFrequency
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi cập nhật subscription");
    }
  }
);

// Xóa Subscription
export const deleteSubscription = createAsyncThunk(
  "subscription/delete",
  async (subId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/subscription/delete/${subId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi xóa subscription");
    }
  }
);

// Tìm Subscription theo SeekerId
export const findSubscriptionBySeekerId = createAsyncThunk(
  "subscription/findBySeekerId",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/subscription/findBySeekerId");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);