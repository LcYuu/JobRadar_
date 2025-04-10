import axios from "axios";
import { api } from "../configs/api";

// Constants
const CV_ANALYSIS_API_URL = 'http://localhost:5000/analyze';
const STORAGE_KEY = 'cv_analysis_results';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Fetch CV file from a URL and convert to a blob
 * @param {string} cvUrl - URL of the CV
 * @returns {Promise<File>} - CV file
 */
export const fetchCVFile = async (cvUrl) => {
  try {
    if (!cvUrl) {
      throw new Error('URL của CV không hợp lệ hoặc trống');
    }
    
    const cvResponse = await fetch(cvUrl);
    if (!cvResponse.ok) {
      if (cvResponse.status === 404) {
        throw new Error('Không tìm thấy file CV. CV có thể đã bị xóa hoặc di chuyển.');
      } else if (cvResponse.status === 403) {
        throw new Error('Không có quyền truy cập file CV. Vui lòng kiểm tra quyền truy cập.');
      } else if (cvResponse.status >= 500) {
        throw new Error('Máy chủ đang gặp vấn đề khi tải CV. Vui lòng thử lại sau.');
      }
      throw new Error(`Không thể tải CV (Mã lỗi: ${cvResponse.status})`);
    }
    
    const cvBlob = await cvResponse.blob();
    
    // Kiểm tra kích thước file, nếu quá nhỏ, có thể file bị hỏng
    if (cvBlob.size < 1000) { // 1KB
      throw new Error('File CV có thể bị hỏng hoặc không hợp lệ.');
    }
    
    // Kiểm tra loại file
    const fileType = cvBlob.type;
    if (fileType !== 'application/pdf' && !fileType.includes('pdf')) {
      throw new Error('Hệ thống chỉ hỗ trợ phân tích file PDF. Vui lòng tải lên CV định dạng PDF.');
    }
    
    return new File([cvBlob], "cv.pdf", { type: cvBlob.type });
  } catch (error) {
    console.error('Error fetching CV file:', error);
    // Đảm bảo lỗi có thông báo rõ ràng
    if (error.message) {
      throw error;
    } else {
      throw new Error('Không thể tải file CV. Vui lòng kiểm tra kết nối và thử lại sau.');
    }
  }
};

/**
 * Analyze CV against job description
 * @param {File} cvFile - CV file
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeCVWithJobDescription = async (cvFile, jobDescription) => {
  try {
    // Validate inputs
    if (!cvFile) {
      throw new Error('File CV không hợp lệ hoặc trống');
    }
    
    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new Error('Mô tả công việc quá ngắn hoặc không có. Cần mô tả công việc chi tiết để phân tích chính xác.');
    }
    
    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('job_description', jobDescription);
    
    // Add timeout to prevent hanging requests
    const response = await axios.post(CV_ANALYSIS_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout
    });
    
    // Validate response
    if (!response.data || Object.keys(response.data).length === 0) {
      throw new Error('Máy chủ trả về kết quả trống hoặc không hợp lệ');
    }
    
    // Check if the response has the expected structure
    if (!response.data.matching_score) {
      throw new Error('Định dạng kết quả phân tích không hợp lệ hoặc không đầy đủ');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing CV:', error);
    
    // Xử lý lỗi từ API
    if (error.response) {
      // Lỗi từ phản hồi của server
      const status = error.response.status;
      if (status === 413) {
        throw new Error('File CV quá lớn. Vui lòng tải lên CV có kích thước nhỏ hơn.');
      } else if (status === 415) {
        throw new Error('Định dạng file không được hỗ trợ. Chỉ hỗ trợ file PDF.');
      } else if (status === 422) {
        throw new Error('Không thể đọc nội dung CV. Vui lòng kiểm tra file CV có thể đọc được.');
      } else if (status >= 500) {
        throw new Error('Máy chủ phân tích CV đang gặp sự cố. Vui lòng thử lại sau.');
      }
      throw new Error(`Lỗi khi phân tích CV: ${error.response.data?.message || 'Lỗi không xác định'}`);
    } else if (error.request) {
      // Lỗi không nhận được phản hồi từ server
      if (error.code === 'ECONNABORTED') {
        throw new Error('Quá thời gian chờ phân tích CV. Máy chủ có thể đang bận, vui lòng thử lại sau.');
      }
      throw new Error('Không thể kết nối đến máy chủ phân tích CV. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } else {
      // Giữ nguyên thông báo lỗi nếu đã có
      if (error.message) {
        throw error;
      } else {
        throw new Error('Có lỗi xảy ra trong quá trình phân tích CV.');
      }
    }
  }
};

/**
 * Save analysis result to backend database
 * @param {string} postId - Job post ID
 * @param {string} userId - User ID 
 * @param {number} matchingScore - Score from analysis
 * @returns {Promise<Object>} - API response
 */
export const saveAnalysisToBackend = async (postId, userId, matchingScore) => {
  try {
    console.log('Saving analysis to backend:', { postId, userId, matchingScore });
    
    // Format matchingScore to ensure it's a number between 0-100
    const formattedScore = Math.max(0, Math.min(100, parseFloat(matchingScore) || 0));
    
    // Ensure postId and userId are valid UUIDs
    if (!postId || !userId) {
      throw new Error('Invalid postId or userId');
    }
    
    const response = await api.post('/apply-job/update-matching-score', {
      postId,
      userId,
      matchingScore: formattedScore
    });
    
    console.log('Backend response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving analysis to backend:', error);
    console.error('Request details:', { postId, userId, matchingScore });
    throw error;
  }
};

