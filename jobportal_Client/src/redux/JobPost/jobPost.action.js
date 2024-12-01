import axios from "axios"
import { api, API_BASE_URL } from "../../configs/api"

// import { CREATE_COMMENT_FAILURE,GET_ALL_JOB_REQUEST, GET_ALL_JOB_FAILURE, CREATE_COMMENT_REQUEST, CREATE_COMMENT_SUCCESS, CREATE_POST_FAILURE, CREATE_POST_REQUEST, CREATE_POST_SUCCESS, GET_ALL_JOB_SUCCESS, GET_ALL_POST_FAILURE, GET_ALL_POST_REQUEST, GET_ALL_POST_SUCCESS, GET_USERS_POST_FAILURE, GET_USERS_POST_REQUEST, GET_USERS_POST_SUCCESS, LIKE_POST_FAILURE, LIKE_POST_REQUEST, LIKE_POST_SUCCESS, GET_TOP8_JOB_REQUEST, GET_TOP8_JOB_FAILURE, GET_TOP8_JOB_SUCCESS, COUNT_JOB_BY_TYPE_REQUEST, COUNT_JOB_BY_TYPE_SUCCESS, COUNT_JOB_BY_TYPE_FAILURE, SEARCH_JOBS_REQUEST, SEARCH_JOBS_SUCCESS, SEARCH_JOBS_FAILURE, SET_SALARY_RANGE_REQUEST, SET_SALARY_RANGE_SUCCESS, SET_SALARY_RANGE_FAILURE, GET_JOBS_BY_COMPANY_REQUEST, GET_JOBS_BY_COMPANY_SUCCESS, GET_JOBS_BY_COMPANY_FAILURE, GET_TOTAL_JOBS_REQUEST, GET_TOTAL_JOBS_SUCCESS, GET_TOTAL_JOBS_FAILURE, GET_JOB_POST_BY_POST_ID_REQUEST, GET_JOB_POST_BY_POST_ID_SUCCESS, GET_JOB_POST_BY_POST_ID_FAILURE, GET_RECOMMEND_JOB_REQUEST, GET_RECOMMEND_JOB_SUCCESS, GET_RECOMMEND_JOB_FAILURE, GET_ALL_ADMIN_JOBS_REQUEST, GET_ALL_ADMIN_JOBS_SUCCESS, GET_ALL_ADMIN_JOBS_FAILURE } from "./jobPost.actionType"


