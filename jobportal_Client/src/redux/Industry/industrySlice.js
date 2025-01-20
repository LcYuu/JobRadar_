// src/redux/industry/industrySlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getIndustry, getIndustryCount, getAllIndustries } from './industry.thunk.js';

const initialState = {
  industries: [],
  industryCount: [],
  loading: false,
  error: null,
  allIndustries: [],
};

const industrySlice = createSlice({
  name: 'industry',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIndustry.pending, (state) => {
        state.loading = true;
      })
      .addCase(getIndustry.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload;
        state.error = null;
      })
      .addCase(getIndustry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getIndustryCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getIndustryCount.fulfilled, (state, action) => {
        state.loading = false;
        state.industryCount = action.payload;
        state.error = null;
      })
      .addCase(getIndustryCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllIndustries.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.allIndustries = action.payload;
        state.error = null;
      })
      .addCase(getAllIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default industrySlice.reducer;
