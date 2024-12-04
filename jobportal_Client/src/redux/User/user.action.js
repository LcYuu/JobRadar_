import { api } from "../../configs/api";
import {
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  UPDATE_USER_STATUS_REQUEST,
  UPDATE_USER_STATUS_SUCCESS,
  UPDATE_USER_STATUS_FAILURE,
  GET_USER_TYPES_REQUEST,
  GET_USER_TYPES_SUCCESS,
  GET_USER_TYPES_FAILURE,
  GET_USER_ROLES_REQUEST,
  GET_USER_ROLES_SUCCESS,
  GET_USER_ROLES_FAILURE,
} from "./user.actionType";
import { API_BASE_URL } from '../../configs/api';
export const getAllUsers = (userName, userTypeId, active, page, size) => async (dispatch) => {
  dispatch({ type: GET_ALL_USERS_REQUEST });
  try {
    const response = await api.get(`/users/admin-get-all`, {
      params: { userName, userTypeId, active, page, size}
    });

    dispatch({
      type: GET_ALL_USERS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_USERS_FAILURE,
      payload: error.response?.data || 'Lỗi'
    });
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  dispatch({ type: DELETE_USER_REQUEST });
  try {
    await api.delete(`/users/delete-user/${userId}`);
    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: userId,
    });
  } catch (error) {
    dispatch({
      type: DELETE_USER_FAILURE,
      payload: error.message,
    });
  }
};

export const updateUserStatus = (userId, userData) => async (dispatch) => {
  dispatch({ type: UPDATE_USER_STATUS_REQUEST });
  try {
    const response = await api.put(`/users/update-user`, userData);
    dispatch({
      type: UPDATE_USER_STATUS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_STATUS_FAILURE,
      payload: error.message,
    });
  }
};

export const getUserTypes = () => async (dispatch) => {
  dispatch({ type: GET_USER_TYPES_REQUEST });
  try {
    const jwt = sessionStorage.getItem('jwt');
    if (!jwt) {
      throw new Error('No token found');
    }

    const response = await api.get(`${API_BASE_URL}/users/user-types`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    dispatch({
      type: GET_USER_TYPES_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: GET_USER_TYPES_FAILURE,
      payload: error.message
    });
  }
};

export const getUserRoles = () => async (dispatch) => {
  dispatch({ type: GET_USER_ROLES_REQUEST });
  try {
    const jwt = sessionStorage.getItem('jwt');
    if (!jwt) {
      throw new Error('No token found');
    }

    const response = await api.get(`/auth/user-role`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      }
    });

    dispatch({
      type: GET_USER_ROLES_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    dispatch({
      type: GET_USER_ROLES_FAILURE,
      payload: error.message
    });
  }
}; 