import axios from "axios";
import {
  CREATE_IMAGE_COMPANY_FAILURE,
  CREATE_IMAGE_COMPANY_REQUEST,
  CREATE_IMAGE_COMPANY_SUCCESS,
  DELETE_IMAGE_COMPANY_FAILURE,
  DELETE_IMAGE_COMPANY_REQUEST,
  DELETE_IMAGE_COMPANY_SUCCESS,
} from "./imageCompany.actionType";
import { api } from "../../configs/api";

export const deleteImageCompany = (imgId) => async (dispatch) => {
  try {
    // Bắt đầu gọi API xóa
    dispatch({ type: DELETE_IMAGE_COMPANY_REQUEST });

    // Gọi API xóa kinh nghiệm
    const response = await axios.delete(
      `http://localhost:8080/image-company/delete-image/${imgId}`
    );

    dispatch({
      type: DELETE_IMAGE_COMPANY_SUCCESS,
      payload: imgId, // Trả về experienceId để cập nhật state
    });
  } catch (error) {
    dispatch({
      type: DELETE_IMAGE_COMPANY_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};

export const createImageCompany = (imgData) => async (dispatch) => {
  dispatch({ type: CREATE_IMAGE_COMPANY_REQUEST });

  try {
    const jwt = sessionStorage.getItem("jwt"); // Lấy JWT từ sessionStorage
    if (!jwt) {
      throw new Error("No token found");
    }

    const response = await api.post(`/image-company/create-image`, imgData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: CREATE_IMAGE_COMPANY_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: CREATE_IMAGE_COMPANY_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};
