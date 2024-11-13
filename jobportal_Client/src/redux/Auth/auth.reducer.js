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
  UPDATE_PROFILE_SUCCESS,
  GET_USER_ROLE_REQUEST,
  GET_USER_ROLE_SUCCESS,
  GET_USER_ROLE_FAILURE,
} from "./auth.actionType";

const initialState = {
  user: null,
  loading: false,
  error: null,
  jwt: sessionStorage.getItem('jwt') || null,
  isAuthenticated: !!sessionStorage.getItem('jwt'),
  userRole: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGNUP_REQUEST:
    case LOGIN_REQUEST:
    case GET_PROFILE_REQUEST:
    case LOGOUT_REQUEST:
      return { ...state, loading: true, error: null };
    
    case GET_PROFILE_SUCCESS:
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    
    case LOGIN_SUCCESS:
      return {
        ...state,
        jwt: action.payload,
        isAuthenticated: true,
        loading: false
      };
    
    case LOGOUT_SUCCESS:
      return initialState;
    
    case SIGNUP_FAILURE:
    case LOGIN_FAILURE:
    case LOGOUT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    case GET_USER_ROLE_REQUEST:
      return { ...state, loading: true };
    case GET_USER_ROLE_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          role: action.payload.role
        }
      };
    case GET_USER_ROLE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
};