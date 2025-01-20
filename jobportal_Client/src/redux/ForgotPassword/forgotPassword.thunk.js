import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";


// Async actions
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `auth/forgot-password/verifyMail/${email}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ email, passwords }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `auth/forgot-password/changePassword/${email}`,
        passwords
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `auth/forgot-password/verifyOtp/${email}/${otp}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  }
);