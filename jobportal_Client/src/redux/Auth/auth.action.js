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
  GET_PROFILE_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE
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
      sessionStorage.setItem("jwt", data.token);
      dispatch({ type: LOGIN_SUCCESS, payload: data.token });
      
      // Fetch user profile
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      
      dispatch({ type: GET_PROFILE_SUCCESS, payload: profileResponse.data });
      
      // Đảm bảo trả về object với success: true
      return { success: true };
    } else {
      throw new Error('Token not received');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại";
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};


export const getProfileAction = () => async (dispatch) => {
  dispatch({type: GET_PROFILE_REQUEST});
  try {
    const jwt = sessionStorage.getItem('jwt');
    if (!jwt) {
      throw new Error('No token found');
    }
    
    const { data } = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    
    if (data) {
      dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
      return true;
    } else {
      throw new Error('Invalid profile data');
    }
  } catch (error) {
    console.error("Profile Fetch Error: ", error);
    dispatch({ type: GET_PROFILE_FAILURE, payload: error.message });
    // Chỉ xóa token nếu lỗi 401/403
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      sessionStorage.removeItem('jwt');
    }
    return false;
  }
};


export const logoutAction = () => async (dispatch) => {
  dispatch({ type: LOGOUT_REQUEST });
  try {
    const token = sessionStorage.getItem('jwt');
    const response = await axios.post(`${API_BASE_URL}/auth/signout`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      sessionStorage.removeItem('jwt');
      dispatch({ type: LOGOUT_SUCCESS });
      window.location.href = '/auth/sign-in';
    }
  } catch (error) {
    dispatch({ type: LOGOUT_FAILURE, payload: error.message });
  }
};