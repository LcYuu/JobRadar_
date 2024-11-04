import {
  GET_ALL_JOB_REQUEST,
  GET_ALL_JOB_SUCCESS,
} from "../JobPost/jobPost.actionType";
import { GET_APPLY_JOB_BY_USER_FAILURE, GET_APPLY_JOB_BY_USER_REQUEST, GET_APPLY_JOB_BY_USER_SUCCESS } from "./applyJob.actionType";

const initialState = {
  applyJobByUser: [],
  loading: false,
  error: null,
  totalPages: null,
};

export const applyJobReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_APPLY_JOB_BY_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_APPLY_JOB_BY_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        applyJobByUser: action.payload.content,
        totalPages: action.payload.page.totalPages,
        error: null,
      };
    case GET_APPLY_JOB_BY_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
