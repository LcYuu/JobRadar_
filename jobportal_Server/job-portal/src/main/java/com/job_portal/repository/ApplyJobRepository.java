package com.job_portal.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.job_portal.DTO.ApplyJobEmployerDTO;
import com.job_portal.DTO.ApplyJobInProfile;
import com.job_portal.models.ApplyJob;
import com.job_portal.models.IdApplyJob;

@Repository
public interface ApplyJobRepository extends JpaRepository<ApplyJob, IdApplyJob> {


	@Query("SELECT a FROM ApplyJob a WHERE a.postId = :postId AND a.userId = :userId")
	Optional<ApplyJob> findByPostIdAndUserId(@Param("postId") UUID postId, @Param("userId") UUID userId);

	boolean existsByPostIdAndUserId(UUID postId, UUID userId);

	@Query("SELECT COUNT(a) > 0 FROM ApplyJob a " + "INNER JOIN JobPost jp ON a.postId = jp.postId "
			+ "WHERE a.isSave = true AND a.userId = :userId AND jp.company.companyId = :companyId")
	boolean existsByUserIdAndCompanyId(@Param("userId") UUID userId, @Param("companyId") UUID companyId);

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
		       "c.logo, " +
		       "COALESCE((SELECT AVG(r.star) FROM Review r WHERE r.company.companyId = c.companyId), 0.0)) " +
		       "FROM ApplyJob a " +
		       "JOIN a.jobPost jp " +
		       "JOIN Seeker sp ON sp.userId = a.userId " +
		       "JOIN Company c ON jp.company.companyId = c.companyId " +
		       "WHERE sp.userId = :userId " +
		       "ORDER BY a.applyDate DESC")
		Page<ApplyJobInProfile> findApplyJobByUserId(@Param("userId") UUID userId, Pageable pageable);

	@Query("SELECT DISTINCT new com.job_portal.DTO.ApplyJobEmployerDTO(a.postId, a.userId, a.isSave, a.applyDate, "
			+ "a.pathCV, a.fullName, j.title, u.avatar, a.isViewed, a.matchingScore) " + "FROM ApplyJob a " + "JOIN a.jobPost j "
			+ "JOIN UserAccount u ON a.userId = u.userId " + "WHERE j.company.companyId = :companyId "
			+ "AND (:fullName IS NULL OR LOWER(a.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) "
			+ "AND (:isSave IS NULL OR a.isSave = :isSave) "
			+ "AND (:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')))")
	Page<ApplyJobEmployerDTO> findApplyJobsWithFilters(@Param("companyId") UUID companyId,
			@Param("fullName") String fullName, @Param("isSave") Boolean isSave, @Param("title") String title,
			Pageable pageable);

	@Query("SELECT a FROM ApplyJob a " +
		   "JOIN JobPost j ON a.postId = j.postId " +
		   "WHERE j.company.companyId = :companyId " +
		   "ORDER BY a.applyDate DESC")
	List<ApplyJob> findByCompanyId(@Param("companyId") UUID companyId);

	@Query("SELECT a FROM ApplyJob a " +
		   "JOIN JobPost j ON a.postId = j.postId " +
		   "WHERE j.company.companyId = :companyId " +
		   "ORDER BY a.matchingScore DESC, a.applyDate DESC")
	List<ApplyJob> findByCompanyIdOrderByMatchingScore(@Param("companyId") UUID companyId);

	@Query("SELECT a FROM ApplyJob a " +
		   "WHERE a.postId = :postId " +
		   "ORDER BY a.matchingScore DESC, a.applyDate DESC")
	List<ApplyJob> findByPostIdOrderByMatchingScore(@Param("postId") UUID postId);

	@Query("SELECT new map(a.postId as postId, a.userId as userId, a.matchingScore as matchingScore, a.applyDate as lastUpdated) " +
		   "FROM ApplyJob a WHERE a.matchingScore > 0")
	List<Map<String, Object>> findAllWithMatchingScore();

	@Query("SELECT new map(a.postId as postId, a.userId as userId, a.matchingScore as matchingScore, a.applyDate as lastUpdated, a.analysisResult as analysisResult) " +
		   "FROM ApplyJob a WHERE a.matchingScore > 0 AND a.analysisResult IS NOT NULL")
	List<Map<String, Object>> findAllWithMatchingScoreAndAnalysis();
	
	@Query("SELECT COUNT(a) FROM ApplyJob a WHERE a.postId = :postId")
	long countByPostId(@Param("postId") UUID postId);
}
	
	
	

