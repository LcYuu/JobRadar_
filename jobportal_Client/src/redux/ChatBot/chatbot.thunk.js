import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../configs/api";


export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async ({ text }, { rejectWithValue }) => {
    try {
      // Lấy thông tin người dùng từ localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.userId || 'guest'; // Dự phòng nếu không có userId

      // Chuẩn bị yêu cầu gửi tới backend
      const chatRequest = { message: text, sender: userId };
      const response = await api.post('/chatbot/send', chatRequest);

      // Xử lý phản hồi từ Rasa
      const botMessages = response.data
      .filter((msg) => !msg.sender || msg.sender !== userId) // Loại bỏ tin nhắn người dùng nếu có
      .map((msg) => ({
        sender: 'bot',
        text: msg.text || null,
        jobs: msg.custom?.jobs || null,
      }));

      // Trả về tin nhắn người dùng và bot
      return botMessages
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Không thể kết nối với server'
      );
    }
  }
);