import { GET_CITY_FAILURE, GET_CITY_REQUEST, GET_CITY_SUCCESS } from "./city.actionType";

const initialState = {
    city: null,
    loading: false,
    error: null,
    cities: [], // Mảng lưu trữ các bài đăng công việc
};


export const cityReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_CITY_REQUEST:
            return { 
                ...state, 
                loading: true, // Bắt đầu trạng thái tải
                error: null // Đặt lỗi về null
            };
        case GET_CITY_SUCCESS:
            return { 
                ...state, 
                cities: action.payload, 
                loading: false, 
                error: null 
            };

        case GET_CITY_FAILURE:
            return { 
                ...state, 
                loading: false, 
                error: action.payload 
            };
        default:
            return state
    }
}