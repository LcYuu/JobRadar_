import axios from "axios";
import { GET_COMPANY_BY_FEATURE_FAILURE, GET_COMPANY_BY_FEATURE_REQUEST, GET_COMPANY_BY_FEATURE_SUCCESS, GET_COMPANY_FIT_SEEKER_FAILURE, GET_COMPANY_FIT_SEEKER_REQUEST, GET_COMPANY_FIT_SEEKER_SUCCESS, GET_COMPANY_POPULAR_FAILURE, GET_COMPANY_POPULAR_REQUEST, GET_COMPANY_POPULAR_SUCCESS, GET_COMPANY_REQUEST, GET_COMPANY_SUCCESS, GET_COMPANY_FAILURE } from "./company.actionType";
import { API_BASE_URL } from "../../configs/api";

export const getCompanyPopular = () => async (dispatch) => {
    dispatch({ type: GET_COMPANY_POPULAR_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/company/get-all`);// Thay thế với URL thực tế
        dispatch({
            type: GET_COMPANY_POPULAR_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: GET_COMPANY_POPULAR_FAILURE,
            payload: error.message
        });
    }
};


export const getCompanyFitSeeker = () => async (dispatch) => {
    dispatch({ type: GET_COMPANY_FIT_SEEKER_REQUEST });

    try {
        const jwt = sessionStorage.getItem('jwt'); // Lấy JWT từ sessionStorage
        if (!jwt) {
            throw new Error('No token found');
        }

        const response = await axios.get(`${API_BASE_URL}/company/find-companies-fit-userId`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });

        console.log("Company" + response)

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

export const searhCompanies = (filters, currentPage, size) => async (dispatch) => {
    dispatch({ type: GET_COMPANY_BY_FEATURE_REQUEST });
    try {
        // Tạo params cho axios
        const params = {
            title: filters.title || undefined,
            cityId: filters.cityId || undefined,
            industryId: filters.industryId || undefined,
            page: currentPage,
            size: size
        };

        console.log("Params gửi đi:", params); // kiểm tra giá trị minSalary, maxSalary

        const response = await axios.get(`http://localhost:8080/company/search-company-by-feature`, { params });
        
        dispatch({
            type: GET_COMPANY_BY_FEATURE_SUCCESS,
            payload: response.data 
        });
    } catch (error) {
        dispatch({
            type: GET_COMPANY_BY_FEATURE_FAILURE,
            payload: error.message 
        });
    }
};
export const getCompanyById = (companyId) => async (dispatch) => {
    try {
      dispatch({ type: GET_COMPANY_REQUEST });
      
      // Đảm bảo companyId là string hợp lệ
      const cleanCompanyId = companyId.replace(/[^\w-]/g, '');
      console.log("Fetching company with ID:", cleanCompanyId);
      
      const response = await axios.get(
        `${API_BASE_URL}/company/profile-company/${cleanCompanyId}`
      );
      console.log("Company data received:", response.data);

      dispatch({
        type: GET_COMPANY_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.error("Error fetching company:", error);
      dispatch({
        type: GET_COMPANY_FAILURE,
        payload: error.response?.data?.message || "Failed to fetch company details",
      });
    }
  };
