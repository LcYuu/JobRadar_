import axios from "axios";
import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE
} from "./auth.actionType";
import { API_BASE_URL } from "../../configs/api";


export const signupAction = (userData) => async (dispatch) => {
  dispatch({ type: SIGNUP_REQUEST });
  try {
    console.log("Sending signup data:", userData);
    const response = await axios.post("http://localhost:8080/auth/signup", userData);
    console.log("Signup response received:", response.data);
    dispatch({ type: SIGNUP_SUCCESS, payload: response.data });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data || error.message || "An unknown error occurred.";
    dispatch({ type: SIGNUP_FAILURE, payload: errorMessage });
    console.error("Signup failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
};




export const loginAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, loginData);

      if (data.token) {
          localStorage.setItem("jwt", data.token);
      }

      dispatch({ type: LOGIN_SUCCESS, payload: data.token });
      return { success: true, data: data.token };
  } catch (error) {
      // Lấy thông báo lỗi từ phản hồi nếu có, nếu không thì dùng thông báo mặc định
      const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi không xác định.";
      console.error("Login Error: ", errorMessage);
      dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
  }
};


export const getProfileAction = (jwt) => async (dispatch) => {
  dispatch({type: GET_PROFILE_REQUEST});
  try {
      const { data } = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: {
              Authorization: `Bearer ${jwt}`,
          },
      });
      console.log("Profile data: ", data);
      dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
  } catch (error) {
      console.error("Profile Fetch Error: ", error);
      dispatch({ type: GET_PROFILE_FAILURE, payload: error });
  }
};