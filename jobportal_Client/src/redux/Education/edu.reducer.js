import {
  CREATE_EDU_SUCCESS,
  DELETE_EDU_SUCCESS,
  GET_EDU_BY_USER_FAILURE,
  GET_EDU_BY_USER_REQUEST,
  GET_EDU_BY_USER_SUCCESS,
  GET_EDU_CANDIDATE_SUCCESS,
} from "./edu.actionType";

const initialState = {
  edu: [],
  loading: false,
  error: null,
  eduCandidate: null,
};

export const eduReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_EDU_BY_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_EDU_BY_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        edu: action.payload,
        error: null,
      };
    case GET_EDU_CANDIDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        eduCandidate: action.payload,
        error: null,
      };
    case CREATE_EDU_SUCCESS:
      return {
        ...state,
        edu: [...state.edu, action.payload],
        loading: false,
        error: null,
      };
    case DELETE_EDU_SUCCESS:
      return {
        ...state,
        loading: false,
        edu: state.edu.filter((education) => education.id !== action.payload), // Loại bỏ kinh nghiệm đã xóa khỏi danh sách
      };
    case GET_EDU_BY_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
