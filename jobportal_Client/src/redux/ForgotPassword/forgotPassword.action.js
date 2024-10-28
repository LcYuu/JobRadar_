import axios from "axios";
import {
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE,
} from "./forgotPassword.actionType";
import { API_BASE_URL } from "../../configs/api";

export const forgotPasswordAction = (email) => async (dispatch) => {
  dispatch({ type: FORGOT_PASSWORD_REQUEST });
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/verifyMail/${email}`);
    dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: response.data, success: true });
    return { success: true }; // Return success
  } catch (error) {
    dispatch({ type: FORGOT_PASSWORD_FAILURE, payload: error.response?.data || error.message, success: false });
    return { success: false }; // Return failure
  }
};

export const changePasswordAction = (email, passwords) => async (dispatch) => {
  dispatch({ type: CHANGE_PASSWORD_REQUEST });
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/changePassword/${email}`, passwords);
    dispatch({ type: CHANGE_PASSWORD_SUCCESS, payload: response.data, success: true });
    return { success: true }; 
  } catch (error) {
    dispatch({ type: CHANGE_PASSWORD_FAILURE, payload: error.response?.data || error.message, success: false });
    return { success: false }; 
  }
};

export const verifyOtpAction = ({ email, otp }) => async (dispatch) => {
    dispatch({ type: VERIFY_OTP_REQUEST });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/verifyOtp/${email}/${otp}`);
      dispatch({ type: VERIFY_OTP_SUCCESS, payload: response.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: VERIFY_OTP_FAILURE, payload: error.response?.data || error.message });
      return { success: false };
    }
  };
