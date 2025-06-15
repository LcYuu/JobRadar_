import { createSlice } from "@reduxjs/toolkit";
import { countReviewByCompany, countReviewByStar, countStarByCompanyId, createReply, createReplyToReview, createReview, deleteReview, deleteReviewReply, findAllReview, findReviewByCompany, findReviewByCompanyIdAndUserId, getReviewByCompany, getReviewReactions, getReviewReplies, reactToReview, updateReview, updateReviewReply } from "./review.thunk";

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
      reviews: [],
      countByStar: [],
      review: null,
      countReview: 0,
      loading: false,
      error: null,
      totalPages: null,
      totalElements: null,
      replies: {},
      reactions: {}
    },
    reducers: {
      updateReactionLocally: (state, action) => {
        const { reviewId, reactionType, userId } = action.payload;
        const currentReaction = state.reactions[reviewId];
        
        if (!currentReaction) {
          state.reactions[reviewId] = {
            likeCount: reactionType === 'LIKE' ? 1 : 0,
            dislikeCount: reactionType === 'DISLIKE' ? 1 : 0,
            userReaction: reactionType
          };
        } else {
          // Nếu user đã có reaction trước đó
          if (currentReaction.userReaction) {
            // Nếu click vào cùng loại reaction -> bỏ reaction
            if (currentReaction.userReaction === reactionType) {
              state.reactions[reviewId] = {
                ...currentReaction,
                likeCount: reactionType === 'LIKE' ? currentReaction.likeCount - 1 : currentReaction.likeCount,
                dislikeCount: reactionType === 'DISLIKE' ? currentReaction.dislikeCount - 1 : currentReaction.dislikeCount,
                userReaction: null
              };
            } 
            // Nếu click vào reaction khác -> chuyển reaction
            else {
              state.reactions[reviewId] = {
                ...currentReaction,
                likeCount: reactionType === 'LIKE' ? currentReaction.likeCount + 1 : currentReaction.likeCount - 1,
                dislikeCount: reactionType === 'DISLIKE' ? currentReaction.dislikeCount + 1 : currentReaction.dislikeCount - 1,
                userReaction: reactionType
              };
            }
          } 
          // Nếu user chưa có reaction
          else {
            state.reactions[reviewId] = {
              ...currentReaction,
              likeCount: reactionType === 'LIKE' ? currentReaction.likeCount + 1 : currentReaction.likeCount,
              dislikeCount: reactionType === 'DISLIKE' ? currentReaction.dislikeCount + 1 : currentReaction.dislikeCount,
              userReaction: reactionType
            };
          }
        }
      }
    },
    extraReducers: (builder) => {
      builder
        // Get Reviews By Company
        .addCase(getReviewByCompany.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getReviewByCompany.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = action.payload;
        })
        .addCase(getReviewByCompany.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Count Reviews By Company
        .addCase(countReviewByCompany.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(countReviewByCompany.fulfilled, (state, action) => {
          state.loading = false;
          state.countReview = action.payload;
        })
        .addCase(countReviewByCompany.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        
        // Create Review
        .addCase(createReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createReview.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = [...state.reviews, action.payload];
        })
        .addCase(createReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Delete Review
        .addCase(deleteReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteReview.fulfilled, (state, action) => {
          state.loading = false;
          const reviewId = action.payload;
          state.reviews = state.reviews.filter(
            (review) => review.id !== reviewId
          );
        })
        .addCase(deleteReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(findReviewByCompany.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(findReviewByCompany.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = action.payload.content;
          state.totalPages = action.payload.page.totalPages;
          state.totalElements = action.payload.page.totalElements;
        })
        .addCase(findReviewByCompany.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(findAllReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(findAllReview.fulfilled, (state, action) => {
          state.loading = false;
          state.reviews = action.payload.content;
          state.totalPages = action.payload.page.totalPages;
          state.totalElements = action.payload.page.totalElements;
        })
        .addCase(findAllReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(findReviewByCompanyIdAndUserId.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(findReviewByCompanyIdAndUserId.fulfilled, (state, action) => {
          state.loading = false;
          state.review = action.payload;
        })
        .addCase(findReviewByCompanyIdAndUserId.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(countReviewByStar.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(countReviewByStar.fulfilled, (state, action) => {
          state.loading = false;
          state.countByStar = action.payload;
        })
        .addCase(countReviewByStar.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(countStarByCompanyId.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(countStarByCompanyId.fulfilled, (state, action) => {
          state.loading = false;
          state.countByStar = action.payload;
        })
        .addCase(countStarByCompanyId.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Create Reply to Review
        .addCase(createReplyToReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createReplyToReview.fulfilled, (state, action) => {
          state.loading = false;
          // Find the review in the state and add the reply to it
          const { reviewId } = action.payload;
          const reviewIndex = state.reviews.findIndex(review => review.reviewId === reviewId);
          
          if (reviewIndex !== -1) {
            const updatedReview = { ...state.reviews[reviewIndex] };
            if (!updatedReview.replies) updatedReview.replies = [];
            updatedReview.replies.push(action.payload);
            
            state.reviews = [
              ...state.reviews.slice(0, reviewIndex),
              updatedReview,
              ...state.reviews.slice(reviewIndex + 1)
            ];

            // ADDED: Also add the new reply to the top-level replies object
            if (!state.replies[reviewId]) {
              state.replies[reviewId] = [];
            }
            state.replies[reviewId].push(action.payload);
          }
        })
        .addCase(createReplyToReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Get Review Replies
        .addCase(getReviewReplies.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getReviewReplies.fulfilled, (state, action) => {
          state.loading = false;
          // Extract reviewId from the first reply in the payload if available
          // Otherwise use a fallback approach
          let reviewId;
          if (action.payload && action.payload.length > 0) {
            reviewId = action.payload[0].reviewId;
          }
          
          if (reviewId) {
            // Store replies by reviewId for easier access
            state.replies = {
              ...state.replies,
              [reviewId]: action.payload
            };
            
            // Also update the review in the state
            const reviewIndex = state.reviews.findIndex(review => review.reviewId === reviewId);
            
            if (reviewIndex !== -1) {
              const updatedReview = { 
                ...state.reviews[reviewIndex],
                replies: action.payload
              };
              
              state.reviews = [
                ...state.reviews.slice(0, reviewIndex),
                updatedReview,
                ...state.reviews.slice(reviewIndex + 1)
              ];
            }
          }
        })
        .addCase(getReviewReplies.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Get Review Reactions
        .addCase(getReviewReactions.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getReviewReactions.fulfilled, (state, action) => {
          state.reactions = action.payload;
        })
        // Delete Review Reply
        .addCase(deleteReviewReply.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteReviewReply.fulfilled, (state, action) => {
          state.loading = false;
          
          // Get the replyId from the payload
          const { replyId } = action.payload;
          
          // Update all reviews that have replies
          state.reviews = state.reviews.map(review => {
            if (review.replies && review.replies.length > 0) {
              // Filter out the deleted reply
              const updatedReplies = review.replies.filter(reply => 
                reply.replyId !== replyId
              );
              
              // If the reply count has changed, update the review
              if (updatedReplies.length !== review.replies.length) {
                return {
                  ...review,
                  replies: updatedReplies
                };
              }
            }
            return review;
          });
          
          // Also update the replies in state
          if (state.replies) {
            Object.keys(state.replies).forEach(reviewId => {
              if (state.replies[reviewId]) {
                state.replies[reviewId] = state.replies[reviewId].filter(
                  reply => reply.replyId !== replyId
                );
              }
            });
          }
        })
        .addCase(deleteReviewReply.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Update Review
        .addCase(updateReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateReview.fulfilled, (state, action) => {
          state.loading = false;
          
          // Find the review in the state and update it
          const updatedReview = action.payload;
          const reviewIndex = state.reviews.findIndex(review => 
            review.reviewId === updatedReview.reviewId
          );
          
          if (reviewIndex !== -1) {
            state.reviews = [
              ...state.reviews.slice(0, reviewIndex),
              updatedReview,
              ...state.reviews.slice(reviewIndex + 1)
            ];
          }
        })
        .addCase(updateReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // Update Review Reply
        .addCase(updateReviewReply.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateReviewReply.fulfilled, (state, action) => {
          state.loading = false;
          
          // Get the updated reply
          const updatedReply = action.payload;
          
          // Update the reply in the review
          state.reviews = state.reviews.map(review => {
            if (review.replies && review.replies.length > 0) {
              const replyIndex = review.replies.findIndex(reply => 
                reply.replyId === updatedReply.replyId
              );
              
              if (replyIndex !== -1) {
                const updatedReplies = [
                  ...review.replies.slice(0, replyIndex),
                  updatedReply,
                  ...review.replies.slice(replyIndex + 1)
                ];
                
                return {
                  ...review,
                  replies: updatedReplies
                };
              }
            }
            return review;
          });
          
          // Also update the reply in the replies state
          if (state.replies) {
            Object.keys(state.replies).forEach(reviewId => {
              if (state.replies[reviewId]) {
                const replyIndex = state.replies[reviewId].findIndex(reply => 
                  reply.replyId === updatedReply.replyId
                );
                
                if (replyIndex !== -1) {
                  state.replies[reviewId] = [
                    ...state.replies[reviewId].slice(0, replyIndex),
                    updatedReply,
                    ...state.replies[reviewId].slice(replyIndex + 1)
                  ];
                }
              }
            });
          }
        })
        .addCase(updateReviewReply.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        // React to Review
        .addCase(reactToReview.fulfilled, (state, action) => {
          const { reviewId, reactionType } = action.payload;
          // Không cần cập nhật state ở đây vì đã xử lý trong reducer updateReactionLocally
        });
    }
  });
  
export const { updateReactionLocally } = reviewSlice.actions;
  export default reviewSlice.reducer;