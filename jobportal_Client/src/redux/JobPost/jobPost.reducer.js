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
  jobPost: [], // Mảng lưu trữ các bài đăng công việc
  postByPostId: null,
  totalPages: 0, // Tổng số trang
  approve: false,
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
    default:
      return state;
  }
};
