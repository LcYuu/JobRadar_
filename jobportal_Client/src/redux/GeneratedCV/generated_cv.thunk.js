import { createAsyncThunk } from "@reduxjs/toolkit";
import { api, API_BASE_URL } from "../../configs/api";
import axios from "axios";


// Lấy CV của người tìm việc
export const getGenCVBySeeker = createAsyncThunk(
  "genCV/getGenCVBySeeker",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/generated-cv/search-cv`);
      
      return response.data;
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
      
export const getGenCVById = createAsyncThunk(
  "genCV/getGenCVById",
  async (genCvId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/generated-cv/get-gencv-by-id/${genCvId}?t=${Date.now()}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      console.log("🚀 ~ API Response for genCvId:", genCvId, response.data);
      return response.data;
    } catch (error) {
      console.error("🚀 ~ API Error for genCvId:", genCvId, error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Xóa CV
export const deleteCV = createAsyncThunk(
  "genCV/deleteCV",
  async (genCvId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/generated-cv/delete-cv/${genCvId}`);
      return genCvId;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Tạo mới CV
export const createCV = createAsyncThunk(
  "genCV/createCV",
  async (cvData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/generated-cv/create-cv`, cvData);
      return response.data;
      
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Update 
export const updateCV = createAsyncThunk(
  "genCV/updateCV",
  async ({ genCvId, cvData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/generated-cv/update-cv/${genCvId}`,
        cvData
      );
      console.log("API response data:", response.data); // Log for debugging
      return response.data; // Ensure API returns updated CV data
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);
