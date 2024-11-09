import { api } from "../../configs/api";
import axios from "axios";
import { CREATE_CV_FAILURE, CREATE_CV_REQUEST, CREATE_CV_SUCCESS, DELETE_CV_FAILURE, DELETE_CV_REQUEST, DELETE_CV_SUCCESS, GET_CV_FAILURE, GET_CV_REQUEST, GET_CV_SUCCESS, UPDATE_CV_MAIN_FAILURE, UPDATE_CV_MAIN_REQUEST, UPDATE_CV_MAIN_SUCCESS } from "./cv.actionType";


export const getCVBySeeker= () => async (dispatch) => {
  dispatch({ type: GET_CV_REQUEST });

  try {
    const jwt = sessionStorage.getItem("jwt"); // Lấy JWT từ sessionStorage
    if (!jwt) {
      throw new Error("No token found");
    }

    const response = await api.get(`/cv/searchCV`)
     

    console.log("CV: " + response.data);

    dispatch({
      type: GET_CV_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_CV_FAILURE,
      payload: error.message,
    });
  }
};

export const updateCVIsMain = (cvId) => async (dispatch) => {
  dispatch({ type: UPDATE_CV_MAIN_REQUEST });
  try {
    
    // Gọi API xóa kinh nghiệm
    const response = await api.post(`/cv/cv-main/${cvId}`);

    dispatch({
      type: UPDATE_CV_MAIN_SUCCESS,
      payload: response.data, // Trả về experienceId để cập nhật state
    });
  } catch (error) {
    dispatch({
      type: UPDATE_CV_MAIN_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};

export const deleteCV = (cvId) => async (dispatch) => {
  dispatch({ type: DELETE_CV_REQUEST });
  try {
    
    // Gọi API xóa kinh nghiệm
    const response = await axios.delete(
      `http://localhost:8080/cv/delete-cv/${cvId}`
    );

    dispatch({
      type: DELETE_CV_SUCCESS,
      payload: cvId, // Trả về experienceId để cập nhật state
    });
  } catch (error) {
    dispatch({
      type: DELETE_CV_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};

export const createCV = (cvData) => async (dispatch) => {
  dispatch({ type: CREATE_CV_REQUEST });
  try {
    const response = await api.post(`/cv/create-cv`, cvData);
    dispatch({
      type: CREATE_CV_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: CREATE_CV_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};
