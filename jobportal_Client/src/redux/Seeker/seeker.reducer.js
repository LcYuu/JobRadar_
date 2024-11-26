import {
  FOLLOW_COMPANY_FAILURE,
  FOLLOW_COMPANY_SUCCESS,
  GET_CANDIDATE_PROFILE_SUCCESS,
  GET_CANDIDATE_SKILLS_SUCCESS,
  GET_FOLLOWED_COMPANY_SUCCESS,
  GET_SEEKER_BY_USER_FAILURE,
  GET_SEEKER_BY_USER_REQUEST,
  GET_SEEKER_BY_USER_SUCCESS,
  UNFOLLOW_COMPANY_SUCCESS,
  UPDATE_SEEKER_SUCCESS,
} from "./seeker.actionType";

const initialState = {
  seeker: [],
  profileCandidate: null,
  skillsCandidate: null,
  loading: false,
  error: null,
  followedCompany: [],
  action: null,
  follow: [],
  message: "",
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
    case GET_CANDIDATE_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profileCandidate: action.payload,
        error: null,
      };
      case GET_CANDIDATE_SKILLS_SUCCESS:
        return {
          ...state,
          loading: false,
          skillsCandidate: action.payload,
          error: null,
        };
    case FOLLOW_COMPANY_SUCCESS:
      return {
        ...state,
        action : action.payload.action,
        follow: [...state.follow, action.payload.companyId],
        message: action.payload.message,
        error: null,
      };
    case UNFOLLOW_COMPANY_SUCCESS:
      return {
        ...state,
        action : action.payload.action,
        follow: state.follow.filter((id) => id !== action.payload.companyId),
        message: action.payload.message,
        error: null,
      };
    case FOLLOW_COMPANY_FAILURE:
      return {
        ...state,
        message: "",
        error: action.error,
      };
    case GET_SEEKER_BY_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
