import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";
import axios from "axios";

// DELETE_IMAGE_COMPANY
export const deleteImageCompany = createAsyncThunk(
  'imageCompany/deleteImageCompany',
  async (imgId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `http://localhost:8080/image-company/delete-image/${imgId}`
      );
      return imgId; // Trả về imgId để cập nhật state
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// CREATE_IMAGE_COMPANY
export const createImageCompany = createAsyncThunk(
  'imageCompany/createImageCompany',
  async (imgData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/image-company/create-image`, imgData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);
