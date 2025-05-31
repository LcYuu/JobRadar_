import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { api, API_BASE_URL } from "../../configs/api";

export const getAllJobAction = createAsyncThunk(
  "jobs/getAll",
  async ({ currentPage, size }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/job-post/get-job-approve?page=${currentPage}&size=${size}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTop8LastestJob = createAsyncThunk(
  "jobs/getTop8",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/job-post/get-top8-lastest-job`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getRecommendJob = createAsyncThunk(
  "jobs/getRecommend",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(`/job-post/recommend-jobs/phobert`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchJobs = createAsyncThunk(
  "jobs/search",
  async ({ filters, currentPage, size }, { rejectWithValue }) => {
    try {
      // Kiểm tra nếu không có filter nào được áp dụng
      const hasActiveFilters = Object.values(filters).some((value) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== "";
      });

      if (!hasActiveFilters) {
        // Nếu không có filter, gọi API lấy tất cả công việc
        const response = await axios.get(
          `http://localhost:8080/job-post/get-job-approve?page=${currentPage}&size=${size}`
        );
        return response.data;
      }

      const params = {
        title: filters.title || undefined,
        selectedTypesOfWork:
          filters.selectedTypesOfWork.length > 0
            ? filters.selectedTypesOfWork.join(",")
            : undefined,
        cityId: filters.cityId || undefined,
        selectedIndustryIds:
          filters.selectedIndustryIds.length > 0
            ? filters.selectedIndustryIds.join(",")
            : undefined,
        minSalary: filters.minSalary ? Number(filters.minSalary) : undefined,
        maxSalary: filters.maxSalary ? Number(filters.maxSalary) : undefined,
        page: currentPage,
        size: size,
      };
      const token = localStorage.getItem("jwt");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get(`/job-post/search-job-by-feature`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchSalaryRange = createAsyncThunk(
  "salary/fetchSalaryRange",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:8080/job-post/salary-range`);
      const { minSalary, maxSalary } = response.data;
      return { minSalary, maxSalary }; // Trả về dữ liệu
    } catch (error) {
      return rejectWithValue(error.message); // Trả về lỗi nếu có
    }
  }
);

export const countJobByType = createAsyncThunk(
  "jobs/countByType",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/job-post/count-job-by-type`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getJobPostByPostId = createAsyncThunk(
  "jobs/getById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/job-post/findJob/${postId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getJobsByCompany = createAsyncThunk(
  "jobs/getJobsByCompany",
  async ({ companyId, currentPage, size, getAllJobs = false }, { rejectWithValue }) => {
    try {
      let url = '';
      if (getAllJobs) {
        // Use the new endpoint that returns all jobs for a company
        url = `/job-post/company/${companyId}?getAllJobs=true`;
      } else {
        // Use the original paginated endpoint
        url = `/job-post/search-by-company/${companyId}?page=${currentPage}&size=${size}`;
      }
      
      const response = await api.get(url);
      return {
        content: response.data.content,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Đếm tổng số công việc của một công ty
export const getTotalJobsByCompany = createAsyncThunk(
  "jobs/getTotalJobsByCompany",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/job-post/count-by-company/${companyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy tất cả công việc
export const getAllJobPost = createAsyncThunk(
  "jobs/getAllJobPost",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/job-post/search-by-company");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy top 5 công việc mới nhất
export const getTop5Lastest = createAsyncThunk(
  "jobs/getTop5Lastest",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/job-post/top-5-job-lastest");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Tìm công việc theo công ty
export const findEmployerCompany = createAsyncThunk(
  "jobs/findEmployerCompany",
  async ({ status, typeOfWork, sortBy, sortDirection, currentPage, size }, { rejectWithValue }) => {
    const params = {
      ...(status && { status }),
      ...(typeOfWork && { typeOfWork }),
      ...(sortBy && { sortBy }),
      ...(sortDirection && { sortDirection }),

      page: currentPage,
      size,
    };
    try {
      const response = await api.get("/job-post/employer-company", { params });
      return {
        jobs: response.data.content,
        totalPages: response.data.page.totalPages,
        totalElements: response.data.page.totalElements,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi không xác định");
    }
  }
);

// Lấy chi tiết công việc theo ID
export const getDetailJobById = createAsyncThunk(
  "jobs/getDetailJobById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/job-post/findJob/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật công việc
export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ postId, jobPostData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/job-post/update-job/${postId}`,
        jobPostData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Tạo công việc mới
export const createJobPost = createAsyncThunk(
  'jobPost/createJobPost',
  async (jobPostData, { rejectWithValue }) => {
    try {
      const response = await api.post('/job-post/create-job', jobPostData);
      // Trả về kết quả thành công giống như trong thunk thông thường
      return {
        success: true,
        message: response.data, // Thông báo thành công từ backend
      };
    } catch (error) {
      // Trả về kết quả lỗi giống như trong thunk thông thường
      return rejectWithValue({
        success: false,
        error: error.response?.data || 'Lỗi khi tạo công việc',
      });
    }
  }
);

export const getAllJobsForAdmin = createAsyncThunk(
  "admin/getAllJobs",
  async ({ title, status, isApprove, page, size }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/job-post/admin/all-jobs`, {
        params: { title, status, isApprove, page, size },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveJob = createAsyncThunk(
  "admin/approveJob",
  async (postId, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`/job-post/approve/${postId}`);

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSimilarJobs = createAsyncThunk(
  "jobs/getSimilarJobs",
  async ({ companyId, excludePostId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/job-post/similar-jobs`, {
        params: { companyId, excludePostId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExpireJob = createAsyncThunk(
  "jobs/updateExpireJob",
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/job-post/set-expire/${postId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const semanticSearchJobsWithGemini = createAsyncThunk(
  "jobPost/semanticSearchJobsWithGemini",
  async ({ query, filters, currentPage, size }, thunkAPI) => {
    try {
      // Chuẩn bị tham số cho API
      const params = {
        query,
        page: currentPage,
        size: size || 100, // Sử dụng size được truyền vào hoặc mặc định 100 để lấy nhiều kết quả hơn
      };

      // Thêm các tùy chọn lọc nếu có
      if (filters?.selectedTypesOfWork?.length > 0) {
        params.selectedTypesOfWork = filters.selectedTypesOfWork;
      }
      if (filters?.cityId) {
        params.cityId = filters.cityId;
      }
      if (filters?.selectedIndustryIds?.length > 0) {
        params.selectedIndustryIds = filters.selectedIndustryIds;
      }
      if (filters?.minSalary !== undefined && filters.minSalary !== null) {
        params.minSalary = filters.minSalary;
      }
      if (filters?.maxSalary !== undefined && filters.maxSalary !== null) {
        params.maxSalary = filters.maxSalary;
      }

      console.log("Gọi API semantic search với params:", params);

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: token ? token : "",
      };

      const response = await api.get('/job-post/semantic-search', { headers, params });
      console.log("Kết quả semantic search:", response.data);

      return {
        content: response.data.content, 
        totalPages: response.data.totalPages, 
        totalElements: response.data.totalElements
      };
    } catch (error) {
      console.error("Lỗi khi tìm kiếm ngữ nghĩa:", error);
      return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getAllJobs = createAsyncThunk(
  "jobs/getAllJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:8080/job-post/get-all`);
      return response.data; // Trả về danh sách công việc
    } catch (error) {
      return rejectWithValue(error.message); // Trả về lỗi nếu có
    }
  }
);

