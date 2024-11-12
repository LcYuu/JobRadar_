import axios from "axios";
import {
  CHECK_IF_SAVED_FAILURE,
  CHECK_IF_SAVED_REQUEST,
  CHECK_IF_SAVED_SUCCESS,
  GET_COMPANY_BY_FEATURE_FAILURE,
  GET_COMPANY_BY_FEATURE_REQUEST,
  GET_COMPANY_BY_FEATURE_SUCCESS,
  GET_COMPANY_FIT_SEEKER_FAILURE,
  GET_COMPANY_FIT_SEEKER_REQUEST,
  GET_COMPANY_FIT_SEEKER_SUCCESS,
  GET_COMPANY_POPULAR_FAILURE,
  GET_COMPANY_POPULAR_REQUEST,
  GET_COMPANY_POPULAR_SUCCESS,
  GET_PROFILE_COMPANY_FAILURE,
  GET_PROFILE_COMPANY_REQUEST,
  GET_PROFILE_COMPANY_SUCCESS,
} from "./company.actionType";
import { api, API_BASE_URL } from "../../configs/api";
import { CHECK_IF_APPLIED_SUCCESS } from "../ApplyJob/applyJob.actionType";

export const getCompanyPopular = () => async (dispatch) => {
  dispatch({ type: GET_COMPANY_POPULAR_REQUEST });
  try {
    const response = await axios.get(`http://localhost:8080/company/get-all`); // Thay thế với URL thực tế
    dispatch({
      type: GET_COMPANY_POPULAR_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_COMPANY_POPULAR_FAILURE,
      payload: error.message,
    });
  }
};

export const getCompanyProfile = (companyId) => async (dispatch) => {
  dispatch({ type: GET_PROFILE_COMPANY_REQUEST });
  try {
    const response = await axios.get(
      `http://localhost:8080/company/profile-company/${companyId}`
    );
    dispatch({
      type: GET_PROFILE_COMPANY_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_PROFILE_COMPANY_FAILURE,
      payload: error.message,
    });
  }
};

export const getCompanyFitSeeker = () => async (dispatch) => {
  dispatch({ type: GET_COMPANY_FIT_SEEKER_REQUEST });

  try {
    const jwt = sessionStorage.getItem("jwt"); // Lấy JWT từ sessionStorage
    if (!jwt) {
      throw new Error("No token found");
    }

    const response = await axios.get(
      `${API_BASE_URL}/company/find-companies-fit-userId`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    console.log("Company" + response);

    dispatch({
      type: GET_COMPANY_FIT_SEEKER_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    console.error("Company Fetch Error: ", error);
    dispatch({
      type: GET_COMPANY_FIT_SEEKER_FAILURE,
      payload: error.message,
    });
  }
};

export const searhCompanies =
  (filters, currentPage, size) => async (dispatch) => {
    dispatch({ type: GET_COMPANY_BY_FEATURE_REQUEST });
    try {
      // Tạo params cho axios
      const params = {
        title: filters.title || undefined,
        cityId: filters.cityId || undefined,
        industryId: filters.industryId || undefined,
        page: currentPage,
        size: size,
      };

      console.log("Params gửi đi:", params); // kiểm tra giá trị minSalary, maxSalary

      const response = await axios.get(
        `http://localhost:8080/company/search-company-by-feature`,
        { params }
      );

      dispatch({
        type: GET_COMPANY_BY_FEATURE_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: GET_COMPANY_BY_FEATURE_FAILURE,
        payload: error.message,
      });
    }
  };

export const checkSaved = (companyId) => async (dispatch) => {
  dispatch({ type: CHECK_IF_SAVED_REQUEST });
  try {
    const response = await api.get(`/company/can-rating/${companyId}`);
    dispatch({
      type: CHECK_IF_SAVED_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: CHECK_IF_SAVED_FAILURE,
      payload: error.message,
    });
  }
};
