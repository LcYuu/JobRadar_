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
  UPDATE_COMPANY_PROFILE_REQUEST,
  UPDATE_COMPANY_PROFILE_SUCCESS,
  UPDATE_COMPANY_PROFILE_FAILURE,
  UPDATE_COMPANY_IMAGES_REQUEST,
  UPDATE_COMPANY_IMAGES_SUCCESS,
  UPDATE_COMPANY_IMAGES_FAILURE,
  VALIDATE_TAXCODE_REQUEST,
  VALIDATE_TAXCODE_FAILURE,
  VALIDATE_TAXCODE_SUCCESS,

  GET_ALL_COMPANIES_REQUEST,
  GET_ALL_COMPANIES_SUCCESS,
  GET_ALL_COMPANIES_FAILURE,
  UPDATE_COMPANY_STATUS_REQUEST,
  UPDATE_COMPANY_STATUS_SUCCESS,
  UPDATE_COMPANY_STATUS_FAILURE,
  DELETE_COMPANY_REQUEST,
  DELETE_COMPANY_SUCCESS,
  DELETE_COMPANY_FAILURE,
  GET_JOB_BY_COMPANY_REQUEST,
  GET_JOB_BY_COMPANY_SUCCESS,
  GET_JOB_BY_COMPANY_FAILURE,
  GET_COMPANY_JOB_COUNTS_REQUEST,
  GET_COMPANY_JOB_COUNTS_SUCCESS,
  GET_COMPANY_JOB_COUNTS_FAILURE,
  GET_COMPANY_JOB_STATS_REQUEST,
  GET_COMPANY_JOB_STATS_SUCCESS,
  GET_COMPANY_JOB_STATS_FAILURE,
  GET_COMPANY_REQUEST,
  GET_COMPANY_SUCCESS,
  GET_COMPANY_FAILURE,
  
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
export const getCompanyByJWT = () => async (dispatch) => {
  dispatch({ type: GET_COMPANY_REQUEST });

  try {
    const jwt = sessionStorage.getItem("jwt"); // Lấy JWT từ sessionStorage
    if (!jwt) {
      throw new Error("No token found");
    }

    const response = await api.get(`/company/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("Company: " + JSON.stringify(response.data, null, 2));

    dispatch({
      type: GET_COMPANY_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_COMPANY_FAILURE,
      payload: error.message,
    });
  }
};

export const updateCompanyProfile = (companyData) => async (dispatch) => {
  dispatch({ type: UPDATE_COMPANY_PROFILE_REQUEST });
  try {
    const { data } = await api.put("/company/update-company", companyData);
    console.log("Company updated: ", data);
    dispatch({ type: UPDATE_COMPANY_PROFILE_SUCCESS, payload: data });
    return data;
  } catch (error) {
    console.error("Company Update Error: ", error);
    dispatch({ type: UPDATE_COMPANY_PROFILE_FAILURE, payload: error });
    throw error;
  }
};
export const updateCompanyImages = (images) => async (dispatch) => {
  dispatch({ type: UPDATE_COMPANY_IMAGES_REQUEST });
  try {
    const jwt = sessionStorage.getItem("jwt");
    if (!jwt) {
      throw new Error("No token found");
    }

    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await api.post("/image-company/create-image", formData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({
      type: UPDATE_COMPANY_IMAGES_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: UPDATE_COMPANY_IMAGES_FAILURE,
      payload: error.response?.data || error.message,
    });
    throw error;
  }
};

export const validateTaxCode = () => {
  return async (dispatch) => {
    dispatch({ type: VALIDATE_TAXCODE_REQUEST }); // Gửi action yêu cầu kiểm tra mã số thuế

    try {
      const response = await api.get(`/company/validate-tax`);
      console.log("b"+ response.data)
        dispatch({
          type: VALIDATE_TAXCODE_SUCCESS,
          payload: response.data, // Kết quả trả về true/false
        });

    } catch (error) {
      dispatch({
        type: VALIDATE_TAXCODE_FAILURE,
        error: error.message || 'Có lỗi xảy ra khi gọi API',
      });
    }
  };
};

export const getAllCompanies = () => async (dispatch) => {
  dispatch({ type: GET_ALL_COMPANIES_REQUEST });
  try {
    const companiesResponse = await api.get('/company/find-all');
    
    // Get industry names for each company
    const companiesWithIndustryNames = await Promise.all(
      companiesResponse.data.map(async (company) => {
        try {
          const industryResponse = await api.get(`/company/get-industry-name/${company.industryId}`);
          return {
            ...company,
            industryName: industryResponse.data
          };
        } catch (error) {
          return {
            ...company,
            industryName: 'N/A'
          };
        }
      })
    );

    dispatch({
      type: GET_ALL_COMPANIES_SUCCESS,
      payload: companiesWithIndustryNames
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_COMPANIES_FAILURE,
      payload: error.message
    });
  }
};

export const updateCompanyStatus = (companyId, status) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_COMPANY_STATUS_REQUEST });
    
    const response = await axios.put(
      `${API_BASE_URL}/admin/companies/${companyId}/status`,
      { isActive: status }
    );

    dispatch({
      type: UPDATE_COMPANY_STATUS_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: UPDATE_COMPANY_STATUS_FAILURE,
      payload: error.response?.data || error.message,
    });
    throw error;
  }
};

export const deleteCompany = (companyId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_COMPANY_REQUEST });
    
    await axios.delete(`${API_BASE_URL}/admin/companies/${companyId}`);

    dispatch({
      type: DELETE_COMPANY_SUCCESS,
      payload: companyId,
    });
  } catch (error) {
    dispatch({
      type: DELETE_COMPANY_FAILURE,
      payload: error.response?.data || error.message,
    });
    throw error;
  }
};



export const getJobByCompany = (companyId, currentPage, size) => async (dispatch) => {
  dispatch({ type: GET_JOB_BY_COMPANY_REQUEST });
  try {
    const response = await axios.get(
      `${API_BASE_URL}/company/${companyId}/jobs`,
      {
        params: {
          page: currentPage,
          size: size
        }
      }
    );

    dispatch({
      type: GET_JOB_BY_COMPANY_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: GET_JOB_BY_COMPANY_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch company jobs"
    });
  }
};

export const getCompanyJobCounts = (companyId) => async (dispatch) => {
  dispatch({ type: GET_COMPANY_JOB_COUNTS_REQUEST });
  try {
    const response = await axios.get(
      `${API_BASE_URL}/job-post/count-jobs-by-company/${companyId}`
    );
    dispatch({
      type: GET_COMPANY_JOB_COUNTS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: GET_COMPANY_JOB_COUNTS_FAILURE,
      payload: error.response?.data?.message || "Failed to fetch job counts"
    });
  }
};

export const getCompanyJobStats = (companyId, startDate, endDate) => async (dispatch) => {
  dispatch({ type: GET_COMPANY_JOB_STATS_REQUEST });
  try {
    console.log('Requesting stats with dates:', { startDate, endDate });
    
    const response = await api.get(
      `/job-post/company/${companyId}/job-stats`,
      {
        params: { 
          startDate: startDate,
          endDate: endDate 
        }
      }
    );

    console.log('Raw API response:', response.data);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid data format from API');
    }

    dispatch({
      type: GET_COMPANY_JOB_STATS_SUCCESS,
      payload: response.data
    });

    return response;
  } catch (error) {
    console.error('Error fetching job stats:', error);
    dispatch({
      type: GET_COMPANY_JOB_STATS_FAILURE,
      payload: error.message
    });
    throw error;
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
export const getAllCompaniesForAdmin = (companyName, industryName, page, size) => async (dispatch) => {
  dispatch({ type: GET_ALL_COMPANIES_REQUEST });
  try {
    // Lấy danh sách công ty
    const companiesResponse = await axios.get(`http://localhost:8080/company/get-all-companies`, {
      params: { companyName, industryName, page, size }
    });

    // Lấy reviews cho từng công ty
    const companiesWithReviews = await Promise.all(
      companiesResponse.data.content.map(async (company) => {
        try {
          const reviewsResponse = await axios.get(
            `http://localhost:8080/api/v1/reviews/findReviewByCompanyId/${company.companyId}`
          );
          const reviews = reviewsResponse.data;

          // Tính trung bình đánh giá
          const totalStars = reviews.reduce((total, review) => total + review.star, 0);
          const averageRating = reviews.length > 0 ? totalStars / reviews.length : 0;

          return {
            ...company,
            reviews: reviews,
            averageRating: averageRating,
            totalReviews: reviews.length
          };
        } catch (error) {
          console.error(`Error fetching reviews for company ${company.companyId}:`, error);
          return {
            ...company,
            reviews: [],
            averageRating: 0,
            totalReviews: 0
          };
        }
      })
    );

    // Cập nhật response data với thông tin đánh giá
    const updatedResponse = {
      ...companiesResponse.data,
      content: companiesWithReviews
    };

    dispatch({
      type: GET_ALL_COMPANIES_SUCCESS,
      payload: updatedResponse
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_COMPANIES_FAILURE,
      payload: error.response?.data || 'Error fetching companies'
    });
  }
};
