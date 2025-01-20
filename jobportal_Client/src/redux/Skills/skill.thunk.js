import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getAllSkill = createAsyncThunk(
  "skills/getAllSkill",  // Thêm prefix cho hành động (bạn có thể đặt tên tuỳ ý)
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:8080/skills/get-all"); // Thay thế với URL thực tế
      return response.data; // Payload được trả về sẽ là response.data
    } catch (error) {
      return rejectWithValue(error.message); // Trả về lỗi nếu có
    }
  }
);
