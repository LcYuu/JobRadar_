package com.job_portal.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.job_portal.models.ReviewReaction;

import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface ReviewReactionRepository extends JpaRepository<ReviewReaction, UUID> {
    
    Optional<ReviewReaction> findByReviewReviewIdAndUserUserId(UUID reviewId, UUID userId);
    
    long countByReviewReviewIdAndReactionType(UUID reviewId, String reactionType);
    
    void deleteByReviewReviewId(UUID reviewId);
    
    @Query("SELECT COUNT(rr) FROM ReviewReaction rr " +
    	       "JOIN rr.review r " +
    	       "WHERE r.company.companyId = :companyId AND rr.reactionType = 'LIKE'")
    	Long countLikesByCompany(@Param("companyId") UUID companyId);

    	@Query("SELECT COUNT(rr) FROM ReviewReaction rr " +
    	       "JOIN rr.review r " +
    	       "WHERE r.company.companyId = :companyId AND rr.reactionType = 'DISLIKE'")
    	Long countDislikesByCompany(@Param("companyId") UUID companyId);
} 