import { createSlice } from "@reduxjs/toolkit";
import { createImageCompany, deleteImageCompany } from "./imageCompany.thunk";

const initialState = {
  imageCompany: [], // Mảng chứa các hình ảnh công ty
  loading: false,
  error: null,
};

const imageCompanySlice = createSlice({
  name: "imageCompany",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // DELETE_IMAGE_COMPANY
      .addCase(deleteImageCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteImageCompany.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload) {
          console.error("action.payload không hợp lệ:", action.payload);
        } else if (Array.isArray(state.imageCompany)) {
          state.imageCompany = state.imageCompany.filter(
            (image) => image.id !== action.payload
          );
        } else {
          console.error("state.imageCompany không phải là mảng:", state.imageCompany);
        }
        state.error = null;
      })
      .addCase(deleteImageCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // CREATE_IMAGE_COMPANY
      .addCase(createImageCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createImageCompany.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.imageCompany = [...state.imageCompany, ...action.payload];
        } else {
          console.error("action.payload không phải là mảng:", action.payload);
        }
        state.error = null;
      })
      .addCase(createImageCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default imageCompanySlice.reducer;
