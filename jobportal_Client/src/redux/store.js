import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import  {thunk}  from "redux-thunk";
import { jobPostReducer } from "./JobPost/jobPost.reducer";
import { authReducer } from "./Auth/auth.reducer";
import { indutryReducer } from "./Industry/industry.reducer";
import {forgotPasswordReducer} from "./ForgotPassword/forgotPassword.reducer"
import { companyReducer } from "./Company/company.reducer";
import { cityReducer } from "./City/city.reducer";
import { applyJobReducer } from "./ApplyJob/applyJob.reducer";
const rootReducer = combineReducers({
    auth:authReducer,
    jobPost:jobPostReducer,
    industry:indutryReducer,
    forgotPassword: forgotPasswordReducer,
    company:companyReducer,
    city:cityReducer,
    applyJob:applyJobReducer
})
export const store = legacy_createStore(rootReducer, applyMiddleware(thunk))