import {

  GET_ALL_JOB_REQUEST,
  GET_ALL_JOB_FAILURE,

  GET_ALL_JOB_SUCCESS,

  GET_TOP8_JOB_REQUEST,
  GET_TOP8_JOB_FAILURE,
  GET_TOP8_JOB_SUCCESS,
  COUNT_JOB_BY_TYPE_REQUEST,
  COUNT_JOB_BY_TYPE_SUCCESS,
  COUNT_JOB_BY_TYPE_FAILURE,
  SEARCH_JOBS_REQUEST,
  SEARCH_JOBS_SUCCESS,
  SEARCH_JOBS_FAILURE,
  SET_SALARY_RANGE_REQUEST,
  SET_SALARY_RANGE_SUCCESS,
  SET_SALARY_RANGE_FAILURE,
  GET_JOBS_BY_COMPANY_REQUEST,
  GET_JOBS_BY_COMPANY_SUCCESS,
  GET_JOBS_BY_COMPANY_FAILURE,
  GET_TOTAL_JOBS_REQUEST,
  GET_TOTAL_JOBS_SUCCESS,
  GET_TOTAL_JOBS_FAILURE,
  GET_JOB_POST_BY_POST_ID_REQUEST,
  GET_JOB_POST_BY_POST_ID_SUCCESS,
  GET_JOB_POST_BY_POST_ID_FAILURE,
  GET_RECOMMEND_JOB_REQUEST,
  GET_RECOMMEND_JOB_SUCCESS,
  GET_RECOMMEND_JOB_FAILURE,
  GET_EMPLOYER_COMPANY_REQUEST,
  GET_EMPLOYER_COMPANY_SUCCESS,
  GET_EMPLOYER_COMPANY_FAILURE,
  GET_ALL_JOB_POST_REQUEST,
  GET_ALL_JOB_POST_SUCCESS,
  GET_ALL_JOB_POST_FAILURE,
  GET_JOB_COMPANY_REQUEST,
  GET_JOB_COMPANY_SUCCESS,
  GET_JOB_COMPANY_FAILURE,
  GET_DETAIL_JOB_BY_ID_REQUEST,
  GET_DETAIL_JOB_BY_ID_SUCCESS,
  GET_DETAIL_JOB_BY_ID_FAILURE,
  UPDATE_JOB_REQUEST,
  UPDATE_JOB_SUCCESS,
  UPDATE_JOB_FAILURE,
  CREATE_JOB_REQUEST,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_FAILURE,
  GET_TOP_5_LASTEST_COMPANY_REQUEST,
  GET_TOP_5_LASTEST_COMPANY_SUCCESS,
  GET_TOP_5_LASTEST_COMPANY_FAILURE,
  GET_COMPANY_REQUEST,
  GET_COMPANY_SUCCESS,
  GET_COMPANY_FAILURE,
  GET_ALL_ADMIN_JOBS_REQUEST,
  GET_ALL_ADMIN_JOBS_SUCCESS,
  GET_ALL_ADMIN_JOBS_FAILURE,
  GET_ALL_JOBS_REQUEST,
  GET_ALL_JOBS_SUCCESS,
  GET_ALL_JOBS_FAILURE,
  GET_JOB_DETAILS_REQUEST,
  GET_JOB_DETAILS_SUCCESS,
  GET_JOB_DETAILS_FAILURE,
  UPDATE_JOB_STATUS_REQUEST,
  UPDATE_JOB_STATUS_SUCCESS,
  UPDATE_JOB_STATUS_FAILURE,
  SET_CURRENT_PAGE,
  SET_PAGE_SIZE,
  UPDATE_JOB_EXPIRE_REQUEST,
  UPDATE_JOB_EXPIRE_SUCCESS,
  UPDATE_JOB_EXPIRE_FAILURE
} from "./jobPost.actionType";

// export const getAllJobActionForAdmin = (currentPage, size, filters = {}) => async (dispatch) => {
//   dispatch({ type: GET_ALL_JOB_REQUEST });
//   try {
//     const params = {
//       page: currentPage,
//       size,
//       ...filters
//     };
    
//     const response = await api.get('/job-post/admin-get-all', { params });
    
//     dispatch({
//       type: GET_ALL_JOB_SUCCESS,
//       payload: {
//         content: response.data.content,
//         totalPages: response.data.totalPages,
//         totalElements: response.data.totalElements,
//         currentPage: response.data.currentPage
//       }
//     });
//   } catch (error) {
//     dispatch({
//       type: GET_ALL_JOB_FAILURE,
//       payload: error.message
//     });
//   }
// };
export const getAllJobAction = (currentPage, size) => async (dispatch) => {
  dispatch({ type: GET_ALL_JOB_REQUEST });
  try {
    const response = await axios.get(
      `http://localhost:8080/job-post/get-job-approve?page=${currentPage}&size=${size}`
    ); // Thay thế với URL thực tế
    dispatch({
      type: GET_ALL_JOB_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_JOB_FAILURE,
      payload: error.message,
    });
  }
};
export const getTop8LastestJob = () => async (dispatch) => {
  dispatch({ type: GET_TOP8_JOB_REQUEST });
  try {
    const response = await axios.get(
      `http://localhost:8080/job-post/get-top8-lastest-job`
    ); // Thay thế với URL thực tế
    dispatch({
      type: GET_TOP8_JOB_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_TOP8_JOB_FAILURE,
      payload: error.message,
    });
  }
};

export const getRecommendJob = () => async (dispatch) => {
  dispatch({ type: GET_RECOMMEND_JOB_REQUEST });
  try {
    const response = await api.post(`/job-post/recommend-jobs`); // Thay thế với URL thực tế
    dispatch({
      type: GET_RECOMMEND_JOB_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_RECOMMEND_JOB_FAILURE,
      payload: error.message,
    });
  }
};

