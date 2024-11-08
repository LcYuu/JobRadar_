
import { api, API_BASE_URL } from "../../configs/api";
import axios from "axios";
import { CREATE_EXP_FAILURE, CREATE_EXP_REQUEST, CREATE_EXP_SUCCESS, DELETE_EXP_FAILURE, DELETE_EXP_REQUEST, DELETE_EXP_SUCCESS, GET_EXP_BY_USER_FAILURE, GET_EXP_BY_USER_REQUEST, GET_EXP_BY_USER_SUCCESS } from "./exp.actionType";



export const getExpByUser = () => async (dispatch) => {
    dispatch({ type: GET_EXP_BY_USER_REQUEST});

    try {
        const jwt = sessionStorage.getItem('jwt'); // Lấy JWT từ sessionStorage
        if (!jwt) {
            throw new Error('No token found');
        }

        const response = await axios.get(`${API_BASE_URL}/experience/seeker`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });

        console.log("Exp: " + response.data)

        dispatch({
            type: GET_EXP_BY_USER_SUCCESS,
            payload: response.data,
        });
    } catch (error) {

        dispatch({
            type: GET_EXP_BY_USER_FAILURE,
            payload: error.message,
        });
    }
};

export const deleteExperience = (experienceId) => async (dispatch) => {
    try {
      // Bắt đầu gọi API xóa
      dispatch({ type: DELETE_EXP_REQUEST });
  
      // Gọi API xóa kinh nghiệm
      const response = await axios.delete(`http://localhost:8080/experience/delete-experience/${experienceId}`);

        dispatch({
          type: DELETE_EXP_SUCCESS,
          payload: experienceId, // Trả về experienceId để cập nhật state
        });

    } catch (error) {
      dispatch({
        type: DELETE_EXP_FAILURE,
        payload: error.response ? error.response.data : error.message,
      });
    }
  };


  export const createExperience = (expData) => async (dispatch) => {
    dispatch({ type: CREATE_EXP_REQUEST });
    try {
      const response = await api.post(`/experience/create-experience`, expData);
        dispatch({
          type: CREATE_EXP_SUCCESS,
          payload: response.data, 
        });
        return response.data; 
    } catch (error) {
      dispatch({
        type: CREATE_EXP_FAILURE,
        payload: error.response ? error.response.data : error.message,
      });
    }
  };