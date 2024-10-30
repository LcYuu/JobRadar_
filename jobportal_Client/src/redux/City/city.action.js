import axios from "axios";
import { GET_CITY_FAILURE, GET_CITY_REQUEST, GET_CITY_SUCCESS } from "./city.actionType";

export const getCity = () => async (dispatch) => {
    dispatch({ type: GET_CITY_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/city/get-all`); // Thay thế với URL thực tế
        dispatch({
            type: GET_CITY_SUCCESS,
            payload: response.data // Trả về dữ liệu nhận được từ API
        });
    } catch (error) {
        dispatch({
            type: GET_CITY_FAILURE,
            payload: error.message // Hoặc error.response.data
        });
    }
};