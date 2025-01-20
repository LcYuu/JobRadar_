import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";


// SUBMIT_SURVEY
export const submitSurvey = createAsyncThunk(
  'survey/submitSurvey',
  async ({ surveyId, surveyData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/surveys/${surveyId}`, surveyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// GET_SURVEY_STATISTICS
export const getSurveyStatistics = createAsyncThunk(
  'survey/getSurveyStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/surveys/statistics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
