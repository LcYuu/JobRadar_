import {
  CREATE_EXP_FAILURE,
  CREATE_EXP_REQUEST,
  CREATE_EXP_SUCCESS,
  DELETE_EXP_SUCCESS,
  GET_EXP_BY_USER_FAILURE,
  GET_EXP_BY_USER_REQUEST,
  GET_EXP_BY_USER_SUCCESS,
  GET_EXP_CANDIDATE_SUCCESS,
} from "./exp.actionType";

const initialState = {
  exp: [],
  loading: false,
  error: null,
  expCandidate: null,
};

export const expReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_EXP_BY_USER_REQUEST:
    case CREATE_EXP_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_EXP_BY_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        exp: action.payload,
        error: null,
      };
    case GET_EXP_CANDIDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        expCandidate: action.payload,
        error: null,
      };
    case CREATE_EXP_SUCCESS:
      return {
        ...state,
        exp: [...state.exp, action.payload],
        loading: false,
        error: null,
      };
    case DELETE_EXP_SUCCESS:
      return {
        ...state,
        loading: false,
        exp: state.exp.filter((experience) => experience.id !== action.payload), // Loại bỏ kinh nghiệm đã xóa khỏi danh sách
      };

    case GET_EXP_BY_USER_FAILURE:
    case CREATE_EXP_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
