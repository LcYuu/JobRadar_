import {
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  UPDATE_USER_STATUS_REQUEST,
  UPDATE_USER_STATUS_SUCCESS,
  UPDATE_USER_STATUS_FAILURE,
  GET_USER_TYPES_REQUEST,
  GET_USER_TYPES_SUCCESS,
  // GET_USER_TYPES_FAILURE,
} from "./user.actionType";

const initialState = {
  users: [],
  userTypes: {},
  loading: false,
  error: null,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_TYPES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_USER_TYPES_SUCCESS:
      const userTypesMap = action.payload.reduce((acc, type) => {
        acc[type.id] = type.name;
        return acc;
      }, {});
      return {
        ...state,
        loading: false,
        userTypes: userTypesMap,
        error: null,
      };

    case GET_ALL_USERS_REQUEST:
    case DELETE_USER_REQUEST:
    case UPDATE_USER_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_ALL_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload.content,
        totalPages: action.payload.page.totalPages,
        totalElements: action.payload.page.totalElements,
        error: null
      };

    case DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter(user => user.userId !== action.payload),
        error: null,
      };

    case UPDATE_USER_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.map(user => 
          user.userId === action.payload.userId ? action.payload : user
        ),
        error: null,
      };

    case GET_ALL_USERS_FAILURE:
    case DELETE_USER_FAILURE:
    case UPDATE_USER_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}; 