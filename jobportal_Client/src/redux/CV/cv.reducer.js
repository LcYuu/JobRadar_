import {
  CREATE_CV_SUCCESS,
  DELETE_CV_SUCCESS,
  GET_CV_FAILURE,
  GET_CV_REQUEST,
  GET_CV_SUCCESS,
  UPDATE_CV_MAIN_SUCCESS,
} from "./cv.actionType";

const initialState = {
  cvs: [],
  loading: false,
  error: null,
  updateSuccess: null,
};

export const cvReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CV_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_CV_SUCCESS:
      return {
        ...state,
        loading: false,
        cvs: action.payload,
        error: null,
      };
    case UPDATE_CV_MAIN_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: action.payload,
        error: null,
      };
    case CREATE_CV_SUCCESS:
      return {
        ...state,
        cv: [...state.cv, action.payload],
        loading: false,
        error: null,
      };
    case DELETE_CV_SUCCESS:
      return {
        ...state,
        loading: false,
        cv: state.cv.filter((CV) => CV.id !== action.payload), // Loại bỏ kinh nghiệm đã xóa khỏi danh sách
      };
    case GET_CV_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
