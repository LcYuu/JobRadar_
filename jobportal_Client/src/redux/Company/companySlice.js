import { createSlice } from "@reduxjs/toolkit";
import {
  getCompanyPopular,
  getCompanyFitSeeker,
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanyImages,
  validateTaxCode,
  getAllCompanies,
  updateCompanyStatus,
  deleteCompany,
  getJobByCompany,
  getCompanyJobCounts,
  getCompanyJobStats,
  searchCompanies,
  checkSaved,
  getCompanyById,
  getCompanyByJWT,
  getAllCompaniesForAdmin,
} from "./company.thunk.js";

const initialState = {
  isValid: null,
  companies: [],
  companyJwt: null,
  companyByFeature: [],
  companyFitSeeker: [],
  companyProfile: null,
  checkIfSaved: null,
  loading: false,
  message: null,
  error: null,
  totalPages: 0,
  totalElements: 0,
  jobCounts: null,
  jobStats: [],
  currentPage: 0,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCompanyPopular.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
        state.error = null;
      })

      // Handle getCompanyByFeature actions
      .addCase(searchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companyByFeature = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.error = null;
      })

      // Handle getCompanyFitSeeker actions
      .addCase(getCompanyFitSeeker.fulfilled, (state, action) => {
        state.loading = false;
        state.companyFitSeeker = action.payload;
        state.error = null;
      })

      // Handle getCompanyProfile actions
      .addCase(getCompanyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.companyProfile = action.payload;
        state.error = null;
      })

      // Handle checkIfSaved actions
      .addCase(checkSaved.fulfilled, (state, action) => {
        state.loading = false;
        state.checkIfSaved = action.payload;
        state.error = null;
      })

      // Handle getCompany actions
      .addCase(getCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.companyJwt = action.payload;
        state.error = null;
      })
      .addCase(getCompanyByJWT.fulfilled, (state, action) => {
        state.loading = false;
        state.companyJwt = action.payload;
        state.error = null;
      })

      // Handle updateCompanyProfile actions
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.companyJwt = action.payload;
        state.error = null;
      })

      // Handle updateCompanyImages actions
      .addCase(updateCompanyImages.fulfilled, (state) => {
        state.loading = false;
        state.message = "Cập nhật hình ảnh thành công";
        state.error = null;
      })

      // Handle validateTaxCode actions
      .addCase(validateTaxCode.fulfilled, (state, action) => {
        state.loading = false;
        state.isValid = action.payload;
        state.error = null;
      })

      // Handle getAllCompanies actions
      .addCase(getAllCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
      })

      // Handle updateCompanyStatus actions
      .addCase(updateCompanyStatus.fulfilled, (state) => {
        state.loading = false;
        state.message = "Cập nhật trạng thái công ty thành công";
        state.error = null;
      })

      // Handle deleteCompany actions
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(
          (company) => company.companyId !== action.payload
        );
        state.message = "Xóa công ty thành công";
        state.error = null;
      })

      // Handle getJobByCompany actions
      .addCase(getJobByCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companyJobs = action.payload;
        state.error = null;
      })

      // Handle getCompanyJobCounts actions
      .addCase(getCompanyJobCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.jobCounts = action.payload;
        state.error = null;
      })

      // Handle getCompanyJobStats actions
      .addCase(getCompanyJobStats.fulfilled, (state, action) => {
        state.loading = false;
        state.jobStats = action.payload;
        state.error = null;
      })
      .addCase(getAllCompaniesForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.content;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
      })
      .addMatcher(
        (action) =>
          action.type.endsWith("pending") &&
          action.type.startsWith("company/"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("rejected") &&
          action.type.startsWith("company/"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default companySlice.reducer;
