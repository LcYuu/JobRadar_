// src/features/company/companySlice.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { api, API_BASE_URL } from "../../configs/api";
import axios from "axios";

export const getCompanyPopular = createAsyncThunk(
  "company/getCompanyPopular",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/company/get-all`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCompanyProfile = createAsyncThunk(
  "company/getCompanyProfile",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/company/profile-company/${companyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCompanyFitSeeker = createAsyncThunk(
  "company/getCompanyFitSeeker",
  async (_, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error("No token found");
      }
      const response = await api.get(`/company/find-companies-fit-userId`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchCompanies = createAsyncThunk(
  "company/searchCompanies",
  async ({ filters, currentPage, size }, { rejectWithValue }) => {
    try {
      const params = {
        title: filters.title || undefined,
        cityId: filters.cityId || undefined,
        industryId: filters.industryId || undefined,
        page: currentPage,
        size: size,
      };

      const response = await api.get(`/company/search-company-by-feature`, {
        params,
      });
      
      // Extract pagination information and content
      return {
        content: response.data.content,
        totalPages: response.data.page?.totalPages || 1,
        totalElements: response.data.page?.totalElements || response.data.content.length,
        currentPage: currentPage
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkSaved = createAsyncThunk(
  "company/checkSaved",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/company/can-rating/${companyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCompanyByJWT = createAsyncThunk(
  "company/getCompanyByJWT",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/company/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  "company/updateCompanyProfile",
  async (companyData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/company/update-company", companyData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCompanyImages = createAsyncThunk(
  "company/updateCompanyImages",
  async (images, { rejectWithValue }) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      return rejectWithValue("No token found");
    }

    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await api.post("/image-company/create-image", formData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const validateTaxCode = createAsyncThunk(
  "company/validateTaxCode",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/company/validate-tax");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Có lỗi xảy ra khi gọi API");
    }
  }
);

export const getAllCompanies = createAsyncThunk(
  "company/getAllCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const companiesResponse = await api.get("/company/find-all");
      const companiesWithIndustryNames = await Promise.all(
        companiesResponse.data.map(async (company) => {
          try {
            const industryResponse = await api.get(
              `/company/get-industry-name/${company.industryId}`
            );
            return {
              ...company,
              industryName: industryResponse.data,
            };
          } catch (error) {
            return {
              ...company,
              industryName: "N/A",
            };
          }
        })
      );
      return companiesWithIndustryNames;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCompanyStatus = createAsyncThunk(
  "company/updateStatus",
  async ({ companyId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/companies/${companyId}/status`, {
        isActive: status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCompany = createAsyncThunk(
  "company/delete",
  async (companyId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/companies/${companyId}`);
      return companyId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getJobByCompany = createAsyncThunk(
  "company/getJobByCompany",
  async ({ companyId, currentPage, size }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/company/${companyId}/jobs`, {
        params: { page: currentPage, size: size },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch company jobs"
      );
    }
  }
);

export const getCompanyJobCounts = createAsyncThunk(
  "company/getJobCounts",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/job-post/count-jobs-by-company/${companyId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch job counts"
      );
    }
  }
);

export const getCompanyJobStats = createAsyncThunk(
  "company/getJobStats",
  async ({ companyId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/job-post/company/${companyId}/job-stats`,
        { params: { startDate, endDate } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch job stats");
    }
  }
);

export const getCompanyById = createAsyncThunk(
  "company/getById",
  async (companyId, { rejectWithValue }) => {
    try {
      const cleanCompanyId = companyId.replace(/[^\w-]/g, ""); // Clean companyId
      const response = await api.get(
        `/company/profile-company/${cleanCompanyId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch company details"
      );
    }
  }
);

export const getAllCompaniesForAdmin = createAsyncThunk(
  "company/getAllForAdmin",
  async ({ companyName, industryName, page, size }, { rejectWithValue }) => {
    try {
      const companiesResponse = await api.get(`/company/get-all-companies`, {
        params: { companyName, industryName, page, size },
      });
      console.log("🚀 ~ companiesResponse:", companiesResponse);

      const companiesWithReviews = await Promise.all(
        companiesResponse.data.content.map(async (company) => {
          try {
            const reviewsResponse = await api.get(
              `review/findReviewByCompanyId/${company.companyId}`
            );
            const reviews = reviewsResponse.data;
            const totalStars = reviews.reduce(
              (total, review) => total + review.star,
              0
            );
            const averageRating =
              reviews.length > 0 ? totalStars / reviews.length : 0;

            return {
              ...company,
              reviews: reviews,
              averageRating,
              totalReviews: reviews.length,
            };
          } catch (error) {
            console.error(
              `Error fetching reviews for company ${company.companyId}:`,
              error
            );
            return {
              ...company,
              reviews: [],
              averageRating: 0,
              totalReviews: 0,
            };
          }
        })
      );

      return {
        ...companiesResponse.data,
        content: companiesWithReviews,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching companies"
      );
    }
  }
);

export const findAllCompany = createAsyncThunk(
  "company/findAllCompany",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/company/find-all`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch job counts"
      );
    }
  }
);
