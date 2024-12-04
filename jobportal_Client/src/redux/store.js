import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import  {thunk}  from "redux-thunk";
import { jobPostReducer } from "./JobPost/jobPost.reducer";
import { authReducer } from "./Auth/auth.reducer";
import { indutryReducer } from "./Industry/industry.reducer";
import {forgotPasswordReducer} from "./ForgotPassword/forgotPassword.reducer"
import { companyReducer } from "./Company/company.reducer";
import { cityReducer } from "./City/city.reducer";
import { applyJobReducer } from "./ApplyJob/applyJob.reducer";
import { seekerReducer } from "./Seeker/seeker.reducer";
import { expReducer } from "./Experience/exp.reducer";
import { eduReducer } from "./Education/edu.reducer";
import { skillReducer } from "./Skills/skill.reducer";
import { cvReducer } from "./CV/cv.reducer";
import { reviewReducer } from "./Review/review.reducer";

import { imageCompanyReducer } from "./ImageCompany/imageCompany.reducer";

import { statsReducer } from './Stats/stats.reducer';
import { userReducer } from './User/user.reducer';
import surveyReducer from './Survey/survey.reducer';
const rootReducer = combineReducers({
    auth:authReducer,
    jobPost:jobPostReducer,
    industry:indutryReducer,
    forgotPassword: forgotPasswordReducer,
    company:companyReducer,
    city:cityReducer,
    applyJob:applyJobReducer,
    seeker:seekerReducer,
    exp:expReducer,
    edu:eduReducer,
    skill:skillReducer,
    cv:cvReducer,
    review:reviewReducer,
    imageCompany: imageCompanyReducer,
    stats: statsReducer,
    user: userReducer,
    survey: surveyReducer

})
export const store = legacy_createStore(rootReducer, applyMiddleware(thunk))