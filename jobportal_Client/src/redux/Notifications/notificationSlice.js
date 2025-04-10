import { createSlice } from "@reduxjs/toolkit";
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead } from "./notification.thunk";

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: {
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchNotifications.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchNotifications.fulfilled, (state, action) => {
          state.loading = false;
          state.notifications = action.payload;
        })
        .addCase(fetchNotifications.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(fetchUnreadCount.fulfilled, (state, action) => {
          state.unreadCount = action.payload;
        })
        .addCase(markNotificationAsRead.fulfilled, (state, action) => {
          state.notifications = state.notifications.filter(
            (notification) => notification.notificationId !== action.payload
          );
          state.unreadCount -= 1;
        });
    }
  });
  
  export default notificationsSlice.reducer;