/**
 * Save full analysis result to backend database
 * @param {string} postId - Job post ID
 * @param {string} userId - User ID 
 * @param {number} matchingScore - Score from analysis
 * @param {Object} fullResult - Complete analysis result object
 * @returns {Promise<Object>} - API response
 */
export const saveFullAnalysisToBackend = async (postId, userId, matchingScore, fullResult) => {
  try {
    console.log('Saving full analysis to backend');
    
    // Format matchingScore to ensure it's a number between 0-100
    const formattedScore = Math.max(0, Math.min(100, parseFloat(matchingScore) || 0));
    
    // Ensure postId and userId are valid UUIDs
    if (!postId || !userId) {
      throw new Error('Invalid postId or userId');
    }
    
    // Convert full result to JSON string
    const analysisResult = JSON.stringify(fullResult);
    
    const response = await api.post('/apply-job/update-full-analysis', {
      postId,
      userId,
      matchingScore: formattedScore,
      analysisResult
    });
    
    console.log('Backend response for full analysis:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving full analysis to backend:', error);
    throw error;
  }
};

/**
 * Get full analysis result from backend
 * @param {string} postId - Job post ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Analysis result object
 */
export const getFullAnalysisFromBackend = async (postId, userId) => {
  try {
    console.log('Getting full analysis from backend');
    
    const response = await api.get(`/apply-job/get-analysis-result/${postId}/${userId}`);
    
    if (response.data) {
      // Kiểm tra xem phân tích kết quả đã là đối tượng hay chuỗi
      if (typeof response.data === 'object' && response.data !== null) {
        console.log('Analysis result is already an object');
        return response.data;
      } else if (typeof response.data === 'string') {
        try {
          // Trường hợp 1: đây là chuỗi JSON hợp lệ
          const analysisResult = JSON.parse(response.data);
          console.log('Successfully parsed analysis result from JSON string');
          return analysisResult;
        } catch (parseError) {
          // Trường hợp 2: đây là chuỗi "[object Object]" không hợp lệ
          console.error('Error parsing analysis result:', parseError);
          console.log('Invalid JSON string received:', response.data);
          
          // Nếu là chuỗi "[object Object]" không hợp lệ, báo lỗi và trả về null
          if (response.data === "[object Object]") {
            console.error('Received invalid "[object Object]" string. Backend is not returning proper JSON.');
          }
          return null;
        }
      }
    }
    
    console.log('No analysis result found');
    return null;
  } catch (error) {
    console.error('Error getting full analysis from backend:', error);
    return null;
  }
};

/**
 * Get cached analysis results
 * @returns {Object} - Cached analysis results
 */
export const getCachedAnalysisResults = () => {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (!cachedData) return {};
    
    const parsedData = JSON.parse(cachedData);
    
    // Clean up old cache entries
    const cleanedData = cleanOldCacheEntries(parsedData);
    
    return cleanedData;
  } catch (error) {
    console.error('Error getting cached analysis results:', error);
    return {};
  }
};

/**
 * Save analysis results to cache
 * @param {string} key - Cache key
 * @param {Object} results - Analysis results
 */
export const saveAnalysisResults = (key, results) => {
  try {
    if (!key || typeof key !== 'string') {
      console.error('Invalid key provided for cache');
      return;
    }
    
    if (!results || typeof results !== 'object') {
      console.error('Invalid results provided for cache');
      return;
    }
    
    const existingData = getCachedAnalysisResults();
    
    const updatedData = {
      ...existingData,
      [key]: {
        ...results,
        timestamp: Date.now(),
      },
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error('Error saving analysis results:', error);
    // Không throw error vì đây là chức năng không thiết yếu (cache)
    return null;
  }
};

/**
 * Clean old cache entries
 * @param {Object} data - Cache data
 * @returns {Object} - Cleaned cache data
 */
const cleanOldCacheEntries = (data) => {
  const now = Date.now();
  const cleanedData = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value.timestamp && (now - value.timestamp) < MAX_CACHE_AGE) {
      cleanedData[key] = value;
    }
  });
  
  // Update storage if items were cleaned
  if (Object.keys(cleanedData).length !== Object.keys(data).length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedData));
  }
  
  return cleanedData;
};

/**
 * Get analysis results for a candidate
 * @param {string} key - Cache key
 * @returns {Object|null} - Analysis results or null if not found
 */
export const getAnalysisForCandidate = (key) => {
  if (!key) return null;
  
  const cachedData = getCachedAnalysisResults();
  return cachedData[key] || null;
};

/**
 * Generate cache key for a candidate
 * @param {Object} candidate - Candidate data
 * @returns {string} - Cache key
 */
export const generateCandidateKey = (candidate) => {
  if (!candidate || !candidate.postId || !candidate.userId) {
    console.error('Invalid candidate data for key generation');
    return null;
  }
  return `${candidate.postId}-${candidate.userId}`;
}; 