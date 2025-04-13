import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCVFile, analyzeCVWithJobDescription, saveAnalysisResults, getCachedAnalysisResults, generateCandidateKey, getAnalysisForCandidate } from '../services/cvAnalysis';
import { saveAnalysisResult, fetchAnalysisResults, fetchCandidateAnalysis } from '../redux/CVAnalysis/cvAnalysis.thunk';
import { setCurrentCandidate, clearCurrentAnalysis } from '../redux/CVAnalysis/cvAnalysisSlice';
import Swal from 'sweetalert2';

// Import cùng constant từ service để đảm bảo đồng bộ
const STORAGE_KEY = 'cv_analysis_results';

/**
 * Custom hook for CV analysis functionality
 * @returns {Object} - CV analysis methods and state
 */
const useCVAnalysis = () => {
  const dispatch = useDispatch();
  const [analysisResults, setAnalysisResults] = useState({});
  const [analyzingCandidates, setAnalyzingCandidates] = useState({});
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const cvAnalysisFromRedux = useSelector((state) => state.cvAnalysis?.results || {});
  const reduxCurrentAnalysis = useSelector((state) => state.cvAnalysis?.currentAnalysis);
  const isLoading = useSelector((state) => state.cvAnalysis?.loading || false);
  const currentCandidate = useSelector((state) => state.cvAnalysis?.currentCandidate);
  
  // Load cached results on mount
  useEffect(() => {
    // Initialize from localStorage first for immediate display
    const cachedResults = getCachedAnalysisResults();
    setAnalysisResults(cachedResults);
    
    // Then fetch from Redux/backend for full sync
    dispatch(fetchAnalysisResults());
  }, [dispatch]);
  
  // Use current analysis from Redux if available
  useEffect(() => {
    if (reduxCurrentAnalysis) {
      setCurrentAnalysis(reduxCurrentAnalysis);
      setShowAnalysisModal(true);
    }
  }, [reduxCurrentAnalysis]);
  
  // Add storage event listener to detect when localStorage is cleared
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If cv_analysis_results was changed or removed
      if (e.key === STORAGE_KEY || e.key === null) {
        console.log('localStorage change detected, refreshing data from server');
        // Refresh data from server
        dispatch(fetchAnalysisResults());
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);
  
  // Periodically refresh data from server (every 5 minutes)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Periodic refresh of CV analysis data');
      dispatch(fetchAnalysisResults());
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [dispatch]);
  
  // Update local state when Redux state changes
  useEffect(() => {
    if (Object.keys(cvAnalysisFromRedux).length > 0) {
      setAnalysisResults(prevResults => ({
        ...prevResults,
        ...cvAnalysisFromRedux
      }));
    }
  }, [cvAnalysisFromRedux]);
  
  /**
   * Fetch job description by postId
   * @param {string|number} postId - Job post ID
   * @param {Array} positions - Available positions from Redux
   * @returns {Promise<string>} - Job description
   */
  const fetchJobDescription = useCallback(async (postId, positions) => {
    try {
      // Check if job description exists in positions from Redux
      const jobPost = positions.find(position => position.postId === postId);
      
      if (jobPost && jobPost.description) {
        return jobPost.description;
      }
      
      // Fallback to API if not found in Redux
      const response = await fetch(`http://localhost:8080/job-post/findJob/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }
      
      const jobData = await response.json();
      return jobData.description;
    } catch (error) {
      console.error('Error fetching job description:', error);
      throw error;
    }
  }, []);
  
  /**
   * Try to get analysis from backend
   * @param {Object} candidate - Candidate data
   */
  const fetchExistingAnalysis = useCallback(async (candidate) => {
    try {
      // Store current candidate in Redux
      dispatch(setCurrentCandidate(candidate));
      
      // Try to fetch from backend
      await dispatch(fetchCandidateAnalysis({
        postId: candidate.postId,
        userId: candidate.userId
      }));
      
      return true;
    } catch (error) {
      console.error('Error fetching existing analysis:', error);
      return false;
    }
  }, [dispatch]);
  
  /**
   * Analyze CV for a candidate
   * @param {Object} candidate - Candidate data
   * @param {Array} positions - Available positions
   * @param {Boolean} forceNewAnalysis - Force a new analysis even if we have existing data
   */
  const analyzeCVMatch = useCallback(async (candidate, positions, forceNewAnalysis = false) => {
    const candidateKey = generateCandidateKey(candidate);
    
    // Skip if already analyzing
    if (analyzingCandidates[candidateKey]) return;
    
    // Set analyzing state
    setAnalyzingCandidates(prev => ({
      ...prev,
      [candidateKey]: true
    }));
    
    try {
      // If not forcing a new analysis, try to get existing analysis from database
      if (!forceNewAnalysis) {
        const hasExistingAnalysis = await fetchExistingAnalysis(candidate);
        
        if (hasExistingAnalysis) {
          console.log('Using existing analysis from database');
          setAnalyzingCandidates(prev => ({
            ...prev,
            [candidateKey]: false
          }));
          return;
        }
        
        // Check if we already have results in local state
        const existingResult = getAnalysisForCandidate(candidateKey);
        if (existingResult) {
          setCurrentAnalysis(existingResult);
          setShowAnalysisModal(true);
          
          // Still save to backend to ensure it's stored in database
          dispatch(saveAnalysisResult({ 
            key: candidateKey, 
            result: existingResult,
            candidate
          }));
          
          return;
        }
      }
      
      // Get job description
      const jobDescription = await fetchJobDescription(candidate.postId, positions);
      if (!jobDescription) {
        throw new Error('Không thể tải mô tả công việc');
      }
      
      // Fetch and analyze CV
      const cvFile = await fetchCVFile(candidate.pathCV);
      const result = await analyzeCVWithJobDescription(cvFile, jobDescription);
      
      // Add timestamp before saving
      const resultWithTimestamp = {
        ...result,
        timestamp: Date.now(),
      };
      
      // Save to local cache and update state
      saveAnalysisResults(candidateKey, resultWithTimestamp);
      setAnalysisResults(prev => ({
        ...prev,
        [candidateKey]: resultWithTimestamp
      }));
      
      // Save to Redux and backend
      dispatch(saveAnalysisResult({ 
        key: candidateKey, 
        result: resultWithTimestamp,
        candidate 
      }));
      
      // Show the modal with results
      setCurrentAnalysis(resultWithTimestamp);
      setShowAnalysisModal(true);
      
    } catch (error) {
      console.error('Error analyzing CV:', error);
      // Hiển thị thông báo lỗi với Sweetalert2
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi phân tích CV',
        text: error.message || 'Có lỗi xảy ra trong quá trình phân tích CV. Vui lòng thử lại sau.',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#6b21a8', // Purple color matching the theme
      });
    } finally {
      // Reset analyzing state
      setAnalyzingCandidates(prev => ({
        ...prev,
        [candidateKey]: false
      }));
    }
  }, [dispatch, analyzingCandidates, fetchJobDescription, fetchExistingAnalysis]);
  
  /**
   * Get cached analysis score for a candidate
   * @param {Object} candidate - Candidate data
   * @returns {number|null} - Analysis score or null if not available
   */
  const getCachedScore = useCallback((candidate) => {
    const key = generateCandidateKey(candidate);
    const result = analysisResults[key];
    return result?.matching_score?.totalScore || null;
  }, [analysisResults]);
  
  /**
   * Check if a candidate is currently being analyzed
   * @param {Object} candidate - Candidate data
   * @returns {boolean} - True if analyzing, false otherwise
   */
  const isAnalyzingCandidate = useCallback((candidate) => {
    const key = generateCandidateKey(candidate);
    return !!analyzingCandidates[key];
  }, [analyzingCandidates]);
  
  /**
   * Close analysis modal
   */
  const closeAnalysisModal = useCallback(() => {
    setShowAnalysisModal(false);
    setCurrentAnalysis(null);
    dispatch(clearCurrentAnalysis());
  }, [dispatch]);
  
  return {
    // State
    analysisResults,
    analyzingCandidates,
    currentAnalysis: currentAnalysis || reduxCurrentAnalysis,
    showAnalysisModal,
    isLoading,
    
    // Methods
    analyzeCVMatch,
    getCachedScore,
    isAnalyzingCandidate,
    closeAnalysisModal,
    setShowAnalysisModal,
    setCurrentAnalysis,
    fetchExistingAnalysis,
  };
};

export default useCVAnalysis; 