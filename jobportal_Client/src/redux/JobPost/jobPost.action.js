// import axios from "axios"
// import { api } from "../../configs/api"
// import { CREATE_COMMENT_FAILURE,GET_ALL_JOB_REQUEST, GET_ALL_JOB_FAILURE, CREATE_COMMENT_REQUEST, CREATE_COMMENT_SUCCESS, CREATE_POST_FAILURE, CREATE_POST_REQUEST, CREATE_POST_SUCCESS, GET_ALL_JOB_SUCCESS, GET_ALL_POST_FAILURE, GET_ALL_POST_REQUEST, GET_ALL_POST_SUCCESS, GET_USERS_POST_FAILURE, GET_USERS_POST_REQUEST, GET_USERS_POST_SUCCESS, LIKE_POST_FAILURE, LIKE_POST_REQUEST, LIKE_POST_SUCCESS, GET_TOP8_JOB_REQUEST, GET_TOP8_JOB_FAILURE, GET_TOP8_JOB_SUCCESS, COUNT_JOB_BY_TYPE_REQUEST, COUNT_JOB_BY_TYPE_SUCCESS, COUNT_JOB_BY_TYPE_FAILURE } from "./jobPost.actionType"


// <<<<<<< HEAD
// import {
//   GET_ALL_JOB_REQUEST,
//   GET_ALL_JOB_FAILURE,
//   GET_ALL_JOB_SUCCESS,
//   GET_TOP8_JOB_REQUEST,
//   GET_TOP8_JOB_FAILURE,
//   GET_TOP8_JOB_SUCCESS,
//   COUNT_JOB_BY_TYPE_REQUEST,
//   COUNT_JOB_BY_TYPE_SUCCESS,
//   COUNT_JOB_BY_TYPE_FAILURE,
//   SEARCH_JOBS_REQUEST,
//   SEARCH_JOBS_SUCCESS,
//   SEARCH_JOBS_FAILURE,
//   SET_SALARY_RANGE_REQUEST,
//   SET_SALARY_RANGE_SUCCESS,
//   SET_SALARY_RANGE_FAILURE,
//   GET_JOBS_BY_COMPANY_REQUEST,
//   GET_JOBS_BY_COMPANY_SUCCESS,
//   GET_JOBS_BY_COMPANY_FAILURE,
//   GET_TOTAL_JOBS_REQUEST,
//   GET_TOTAL_JOBS_SUCCESS,
//   GET_TOTAL_JOBS_FAILURE,
//   GET_JOB_POST_BY_POST_ID_REQUEST,
//   GET_JOB_POST_BY_POST_ID_SUCCESS,
//   GET_JOB_POST_BY_POST_ID_FAILURE,
//   GET_RECOMMEND_JOB_REQUEST,
//   GET_RECOMMEND_JOB_SUCCESS,
//   GET_RECOMMEND_JOB_FAILURE,
//   GET_EMPLOYER_COMPANY_REQUEST,
//   GET_EMPLOYER_COMPANY_SUCCESS,
//   GET_EMPLOYER_COMPANY_FAILURE,
//   GET_ALL_JOB_POST_REQUEST,
//   GET_ALL_JOB_POST_SUCCESS,
//   GET_ALL_JOB_POST_FAILURE,
//   GET_JOB_COMPANY_REQUEST,
//   GET_JOB_COMPANY_SUCCESS,
//   GET_JOB_COMPANY_FAILURE,
//   GET_DETAIL_JOB_BY_ID_REQUEST,
//   GET_DETAIL_JOB_BY_ID_SUCCESS,
//   GET_DETAIL_JOB_BY_ID_FAILURE,
//   UPDATE_JOB_REQUEST,
//   UPDATE_JOB_SUCCESS,
//   UPDATE_JOB_FAILURE,
//   CREATE_JOB_REQUEST,
//   CREATE_JOB_SUCCESS,
//   CREATE_JOB_FAILURE,
//   GET_TOP_5_LASTEST_COMPANY_REQUEST,
//   GET_TOP_5_LASTEST_COMPANY_SUCCESS,
//   GET_TOP_5_LASTEST_COMPANY_FAILURE,
//   // GET_COMPANY_REQUEST,
//   // GET_COMPANY_SUCCESS,
//   // GET_COMPANY_FAILURE,
//   GET_ALL_ADMIN_JOBS_REQUEST,
//   GET_ALL_ADMIN_JOBS_SUCCESS,
//   GET_ALL_ADMIN_JOBS_FAILURE,
//   // GET_ALL_JOBS_REQUEST,
//   // GET_ALL_JOBS_SUCCESS,
//   // GET_ALL_JOBS_FAILURE,
//   // GET_JOB_DETAILS_REQUEST,
//   // GET_JOB_DETAILS_SUCCESS,
//   // GET_JOB_DETAILS_FAILURE,
//   // UPDATE_JOB_STATUS_REQUEST,
//   // UPDATE_JOB_STATUS_SUCCESS,
//   // UPDATE_JOB_STATUS_FAILURE,
//   SET_CURRENT_PAGE,
//   SET_PAGE_SIZE,
//   UPDATE_JOB_EXPIRE_REQUEST,
//   UPDATE_JOB_EXPIRE_SUCCESS,
//   UPDATE_JOB_EXPIRE_FAILURE,
// } from "./jobPost.actionType";
// =======
// // export const createPostAction = (postData) => async(dispatch) =>{
// //     dispatch({type:CREATE_POST_REQUEST})
    
