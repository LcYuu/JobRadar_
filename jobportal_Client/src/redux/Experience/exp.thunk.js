import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";

export const getExpByUser = createAsyncThunk(
  "experience/getExpByUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/experience/seeker`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Delete experience
export const deleteExperience = createAsyncThunk(
  "experience/deleteExperience",
  async (experienceId, { rejectWithValue }) => {
    try {
      await api.delete(`/experience/delete-experience/${experienceId}`);
      return experienceId;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Create experience
export const createExperience = createAsyncThunk(
  "experience/createExperience",
  async (expData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/experience/create-experience`, expData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Update experience
export const updateExperience = createAsyncThunk(
  "experience/updateExperience",
  async ({ experienceId, experienceData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(
        `/experience/update-experience/${experienceId}`,
        experienceData
      );
      console.log("🚀 ~ response:", response)
      dispatch(getExpByUser());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);
      

// Get experience by candidate (userId)
export const getExpCandidate = createAsyncThunk(
  "experience/getExpCandidate",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/experience/profile-seeker`, {
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
