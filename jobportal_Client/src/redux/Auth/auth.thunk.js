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

export const getProfileAction = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('No token found');
      }

      const { data } = await api.get(`${API_BASE_URL}/users/profile`, {
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