// //     try {
// //         const {data} = await api.post(`/api/posts`, postData)
// //         dispatch({type: CREATE_POST_SUCCESS , payload: data})
// //         console.log("create post ", data)
// //     } catch (error) {
// //         console.log("error ", error)
// //         dispatch({type: CREATE_POST_FAILURE, payload: error})
// //     }
// // }
// >>>>>>> GT_1


// export const getAllJobAction = (currentPage, size) => async (dispatch) => {
//     dispatch({ type: GET_ALL_JOB_REQUEST });
//     try {
//         const response = await axios.get(`http://localhost:8080/job-post/get-job-approve?page=${currentPage}&size=${size}`); // Thay thế với URL thực tế
//         dispatch({
//             type: GET_ALL_JOB_SUCCESS,
//             payload: response.data // Trả về dữ liệu nhận được từ API
//         });
//     } catch (error) {
//         dispatch({
//             type: GET_ALL_JOB_FAILURE,
//             payload: error.message // Hoặc error.response.data
//         });
//     }
// };

// export const getTop8LastestJob = () => async (dispatch) => {
// <<<<<<< HEAD
//   dispatch({ type: GET_TOP8_JOB_REQUEST });
//   try {
//     const response = await axios.get(
//       `http://localhost:8080/job-post/get-top8-lastest-job`
//     ); // Thay thế với URL thực tế
//     dispatch({
//       type: GET_TOP8_JOB_SUCCESS,
//       payload: response.data,
//     });
//   } catch (error) {
//     dispatch({
//       type: GET_TOP8_JOB_FAILURE,
//       payload: error.message,
//     });
//   }
// };

// export const getRecommendJob = () => async (dispatch) => {
//   dispatch({ type: GET_RECOMMEND_JOB_REQUEST });
//   try {
//     const response = await api.post(`/job-post/recommend-jobs`); // Thay thế với URL thực tế
//     dispatch({
//       type: GET_RECOMMEND_JOB_SUCCESS,
//       payload: response.data,
//     });
//   } catch (error) {
//     dispatch({
//       type: GET_RECOMMEND_JOB_FAILURE,
//       payload: error.message,
//     });
//   }
// };

// export const searchJobs = (filters, currentPage, size) => async (dispatch) => {
//   dispatch({ type: SEARCH_JOBS_REQUEST });
//   try {
//     // Tạo params cho axios
//     const params = {
//       title: filters.title || undefined,
//       selectedTypesOfWork:
//         filters.selectedTypesOfWork.length > 0
//           ? filters.selectedTypesOfWork.join(",")
//           : undefined,
//       cityId: filters.cityId || undefined,
//       selectedIndustryIds:
//         filters.selectedIndustryIds.length > 0
//           ? filters.selectedIndustryIds.join(",")
//           : undefined,
//       minSalary: filters.minSalary ? Number(filters.minSalary) : undefined,
//       maxSalary: filters.maxSalary ? Number(filters.maxSalary) : undefined,
//       page: currentPage,
//       size: size,
//     };
//     const token = localStorage.getItem("jwt");
//     const headers = token ? { Authorization: `Bearer ${token}` } : {};
//     const response = await api.get(`/job-post/search-job-by-feature`, {
//       headers,
//       params,
//     });