export const searchJobs = (filters, currentPage, size) => async (dispatch) => {
  dispatch({ type: SEARCH_JOBS_REQUEST });
  try {
    // Tạo params cho axios
    const params = {
      title: filters.title || undefined,
      selectedTypesOfWork:
        filters.selectedTypesOfWork.length > 0
          ? filters.selectedTypesOfWork.join(",")
          : undefined,
      cityId: filters.cityId || undefined,
      selectedIndustryIds:
        filters.selectedIndustryIds.length > 0
          ? filters.selectedIndustryIds.join(",")
          : undefined,
      minSalary: filters.minSalary ? Number(filters.minSalary) : undefined,
      maxSalary: filters.maxSalary ? Number(filters.maxSalary) : undefined,
      page: currentPage,
      size: size,
    };
    const token = sessionStorage.getItem("jwt");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get(`/job-post/search-job-by-feature`, {
      headers,
      params,
    });

    dispatch({
      type: SEARCH_JOBS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: SEARCH_JOBS_FAILURE,
      payload: error.message,
    });
  }
};

export const fetchSalaryRange = () => async (dispatch) => {
  dispatch({ type: SET_SALARY_RANGE_REQUEST });

  try {
    const response = await axios.get(
      `http://localhost:8080/job-post/salary-range`
    );
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
    const response = await axios.get(
      `http://localhost:8080/job-post/count-job-by-type`
    ); // Thay thế với URL thực tế
    dispatch({
      type: COUNT_JOB_BY_TYPE_SUCCESS,
      payload: response.data, // Trả về dữ liệu nhận được từ API
    });
  } catch (error) {
    dispatch({
      type: COUNT_JOB_BY_TYPE_FAILURE,
      payload: error.message, // Hoặc error.response.data
    });
  }
};

export const getJobPostByPostId = (postId) => async (dispatch) => {
  dispatch({ type: GET_JOB_POST_BY_POST_ID_REQUEST });
  try {
    const response = await axios.get(
      `http://localhost:8080/job-post/findJob/${postId}`
    );

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

export const getJobsByCompany =
  (companyId, currentPage, size) => async (dispatch) => {
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
          totalElements: response.data.totalElements,
        },
      });
    } catch (error) {
      dispatch({
        type: GET_JOBS_BY_COMPANY_FAILURE,
        payload: error.message,
      });

    }
};

export const getTotalJobsByCompany = (companyId) => async (dispatch) => {
  dispatch({ type: GET_TOTAL_JOBS_REQUEST });
  try {
    const response = await axios.get(
      `${API_BASE_URL}/job-post/count-by-company/${companyId}`
    );
    dispatch({
      type: GET_TOTAL_JOBS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_TOTAL_JOBS_FAILURE,
      payload: error.message,
    });
  }
};
export const getAllJobPost = () => async (dispatch) => {
  dispatch({ type: GET_ALL_JOB_POST_REQUEST });
  try {
    const response = await api.get(`/job-post/search-by-company`);
    dispatch({
      type: GET_ALL_JOB_POST_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_JOB_POST_FAILURE,
      payload: error.message,
    });
  }
};

export const getTop5Lastest = () => async (dispatch) => {
  dispatch({ type: GET_TOP_5_LASTEST_COMPANY_REQUEST });
  try {
    const response = await api.get(`/job-post/top-5-job-lastest`);
    dispatch({
      type: GET_TOP_5_LASTEST_COMPANY_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_TOP_5_LASTEST_COMPANY_FAILURE,
      payload: error.message,
    });
  }
};

export const findEmployerCompany = (
  status,
  typeOfWork,
  sortByCreateDate,
  sortByExpireDate,
  sortByCount,
  currentPage,
  size
) => async (dispatch) => {
  dispatch({ type: GET_JOB_COMPANY_REQUEST });
  const params = {
    ...(status && { status }), // Chỉ thêm status nếu có giá trị
    ...(typeOfWork && { typeOfWork }), // Chỉ thêm typeOfWork nếu có giá trị
    sortByCount: sortByCount,
    sortByExpireDate: sortByExpireDate,
    sortByCreateDate: sortByCreateDate,
    page: currentPage,
    size: size,
  };

  console.log("a" + JSON.stringify(params));

  try {
    const response = await api.get('/job-post/employer-company', { params });

    dispatch({
      type: GET_JOB_COMPANY_SUCCESS,
      payload: {
        jobs: response.data.content, // Các công việc sau khi lọc và phân trang
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements,
      },
    });
  } catch (error) {
    dispatch({
      type: GET_JOB_COMPANY_FAILURE,
      payload: error.message || 'Lỗi không xác định',
    });
  }
};

