import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../configs/api';
import axios from 'axios';

export const getReviewByCompany = createAsyncThunk(
  'review/getReviewByCompany',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/review/findReviewByCompanyId/${companyId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
      


export const countReviewByCompany = createAsyncThunk(
  'review/countReviewByCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/review/countReviewByCompany`);
      return response.data;
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async ({ reviewData, companyId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/review/create-review/${companyId}`,
        {
          star: reviewData.star,
          message: reviewData.message,
          anonymous: Boolean(reviewData.isAnonymous),
          createDate: new Date().toISOString(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/review/delete/${reviewId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);