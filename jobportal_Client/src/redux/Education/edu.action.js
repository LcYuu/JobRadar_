import { api, API_BASE_URL } from "../../configs/api";
import axios from "axios";
import {
  CREATE_EDU_FAILURE,
  CREATE_EDU_REQUEST,
  CREATE_EDU_SUCCESS,
  DELETE_EDU_FAILURE,
  DELETE_EDU_REQUEST,
  DELETE_EDU_SUCCESS,
  GET_EDU_BY_USER_FAILURE,
  GET_EDU_BY_USER_REQUEST,
  GET_EDU_BY_USER_SUCCESS,
  UPDATE_EDU_REQUEST,
  UPDATE_EDU_SUCCESS,
  UPDATE_EDU_FAILURE,
  GET_EDU_CANDIDATE_REQUEST,
  GET_EDU_CANDIDATE_SUCCESS,
  GET_EDU_CANDIDATE_FAILURE,
} from "./edu.actionType";

export const getEduByUser = () => async (dispatch) => {
  dispatch({ type: GET_EDU_BY_USER_REQUEST });

  try {
    const jwt = localStorage.getItem("jwt"); // Lấy JWT từ localStorage
    if (!jwt) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${API_BASE_URL}/education/seeker`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("Edu: " + response.data);

    dispatch({
      type: GET_EDU_BY_USER_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_EDU_BY_USER_FAILURE,
      payload: error.message,
    });
  }
};

export const deleteEducation = (educationId) => async (dispatch) => {
  try {
    // Bắt đầu gọi API xóa
    dispatch({ type: DELETE_EDU_REQUEST });

    // Gọi API xóa kinh nghiệm
    const response = await axios.delete(
      `http://localhost:8080/education/delete-education/${educationId}`
    );

    dispatch({
      type: DELETE_EDU_SUCCESS,
      payload: educationId, // Trả về experienceId để cập nhật state
    });
  } catch (error) {
    dispatch({
      type: DELETE_EDU_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};

export const createEducation = (eduData) => async (dispatch) => {
  dispatch({ type: CREATE_EDU_REQUEST });
  try {
    const response = await api.post(`/education/create-education`, eduData);
    dispatch({
      type: CREATE_EDU_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: CREATE_EDU_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};

export const updateEducation = (educationId, educationData) => async (dispatch) => {
  dispatch({ type: UPDATE_EDU_REQUEST });
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      throw new Error("No token found");
    }

    const response = await axios.put(
      `${API_BASE_URL}/education/update-education/${educationId}`,
      educationData,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    dispatch({
      type: UPDATE_EDU_SUCCESS,
      payload: response.data,
    });
    
    // Refresh education data
    dispatch(getEduByUser());
  } catch (error) {
    dispatch({
      type: UPDATE_EDU_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};

export const getEduCandidate = (userId) => async (dispatch) => {
  dispatch({ type: GET_EDU_CANDIDATE_REQUEST });

  try {
    const response = await axios.get(`http://localhost:8080/education/profile-seeker`, {
      params: {userId}
    });
    dispatch({
      type: GET_EDU_CANDIDATE_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_EDU_CANDIDATE_FAILURE,
      payload: error.response ? error.response.data : "Đã xảy ra lỗi",
    });
  }
};
