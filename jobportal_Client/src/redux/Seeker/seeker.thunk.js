import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";

// Async Thunks

// Get Seeker by User
export const getSeekerByUser = createAsyncThunk(
  "seeker/getSeekerByUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/seeker/seeker-profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update Seeker
export const updateSeekerAction = createAsyncThunk(
  "seeker/updateSeeker",
  async ({userData}, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/seeker/update-seeker", userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get Followed Companies
export const getFollowedCompany = createAsyncThunk(
  "seeker/getFollowedCompany",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/seeker/followed-companies");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// // Follow/Unfollow Company
// export const followCompany = createAsyncThunk(
//   "seeker/followCompany",
//   async (companyId, { rejectWithValue }) => {
//     try {
//       const response = await api.put(`/seeker/follow/${companyId}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

export const followCompany = createAsyncThunk(
  "seeker/followCompany",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/seeker/follow/${companyId}`);
      const { action, message } = response.data;
      return { companyId, action, message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get Candidate Profile
export const getCandidateProfile = createAsyncThunk(
  "seeker/getCandidateProfile",
  async ({ userId, postId }, { rejectWithValue }) => {
    try {
      const response = await api.get("/seeker/profile-apply", {
        params: { userId, postId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get Candidate Skills
export const getCandidateSkills = createAsyncThunk(
  "seeker/getCandidateSkills",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get("/seeker/candidate-skills", {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
