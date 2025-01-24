import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { api, API_BASE_URL } from "../../configs/api";


export const fetchPlatforms = createAsyncThunk(
    'platforms/fetchPlatforms',
    async () => {
      const response = await api.get('/socialLink/social-platforms');
      return response.data;
    }
  );

export const fetchSocialLinks = createAsyncThunk(
  "socialLink/fetchSocialLinks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/socialLink/get-socialLink-by-userId`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSocialLinksByUserId = createAsyncThunk(
  'socialLinks/fetchSocialLinks',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/socialLink/profile-socialLink`, {
        params: { userId },
      
      });
      console.log("🚀 ~ response:", response)
      return response.data; // Trả về danh sách socialLinks
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Đã xảy ra lỗi khi gọi API.'
      );
    }
  }
);

export const createSocialLink = createAsyncThunk(
  "socialLink/createSocialLink",
  async (socialLink, { rejectWithValue }) => {
    try {
      const response = await api.post(`/socialLink/create-socialLink`, socialLink);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSocialLink = createAsyncThunk(
  "socialLink/updateSocialLink",
  async ({ id, socialLink }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/socialLink/update-socialLink/${id}`, socialLink);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSocialLink = createAsyncThunk(
  "socialLink/deleteSocialLink",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/socialLink/delete-socialLink/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
