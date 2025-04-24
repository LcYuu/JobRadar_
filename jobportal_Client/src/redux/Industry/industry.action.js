import axios from "axios";
import { GET_INDUSTRY_COUNT_FAILURE, GET_INDUSTRY_COUNT_REQUEST, GET_INDUSTRY_COUNT_SUCCESS, GET_INDUSTRY_FAILURE, GET_INDUSTRY_REQUEST, GET_INDUSTRY_SUCCESS, GET_ALL_INDUSTRIES_REQUEST, GET_ALL_INDUSTRIES_SUCCESS, GET_ALL_INDUSTRIES_FAILURE } from "./industry.actionType";

export const getIndustry = () => async (dispatch) => {
    dispatch({ type: GET_INDUSTRY_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/industry/countJobByIndustry`); // Thay thế với URL thực tế
        dispatch({
            type: GET_INDUSTRY_SUCCESS,
            payload: response.data // Trả về dữ liệu nhận được từ API
        });
    } catch (error) {
        dispatch({
            type: GET_INDUSTRY_FAILURE,
            payload: error.message // Hoặc error.response.data
        });
    }
};

export const getIndustryCount = () => async (dispatch) => {
    dispatch({ type: GET_INDUSTRY_COUNT_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/industry/count-industry`); // Thay thế với URL thực tế
        dispatch({
            type: GET_INDUSTRY_COUNT_SUCCESS,
            payload: response.data // Trả về dữ liệu nhận được từ API
        });
    } catch (error) {
        dispatch({
            type: GET_INDUSTRY_COUNT_FAILURE,
            payload: error.message // Hoặc error.response.data
        });
    }
};

export const getAllIndustries = () => async (dispatch) => {
    dispatch({ type: GET_ALL_INDUSTRIES_REQUEST });
    try {
        const response = await axios.get('http://localhost:8080/industry/get-all');
        // Lọc bỏ các ngành nghề có giá trị null hoặc "None"
        const validIndustries = response.data.filter(industry => 
            industry.industryName && 
            industry.industryName.toLowerCase() !== 'none'
        );
        dispatch({
            type: GET_ALL_INDUSTRIES_SUCCESS,
            payload: validIndustries
        });
    } catch (error) {
        dispatch({
            type: GET_ALL_INDUSTRIES_FAILURE,
            payload: error.message
        });
    }
};
