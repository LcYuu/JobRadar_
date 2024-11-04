import {
  GET_COMPANY_BY_FEATURE_SUCCESS,
  GET_COMPANY_FIT_SEEKER_SUCCESS,
  GET_COMPANY_POPULAR_FAILURE,
  GET_COMPANY_POPULAR_REQUEST,
  GET_COMPANY_POPULAR_SUCCESS,
} from "./company.actionType";

const initialState = {
  company: null,
  companies: [],
  companyByFeature: [],
  companyFitSeeker: [],
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

    case GET_COMPANY_POPULAR_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
