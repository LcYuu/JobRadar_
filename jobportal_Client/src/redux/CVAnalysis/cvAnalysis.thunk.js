import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../configs/api';
import { 
  getCachedAnalysisResults, 
  saveAnalysisToBackend, 
  saveFullAnalysisToBackend,
  getFullAnalysisFromBackend
} from '../../services/cvAnalysis';

/**
 * Save analysis result to backend
 */
export const saveAnalysisResult = createAsyncThunk(
  'cvAnalysis/saveAnalysisResult',
  async ({ key, result, candidate }, { rejectWithValue }) => {
    try {
      // Extract matching score from the result
      const matchingScore = result.matching_score?.totalScore || 0;
      
      // Try to determine postId and userId from different sources
      let postId, userId;
      
      // First check if we have a valid candidate object
      if (candidate && candidate.postId && candidate.userId) {
        console.log('Using candidate object for IDs');
        postId = candidate.postId;
        userId = candidate.userId;
      } 
      // Then try to parse from key (format: postId-userId)
      else if (key && key.includes('-')) {
        console.log('Parsing IDs from key:', key);
        [postId, userId] = key.split('-');
      }
      
      console.log('Extracted IDs:', { postId, userId, matchingScore });
      
      // Save to backend database (if we have valid IDs)
      if (postId && userId) {
        // First save the basic score
        await saveAnalysisToBackend(postId, userId, matchingScore);
        console.log('Successfully saved score to backend');
        
        // Then save the full analysis result
        await saveFullAnalysisToBackend(postId, userId, matchingScore, result);
        console.log('Successfully saved full analysis to backend');
        
        // Now that data is safely stored in database, clear from localStorage
        try {
          // Get existing cache
          const cachedResults = getCachedAnalysisResults();
          
          // Remove this specific entry
          if (cachedResults[key]) {
            delete cachedResults[key];
            
            // Save modified cache back
            localStorage.setItem('cv_analysis_results', JSON.stringify(cachedResults));
            console.log('Removed entry from localStorage cache after saving to DB');
          }
        } catch (cacheError) {
          // Non-critical error, just log it
          console.warn('Failed to remove from localStorage:', cacheError);
        }
      } else {
        console.error('Failed to extract valid IDs', { key, candidate });
        throw new Error('Could not determine valid postId and userId');
      }
      
      return { key, result };
    } catch (error) {
      console.error('Error in saveAnalysisResult:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch analysis results from backend
 */
export const fetchAnalysisResults = createAsyncThunk(
  'cvAnalysis/fetchAnalysisResults',
  async (_, { rejectWithValue }) => {
    try {
      // First try to get from localStorage for immediate display
      const cachedResults = getCachedAnalysisResults();
      
      // Then try to fetch from API
      try {
        // Get all apply jobs with matchingScore > 0 and analysis result
        const response = await api.get('/apply-job/get-matching-scores-with-details');
        
        if (response.data && Array.isArray(response.data)) {
          // Convert API results to the same format as localStorage
          const apiResults = {};
          
          await Promise.all(response.data.map(async (item) => {
            const key = `${item.postId}-${item.userId}`;
            
            // If we have a full analysis result stored
            if (item.analysisResult) {
              try {
                // Parse the JSON string to object
                const analysisObject = JSON.parse(item.analysisResult);
                
                apiResults[key] = {
                  ...analysisObject,
                  timestamp: item.lastUpdated ? new Date(item.lastUpdated).getTime() : Date.now()
                };
              } catch (parseError) {
                console.error('Error parsing analysis result:', parseError);
                
                // Fallback to basic info if parsing fails
                apiResults[key] = {
                  matching_score: {
                    totalScore: item.matchingScore
                  },
                  timestamp: item.lastUpdated ? new Date(item.lastUpdated).getTime() : Date.now()
                };
              }
            } else {
              // If no full analysis, try to fetch it
              try {
                const fullAnalysis = await getFullAnalysisFromBackend(item.postId, item.userId);
                
                if (fullAnalysis) {
                  apiResults[key] = {
                    ...fullAnalysis,
                    timestamp: item.lastUpdated ? new Date(item.lastUpdated).getTime() : Date.now()
                  };
                } else {
                  // Use basic info if full analysis not available
                  apiResults[key] = {
                    matching_score: {
                      totalScore: item.matchingScore
                    },
                    timestamp: item.lastUpdated ? new Date(item.lastUpdated).getTime() : Date.now()
                  };
                }
              } catch (fetchError) {
                console.error('Error fetching full analysis:', fetchError);
                
                // Use basic info if fetching fails
                apiResults[key] = {
                  matching_score: {
                    totalScore: item.matchingScore
                  },
                  timestamp: item.lastUpdated ? new Date(item.lastUpdated).getTime() : Date.now()
                };
              }
            }
          }));
          
          // Merge with cached results (API data takes precedence)
          return { ...cachedResults, ...apiResults };
        }
      } catch (apiError) {
        console.error('Error fetching from API, using cached data:', apiError);
      }
      
      // If API fetch fails, fall back to cache
      return cachedResults;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch analysis result for a specific candidate
 */
export const fetchCandidateAnalysis = createAsyncThunk(
  'cvAnalysis/fetchCandidateAnalysis',
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const fullAnalysis = await getFullAnalysisFromBackend(postId, userId);
      
      if (fullAnalysis) {
        const key = `${postId}-${userId}`;
        return { key, result: fullAnalysis };
      }
      
      throw new Error('No analysis result found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Clear all analysis results
 */
export const clearAnalysisResults = createAsyncThunk(
  'cvAnalysis/clearAnalysisResults',
  async (_, { rejectWithValue }) => {
    try {
      // Clear the localStorage
      localStorage.removeItem('cv_analysis_results');
      
      // In a real implementation, you would also clear from the backend:
      // await api.delete('/cv-analysis/all');
      
      return {};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
); 