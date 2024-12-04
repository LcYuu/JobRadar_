import { api, API_BASE_URL  } from "../../configs/api";
import {
  SUBMIT_SURVEY_REQUEST,
  SUBMIT_SURVEY_SUCCESS,
  SUBMIT_SURVEY_FAILURE,
  GET_SURVEY_STATISTICS_REQUEST,
  GET_SURVEY_STATISTICS_SUCCESS,
    GET_SURVEY_STATISTICS_FAILURE,
} from './survey.actionType';
import axios from "axios";

export const submitSurvey = (surveyId, surveyData) => async (dispatch) => {
  dispatch({ type: SUBMIT_SURVEY_REQUEST });
  try {
    const response = await api.post(`/surveys/${surveyId}`, surveyData);
    dispatch({
      type: SUBMIT_SURVEY_SUCCESS,
      payload: response.data
    });
    return { success: true };
  } catch (error) {
    dispatch({
      type: SUBMIT_SURVEY_FAILURE,
      payload: error.message
    });
    return { success: false, error: error.message };
  }
};

export const getSurveyStatistics = () => async (dispatch) => {
    dispatch({ type: GET_SURVEY_STATISTICS_REQUEST });
    try {
        const response = await axios.get(`${API_BASE_URL}/surveys/statistics`);
        dispatch({
            type: GET_SURVEY_STATISTICS_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: GET_SURVEY_STATISTICS_FAILURE,
            payload: error.response?.data || error.message,
        });
    }
};