
import { COUNT_REVIEW_BY_COMPANY_SUCCESS, CREATE_REVIEW_FAILURE, CREATE_REVIEW_REQUEST, CREATE_REVIEW_SUCCESS, GET_REVIEW_BY_COMPANY_FAILURE, GET_REVIEW_BY_COMPANY_REQUEST, GET_REVIEW_BY_COMPANY_SUCCESS } from "./review.actionType";

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  countReview: null,
};

export const reviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REVIEW_BY_COMPANY_REQUEST:
    case CREATE_REVIEW_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_REVIEW_BY_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        reviews: action.payload,
        error: null,
      };
      case COUNT_REVIEW_BY_COMPANY_SUCCESS:
        return {
          ...state,
          loading: false,
          countReview: action.payload,
          error: null,
        };
    case CREATE_REVIEW_SUCCESS:
      return {
        ...state,
        reviews: [...state.reviews, action.payload],
        loading: false,
        error: null,
      };

    case GET_REVIEW_BY_COMPANY_FAILURE:
    case CREATE_REVIEW_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
