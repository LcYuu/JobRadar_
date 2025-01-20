import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";

export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async ({ userName, userTypeId, active, page, size }, { rejectWithValue }) => {

    try {
      const response = await api.get("/users/admin-get-all", {
        params: { userName, userTypeId, active, page, size },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi");
    }
  }
);
      

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/delete-user/${userId}`);
      return userId; // Trả về userId để cập nhật state sau khi xóa
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put("/users/update-user", userData);
      return response.data; // Trả về dữ liệu cập nhật để cập nhật state
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getUserTypes = createAsyncThunk(
  "users/getUserTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/user-types");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getUserRoles = createAsyncThunk(
  "users/getUserRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/user-role");
      return response.data;
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return rejectWithValue(error.message);
    }
  }
);
