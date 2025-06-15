import { createSlice } from "@reduxjs/toolkit";
import {
  approveJob,
  canPostJob,
  countJobByType,
  createJobPost,
  fetchSalaryRange,
  findEmployerCompany,
  getAllJob,
  getAllJobAction,
  getAllJobPost,
  getAllJobsForAdmin,
  getDetailJobById,
  getJobPostByPostId,
  getJobsByCompany,
  getRecommendJob,
  getSimilarJobs,
  getTop5Lastest,
  getTop8LastestJob,
  getTotalJobsByCompany,
  searchJobs,
  updateExpireJob,
  updateJob,
} from "./jobPost.thunk";

const initialState = {
  minSalary: null,
  maxSalary: null,
  post: null,
  loading: false,
  error: null,
  searchJob: [],
  top8Job: [],
  jobCountByType: [],
  jobPost: [],
  postByPostId: null,
  totalPages: 0, // Tổng số trang
  approve: false,
  // totalItems: 0,
  totalJobs: 0,
  recommendJob: [],
  employerCompany: [],
  positions: [],
  jobs: [],
  detailJob: null,
  totalElements: 0,
  currentPage: 0,
  expireJob: null,
  canPost: null, // Result of canPostJob (e.g., "Công ty có thể đăng bài.")
  canPostLoading: false, // Loading state for canPostJob
  canPostError: null, // Error message for canPostJob
  similarJobs: [],

};

const jobPostSlice = createSlice({
  name: "jobPost",
  initialState,
  reducers: {
    // Thêm reducer để reset jobPost
    resetJobPost: (state) => {
      state.jobPost = [];
      state.error = null;
      state.totalPages = 0;
      state.totalElements = 0;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(canPostJob.pending, (state) => {
        state.canPostLoading = true;
        state.canPostError = null;
        state.canPost = null;
      })
      .addCase(canPostJob.fulfilled, (state, action) => {
        state.canPostLoading = false;
        state.canPost = action.payload; // e.g., "Công ty có thể đăng bài."
        state.canPostError = null;
      })
      .addCase(canPostJob.rejected, (state, action) => {
        state.canPostLoading = false;
        state.canPostError = action.payload; // e.g., "Công ty chỉ được đăng 1 bài trong vòng 1 giờ."
        state.canPost = null;
      })
      .addCase(getAllJobAction.fulfilled, (state, action) => {
        state.loading = false;
        state.jobPost = action.payload.content;
        state.totalPages = action.payload.page.totalPages; // Lưu trữ tổng số trang
        state.error = null;
      })
      .addCase(getAllJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobPost = action.payload.content;
        state.totalPages = action.payload.page.totalPages; // Lưu trữ tổng số trang
        state.error = null;
      })
      .addCase(getTop8LastestJob.fulfilled, (state, action) => {
        state.top8Job = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getRecommendJob.fulfilled, (state, action) => {
        state.recommendJob = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.searchJob = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
        state.currentPage = action.payload.page.currentPage;
        state.error = null;
      })
      .addCase(countJobByType.fulfilled, (state, action) => {
        state.jobCountByType = action.payload;
        state.loading = false; // Kết thúc trạng thái tải
        state.error = null; // Đặt lỗi về null
      })

      .addCase(getJobPostByPostId.fulfilled, (state, action) => {
        state.loading = false;
        state.postByPostId = action.payload;
        state.error = null;
      })
      .addCase(getJobsByCompany.fulfilled, (state, action) => {
        state.jobPost = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.loading = false;
        state.error = null;
      })

      .addCase(fetchSalaryRange.fulfilled, (state, action) => {
        state.loading = false;
        state.minSalary = action.payload.minSalary; // Cập nhật minSalary
        state.maxSalary = action.payload.maxSalary; // Cập nhật maxSalary
      })

      // Handle updateCompanyProfile actions

      .addCase(getTotalJobsByCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.totalJobs = action.payload;
        state.error = null;
      })
      // Handle updateCompanyImages actions
      .addCase(getAllJobPost.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
        state.error = null;
      })
      .addCase(getTop5Lastest.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        state.error = null;
      })
      .addCase(findEmployerCompany.fulfilled, (state, action) => {
        state.jobs = action.payload.jobs;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.loading = false;
        state.error = null;
      })
      .addCase(getDetailJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.detailJob = action.payload;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.detailJob = action.payload;
        state.error = null;
      })
      .addCase(createJobPost.fulfilled, (state, action) => {
        state.loading = false;
        state.detailJob = action.payload;
        state.error = null;
      })
      .addCase(getAllJobsForAdmin.fulfilled, (state, action) => {
        state.jobPost = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
        state.loading = false;
      })

      .addCase(approveJob.fulfilled, (state) => {
        state.loading = false; // Đặt loading thành false khi thành công
        state.error = null; // Reset lỗi
      })

      .addCase(getSimilarJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.similarJobs = action.payload;
        state.error = null;
      })

      .addCase(updateExpireJob.fulfilled, (state, action) => {
        state.loading = false;
        state.expireJob = action.payload;
        state.error = null;
      })
      .addMatcher(
        (action) =>
          action.type.endsWith("pending") && action.type.startsWith("jobPost/"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("rejected") &&
          action.type.startsWith("jobPost/"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});
// Export action resetJobPost
export const { resetJobPost } = jobPostSlice.actions;

export default jobPostSlice.reducer;
