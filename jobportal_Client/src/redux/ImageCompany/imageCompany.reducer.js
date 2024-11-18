
import {
  CREATE_IMAGE_COMPANY_SUCCESS,
  DELETE_IMAGE_COMPANY_SUCCESS,
} from "./imageCompany.actionType";

const initialState = {
  imageCompany: [],
  loading: false,
  error: null,
};

export const imageCompanyReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_IMAGE_COMPANY_SUCCESS:
      return {
        ...state,
        imageCompany: action.payload,
        loading: false,
        error: null,
      };
    case DELETE_IMAGE_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        imageCompany: state.imageCompany.filter(
          (imgId) => imgId.id !== action.payload
        ), 
      };

    default:
      return state;
  }
};
