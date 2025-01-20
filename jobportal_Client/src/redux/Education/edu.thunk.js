import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";

export const getEduByUser = createAsyncThunk(
  "education/getEduByUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/education/seeker`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Delete education
export const deleteEducation = createAsyncThunk(
  "education/deleteEducation",
  async (educationId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/education/delete-education/${educationId}`
      );
      return educationId; // Trả về `educationId` để cập nhật state
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Create education
export const createEducation = createAsyncThunk(
  "education/createEducation",
  async (eduData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/education/create-education`, eduData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Update education
export const updateEducation = createAsyncThunk(
  "education/updateEducation",
  async ({ educationId, educationData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(
        `/education/update-education/${educationId}`,
        educationData
      );
      // Refresh education data
      dispatch(getEduByUser());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Get education by candidate (userId)
export const getEduCandidate = createAsyncThunk(
  "education/getEduCandidate",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/education/profile-seeker`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);
