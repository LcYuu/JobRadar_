import {
    SUBMIT_SURVEY_REQUEST,
    SUBMIT_SURVEY_SUCCESS,
    SUBMIT_SURVEY_FAILURE,
    GET_SURVEY_STATISTICS_REQUEST,
    GET_SURVEY_STATISTICS_SUCCESS,
    GET_SURVEY_STATISTICS_FAILURE,
  } from './survey.actionType';
  
  const initialState = {
    loading: false,
    error: null,
    survey: null,
    statistics: null,
  };
  const surveyReducer = (state = initialState, action) => {
    switch (action.type) {
      case SUBMIT_SURVEY_REQUEST:
        return {
          ...state,
          loading: true
        };
      case SUBMIT_SURVEY_SUCCESS:
        return {
          ...state,
          loading: false,
          survey: action.payload,
          error: null
        };
      case SUBMIT_SURVEY_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
        case GET_SURVEY_STATISTICS_REQUEST:
          return { ...state, loading: true, error: null };
      case GET_SURVEY_STATISTICS_SUCCESS:
          return {
              ...state,
              loading: false,
              statistics: action.payload,
              error: null,
          };
      case GET_SURVEY_STATISTICS_FAILURE:
          return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }

    
  };
  
  
  export default surveyReducer;