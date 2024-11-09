import {
  GET_FOLLOWED_COMPANY_SUCCESS,
  GET_SEEKER_BY_USER_FAILURE,
  GET_SEEKER_BY_USER_REQUEST,
  GET_SEEKER_BY_USER_SUCCESS,
  UPDATE_SEEKER_SUCCESS,
} from "./seeker.actionType";

const initialState = {
  seeker: [],
  loading: false,
  error: null,
  followedCompany: [],
};

export const seekerReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SEEKER_BY_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_SEEKER_BY_USER_SUCCESS:
    case UPDATE_SEEKER_SUCCESS:
      return {
        ...state,
        loading: false,
        seeker: action.payload,
        error: null,
      };
    case GET_FOLLOWED_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        followedCompany: action.payload,
        error: null,
      };
    case GET_SEEKER_BY_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
