import axios from "axios";
import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_REQUEST,
  GET_PROFILE_FAILURE,

  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  GET_USER_ROLE_REQUEST,
  GET_USER_ROLE_SUCCESS,
  GET_USER_ROLE_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  
} from "./auth.actionType";
import { api, API_BASE_URL } from "../../configs/api";
import { UPDATE_JOB_REQUEST } from "../JobPost/jobPost.actionType";



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
      dispatch({ type: LOGIN_SUCCESS, payload: data.token });
      
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      
      const roleResponse = await axios.get(`${API_BASE_URL}/auth/user-role`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      
      dispatch({ 
        type: GET_PROFILE_SUCCESS, 
        payload: {
          ...profileResponse.data,
          role: roleResponse.data.role
        }
      });
      
      return { success: true, user: { ...profileResponse.data, role: roleResponse.data.role } };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    return { success: false, message: errorMessage };
  }
};


export const getProfileAction = () => async (dispatch) => {
  dispatch({type: GET_PROFILE_REQUEST});
  try {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      throw new Error('No token found');
    }
    
    const { data } = await api.get(`${API_BASE_URL}/users/profile`, {
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
      return true;
  } catch (error) {
    console.error("Profile Fetch Error: ", error);
    dispatch({ type: GET_PROFILE_FAILURE, payload: error.message });

  }
};


export const logoutAction = () => async (dispatch) => {
  dispatch({ type: LOGOUT_REQUEST });
  try {
    const token = localStorage.getItem('jwt');
    const response = await axios.post(`${API_BASE_URL}/auth/signout`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      localStorage.removeItem('jwt');
      dispatch({ type: LOGOUT_SUCCESS });
      window.location.href = '/';
    } 
  } catch (error) {
    dispatch({ type: LOGOUT_FAILURE, payload: error.message });
  }
};


export const updateProfileAction = (userData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  try {
      const { data } = await api.put("/users/update-user", userData);
      console.log("Profile updated: ", data);
      dispatch({ type: UPDATE_PROFILE_SUCCESS, payload: data });
      return data; 
  } catch (error) {
      console.error("Profile Update Error: ", error);
      dispatch({ type: UPDATE_PROFILE_FAILURE, payload: error });
      throw error; 
  }
};

export const getUserRole = () => async (dispatch) => {
  dispatch({ type: GET_USER_ROLE_REQUEST });

  try {
    const response = await api.get('/auth/user-role');
    dispatch({
      type: GET_USER_ROLE_SUCCESS,
      payload: response.data.role
    });
  } catch (error) {
    dispatch({
      type: GET_USER_ROLE_FAILURE,
      payload: error.message,
    });
  }
};