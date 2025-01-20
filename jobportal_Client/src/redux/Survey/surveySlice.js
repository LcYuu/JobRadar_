import { createSlice } from "@reduxjs/toolkit";
import { getSurveyStatistics, submitSurvey } from "./survey.thunk";

const initialState = {
  loading: false,
  error: null,
  survey: null,
  statistics: null,
};

const surveySlice = createSlice({
  name: "survey",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // SUBMIT_SURVEY
    builder
      .addCase(submitSurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitSurvey.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.survey = action.payload;
      })
      .addCase(submitSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSurveyStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSurveyStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(getSurveyStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default surveySlice.reducer;
