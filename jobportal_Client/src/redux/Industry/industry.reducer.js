import { GET_ALL_JOB_SUCCESS } from "../JobPost/jobPost.actionType";
import { GET_INDUSTRY_COUNT_SUCCESS, GET_INDUSTRY_FAILURE, GET_INDUSTRY_REQUEST, GET_INDUSTRY_SUCCESS } from "./industry.actionType";
import { GET_ALL_INDUSTRIES_REQUEST, GET_ALL_INDUSTRIES_SUCCESS, GET_ALL_INDUSTRIES_FAILURE } from "./industry.actionType";

const initialState = {
    industry: null,
    loading: false,
    error: null,
    industries: [],
    industryCount: [], // Mảng lưu trữ các bài đăng công việc
    allIndustries: [],
};


export const indutryReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_INDUSTRY_REQUEST:
            return { 
                ...state, 
                loading: true, // Bắt đầu trạng thái tải
                error: null // Đặt lỗi về null
            };
        case GET_INDUSTRY_SUCCESS:
            return { 
                ...state, 
                industries: action.payload, 
                loading: false, 
                error: null 
            };
        case GET_INDUSTRY_COUNT_SUCCESS:
            return{
                ...state,
                industryCount: action.payload,
                loading: false,
                error: null
            }
        case GET_INDUSTRY_FAILURE:
            return { 
                ...state, 
                loading: false, 
                error: action.payload 
            };
        case GET_ALL_INDUSTRIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case GET_ALL_INDUSTRIES_SUCCESS:
            return {
                ...state,
                allIndustries: action.payload,
                loading: false,
                error: null
            };
        case GET_ALL_INDUSTRIES_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
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
            return state
    }
}