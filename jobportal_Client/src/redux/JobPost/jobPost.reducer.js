import { getAllJobPost } from "./jobPost.action";
import {
  COUNT_JOB_BY_TYPE_REQUEST,
  COUNT_JOB_BY_TYPE_SUCCESS,
  GET_ALL_JOB_FAILURE,
  GET_ALL_JOB_REQUEST,
  GET_ALL_JOB_SUCCESS,
  GET_JOB_POST_BY_POST_ID_REQUEST,
  GET_JOB_POST_BY_POST_ID_SUCCESS,
  GET_TOP8_JOB_FAILURE,
  GET_TOP8_JOB_REQUEST,
  GET_TOP8_JOB_SUCCESS,
  SEARCH_JOBS_FAILURE,
  SEARCH_JOBS_REQUEST,
  SEARCH_JOBS_SUCCESS,
  SET_SALARY_RANGE_SUCCESS,
  GET_JOBS_BY_COMPANY_SUCCESS,
  GET_JOBS_BY_COMPANY_FAILURE,
  GET_JOBS_BY_COMPANY_REQUEST,
  GET_TOTAL_JOBS_REQUEST,
  GET_TOTAL_JOBS_SUCCESS,
  GET_TOTAL_JOBS_FAILURE,
  GET_RECOMMEND_JOB_SUCCESS,
  GET_EMPLOYER_COMPANY_SUCCESS,
  GET_ALL_JOB_POST_SUCCESS,
  GET_JOB_COMPANY_SUCCESS,
  GET_DETAIL_JOB_BY_ID_SUCCESS,
  UPDATE_JOB_REQUEST,
  UPDATE_JOB_SUCCESS,
  CREATE_JOB_SUCCESS,
  GET_TOP_5_LASTEST_COMPANY_SUCCESS,
  GET_ALL_ADMIN_JOBS_REQUEST,
  GET_ALL_ADMIN_JOBS_SUCCESS,
  GET_ALL_ADMIN_JOBS_FAILURE,
  GET_ALL_JOBS_REQUEST,
  GET_ALL_JOBS_SUCCESS,
  GET_ALL_JOBS_FAILURE,
  UPDATE_JOB_EXPIRE_SUCCESS,
} from "./jobPost.actionType";

const initialState = {
  minSalary: null,
  maxSalary: null,
  post: null,
  loading: false,
  error: null,
  searchJob: [],
  top8Job: [],
  jobCountByType: [],
  jobPost: [],
  postByPostId: null,
  totalPages: 0, // Tổng số trang
  approve: false,
  totalItems: 0,
  totalJobs: 0,
  recommendJob: [],
  employerCompany: [],
  positions: [],
  jobs: [],
  detailJob: null,
  totalElements: 0,
  currentPage: 0,
  expireJob: null,
};

