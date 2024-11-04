
import { API_BASE_URL } from "../../configs/api";
import axios from "axios";
import { GET_APPLY_JOB_BY_USER_FAILURE, GET_APPLY_JOB_BY_USER_REQUEST, GET_APPLY_JOB_BY_USER_SUCCESS } from "./applyJob.actionType";

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