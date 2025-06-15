import { createAsyncThunk } from '@reduxjs/toolkit';
import { api, API_BASE_URL } from '../../configs/api';
import axios from 'axios';

export const getReviewByCompany = createAsyncThunk(
  'review/getReviewByCompany',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/review/findReviewByCompanyId/${companyId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const countReviewByCompany = createAsyncThunk(
  'review/countReviewByCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/review/countReviewByCompany`);
      return response.data;
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkContentModeration = createAsyncThunk(
  'review/checkContentModeration',
  async (content, { rejectWithValue }) => {
    try {
      console.log("Sending content for moderation check:", content);
      const response = await axios.post(
        `http://localhost:5000/check-comment`,
        { text: content, threshold: 0.7 }
      );
      
      // Check the response format from the AI service
      const result = response.data;
      console.log("Moderation API response:", result);
      
      // Convert the result to the expected format
      const formattedResult = {
        isAppropriate: !result.is_toxic,
        score: result.score,
        message: result.message,
        rawResponse: result // Keep the raw response for debugging
      };
      
      console.log("Formatted moderation result:", formattedResult);
      return formattedResult;
    } catch (error) {
      console.error("Error in content moderation check:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async ({ reviewData, companyId }, { rejectWithValue, dispatch }) => {
    try {
      // Check content moderation first
      console.log("Checking content moderation for review:", reviewData.message);
      const moderationResult = await dispatch(checkContentModeration(reviewData.message)).unwrap();
      console.log("Moderation result:", moderationResult);
      
      if (!moderationResult.isAppropriate) {
        // Create a more detailed error message
        const errorMessage = `Bình luận của bạn chứa nội dung không phù hợp. Vui lòng sửa lại bình luận. (score: ${moderationResult.score})`;
        console.log("Content moderation failed:", errorMessage);
        return rejectWithValue(errorMessage);
      }

      const response = await api.post(
        `/review/create-review/${companyId}`,
        {
          star: reviewData.star,
          message: reviewData.message,
          anonymous: Boolean(reviewData.isAnonymous),
          anonymousId: reviewData.anonymousId,
          createDate: new Date().toISOString(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in createReview:", error);
      // Check if this is a moderation error or a server error
      if (error.message && error.message.includes('không phù hợp')) {
        console.log("Returning moderation error:", error.message);
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đánh giá');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/review/delete/${reviewId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const findReviewByCompany = createAsyncThunk(
  "reviews/findReviewByCompanyId",
  async ({ page, size, star }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/review/findReviewByCompanyId`, {params: { page, size, star },}
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const findAllReview = createAsyncThunk(
  "reviews/finđAllReview",
  async ({ page, size, companyId, star }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/review/get-all`, {params: { page, size, companyId, star },}
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const findReviewByCompanyIdAndUserId = createAsyncThunk(
  'review/findReviewByCompanyIdAndUserId',
  async ({ companyId, userId}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/review/review-detail?companyId=${companyId}&userId=${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const countReviewByStar = createAsyncThunk(
  'review/countReviewByStar',
  async ({ companyId}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/review/count-by-star?companyId=${companyId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const countStarByCompanyId = createAsyncThunk(
  'review/countStarByCompanyId',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/review/count-star-by-company-id`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add review reply
export const createReplyToReview = createAsyncThunk(
  'review/createReplyToReview',
  async ({ 
    reviewId, 
    content, 
    anonymous, 
    anonymousId,
    parentReplyId, 
    parentUserName, 
    parentUserId,
    parentIsAnonymous,
    parentAnonymousId
  }, { rejectWithValue, dispatch }) => {
    try {
      // Check content moderation first
      console.log("Checking content moderation for:", content);
      const moderationResult = await dispatch(checkContentModeration(content)).unwrap();
      console.log("Moderation result:", moderationResult);
      
      if (!moderationResult.isAppropriate) {
        // Create a more detailed error message
        const errorMessage = `Bình luận của bạn chứa nội dung không phù hợp. Vui lòng sửa lại bình luận. (score: ${moderationResult.score})`;
        console.log("Content moderation failed:", errorMessage);
        
        // Trả về lỗi trực tiếp, không bọc trong đối tượng Error
        return rejectWithValue(errorMessage);
      }

      const payload = {
        reviewId,
        content,
        anonymous,
        anonymousId,
        createDate: new Date().toISOString(),
      };
      
      // Add optional fields if they exist
      if (parentReplyId) payload.parentReplyId = parentReplyId;
      if (parentUserName) payload.parentUserName = parentUserName;
      if (parentUserId) payload.parentUserId = parentUserId;
      if (parentIsAnonymous) payload.parentIsAnonymous = parentIsAnonymous;
      if (parentAnonymousId) payload.parentAnonymousId = parentAnonymousId;
      
      const response = await api.post(
        `/review/create-reply`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error in createReplyToReview:", error);
      // Check if this is a moderation error or a server error
      if (error.message && error.message.includes('không phù hợp')) {
        console.log("Returning moderation error:", error.message);
        // Trả về chuỗi lỗi trực tiếp
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo phản hồi');
    }
  }
);

// Get all replies for a review
export const getReviewReplies = createAsyncThunk(
  'review/getReviewReplies',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/review/get-replies/${reviewId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add reaction to a review (like/dislike)
export const reactToReview = createAsyncThunk(
  'review/reactToReview',
  async ({ reviewId, reactionType }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/review/react`,
        {
          reviewId,
          reactionType,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get reactions for reviews
export const getReviewReactions = createAsyncThunk(
  'review/getReviewReactions',
  async (reviewIds, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/review/get-reactions`,
        {
          params: { reviewIds: Array.isArray(reviewIds) ? reviewIds.join(',') : reviewIds }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a reply to a review
export const deleteReviewReply = createAsyncThunk(
  'review/deleteReviewReply',
  async (replyId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/review/delete-reply/${replyId}`);
      return { replyId, success: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update a review
export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue, dispatch }) => {
    try {
      // Check content moderation first
      console.log("Checking content moderation for update review:", reviewData.message);
      const moderationResult = await dispatch(checkContentModeration(reviewData.message)).unwrap();
      console.log("Moderation result:", moderationResult);
      
      if (!moderationResult.isAppropriate) {
        // Create a more detailed error message
        const errorMessage = `Bình luận của bạn chứa nội dung không phù hợp. Vui lòng sửa lại bình luận. (score: ${moderationResult.score})`;
        console.log("Content moderation failed:", errorMessage);
        return rejectWithValue(errorMessage);
      }

      const response = await api.put(
        `/review/update-review/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error in updateReview:", error);
      // Check if this is a moderation error or a server error
      if (error.message && error.message.includes('không phù hợp')) {
        console.log("Returning moderation error:", error.message);
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật đánh giá');
    }
  }
);

// Update a reply to a review
export const updateReviewReply = createAsyncThunk(
  'review/updateReviewReply',
  async ({ replyId, content, anonymous }, { rejectWithValue, dispatch }) => {
    try {
      // Check content moderation first
      console.log("Checking content moderation for update reply:", content);
      const moderationResult = await dispatch(checkContentModeration(content)).unwrap();
      console.log("Moderation result:", moderationResult);
      
      if (!moderationResult.isAppropriate) {
        // Create a more detailed error message
        const errorMessage = `Bình luận của bạn chứa nội dung không phù hợp. Vui lòng sửa lại bình luận. (score: ${moderationResult.score})`;
        console.log("Content moderation failed:", errorMessage);
        return rejectWithValue(errorMessage);
      }

      const response = await api.put(
        `/review/update-reply/${replyId}`,
        {
          content,
          anonymous
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in updateReviewReply:", error);
      // Check if this is a moderation error or a server error
      if (error.message && error.message.includes('không phù hợp')) {
        console.log("Returning moderation error:", error.message);
        return rejectWithValue(error.message);
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật phản hồi');
    }
  }
);