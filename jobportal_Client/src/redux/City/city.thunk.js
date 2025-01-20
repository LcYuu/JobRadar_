import { createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

// Thay thế URL thực tế của API
export const getCity = createAsyncThunk(
  "city/getCity",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:8080/city/get-all");
      return response.data; // Trả về dữ liệu nhận được từ API
    } catch (error) {
      return rejectWithValue(error.message); // Trả về lỗi nếu có
    }
  }
);
