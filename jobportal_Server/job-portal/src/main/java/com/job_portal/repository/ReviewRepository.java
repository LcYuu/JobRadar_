package com.job_portal.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.DTO.CountReviewByCompanyDTO;

import com.job_portal.DTO.CountReviewByStar;

import com.job_portal.models.JobPost;
import com.job_portal.models.Review;

public interface ReviewRepository extends JpaRepository<Review, UUID>, JpaSpecificationExecutor<Review>{
	@Query("SELECT r FROM Review r WHERE r.company.companyId = :companyId")
	public List<Review> findReviewByCompanyId(@Param("companyId") UUID companyId);

	@Query("SELECT r FROM Review r WHERE r.company.companyId = :companyId AND r.seeker.userId = :userId")
	public Review findReviewByCompanyIdAndUserId(@Param("companyId") UUID companyId, @Param("userId") UUID userId);

	@Query("SELECT new com.job_portal.DTO.CountReviewByCompanyDTO(r.company.companyId, COUNT(r)) FROM Review r WHERE r.company.companyId = :companyId GROUP BY r.company.companyId")
	CountReviewByCompanyDTO countReviewsByCompany(@Param("companyId") UUID companyId);

	Page<Review> findByCompanyCompanyId(UUID companyId, Pageable pageable);

	@Query("""
			    SELECT new com.job_portal.DTO.CountReviewByStar(s.star, COALESCE(COUNT(r), 0))
			    FROM (SELECT 1 as star UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) s
			    LEFT JOIN Review r ON s.star = r.star
			    WHERE (:companyId IS NULL OR r.company.companyId = :companyId)
			    GROUP BY s.star
			""")
	List<CountReviewByStar> countReviewsByStar(@Param("companyId") UUID companyId);
}
