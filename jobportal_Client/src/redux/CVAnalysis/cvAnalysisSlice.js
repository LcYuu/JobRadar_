import { createSlice } from '@reduxjs/toolkit';
import { saveAnalysisResult, fetchAnalysisResults, clearAnalysisResults, fetchCandidateAnalysis } from './cvAnalysis.thunk';

const initialState = {
  results: {},
  loading: false,
  error: null,
  lastUpdated: null,
  currentCandidate: null,
  currentAnalysis: null,
};

const cvAnalysisSlice = createSlice({
  name: 'cvAnalysis',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    setCurrentCandidate: (state, action) => {
      state.currentCandidate = action.payload;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
      state.currentCandidate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Save analysis result
      .addCase(saveAnalysisResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAnalysisResult.fulfilled, (state, action) => {
        const { key, result } = action.payload;
        state.results[key] = result;
        state.loading = false;
        state.lastUpdated = Date.now();
      })
      .addCase(saveAnalysisResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể lưu kết quả phân tích';
      })
      
      // Fetch analysis results
      .addCase(fetchAnalysisResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisResults.fulfilled, (state, action) => {
        state.results = action.payload;
        state.loading = false;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchAnalysisResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải kết quả phân tích';
      })
      
      // Fetch analysis for specific candidate
      .addCase(fetchCandidateAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateAnalysis.fulfilled, (state, action) => {
        const { key, result } = action.payload;
        state.results[key] = result;
        state.currentAnalysis = result;
        state.loading = false;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCandidateAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải kết quả phân tích ứng viên';
      })
      
      // Clear analysis results
      .addCase(clearAnalysisResults.fulfilled, (state) => {
        state.results = {};
        state.lastUpdated = Date.now();
      });
  },
});

export const { resetError, setCurrentCandidate, clearCurrentAnalysis } = cvAnalysisSlice.actions;
export default cvAnalysisSlice.reducer; 