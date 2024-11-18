package com.job_portal.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.DTO.JobCountType;
import com.job_portal.DTO.JobRecommendationDTO;
import com.job_portal.DTO.JobWithApplicationCountDTO;
import com.job_portal.models.JobPost;

public interface JobPostRepository extends JpaRepository<JobPost, UUID>, JpaSpecificationExecutor<JobPost> {

	@Query("SELECT j FROM JobPost j WHERE (j.title LIKE %:query% OR j.typeOfWork LIKE %:query%) AND j.isApprove = true")
	public List<JobPost> findJobByJobName(@Param("query") String query);

	@Query("SELECT j FROM JobPost j WHERE j.experience LIKE %:experience% AND j.isApprove = true")
	public List<JobPost> findJobByExperience(@Param("experience") String experience);

	@Query("SELECT j FROM JobPost j WHERE j.company.companyId = :companyId AND j.isApprove = true AND j.expireDate >= CURRENT_DATE")
	public Page<JobPost> findJobByCompanyId(@Param("companyId") UUID companyId, Pageable pageable);
	
	@Query("SELECT j FROM JobPost j WHERE j.company.companyId = :companyId AND j.isApprove = true AND j.expireDate >= CURRENT_DATE")
	public List<JobPost> findJobByCompany(@Param("companyId") UUID companyId);

	// Lọc các JobPost có salary >= minSalary và đã phê duyệt
	public List<JobPost> findBySalaryGreaterThanEqualAndIsApproveTrue(Long minSalary);

	// Lọc các JobPost có salary <= maxSalary và đã phê duyệt
	public List<JobPost> findBySalaryLessThanEqualAndIsApproveTrue(Long maxSalary);

	// Lọc các JobPost có salary giữa minSalary và maxSalary và đã phê duyệt
	public List<JobPost> findBySalaryBetweenAndIsApproveTrue(Long minSalary, Long maxSalary);

	@Query("SELECT FUNCTION('date', jp.createDate) AS date, COUNT(jp) AS count " + "FROM JobPost jp "
			+ "WHERE jp.createDate BETWEEN :startDate AND :endDate " + "GROUP BY FUNCTION('date', jp.createDate)")
	List<Object[]> countNewJobsPerDay(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate);

	List<JobPost> findByIsApproveTrueAndExpireDateGreaterThanEqual(LocalDateTime currentDate);

	@Query("SELECT new com.job_portal.DTO.JobRecommendationDTO(j.postId, j.title, j.description, j.location, j.salary, j.experience, "
			+ "j.typeOfWork, j.createDate, j.expireDate, j.company.companyId, j.company.companyName, j.city.cityName, j.company.industry.industryName, j.company.logo) "
			+ "FROM JobPost j WHERE j.isApprove = true AND j.expireDate >= CURRENT_DATE")
	List<JobRecommendationDTO> findApprovedAndActiveJobs();

	Page<JobPost> findByIsApproveTrueAndExpireDateGreaterThanEqual(Pageable pageable, LocalDateTime currentTime);

	@Query("SELECT j FROM JobPost j WHERE j.isApprove = true ORDER BY j.createDate DESC")
	List<JobPost> findTop8LatestJobPosts();

	@Query("SELECT new com.job_portal.DTO.JobCountType(j.typeOfWork, COUNT(j)) " + "FROM JobPost j "
			+ "WHERE j.isApprove = true AND j.expireDate >= CURRENT_DATE " + "GROUP BY j.typeOfWork")
	List<JobCountType> countJobsByType();

	Page<JobPost> findByIsApproveTrue(Specification<JobPost> spec, Pageable pageable);

	@Query("SELECT MIN(j.salary) FROM JobPost j")
	Long findMinSalary();

	@Query("SELECT MAX(j.salary) FROM JobPost j")
	Long findMaxSalary();

	default Specification<JobPost> alwaysActiveJobs() {
		return (root, query, criteriaBuilder) -> criteriaBuilder.and(criteriaBuilder.isTrue(root.get("isApprove")),
				criteriaBuilder.greaterThanOrEqualTo(root.get("expireDate"), LocalDateTime.now()));
	}

	Page<JobPost> findByCompanyCompanyIdAndApproveTrue(UUID companyId, Pageable pageable);

	Page<JobPost> findByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(UUID companyId, Pageable pageable,
			LocalDateTime now);

	long countByCompanyCompanyIdAndIsApproveTrue(UUID companyId);

	long countByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(UUID companyId,
			LocalDateTime currentDate);

	@Query(value = "SELECT new com.job_portal.DTO.JobWithApplicationCountDTO("
			+ "jp.postId, jp.title, jp.description, jp.location, jp.salary, jp.experience, "
			+ "jp.typeOfWork, jp.createDate, jp.expireDate, " + "COUNT(a.postId), jp.status, i.industryName) "
			+ "FROM JobPost jp " + "LEFT JOIN ApplyJob a ON jp.postId = a.postId "
			+ "JOIN Company c ON jp.company.companyId = c.companyId " + "JOIN Industry i ON c.industry.industryId = i.industryId "
			+ "WHERE jp.company.companyId = :companyId " + "AND jp.isApprove = true " + "AND jp.expireDate >= CURRENT_DATE "
			+ "GROUP BY jp.postId, jp.title, jp.description, jp.location, jp.salary, jp.experience, "
			+ "jp.typeOfWork, jp.createDate, jp.expireDate, jp.status, i.industryName "
			+ "ORDER BY jp.createDate DESC", nativeQuery = false)
	Page<JobWithApplicationCountDTO> findTop5JobsWithApplicationCountStatusAndIndustryName(
			@Param("companyId") UUID companyId, Pageable pageable);

}
