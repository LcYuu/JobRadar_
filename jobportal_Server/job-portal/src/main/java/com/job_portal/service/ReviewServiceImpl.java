package com.job_portal.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.CountReviewByStar;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.Review;
import com.job_portal.models.Seeker;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.ReviewRepository;
import com.social.exceptions.AllExceptions;

@Service
public class ReviewServiceImpl implements IReviewService {

	@Autowired
	ReviewRepository reviewRepository;
	@Autowired
	CompanyRepository companyRepository;

	@Override
	public boolean createReview(Seeker seeker, UUID companyId, Review reviewRequest) throws AllExceptions {
		try {
			Review review = new Review();
			review.setStar(reviewRequest.getStar());
			review.setMessage(reviewRequest.getMessage());
			review.setAnonymous(reviewRequest.isAnonymous());
			review.setCreateDate(LocalDateTime.now());
			review.setSeeker(seeker);
			
			Optional<Company> company = companyRepository.findById(companyId);
			if (company.isEmpty()) {
				throw new AllExceptions("Company not found");
			}
			review.setCompany(company.get());
			
			reviewRepository.save(review);
			return true;
		} catch (Exception e) {
			throw new AllExceptions("Error creating review: " + e.getMessage());
		}
	}

	@Override
	public List<Review> findReviewByCompanyId(UUID companyId) throws AllExceptions {
		try {
			List<Review> reviews = reviewRepository.findReviewByCompanyId(companyId);
			return reviews;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

	@Override
	public boolean deleteReview(UUID reviewId) throws AllExceptions {
		Optional<Review> review = reviewRepository.findById(reviewId);
		
		if (review.isEmpty()) {
			throw new AllExceptions("Review not found with id: " + reviewId);
		}
		
		try {
			Company company = review.get().getCompany();
			
			company.getReviews().remove(review.get());
			companyRepository.save(company);
			
			reviewRepository.delete(review.get());
			return true;
		} catch (Exception e) {
			throw new AllExceptions("Error deleting review: " + e.getMessage());
		}
	}

	@Override
	public Page<Review> findReviewByCompanyId(UUID companyId, Pageable pageable) {
		return reviewRepository.findByCompanyCompanyId(companyId, pageable);
	}

	@Override
	public Review findReviewByCompanyIdAndUserId(UUID companyId, UUID userId) {
		return reviewRepository.findReviewByCompanyIdAndUserId(companyId, userId);
	}

	@Override
	public List<CountReviewByStar> countReviewsByStar(UUID companyId) {
		return reviewRepository.countReviewsByStar(companyId);
	}

}