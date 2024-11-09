import { GET_ALL_SKILL_FAILURE, GET_ALL_SKILL_REQUEST, GET_ALL_SKILL_SUCCESS } from "./skill.actionType";


const initialState = {
  skills: [],
  loading: false,
  error: null,

};

export const skillReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_SKILL_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_ALL_SKILL_SUCCESS:
      return {
        ...state,
        loading: false,
        skills: action.payload,
        error: null,
      };
    case GET_ALL_SKILL_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
