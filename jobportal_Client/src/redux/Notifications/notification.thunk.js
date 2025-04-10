import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../configs/api';

// Fetch danh sách thông báo chưa đọc
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seeker/notifications/${userId}`);

      return response.data.filter(notification => !notification.isRead);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch số lượng thông báo chưa đọc
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seeker/unread-count/${userId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Đánh dấu thông báo là đã đọc
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE_URL}/seeker/read/${notificationId}`);

      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
