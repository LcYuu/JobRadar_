import axios from "axios";
import { GET_INDUSTRY_FAILURE, GET_INDUSTRY_REQUEST, GET_INDUSTRY_SUCCESS } from "./industry.actionType";
import { API_BASE_URL } from "../../configs/api";





// export const loginAction = (loginData) => async (dispatch) => {
//   dispatch({ type: LOGIN_REQUEST });
//   try {
//     const response = await axios.post("http://localhost:8080/auth/login", loginData);
//     dispatch({ type: LOGIN_SUCCESS, payload: response.data });
//     localStorage.setItem('user', JSON.stringify(response.data));
//     localStorage.setItem('token', response.data.token);
//     return { success: true, data: response.data };
//   } catch (error) {
//     const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";
//     dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
//     return { success: false, error: errorMessage };
//   }
// };

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