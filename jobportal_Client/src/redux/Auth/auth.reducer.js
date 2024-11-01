import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
} from "./auth.actionType";

const initialState = {
  loading: false,
  user: null,
  error: null,
  jwt: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGNUP_REQUEST:
    case LOGIN_REQUEST:
    case GET_PROFILE_REQUEST:
    case LOGOUT_REQUEST:
      return { ...state, loading: true, error: null };
    
    case GET_PROFILE_SUCCESS:
      return { ...state, loading: false, user: action.payload, error: null };
    
    case LOGIN_SUCCESS:
      return { ...state, loading: false, jwt: action.payload, error: null };
    
    case LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        jwt: null,
      };
    
    case SIGNUP_FAILURE:
    case LOGIN_FAILURE:
    case LOGOUT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
};