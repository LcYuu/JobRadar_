import axios from "axios"
import { api, API_BASE_URL } from "../../configs/api"

import { CREATE_COMMENT_FAILURE,GET_ALL_JOB_REQUEST, GET_ALL_JOB_FAILURE, CREATE_COMMENT_REQUEST, CREATE_COMMENT_SUCCESS, CREATE_POST_FAILURE, CREATE_POST_REQUEST, CREATE_POST_SUCCESS, GET_ALL_JOB_SUCCESS, GET_ALL_POST_FAILURE, GET_ALL_POST_REQUEST, GET_ALL_POST_SUCCESS, GET_USERS_POST_FAILURE, GET_USERS_POST_REQUEST, GET_USERS_POST_SUCCESS, LIKE_POST_FAILURE, LIKE_POST_REQUEST, LIKE_POST_SUCCESS, GET_TOP8_JOB_REQUEST, GET_TOP8_JOB_FAILURE, GET_TOP8_JOB_SUCCESS, COUNT_JOB_BY_TYPE_REQUEST, COUNT_JOB_BY_TYPE_SUCCESS, COUNT_JOB_BY_TYPE_FAILURE, SEARCH_JOBS_REQUEST, SEARCH_JOBS_SUCCESS, SEARCH_JOBS_FAILURE, SET_SALARY_RANGE_REQUEST, SET_SALARY_RANGE_SUCCESS, SET_SALARY_RANGE_FAILURE, GET_JOBS_BY_COMPANY_REQUEST, GET_JOBS_BY_COMPANY_SUCCESS, GET_JOBS_BY_COMPANY_FAILURE, GET_TOTAL_JOBS_REQUEST, GET_TOTAL_JOBS_SUCCESS, GET_TOTAL_JOBS_FAILURE, GET_JOB_POST_BY_POST_ID_REQUEST, GET_JOB_POST_BY_POST_ID_SUCCESS, GET_JOB_POST_BY_POST_ID_FAILURE, GET_RECOMMEND_JOB_REQUEST, GET_RECOMMEND_JOB_SUCCESS, GET_RECOMMEND_JOB_FAILURE } from "./jobPost.actionType"





export const getAllJobAction = (currentPage, size) => async (dispatch) => {
    dispatch({ type: GET_ALL_JOB_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/job-post/get-job-approve?page=${currentPage}&size=${size}`); // Thay thế với URL thực tế
        dispatch({
            type: GET_ALL_JOB_SUCCESS,
            payload: response.data 
        });
    } catch (error) {
        dispatch({
            type: GET_ALL_JOB_FAILURE,
            payload: error.message 
        });
    }
};

export const getTop8LastestJob = () => async (dispatch) => {
    dispatch({ type: GET_TOP8_JOB_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/job-post/get-top8-lastest-job`); // Thay thế với URL thực tế
        dispatch({
            type: GET_TOP8_JOB_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: GET_TOP8_JOB_FAILURE,
            payload: error.message 
        });
    }
};

export const getRecommendJob = () => async (dispatch) => {
    dispatch({ type: GET_RECOMMEND_JOB_REQUEST });
    try {
        const response = await api.post(`/job-post/recommend-jobs`); // Thay thế với URL thực tế
        dispatch({
            type: GET_RECOMMEND_JOB_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: GET_RECOMMEND_JOB_FAILURE,
            payload: error.message 
        });
    }
};

export const searchJobs = (filters, currentPage, size) => async (dispatch) => {
    dispatch({ type: SEARCH_JOBS_REQUEST });
    try {
        // Tạo params cho axios
        const params = {
            title: filters.title || undefined,
            selectedTypesOfWork: filters.selectedTypesOfWork.length > 0 ? filters.selectedTypesOfWork.join(',') : undefined,
            cityId: filters.cityId || undefined,
            selectedIndustryIds: filters.selectedIndustryIds.length > 0 ? filters.selectedIndustryIds.join(',') : undefined,
            minSalary: filters.minSalary ? Number(filters.minSalary) : undefined,
            maxSalary: filters.maxSalary ? Number(filters.maxSalary) : undefined,
            page: currentPage,
            size: size
        };
        const token = sessionStorage.getItem("jwt");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get(`/job-post/search-job-by-feature`, {
            headers,
            params
        });

        dispatch({
            type: SEARCH_JOBS_SUCCESS,
            payload: response.data 
        });
    } catch (error) {
        dispatch({
            type: SEARCH_JOBS_FAILURE,
            payload: error.message 
        });
    }
};




export const fetchSalaryRange = () => async (dispatch) => {
    dispatch({ type: SET_SALARY_RANGE_REQUEST });

    try {
        const response = await axios.get(`http://localhost:8080/job-post/salary-range`);
        const { minSalary, maxSalary } = response.data;

        dispatch({
            type: SET_SALARY_RANGE_SUCCESS,
            payload: { minSalary, maxSalary },
        });
    } catch (error) {
        dispatch({
            type: SET_SALARY_RANGE_FAILURE,
            payload: error.message,
        });
    }
};

export const countJobByType = () => async (dispatch) => {
    dispatch({ type: COUNT_JOB_BY_TYPE_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/job-post/count-job-by-type`); // Thay thế với URL thực tế
        dispatch({
            type: COUNT_JOB_BY_TYPE_SUCCESS,
            payload: response.data // Trả về dữ liệu nhận được từ API
        });
    } catch (error) {
        dispatch({
            type: COUNT_JOB_BY_TYPE_FAILURE,
            payload: error.message // Hoặc error.response.data
        });
    }
};

export const getJobPostByPostId = (postId) => async (dispatch) => {
    dispatch({ type: GET_JOB_POST_BY_POST_ID_REQUEST });
    try {

      const response = await axios.get(`http://localhost:8080/job-post/findJob/${postId}`)
  
      dispatch({
        type: GET_JOB_POST_BY_POST_ID_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: GET_JOB_POST_BY_POST_ID_FAILURE,
        payload: error.message,
      });
    }
  };

export const getJobsByCompany = (companyId, currentPage, size) => async (dispatch) => {
    dispatch({ type: GET_JOBS_BY_COMPANY_REQUEST });
    try {
        const response = await api.get(
            `/job-post/search-by-company/${companyId}?page=${currentPage}&size=${size}`
        );
        
        dispatch({
            type: GET_JOBS_BY_COMPANY_SUCCESS,
            payload: {
                content: response.data.content,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements
            }
        });
    } catch (error) {
        dispatch({
            type: GET_JOBS_BY_COMPANY_FAILURE,
            payload: error.message
        });
    }
};

export const getTotalJobsByCompany = (companyId) => async (dispatch) => {
    dispatch({ type: GET_TOTAL_JOBS_REQUEST });
    try {
        const response = await axios.get(`${API_BASE_URL}/job-post/count-by-company/${companyId}`);
        dispatch({
            type: GET_TOTAL_JOBS_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: GET_TOTAL_JOBS_FAILURE,
            payload: error.message
        });
    }
};


