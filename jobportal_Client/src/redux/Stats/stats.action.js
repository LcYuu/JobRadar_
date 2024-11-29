import axios from 'axios';
import { API_BASE_URL } from '../../configs/api';
import {
  GET_TOTAL_USERS_REQUEST,
  GET_TOTAL_USERS_SUCCESS,
  GET_TOTAL_USERS_FAILURE,
  GET_TOTAL_COMPANIES_REQUEST,
  GET_TOTAL_COMPANIES_SUCCESS,
  GET_TOTAL_COMPANIES_FAILURE,
  GET_TOTAL_JOBS_REQUEST,
  GET_TOTAL_JOBS_SUCCESS,
  GET_TOTAL_JOBS_FAILURE,
  GET_ACTIVE_JOBS_REQUEST,
  GET_ACTIVE_JOBS_SUCCESS,
  GET_ACTIVE_JOBS_FAILURE,
  GET_DAILY_STATS_REQUEST,
  GET_DAILY_STATS_SUCCESS,
  GET_DAILY_STATS_FAILURE
} from './stats.actionType';

export const getTotalUsers = () => async (dispatch) => {
  dispatch({ type: GET_TOTAL_USERS_REQUEST });
  try {
    const response = await axios.get(`${API_BASE_URL}/users/get-all`);
    // Add logging to debug
    console.log('Total users response:', response.data);
    
    // Check if response.data is an array
    const totalUsers = Array.isArray(response.data) ? response.data.length : 0;
    
    dispatch({
      type: GET_TOTAL_USERS_SUCCESS,
      payload: totalUsers
    });
  } catch (error) {
    console.error('Error fetching total users:', error);
    dispatch({
      type: GET_TOTAL_USERS_FAILURE,
      payload: error.message
    });
  }
};
export const getTotalCompanies = () => async (dispatch) => {
  dispatch({ type: GET_TOTAL_COMPANIES_REQUEST });
  try {
    const response = await axios.get(`${API_BASE_URL}/company/find-all`);
    console.log('Total companies response:', response.data);
    
    const totalCompanies = Array.isArray(response.data) ? response.data.length : 0;
    
    dispatch({
      type: GET_TOTAL_COMPANIES_SUCCESS,
      payload: totalCompanies
    });
  } catch (error) {
    console.error('Error fetching total companies:', error);
    dispatch({
      type: GET_TOTAL_COMPANIES_FAILURE,
      payload: error.message
    });
  }
};
export const getTotalJobs = () => async (dispatch) => {
  dispatch({ type: GET_TOTAL_JOBS_REQUEST });
  try {
    const response = await axios.get(`${API_BASE_URL}/job-post/get-all`);
    console.log('Total jobs response:', response.data);
    
    const totalJobs = Array.isArray(response.data) ? response.data.length : 0;
    
    dispatch({
      type: GET_TOTAL_JOBS_SUCCESS,
      payload: totalJobs
    });
  } catch (error) {
    console.error('Error fetching total jobs:', error);
    dispatch({
      type: GET_TOTAL_JOBS_FAILURE,
      payload: error.message
    });
  }
};
export const getActiveJobs = () => async (dispatch) => {
  dispatch({ type: GET_ACTIVE_JOBS_REQUEST });
  try {
    // Using the same endpoint as search jobs but with specific params for active jobs
    const params = {
      page: 0,
      size: 1  // We only need the total count, not the actual jobs
    };
    
    const response = await axios.get(`${API_BASE_URL}/job-post/search-job-by-feature`, {
      params
    });
    
    // Get total elements from the paginated response
    const activeJobs = response.data.page.totalElements || 0;
    
    dispatch({
      type: GET_ACTIVE_JOBS_SUCCESS,
      payload: activeJobs
    });
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    dispatch({
      type: GET_ACTIVE_JOBS_FAILURE,
      payload: error.message
    });
  }
};
export const getDailyStats = (startDate, endDate) => async (dispatch) => {
  try {
    dispatch({ type: GET_DAILY_STATS_REQUEST });
    
    const response = await axios.get(`${API_BASE_URL}/stats/daily`, {
      params: {
        startDate,
        endDate
      }
    });
    
    dispatch({
      type: GET_DAILY_STATS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: GET_DAILY_STATS_FAILURE,
      payload: error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê'
    });
  }
};