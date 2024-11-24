import { api, API_BASE_URL } from "../../configs/api";
import axios from "axios";
import {
  COUNT_REVIEW_BY_COMPANY_FAILURE,
  COUNT_REVIEW_BY_COMPANY_REQUEST,
  COUNT_REVIEW_BY_COMPANY_SUCCESS,
  CREATE_REVIEW_FAILURE,
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  GET_REVIEW_BY_COMPANY_FAILURE,
  GET_REVIEW_BY_COMPANY_REQUEST,
  GET_REVIEW_BY_COMPANY_SUCCESS,
} from "./review.actionType";

export const getReviewByCompany = (companyId) => async (dispatch) => {
  dispatch({ type: GET_REVIEW_BY_COMPANY_REQUEST });

  try {
    const response = await axios.get(
      `http://localhost:8080/review/findReviewByCompanyId/${companyId}`
    );

    dispatch({
      type: GET_REVIEW_BY_COMPANY_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_REVIEW_BY_COMPANY_FAILURE,
      payload: error.message,
    });
  }
};

export const countReviewByCompany = () => async (dispatch) => {
  dispatch({ type: COUNT_REVIEW_BY_COMPANY_REQUEST });

  try {
    const response = await api.get(`/review/countReviewByCompany`);

    dispatch({
      type: COUNT_REVIEW_BY_COMPANY_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: COUNT_REVIEW_BY_COMPANY_FAILURE,
      payload: error.message,
    });
  }
};

export const createReview = (reviewData, companyId) => async (dispatch) => {
  dispatch({ type: CREATE_REVIEW_REQUEST });
  try {
    const response = await api.post(`/review/create-review/${companyId}`, reviewData);
    dispatch({
      type: CREATE_REVIEW_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: CREATE_REVIEW_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};