export const jobPostReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_JOB_REQUEST:
    case GET_TOP8_JOB_REQUEST:
    case COUNT_JOB_BY_TYPE_REQUEST:
    case SEARCH_JOBS_REQUEST:
    case GET_JOB_POST_BY_POST_ID_REQUEST:
      return {
        ...state,
        loading: true, // Bắt đầu trạng thái tải
        error: null, // Đặt lỗi về null
      };
    case GET_ALL_JOB_SUCCESS:
      return {
        ...state,
        jobPost: action.payload.content, // Lưu trữ tất cả các công việc vào mảng jobPost
        totalPages: action.payload.page.totalPages, // Lưu trữ tổng số trang
        loading: false, // Kết thúc trạng thái tải
        error: null, // Đặt lỗi về null
      };
    case CREATE_JOB_SUCCESS:
    case UPDATE_JOB_SUCCESS:
      return {
        ...state,
        loading: false,
        detailJob: action.payload,
        error: null,
      };
    case UPDATE_JOB_EXPIRE_SUCCESS:
      return {
        ...state,
        loading: false,
        expireJob: action.payload,
        error: null,
      };
    case GET_TOP8_JOB_SUCCESS:
      return {
        ...state,
        top8Job: action.payload,
        loading: false, // Kết thúc trạng thái tải
        error: null, // Đặt lỗi về null
      };
    case SET_SALARY_RANGE_SUCCESS:
      return {
        ...state,
        loading: false,
        minSalary: action.payload.minSalary,
        maxSalary: action.payload.maxSalary,
      };
    case COUNT_JOB_BY_TYPE_SUCCESS:
      return {
        ...state,
        jobCountByType: action.payload,
        loading: false, // Kết thúc trạng thái tải
        error: null, // Đặt lỗi về null
      };
    case GET_ALL_JOB_POST_SUCCESS:
      return {
        ...state,
        positions: action.payload,
        loading: false, // Kết thúc trạng thái tải
        error: null, // Đặt lỗi về null
      };
    case SEARCH_JOBS_SUCCESS:
      return {
        ...state,
        searchJob: action.payload.content,
        totalPages: action.payload.page.totalPages,
        loading: false,
        error: null,
      };
    case GET_JOB_POST_BY_POST_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        postByPostId: action.payload,
        error: null,
      };
    case GET_EMPLOYER_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        employerCompany: action.payload.content,
        totalPages: action.payload.page.totalPages,
        totalElements: action.payload.page.totalElements,
        error: null,
      };

    case GET_JOB_COMPANY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        jobs: action.payload.jobs,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
      };
    case GET_TOP_5_LASTEST_COMPANY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        jobs: action.payload,
      };

    case GET_RECOMMEND_JOB_SUCCESS:
      return {
        ...state,
        recommendJob: action.payload,
        loading: false,
        error: null,
      };
    case GET_DETAIL_JOB_BY_ID_SUCCESS:
      return {
        ...state,
        detailJob: action.payload,
        loading: false,
        error: null,
      };
    case GET_TOP8_JOB_FAILURE:
    case GET_ALL_JOB_FAILURE:
    case SEARCH_JOBS_FAILURE:
      return {
        ...state,
        loading: false, // Kết thúc trạng thái tải
        error: action.payload, // Lưu trữ lỗi nếu có
      };

    // case GET_ALL_POST_SUCCESS:
    //     return {
    //         ...state,
    //         jobPost: action.payload,
    //         comments: action.payload.comment,
    //         loading: false,
    //         error: null
    //     }
    // case GET_USERS_POST_SUCCESS: // Thêm case này
    //     return {
    //         ...state,
    //         jobPost: action.payload,
    //         loading: false,
    //         error: null
    //     }
    // case LIKE_POST_SUCCESS:
    //     return {
    //         ...state,
    //         like: action.payload,
    //         jobPost: state.jobPost.map((item) => item.post_id === action.payload.post_id ? action.payload : item),
    //         loading: false,
    //         error: null
    //     }
    // case CREATE_COMMENT_SUCCESS:
    //     return {
    //         ...state,
    //         newComment: action.payload,
    //         loading: false,
    //         error: null
    //     }
    // case CREATE_POST_FAILURE:
    // case GET_ALL_POST_FAILURE:
    // case GET_USERS_POST_FAILURE:
    //     return {
    //         ...state, error: action.payload,
    //         loading: false
    //     }
    case GET_JOBS_BY_COMPANY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_JOBS_BY_COMPANY_SUCCESS:
      return {
        ...state,
        jobPost: action.payload.content,
        totalPages: action.payload.totalPages,
        totalItems: action.payload.totalElements,
        loading: false,
        error: null,
      };
    case GET_JOBS_BY_COMPANY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case GET_TOTAL_JOBS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_TOTAL_JOBS_SUCCESS:
      return {
        ...state,
        totalJobs: action.payload,
        loading: false,
        error: null,
      };
    case GET_TOTAL_JOBS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case GET_ALL_ADMIN_JOBS_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_ALL_ADMIN_JOBS_SUCCESS:
      return {
        ...state,
        jobPost: action.payload.content,
        totalPages: action.payload.page.totalPages,
        totalElements: action.payload.page.totalElements,
        loading: false,
        error: null,
      };
    case GET_ALL_ADMIN_JOBS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case GET_ALL_JOBS_REQUEST:
    case SEARCH_JOBS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_ALL_JOBS_SUCCESS:
      return {
        ...state,
        loading: false,
        jobPost: action.payload.content,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
        currentPage: action.payload.currentPage,
        error: null,
      };

    case SEARCH_JOBS_SUCCESS:
      return {
        ...state,
        loading: false,
        searchJob: action.payload.content,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
        currentPage: action.payload.currentPage,
        error: null,
      };

    case GET_ALL_JOBS_FAILURE:
    case SEARCH_JOBS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "GET_SIMILAR_JOBS_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "GET_SIMILAR_JOBS_SUCCESS":
      return {
        ...state,
        loading: false,
        similarJobs: action.payload,
      };
    case "GET_SIMILAR_JOBS_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
