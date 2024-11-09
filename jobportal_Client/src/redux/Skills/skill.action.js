
import axios from "axios";
import { GET_ALL_SKILL_FAILURE, GET_ALL_SKILL_REQUEST, GET_ALL_SKILL_SUCCESS } from "./skill.actionType";

export const getAllSkill = () => async (dispatch) => {
    dispatch({ type: GET_ALL_SKILL_REQUEST });
    try {
        const response = await axios.get(`http://localhost:8080/skills/get-all`); // Thay thế với URL thực tế
        dispatch({
            type: GET_ALL_SKILL_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: GET_ALL_SKILL_FAILURE,
            payload: error.message 
        });
    }
};