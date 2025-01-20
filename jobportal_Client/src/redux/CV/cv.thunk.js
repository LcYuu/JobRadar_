import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";
import axios from "axios";


// Lấy CV của người tìm việc
export const getCVBySeeker = createAsyncThunk(
  "cv/getCVBySeeker",
  async (_, { rejectWithValue }) => {
    try {
      const jwt = sessionStorage.getItem("jwt");
      if (!jwt) {
        throw new Error("No token found");
      }
      const response = await api.get(`/cv/searchCV`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật CV chính
export const updateCVIsMain = createAsyncThunk(
  "cv/updateCVIsMain",
  async (cvId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/cv/cv-main/${cvId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Xóa CV
export const deleteCV = createAsyncThunk(
  "cv/deleteCV",
  async (cvId, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:8080/cv/delete-cv/${cvId}`);
      
      return cvId;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Tạo mới CV
export const createCV = createAsyncThunk(
  "cv/createCV",
  async (cvData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/cv/create-cv`, cvData);
      console.log("🚀 ~ response:", response)
      return response.data;
      
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);
