import { GET_COMPANY_POPULAR_FAILURE, GET_COMPANY_POPULAR_REQUEST, GET_COMPANY_POPULAR_SUCCESS } from "./company.actionType";

const initialState = {
    company: null,
    companies: [],
    loading: false,
    message: null,
    error: null,
};

export const companyReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_COMPANY_POPULAR_REQUEST:
        return { ...state, loading: true, error: null };
      case GET_COMPANY_POPULAR_SUCCESS:
        return { ...state, loading: false, companies: action.payload, error: null };
      case GET_COMPANY_POPULAR_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };