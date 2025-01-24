import { createSlice } from "@reduxjs/toolkit";
import {
  createSocialLink,
  deleteSocialLink,
  fetchPlatforms,
  fetchSocialLinks,
  fetchSocialLinksByUserId,
  updateSocialLink,
} from "./socialLink.thunk";

const socialLinkSlice = createSlice({
  name: "socialLink",
  initialState: {
    socialLinks: [],
    loading: false,
    error: null,
    message: null,
    platforms: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocialLinks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSocialLinks.fulfilled, (state, action) => {
        state.loading = false;
        state.socialLinks = action.payload;
      })
      .addCase(fetchSocialLinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSocialLinksByUserId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSocialLinksByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.socialLinks = action.payload;
      })
      .addCase(fetchSocialLinksByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSocialLink.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSocialLink.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(createSocialLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSocialLink.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSocialLink.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.socialLinks.findIndex(
          (link) => link.id === action.payload.id
        );
        if (index !== -1) {
          state.socialLinks[index] = action.payload;
        }
      })
      .addCase(updateSocialLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSocialLink.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSocialLink.fulfilled, (state, action) => {
        state.loading = false;
        state.socialLinks = state.socialLinks.filter(
          (link) => link.id !== action.payload.id
        );
        state.message = action.payload;
      })
      .addCase(deleteSocialLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlatforms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.loading = false;
        state.platforms = action.payload;
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default socialLinkSlice.reducer;
