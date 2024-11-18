package com.job_portal.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.DTO.CountReviewByCompanyDTO;
import com.job_portal.models.JobPost;
import com.job_portal.models.Review;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
	@Query("SELECT r FROM Review r WHERE r.company.companyId = :companyId")
	public List<Review> findReviewByCompanyId(@Param("companyId") UUID companyId);

	@Query("SELECT new com.job_portal.DTO.CountReviewByCompanyDTO(r.company.companyId, COUNT(r)) FROM Review r WHERE r.company.companyId = :companyId GROUP BY r.company.companyId")
	CountReviewByCompanyDTO countReviewsByCompany(@Param("companyId") UUID companyId);

}
