import {
    GET_TOTAL_USERS_REQUEST,
    GET_TOTAL_USERS_SUCCESS,
    GET_TOTAL_USERS_FAILURE,
    GET_TOTAL_COMPANIES_FAILURE,
    GET_TOTAL_COMPANIES_REQUEST,
    GET_TOTAL_COMPANIES_SUCCESS,
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
  
  const initialState = {
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
    dailyStats: [],
    loading: false,
    error: null
  };
  
  export const statsReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_TOTAL_USERS_REQUEST:
      case GET_TOTAL_COMPANIES_REQUEST:
      case GET_TOTAL_JOBS_REQUEST:
      case GET_ACTIVE_JOBS_REQUEST:
        return { ...state, loading: true };
        
      case GET_TOTAL_USERS_SUCCESS:
        return { ...state, loading: false, totalUsers: action.payload };
        
      case GET_TOTAL_COMPANIES_SUCCESS:
        return { ...state, loading: false, totalCompanies: action.payload };
        
      case GET_TOTAL_JOBS_SUCCESS:
        return { ...state, loading: false, totalJobs: action.payload };
        
      case GET_ACTIVE_JOBS_SUCCESS:
        return { ...state, loading: false, activeJobs: action.payload };
        
      case GET_TOTAL_USERS_FAILURE:
      case GET_TOTAL_COMPANIES_FAILURE:
      case GET_TOTAL_JOBS_FAILURE:
      case GET_ACTIVE_JOBS_FAILURE:
        return { ...state, loading: false, error: action.payload };
        
      case GET_DAILY_STATS_REQUEST:
        return { ...state, loading: true };
        
      case GET_DAILY_STATS_SUCCESS:
        return { ...state, loading: false, dailyStats: action.payload };
        
      case GET_DAILY_STATS_FAILURE:
        return { ...state, loading: false, error: action.payload };
        
      default:
        return state;
    }
  };