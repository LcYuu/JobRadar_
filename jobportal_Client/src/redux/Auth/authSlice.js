import { createSlice } from '@reduxjs/toolkit';
import { signupAction, loginAction, getProfileAction, logoutAction, getUserRole, blockCompany, unblockCompany, updateRole, updateEmployer } from './auth.thunk';

const initialState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
  loginStatus: null,
  isAuthenticated: !!localStorage.getItem('jwt'),
  jwt: localStorage.getItem('jwt') || null,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
    setUserFromStorage: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setInitialized: (state, action) => {
      state.isInitializing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAction.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Sign up successful!';
      })
      .addCase(signupAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.loading = false;
        state.jwt = action.payload;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.successMessage = 'Login successful!';
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.loginStatus = "success";
        state.user = action.payload;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.loginStatus = "failure";
        state.error = action.payload || "Đã có lỗi xảy ra";
      })
      .addCase(getProfileAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileAction.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfileAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        return initialState;
      })
      .addCase(logoutAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(blockCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(blockCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(blockCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(unblockCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(unblockCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(unblockCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEmployer.fulfilled, (state,action) => {
        state.loading = false;
        state.successMessage = "Success";  
      })
      // .addCase(updateProfileAction.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(updateProfileAction.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.user = action.payload;
      //   state.successMessage = 'Profile updated successfully!';
      // })
      // .addCase(updateProfileAction.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      .addCase(getUserRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          role: action.payload.role
        }
      })
      .addCase(getUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, setUserFromStorage, setInitialized } = authSlice.actions;
export default authSlice.reducer;
