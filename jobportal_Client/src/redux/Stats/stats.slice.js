import { createSlice } from "@reduxjs/toolkit";
import { getGrowthStats } from "../actions/statsActions";

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
    dailyStats: [],
    growthStats: {
      userGrowth: 0,
      companyGrowth: 0,
      jobGrowth: 0,
      activeJobGrowth: 0
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGrowthStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGrowthStats.fulfilled, (state, action) => {
        state.loading = false;
        state.growthStats = {
          userGrowth: action.payload.userGrowth || 0,
          companyGrowth: action.payload.companyGrowth || 0,
          jobGrowth: action.payload.jobGrowth || 0,
          activeJobGrowth: action.payload.activeJobGrowth || 0
        };
      })
      .addCase(getGrowthStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep default growthStats values on error
      });
  },
});

export const selectStats = (state) => state.stats;
export default statsSlice.reducer;