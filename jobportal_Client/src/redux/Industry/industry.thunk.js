// src/redux/industry/industryThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/industry';  // Sửa URL theo đúng API của bạn

export const getIndustry = createAsyncThunk(
  'industry/getIndustry',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/countJobByIndustry`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getIndustryCount = createAsyncThunk(
  'industry/getIndustryCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/count-industry`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllIndustries = createAsyncThunk(
  'industry/getAllIndustries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-all`);
      const validIndustries = response.data.filter(industry => 
        industry.industryName && 
        industry.industryName.toLowerCase() !== 'none'
      );
      return validIndustries;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
