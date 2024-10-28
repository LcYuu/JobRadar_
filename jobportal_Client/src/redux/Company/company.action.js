import axios from "axios";
import { GET_COMPANY_POPULAR_FAILURE, GET_COMPANY_POPULAR_REQUEST, GET_COMPANY_POPULAR_SUCCESS } from "./company.actionType";

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