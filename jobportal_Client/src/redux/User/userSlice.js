import { createSlice } from "@reduxjs/toolkit";
import {
  deleteUser,
  getAllUsers,
  getUserTypes,
  updateUserStatus,
} from "./user.thunk";

const initialState = {
  users: [],
  userTypes: {},
  loading: false,
  error: null,
  totalPages: 0,
  totalElements: 0,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserTypes.fulfilled, (state, action) => {
        const userTypesMap = action.payload.reduce((acc, type) => {
          acc[type.id] = type.name;
          return acc;
        }, {});
        state.loading = false;
        state.userTypes = userTypesMap;
        state.error = null;
      })
      .addCase(getUserTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (user) => user.userId !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user.userId === updatedUser.userId
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        state.error = null;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
