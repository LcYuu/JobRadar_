package com.job_portal.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.job_portal.models.ReviewReply;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, UUID> {
    
    List<ReviewReply> findByReviewReviewIdOrderByCreateDateAsc(UUID reviewId);
    
    long countByReviewReviewId(UUID reviewId);
    
    void deleteByReviewReviewId(UUID reviewId);
} 