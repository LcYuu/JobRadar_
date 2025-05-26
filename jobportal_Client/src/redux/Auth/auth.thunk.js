import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api, API_BASE_URL } from '../../configs/api';
import { startInactivityTimer } from '../../utils/session';

// Thêm action type
export const signupAction = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {

      const response = await axios.post('http://localhost:8080/auth/signup', userData);

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'An unknown error occurred.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginAction = createAsyncThunk(
  'auth/login',
  async (loginData, { dispatch,rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, loginData);

      if (data.token) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });

        const roleResponse = await axios.get(`${API_BASE_URL}/auth/user-role`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },  
        });
        

        const user = {
          ...profileResponse.data,
          role: roleResponse.data.role,
        };

        return { success: true, user };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateRole = createAsyncThunk(
  "auth/updateRole",
  async (role, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await axios.post(
        `${API_BASE_URL}/auth/update-role/${role}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Trả về dữ liệu từ API (bao gồm userTypeId)
    } catch (error) {
      return rejectWithValue(error.response?.data || "Đã có lỗi xảy ra");
    }
  }
);

export const getProfileAction = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('No token found');
      }

      const { data } = await api.get(`/users/profile`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (data) {
        return data;
      } else {
        throw new Error('Invalid profile data');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAction = createAsyncThunk(
  'auth/logout',
  async (_, {dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.post(`${API_BASE_URL}/auth/signout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        return;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateProfileAction = createAsyncThunk(
  'auth/updateProfile',
  async ({userData}, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/users/update-user', userData);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserRole = createAsyncThunk(
  'auth/getUserRole',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/user-role');
      return response.data.role;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const blockCompany = createAsyncThunk(
  "auth/blockCompany",
  async ({ companyId, blockedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/block-company/${companyId}`, blockedData);
      console.log("🚀 ~ response:", response)
      return response.data; // Trả về thông báo từ server
      
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra");
    }
  }
);

export const unblockCompany = createAsyncThunk(
  "auth/unblockCompany",
  async ({ companyId }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/unblock-company/${companyId}`);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra");
    }
  }
);

export const updateEmployer = createAsyncThunk(
  "auth/updateEmployer",
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/update-employer", companyData);
      return response.data; 
    } catch (error) {
      console.error("Error updating employer:", error);
      return rejectWithValue(
        error.response?.data?.message || "Cập nhật thông tin công ty thất bại"
      );
    }
  }
);

export const googleLoginAction = createAsyncThunk(
  'auth/googleLogin',
  async (googleToken, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/google`, {
        token: googleToken,
      });

      if (response.data.token) {
        localStorage.setItem('jwt', response.data.token);

        const checkEmailResponse = await axios.post(
          `${API_BASE_URL}/auth/check-email`,
          { token: googleToken }
        );

        if (checkEmailResponse.data) {
          const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`,
            },
          });

          const roleResponse = await axios.get(`${API_BASE_URL}/auth/user-role`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`,
            },
          });

          const user = {
            ...profileResponse.data,
            role: roleResponse.data.role,
          };

          return { success: true, user };
        } else {
          return { success: true, needsRoleSelection: true };
        }
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
