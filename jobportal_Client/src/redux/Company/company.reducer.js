import {
  CHECK_IF_SAVED_SUCCESS,
  GET_COMPANY_BY_FEATURE_SUCCESS,
  GET_COMPANY_FIT_SEEKER_SUCCESS,
  GET_COMPANY_POPULAR_FAILURE,
  GET_COMPANY_POPULAR_REQUEST,
  GET_COMPANY_POPULAR_SUCCESS,
  GET_PROFILE_COMPANY_REQUEST,
  GET_PROFILE_COMPANY_SUCCESS,
  GET_COMPANY_REQUEST,
  GET_COMPANY_SUCCESS,
  GET_COMPANY_FAILURE,
  UPDATE_COMPANY_PROFILE_REQUEST,
  UPDATE_COMPANY_PROFILE_SUCCESS,
  UPDATE_COMPANY_PROFILE_FAILURE,
  UPDATE_COMPANY_IMAGES_REQUEST,
  UPDATE_COMPANY_IMAGES_SUCCESS,
  UPDATE_COMPANY_IMAGES_FAILURE,

  VALIDATE_TAXCODE_REQUEST,
  VALIDATE_TAXCODE_SUCCESS,
  VALIDATE_TAXCODE_FAILURE,

  GET_ALL_COMPANIES_REQUEST,
  GET_ALL_COMPANIES_SUCCESS,
  GET_ALL_COMPANIES_FAILURE,
  UPDATE_COMPANY_STATUS_REQUEST,
  UPDATE_COMPANY_STATUS_SUCCESS,
  UPDATE_COMPANY_STATUS_FAILURE,
  DELETE_COMPANY_REQUEST,
  DELETE_COMPANY_SUCCESS,
  DELETE_COMPANY_FAILURE,
  GET_JOB_BY_COMPANY_REQUEST,
  GET_JOB_BY_COMPANY_SUCCESS,
  GET_JOB_BY_COMPANY_FAILURE,
  GET_COMPANY_JOB_COUNTS_REQUEST,
  GET_COMPANY_JOB_COUNTS_SUCCESS,
  GET_COMPANY_JOB_COUNTS_FAILURE,
  GET_COMPANY_JOB_STATS_REQUEST,
  GET_COMPANY_JOB_STATS_SUCCESS,
  GET_COMPANY_JOB_STATS_FAILURE,
  

} from "./company.actionType";

const initialState = {
  isValid: null,
  companies: [],
  companyJwt: null,
  companyByFeature: [],
  companyFitSeeker: [],
  companyProfile: null,
  checkIfSaved: null,
  loading: false,
  message: null,
  error: null,
  totalPages: 0,
  totalElements: 0,
  jobCounts: null,
  jobStats: [],
  currentPage: 0
};

export const companyReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_COMPANY_POPULAR_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_COMPANY_POPULAR_SUCCESS:
      return {
        ...state,
        loading: false,
        companies: action.payload,
        error: null,
      };
    case GET_COMPANY_BY_FEATURE_SUCCESS:
      return {
        ...state,
        loading: false,
        companyByFeature: action.payload.content,
        totalPages: action.payload.page.totalPages,
        error: null,
      };
    case GET_COMPANY_FIT_SEEKER_SUCCESS:
      return {
        ...state,
        loading: false,
        companyFitSeeker: action.payload,
        error: null,
      };
    case GET_PROFILE_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        companyProfile: action.payload,
        error: null,
      };
    case CHECK_IF_SAVED_SUCCESS:
      return {
        ...state,
        loading: false,
        checkIfSaved: action.payload,
        error: null,
      };

    case GET_COMPANY_POPULAR_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case GET_COMPANY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        companyJwt: null,
      };
    case GET_COMPANY_SUCCESS:
    case UPDATE_COMPANY_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        companyJwt: action.payload,
        error: null,
      };
    case GET_COMPANY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case UPDATE_COMPANY_PROFILE_REQUEST:
    case UPDATE_COMPANY_IMAGES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_COMPANY_IMAGES_SUCCESS:
      return {
        ...state,
        loading: false,
        message: "Cập nhật hình ảnh thành công",
        error: null,
      };

    case UPDATE_COMPANY_PROFILE_FAILURE:
    case UPDATE_COMPANY_IMAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case VALIDATE_TAXCODE_REQUEST:
      return { ...state, loading: true, error: null };
    case VALIDATE_TAXCODE_SUCCESS:
      return { ...state, loading: false, isValid: action.payload };
    case VALIDATE_TAXCODE_FAILURE:
      return { ...state, loading: false, error: action.error };

    case GET_ALL_COMPANIES_REQUEST:
      return {
        ...state,
        loading: true
      };
    case GET_ALL_COMPANIES_SUCCESS:
      return {
        ...state,
        loading: false,
        companies: action.payload.content,
        totalPages: action.payload.page.totalPages,
        totalElements: action.payload.page.totalElements,
        error: null
      };
    case GET_ALL_COMPANIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case UPDATE_COMPANY_STATUS_REQUEST:
    case DELETE_COMPANY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_COMPANY_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        message: "Cập nhật trạng thái công ty thành công",
        error: null,
      };

    case DELETE_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        companies: state.companies.filter(company => company.companyId !== action.payload),
        message: "Xóa công ty thành công",
        error: null,
      };

    case UPDATE_COMPANY_STATUS_FAILURE:
    case DELETE_COMPANY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case GET_JOB_BY_COMPANY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_JOB_BY_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        companyJobs: action.payload,
        error: null
      };

    case GET_JOB_BY_COMPANY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case GET_COMPANY_JOB_COUNTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_COMPANY_JOB_COUNTS_SUCCESS:
      return {
        ...state,
        loading: false,
        jobCounts: action.payload,
        error: null
      };

    case GET_COMPANY_JOB_COUNTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case GET_COMPANY_JOB_STATS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case GET_COMPANY_JOB_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        jobStats: action.payload,
        error: null
      };

    case GET_COMPANY_JOB_STATS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};
