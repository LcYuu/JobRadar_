import {
  CHECK_IF_APPLIED_SUCCESS,
  CREATE_APPLY_JOB_SUCCESS,
  GET_APPLY_JOB_BY_COMPANY_SUCCESS,
  GET_APPLY_JOB_BY_USER_FAILURE,
  GET_APPLY_JOB_BY_USER_REQUEST,
  GET_APPLY_JOB_BY_USER_SUCCESS,
  GET_ONE_APPLY_JOB_SUCCESS,
  UPDATE_APPLY_JOB_SUCCESS,
  UPDATE_APPROVE_SUCCESS,
  GET_CANDIDATE_APPLY_INFO_SUCCESS,
} from "./applyJob.actionType";

const initialState = {
  applyJobByUser: [],
  oneApplyJob: null,
  updateApply: null,
  totalElements: null,
  loading: false,
  error: null,
  totalPages: null,
  hasApplied: null,
  applyJobByCompany: [],
  approveApply: null,
  candidateApplyInfo: null,
  
};

export const applyJobReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_APPLY_JOB_BY_USER_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_APPLY_JOB_SUCCESS:
      return {
        ...state,
        loading: false,
        applyJobByUser: [...state.applyJobByUser, action.payload], // Thêm ứng tuyển mới vào danh sách
        hasApplied: true,
        error: null,
      };
    case GET_APPLY_JOB_BY_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        applyJobByUser: action.payload.content,
        totalPages: action.payload.page.totalPages,
        totalElements: action.payload.page.totalElements,
        error: null,
      };
    case GET_APPLY_JOB_BY_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        applyJobByCompany: action.payload.content,
        totalPages: action.payload.page.totalPages,
        totalElements: action.payload.page.totalElements,
        error: null,
      };
    case CHECK_IF_APPLIED_SUCCESS:
      return {
        ...state,
        hasApplied: action.payload,
        error: null,
        loading: false,
      };
    case UPDATE_APPROVE_SUCCESS:
      return {
        ...state,
        approveApply: action.payload,
        error: null,
        loading: false,
      };
    case GET_ONE_APPLY_JOB_SUCCESS:
      return {
        ...state,
        oneApplyJob: action.payload,
        loading: false,
        error: null,
      };
    case UPDATE_APPLY_JOB_SUCCESS:
      return {
        ...state,
        loading: false,
        updateApply: action.payload,
        error: null,
      };
    case GET_APPLY_JOB_BY_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case GET_CANDIDATE_APPLY_INFO_SUCCESS:
      return {
        ...state,
        candidateApplyInfo: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};