//     dispatch({
//       type: SEARCH_JOBS_SUCCESS,
//       payload: response.data,
//     });
//   } catch (error) {
//     dispatch({
//       type: SEARCH_JOBS_FAILURE,
//       payload: error.message,
//     });
//   }
// };

// export const fetchSalaryRange = () => async (dispatch) => {
//   dispatch({ type: SET_SALARY_RANGE_REQUEST });

//   try {
//     const response = await axios.get(
//       `http://localhost:8080/job-post/salary-range`
//     );
//     const { minSalary, maxSalary } = response.data;

//     dispatch({
//       type: SET_SALARY_RANGE_SUCCESS,
//       payload: { minSalary, maxSalary },
//     });
//   } catch (error) {
//     dispatch({
//       type: SET_SALARY_RANGE_FAILURE,
//       payload: error.message,
//     });
//   }
// =======
//     dispatch({ type: GET_TOP8_JOB_REQUEST });
//     try {
//         const response = await axios.get(`http://localhost:8080/job-post/get-top8-lastest-job`); // Thay thế với URL thực tế
//         dispatch({
//             type: GET_TOP8_JOB_SUCCESS,
//             payload: response.data // Trả về dữ liệu nhận được từ API
//         });
//     } catch (error) {
//         dispatch({
//             type: GET_TOP8_JOB_FAILURE,
//             payload: error.message // Hoặc error.response.data
//         });
//     }
// >>>>>>> GT_1
// };

// export const countJobByType = () => async (dispatch) => {
//     dispatch({ type: COUNT_JOB_BY_TYPE_REQUEST });
//     try {
//         const response = await axios.get(`http://localhost:8080/job-post/count-job-by-type`); // Thay thế với URL thực tế
//         dispatch({
//             type: COUNT_JOB_BY_TYPE_SUCCESS,
//             payload: response.data // Trả về dữ liệu nhận được từ API
//         });
//     } catch (error) {
//         dispatch({
//             type: COUNT_JOB_BY_TYPE_FAILURE,
//             payload: error.message // Hoặc error.response.data
//         });
//     }
// };




// // export const getUsersPostAction = (user_id) => async(dispatch) =>{
// //     dispatch({type: GET_USERS_POST_REQUEST})
// //     console.log("user_id type:", typeof user_id); 
// //     try {
// //         const {data} = await api.get(`/api/posts/user/${user_id}`)
// //         dispatch({type: GET_USERS_POST_SUCCESS, payload: data})
// //         console.log("get users post", data)
// //     } catch (error) {
// //         console.error("Error fetching user's posts: ", error);
// //         dispatch({type: GET_USERS_POST_FAILURE, payload: error.message || 'Something went wrong'})
// //     }
// // }



// // export const likePostAction = (post_id) => async(dispatch) =>{
// //     dispatch({type:LIKE_POST_REQUEST})
    
// //     try {
// //         const {data} = await api.put(`/api/posts/like/${post_id}`)
// //         dispatch({type: LIKE_POST_SUCCESS , payload: data})
// //         console.log("like post", data)
// //     } catch (error) {
// //         console.log("error ", error)
// //         dispatch({type: LIKE_POST_FAILURE, payload: error})
// //     }
// // }

// // export const createCommentAction = (reqData) => async(dispatch) =>{
// //     dispatch({type: CREATE_COMMENT_REQUEST})
// //     try {
// //         const {data} = await api.post(`/api/comments/post/${reqData.post_id}`, reqData.data)
// //         dispatch({type: CREATE_COMMENT_SUCCESS , payload: data})
// //         console.log("create comment ", data)
// //     } catch (error) {
// //         console.log("error ", error)
// //         dispatch({type: CREATE_COMMENT_FAILURE, payload: error})
// //     }
// // }


