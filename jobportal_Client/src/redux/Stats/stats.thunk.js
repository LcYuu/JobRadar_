import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../configs/api';


// Async Thunks
export const getTotalUsers = createAsyncThunk('stats/getTotalUsers', async (_, rejectWithValue) => {
  try {
    const response = await api.get(`/users/get-all`);
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getTotalCompanies = createAsyncThunk('stats/getTotalCompanies', async (_, rejectWithValue) => {
  try {
    const response = await api.get(`/company/find-all`);
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getTotalJobs = createAsyncThunk('stats/getTotalJobs', async (_, rejectWithValue) => {
  try {
    const response = await api.get(`/job-post/get-all`);
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getActiveJobs = createAsyncThunk('stats/getActiveJobs', async (_, rejectWithValue) => {
  try {
    const params = { page: 0, size: 1 };
    const response = await api.get(`/job-post/search-job-by-feature`, { params });
    return response.data.page?.totalElements || 0;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const getDailyStats = createAsyncThunk('stats/getDailyStats', async ({ startDate, endDate }, rejectWithValue) => {
  try {
    const response = await api.get(`/stats/daily`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê');
  }
});

export const getGrowthStats = createAsyncThunk(
  "stats/getGrowthStats",
  async (_, thunkAPI) => {
    try {
      const response = await fetch("http://localhost:8080/stats/growth-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch growth stats");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);