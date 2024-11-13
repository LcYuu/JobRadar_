
import { api, API_BASE_URL } from "../../configs/api";
import axios from "axios";
import { CHECK_IF_APPLIED_FAILURE, CHECK_IF_APPLIED_REQUEST, CHECK_IF_APPLIED_SUCCESS, CREATE_APPLY_JOB_FAILURE, CREATE_APPLY_JOB_REQUEST, CREATE_APPLY_JOB_SUCCESS, GET_APPLY_JOB_BY_USER_FAILURE, GET_APPLY_JOB_BY_USER_REQUEST, GET_APPLY_JOB_BY_USER_SUCCESS, GET_ONE_APPLY_JOB_FAILURE, GET_ONE_APPLY_JOB_REQUEST, GET_ONE_APPLY_JOB_SUCCESS, UPDATE_APPLY_JOB_FAILURE, UPDATE_APPLY_JOB_REQUEST, UPDATE_APPLY_JOB_SUCCESS } from "./applyJob.actionType";

export const getApplyJobByUser = (currentPage, size) => async (dispatch) => {
    dispatch({ type: GET_APPLY_JOB_BY_USER_REQUEST });

    try {
        const jwt = sessionStorage.getItem('jwt'); // Lấy JWT từ sessionStorage
        if (!jwt) {
            throw new Error('No token found');
        }

        const response = await axios.get(`${API_BASE_URL}/apply-job/get-apply-job-by-user?page=${currentPage}&size=${size}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });

        console.log("Apply Job: " + response.data)

        dispatch({
            type: GET_APPLY_JOB_BY_USER_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        console.error("Company Fetch Error: ", error);
        dispatch({
            type: GET_APPLY_JOB_BY_USER_FAILURE,
            payload: error.message,
        });
    }
};

export const getOneApplyJob = (postId) => async (dispatch) => {
    dispatch({ type: GET_ONE_APPLY_JOB_REQUEST });

    try {
        const response = await api.get(`/apply-job/find/${postId}`)

        dispatch({
            type: GET_ONE_APPLY_JOB_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: GET_ONE_APPLY_JOB_FAILURE,
            payload: error.message,
        });
    }
};

export const createApply = (applyData, postId) => async (dispatch) => {
    dispatch({ type: CREATE_APPLY_JOB_REQUEST });

    try {
        const response = await api.post(`/apply-job/create-apply/${postId}`, applyData);

        console.log("Apply Job: ", response.data);

        dispatch({
            type: CREATE_APPLY_JOB_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        console.error("Apply Job Error: ", error);
        dispatch({
            type: CREATE_APPLY_JOB_FAILURE,
            payload: error.message,
        });
    }
};

export const updateApply = (applyData, postId) => async (dispatch) => {
    dispatch({ type: UPDATE_APPLY_JOB_REQUEST });

    try {
        const response = await api.put(`/apply-job/update-apply/${postId}`, applyData);

        console.log("Apply Job: ", response.data);

        dispatch({
            type: UPDATE_APPLY_JOB_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        console.error("Apply Job Error: ", error);
        dispatch({
            type: UPDATE_APPLY_JOB_FAILURE,
            payload: error.message,
        });
    }
};

export const checkIfApplied = (postId) => async (dispatch) => {
    dispatch({ type: CHECK_IF_APPLIED_REQUEST});
    try {
      const response = await api.get(`/apply-job/checkApply/${postId}`)
      dispatch({
        type: CHECK_IF_APPLIED_SUCCESS,
        payload: response.data, 
      });
    } catch (error) {
      dispatch({
        type: CHECK_IF_APPLIED_FAILURE,
        payload: error.message,
      });
    }
  };
