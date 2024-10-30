package com.job_portal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.job_portal.models.ApplyJob;
import com.job_portal.models.IdApplyJob;

@Repository
public interface ApplyJobRepository extends JpaRepository<ApplyJob, IdApplyJob> {
	Optional<ApplyJob> findByPostIdAndUserId(UUID postId, UUID userId);
	
	@Query("SELECT COUNT(a) > 0 FROM ApplyJob a " +
	           "INNER JOIN JobPost jp ON a.postId = jp.postId " +
	           "WHERE a.isSave = true AND a.userId = :userId AND jp.company.companyId = :companyId")
	    boolean existsByUserIdAndCompanyId(@Param("userId") UUID userId, 
	                                        @Param("companyId") UUID companyId);
}
