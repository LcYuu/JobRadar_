import { createSlice } from "@reduxjs/toolkit";
import { getAllSkill } from "./skill.thunk";

const initialState = {
  skills: [], // Danh sách kỹ năng
  loading: false,
  error: null,
};

const skillSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSkill.pending, (state) => {
        state.loading = true; 
        state.error = null; 
      })
      .addCase(getAllSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload; 
      })
      .addCase(getAllSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default skillSlice.reducer;
