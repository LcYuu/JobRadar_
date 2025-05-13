package com.job_portal.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.job_portal.models.ReviewReaction;

@Repository
public interface ReviewReactionRepository extends JpaRepository<ReviewReaction, UUID> {
    
    Optional<ReviewReaction> findByReviewReviewIdAndUserUserId(UUID reviewId, UUID userId);
    
    long countByReviewReviewIdAndReactionType(UUID reviewId, String reactionType);
    
    void deleteByReviewReviewId(UUID reviewId);
} 