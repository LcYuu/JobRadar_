package com.job_portal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.job_portal.DTO.ApplyJobInProfile;
import com.job_portal.models.ApplyJob;
import com.job_portal.models.IdApplyJob;

@Repository
public interface ApplyJobRepository extends JpaRepository<ApplyJob, IdApplyJob> {
	Optional<ApplyJob> findByPostIdAndUserId(UUID postId, UUID userId);
	
	boolean existsByPostIdAndUserId(UUID postId, UUID userId);
	@Query("SELECT COUNT(a) > 0 FROM ApplyJob a " +
	           "INNER JOIN JobPost jp ON a.postId = jp.postId " +
	           "WHERE a.isSave = true AND a.userId = :userId AND jp.company.companyId = :companyId")
	    boolean existsByUserIdAndCompanyId(@Param("userId") UUID userId, 
	                                        @Param("companyId") UUID companyId);
	@Query("SELECT new com.job_portal.DTO.ApplyJobInProfile(" +
	        "a.userId, " +
	        "a.postId, " +
	        "a.isSave, " +
	        "a.applyDate, " +
	        "a.pathCV, " +
	        "jp.salary, " +
	        "jp.location, " +
	        "jp.title, " +
	        "c.companyName, " +
	        "jp.typeOfWork, " +
	        "c.logo)" +
	        "FROM ApplyJob a " +
	        "JOIN a.jobPost jp " +
	        "JOIN Seeker sp ON sp.userId = a.userId " +
	        "JOIN Company c ON jp.company.companyId = c.companyId " +
	        "WHERE sp.userId = :userId")
	Page<ApplyJobInProfile> findApplyJobByUserId(@Param("userId") UUID userId, Pageable pageable);
	
	
	

}