export const getDetailJobById = (postId) => async (dispatch) => {
  dispatch({ type: GET_DETAIL_JOB_BY_ID_REQUEST });
  try {
    const response = await api.get(`/job-post/findJob/${postId}`);
    dispatch({
      type: GET_DETAIL_JOB_BY_ID_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_DETAIL_JOB_BY_ID_FAILURE,
      error: error.message,
    });
  }
};

export const updateJob = (postId, jobPostData) => async (dispatch) => {
  console.log("postId:", postId); // Kiểm tra giá trị của postId
  console.log("jobPostData:", jobPostData); // Kiểm tra dữ liệu gửi đi
  dispatch({ type: UPDATE_JOB_REQUEST });
  try {
    const { data } = await api.put(
      `/job-post/update-job/${postId}`,
      jobPostData
    );
    console.log("Post updated: ", data);
    dispatch({ type: UPDATE_JOB_SUCCESS, payload: data });
    return data;
  } catch (error) {
    console.error("Post Update Error: ", error);
    dispatch({ type: UPDATE_JOB_FAILURE, payload: error });
    throw error;
  }
};

export const createJobPost = (jobPostData) => async (dispatch) => {
  dispatch({ type: CREATE_JOB_REQUEST });
  try {
      const response = await api.post("/job-post/create-job", jobPostData);
      dispatch({
          type: CREATE_JOB_SUCCESS,
          payload: response.data, // Thông báo thành công từ backend
      });
      return {
        success: true
      };
  } catch (error) {
      dispatch({
          type: CREATE_JOB_FAILURE,
          payload: error.response?.data || "Lỗi khi tạo công việc",
      });
      return {
        success: false,
        error: error.response?.data || "Lỗi khi tạo công việc" 
      };
  }
};
export const getAllJobsForAdmin = (page, size) => async (dispatch) => {
  dispatch({ type: GET_ALL_ADMIN_JOBS_REQUEST });
  try {
    const response = await api.get(`/job-post/admin/all-jobs`, {
      params: {
        page,
        size
      }
    });
    
    dispatch({
      type: GET_ALL_ADMIN_JOBS_SUCCESS,
      payload: {
        jobPost: response.data.content,
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements,
        currentPage: response.data.page.number
      }
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_ADMIN_JOBS_FAILURE,
      payload: error.message
    });
  }
};

export const approveJob = (postId) => async (dispatch) => {
  try {
    await api.post(`/job-post/approve/${postId}`);
    // Sau khi approve thành công, fetch lại danh sách
    dispatch(getAllJobsForAdmin(0, 10));
  } catch (error) {
    console.error('Error approving job:', error);
  }
};

export const setCurrentPage = (page) => ({
  type: SET_CURRENT_PAGE,
  payload: page
});

export const setPageSize = (size) => ({
  type: SET_PAGE_SIZE,
  payload: size
});

export const getSimilarJobs = (companyId, excludePostId) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/job-post/similar-jobs`, {
      params: {
        companyId,
        excludePostId,
      }
    });
    dispatch({
      type: "GET_SIMILAR_JOBS_SUCCESS",
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: "GET_SIMILAR_JOBS_FAILURE",
      payload: error.message
    });
  }
};


export const updateExpireJob = (postId) => async (dispatch) => {
  dispatch({ type: UPDATE_JOB_EXPIRE_REQUEST });
  try {
    const { data } = await api.put(`job-post/set-expire/${postId}`
    );
    dispatch({ type: UPDATE_JOB_EXPIRE_SUCCESS, payload: data });
    return data;
  } catch (error) {
    console.error("Post Update Error: ", error);
    dispatch({ type: UPDATE_JOB_EXPIRE_FAILURE, payload: error });
    throw error;
  }
};