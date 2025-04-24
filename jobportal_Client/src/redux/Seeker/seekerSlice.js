import { createSlice } from "@reduxjs/toolkit";
import {
  followCompany,
  getCandidateProfile,
  getCandidateSkills,
  getFollowedCompany,
  getSeekerByUser,
  updateSeekerAction,
} from "./seeker.thunk";

const seekerSlice = createSlice({
  name: "seeker",
  initialState: {
    seeker: [],
    profileCandidate: null,
    skillsCandidate: null,
    loading: false,
    error: null,
    followedCompany: [],
    action: null,
    follow: [],
    message: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSeekerByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSeekerByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.seeker = action.payload;
      })
      .addCase(getSeekerByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSeekerAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeekerAction.fulfilled, (state, action) => {
        state.loading = false;
        state.seeker = action.payload;
      })
      .addCase(updateSeekerAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFollowedCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFollowedCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.followedCompany = action.payload;
      })
      .addCase(getFollowedCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Follow/Unfollow Company
      .addCase(followCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followCompany.fulfilled, (state, action) => {
        const { companyId, action: followAction, message } = action.payload;
        if (followAction === "follow") {
          state.action = followAction;
          state.follow = [...state.follow, action.payload.companyId];
        } else if (followAction === "unfollow") {
          state.action = followAction;
          state.follow = state.follow.filter((id) => id !== companyId);
        }
        state.message = message;
        state.error = null;
      })
      .addCase(followCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCandidateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCandidateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profileCandidate = action.payload;
      })
      .addCase(getCandidateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCandidateSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCandidateSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skillsCandidate = action.payload;
      })
      .addCase(getCandidateSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default seekerSlice.reducer;
