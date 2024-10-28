import {
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAILURE,
    CHANGE_PASSWORD_REQUEST,
    CHANGE_PASSWORD_SUCCESS,
    CHANGE_PASSWORD_FAILURE,
  } from "./forgotPassword.actionType";
  
  const initialState = {
    loading: false,
    message: null,
    error: null,
  };
  
  export const forgotPasswordReducer = (state = initialState, action) => {
    switch (action.type) {
      case FORGOT_PASSWORD_REQUEST:
      case CHANGE_PASSWORD_REQUEST:
        return { ...state, loading: true, error: null };
      case FORGOT_PASSWORD_SUCCESS:
      case CHANGE_PASSWORD_SUCCESS:
        return { ...state, loading: false, message: action.payload, error: null };
      case FORGOT_PASSWORD_FAILURE:
      case CHANGE_PASSWORD_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };