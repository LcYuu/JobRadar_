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
  try {
    console.log("Sending review data:", reviewData);
    const response = await api.post(`/review/create-review/${companyId}`, {
      star: reviewData.star,
      message: reviewData.message,
      anonymous: Boolean(reviewData.isAnonymous),
      createDate: new Date().toISOString()
    });
    console.log("Review response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Create review error:", error);
    throw error;
  }
};

export const deleteReview = (reviewId) => async (dispatch) => {
  try {
    const response = await api.delete(`/review/delete/${reviewId}`);
    console.log("Delete review response:", response); // Debug log
    return response.data;
  } catch (error) {
    console.error("Delete review error:", error); // Debug log
    throw error;
  }
};
