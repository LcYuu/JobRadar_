package com.job_portal.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.job_portal.DTO.CountReviewByStar;
import com.job_portal.models.JobPost;
import com.job_portal.models.Review;
import com.job_portal.models.Seeker;
import com.social.exceptions.AllExceptions;

public interface IReviewService {
	public boolean createReview(Seeker seeker, UUID companyId, Review req) throws AllExceptions;
	public List<Review> findReviewByCompanyId(UUID companyId) throws AllExceptions;
	public boolean deleteReview(UUID reviewId) throws AllExceptions;
	public boolean deleteReview(UUID reviewId, boolean isOwner) throws AllExceptions;
	public Page<Review> findReviewByCompanyId(UUID companyId, Pageable pageable);
	public Review findReviewByCompanyIdAndUserId(UUID companyId, UUID userId);
	public List<CountReviewByStar> countReviewsByStar(UUID companyId);
}
