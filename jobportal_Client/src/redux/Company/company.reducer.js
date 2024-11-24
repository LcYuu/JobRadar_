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
  totalPages: null,
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

    default:
      return state;
  }
};
