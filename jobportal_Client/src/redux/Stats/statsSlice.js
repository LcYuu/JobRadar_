import { createSlice } from "@reduxjs/toolkit";
import { getActiveJobs, getDailyStats, getTotalCompanies, getTotalJobs, getTotalUsers } from "./stats.thunk";

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
    dailyStats: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTotalUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTotalUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.totalUsers = action.payload;
      })
      .addCase(getTotalUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getTotalCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTotalCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCompanies = action.payload;
      })
      .addCase(getTotalCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getTotalJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTotalJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.totalJobs = action.payload;
      })
      .addCase(getTotalJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getActiveJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.activeJobs = action.payload;
      })
      .addCase(getActiveJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getDailyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyStats = action.payload;
      })
      .addCase(getDailyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default statsSlice.reducer;
