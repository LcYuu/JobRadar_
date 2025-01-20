import { createSlice } from "@reduxjs/toolkit";
import { getCity } from "./city.thunk";

const citySlice = createSlice({
    name: "city",
    initialState: {
      cities: [], // Danh sách thành phố
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(getCity.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getCity.fulfilled, (state, action) => {
          state.loading = false;
          state.cities = action.payload; // Lưu dữ liệu thành phố vào state
        })
        .addCase(getCity.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload; // Lưu lỗi nếu xảy ra
        });
    },
  });
  
  export default citySlice.reducer;
  