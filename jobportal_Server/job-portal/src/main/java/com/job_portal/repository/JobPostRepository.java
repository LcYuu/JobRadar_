package com.job_portal.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
import com.job_portal.projection.JobRecommendationProjection;
import com.job_portal.projection.JobWithApplicationCountProjection;

public interface JobPostRepository extends JpaRepository<JobPost, UUID>, JpaSpecificationExecutor<JobPost> {

	@Query("SELECT j FROM JobPost j WHERE (j.title LIKE %:query% OR j.typeOfWork LIKE %:query%) AND j.isApprove = true")
	public List<JobPost> findJobByJobName(@Param("query") String query);

	@Query("SELECT j FROM JobPost j WHERE j.experience LIKE %:experience% AND j.isApprove = true")
	public List<JobPost> findJobByExperience(@Param("experience") String experience);

	@Query("SELECT j FROM JobPost j WHERE j.company.companyId = :companyId AND j.isApprove = true AND j.expireDate >= CURRENT_TIMESTAMP")
	public Page<JobPost> findJobByCompanyId(@Param("companyId") UUID companyId, Pageable pageable);

	@Query("SELECT j FROM JobPost j WHERE j.company.companyId = :companyId AND j.isApprove = true AND j.expireDate >= CURRENT_TIMESTAMP")
	public List<JobPost> findJobByCompany(@Param("companyId") UUID companyId);

	@Query("SELECT jp FROM JobPost jp JOIN jp.company c JOIN c.industry i "
			+ "WHERE jp.createDate > :createdAt AND i.industryId IN :industryIds "
			+ "AND jp.isApprove = true AND jp.expireDate >= CURRENT_TIMESTAMP")
	List<JobPost> findByCreateDateAfterAndIndustryIds(@Param("createdAt") LocalDateTime createdAt,
			@Param("industryIds") List<Integer> industryIds);

	// Lọc các JobPost có salary >= minSalary và đã phê duyệt
	public List<JobPost> findBySalaryGreaterThanEqualAndIsApproveTrue(Long minSalary);

	// Lọc các JobPost có salary <= maxSalary và đã phê duyệt
	public List<JobPost> findBySalaryLessThanEqualAndIsApproveTrue(Long maxSalary);

	// Lọc các JobPost có salary giữa minSalary và maxSalary và đã phê duyệt
	public List<JobPost> findBySalaryBetweenAndIsApproveTrue(Long minSalary, Long maxSalary);

	@Query(value = "SELECT DATE(create_date) as date, COUNT(*) as count " + "FROM job_post "
			+ "WHERE create_date BETWEEN :startDate AND :endDate " + "GROUP BY DATE(create_date) "
			+ "ORDER BY date", nativeQuery = true)
	List<Object[]> countNewJobsPerDay(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate);

	List<JobPost> findByIsApproveTrueAndExpireDateGreaterThanEqual(LocalDateTime currentDate);

	@Query(value = "SELECT  BIN_TO_UUID(j.post_id) AS postId, j.title, j.description, j.location, j.salary, j.experience, "
			+ "j.type_of_work, j.create_date, j.expire_date,  BIN_TO_UUID(j.company_id), c.company_name, ci.city_name, "
			+ "GROUP_CONCAT(DISTINCT i.industry_name) AS industryNames, c.logo " + "FROM job_posts j "
			+ "JOIN company c ON j.company_id = c.user_id " + "JOIN city ci ON c.city_id = ci.city_id "

			+ "JOIN company_industries ci2 ON c.user_id = ci2.company_id "
			+ "JOIN industry i ON ci2.industry_id = i.industry_id "
			+ "WHERE j.is_approve = true AND j.expire_date >= CURRENT_TIMESTAMP "
			+ "GROUP BY j.post_id, j.title, j.description, j.location, j.salary, j.experience, j.type_of_work, "
			+ "j.create_date, j.expire_date, j.company_id, c.company_name, ci.city_name, c.logo",
		nativeQuery = true)
	List<JobRecommendationProjection> findApprovedAndActiveJobs();

	@Query("SELECT j FROM JobPost j WHERE j.isApprove = true AND j.expireDate >= CURRENT_TIMESTAMP ORDER BY j.createDate DESC")
	Page<JobPost> findJobPostActive(Pageable pageable);

	@Query("SELECT j FROM JobPost j WHERE j.isApprove = true AND j.expireDate >= CURRENT_TIMESTAMP ORDER BY j.createDate DESC")
	List<JobPost> findTop8LatestJobPosts();

	@Query("SELECT new com.job_portal.DTO.JobCountType(j.typeOfWork, COUNT(j)) " + "FROM JobPost j "
			+ "WHERE j.isApprove = true AND j.expireDate >= CURRENT_TIMESTAMP " + "GROUP BY j.typeOfWork")
	List<JobCountType> countJobsByType();

	Page<JobPost> findByIsApproveTrue(Specification<JobPost> spec, Pageable pageable);

	@Query("SELECT MIN(j.salary) FROM JobPost j WHERE j.isApprove = true AND j.expireDate >=CURRENT_TIMESTAMP")
	Long findMinSalary();

	@Query("SELECT MAX(j.salary) FROM JobPost j WHERE j.isApprove = true AND j.expireDate >= CURRENT_TIMESTAMP")
	Long findMaxSalary();

	default Specification<JobPost> alwaysActiveJobs() {
	    return (root, query, criteriaBuilder) -> {
	        query.distinct(true); // Loại bỏ kết quả trùng lặp
	        return criteriaBuilder.and(
	            criteriaBuilder.isTrue(root.get("isApprove")),
	            criteriaBuilder.greaterThanOrEqualTo(root.get("expireDate"), LocalDateTime.now())
	        );
	    };
	}

	Page<JobPost> findByCompanyCompanyIdAndApproveTrue(UUID companyId, Pageable pageable);

	Page<JobPost> findByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(UUID companyId, Pageable pageable,
			LocalDateTime now);

	long countByCompanyCompanyIdAndIsApproveTrue(UUID companyId);

	long countByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(UUID companyId,
			LocalDateTime currentDate);

	@Query(value = "SELECT BIN_TO_UUID(jp.post_id) AS postId, jp.title, jp.description, jp.location, jp.salary, jp.experience, "
			+ "jp.type_of_work AS typeOfWork, jp.create_date AS createDate, jp.expire_date AS expireDate, "
			+ "COUNT(DISTINCT a.post_id) AS applicationCount, jp.status, "
			+ "GROUP_CONCAT(DISTINCT i.industry_name SEPARATOR ', ') AS industryNames, jp.is_approve AS isApprove "
			+ "FROM job_posts jp " + "LEFT JOIN apply_job a ON jp.post_id = a.post_id "
			+ "JOIN company c ON jp.company_id = c.user_id "
			+ "JOIN company_industries ci ON c.user_id = ci.company_id "
			+ "JOIN industry i ON ci.industry_id = i.industry_id " + "WHERE jp.company_id = UUID_TO_BIN(:companyId) "
			+ "AND jp.expire_date >= CURRENT_TIMESTAMP "
			+ "GROUP BY jp.post_id, jp.title, jp.description, jp.location, jp.salary, jp.experience, "
			+ "jp.type_of_work, jp.create_date, jp.expire_date, jp.status, jp.is_approve "
			+ "ORDER BY jp.create_date DESC, jp.post_id", nativeQuery = true)
	List<JobWithApplicationCountProjection> findJobsByCompanyIdSortedByCreateDateDesc(
			@Param("companyId") String companyId);

	@Query(value = """
		    SELECT BIN_TO_UUID(jp.post_id) AS postId, jp.title, jp.description, jp.location, jp.salary, 
		           jp.experience, jp.type_of_work AS typeOfWork, jp.create_date AS createDate, 
		           jp.expire_date AS expireDate, COUNT(DISTINCT a.post_id) AS applicationCount, 
		           jp.status, GROUP_CONCAT(i.industry_name SEPARATOR ', ') AS industryNames, 
		           jp.is_approve AS isApprove
		    FROM job_posts jp
		    LEFT JOIN apply_job a ON jp.post_id = a.post_id
		    JOIN company c ON jp.company_id = c.user_id
		    JOIN company_industries ci ON c.user_id = ci.company_id
		    JOIN industry i ON ci.industry_id = i.industry_id
		    WHERE jp.company_id = UUID_TO_BIN(:companyId)
		      AND (:status IS NULL OR jp.status = :status)
		      AND (:typeOfWork IS NULL OR jp.type_of_work = :typeOfWork)
		    GROUP BY jp.post_id, jp.title, jp.description, jp.location, jp.salary, jp.experience, 
		             jp.type_of_work, jp.create_date, jp.expire_date, jp.status, jp.is_approve
		    ORDER BY jp.create_date DESC, jp.post_id
		    """,
		    countQuery = """
		    SELECT COUNT(DISTINCT jp.post_id)
		    FROM job_posts jp
		    JOIN company c ON jp.company_id = c.user_id
		    JOIN company_industries ci ON c.user_id = ci.company_id
		    JOIN industry i ON ci.industry_id = i.industry_id
		    WHERE jp.company_id = UUID_TO_BIN(:companyId)
		      AND (:status IS NULL OR jp.status = :status)
		      AND (:typeOfWork IS NULL OR jp.type_of_work = :typeOfWork)
		    """,
		    nativeQuery = true)
		Page<JobWithApplicationCountProjection> findJobsWithFiltersAndSorting(
		        @Param("companyId") String companyId,
		        @Param("status") String status, 
		        @Param("typeOfWork") String typeOfWork, 
		        Pageable pageable);

	@Query("SELECT j FROM JobPost j WHERE j.expireDate < :date AND j.status = :status")
	List<JobPost> findAllByExpireDateBeforeAndStatus(@Param("date") LocalDateTime date, @Param("status") String status);

	// long countByCompanyCompanyIdAndIsApproveTrue(UUID companyId);

	// long
	// countByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(UUID
	// companyId,
	// LocalDateTime currentDate);

	@Query("SELECT COUNT(j) FROM JobPost j WHERE DATE(j.createDate) BETWEEN :startDate AND :endDate")
	long countByCreatedAtBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);


	Page<JobPost> findByCompanyCompanyId(UUID companyId, Pageable pageable);

	Page<JobPost> findByCompanyCompanyIdAndIsApproveTrue(UUID companyId, Pageable pageable);

	long countByCompanyCompanyId(UUID companyId);

	/*
	 * long countByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(
	 * UUID companyId, LocalDateTime date );
	 */

	long countByCompanyCompanyIdAndIsApproveFalseOrExpireDateLessThan(UUID companyId, LocalDateTime date);

	@Query("SELECT COUNT(j) FROM JobPost j " + "WHERE j.company.companyId = :companyId "
			+ "AND j.createDate BETWEEN :startDate AND :endDate")
	long countJobsByCompanyAndDateRange(@Param("companyId") UUID companyId, @Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate);

	@Query("SELECT COUNT(j) FROM JobPost j " + "WHERE j.company.companyId = :companyId " + "AND j.isApprove = true "
			+ "AND j.expireDate >= CURRENT_TIMESTAMP " + "AND j.createDate BETWEEN :startDate AND :endDate")
	long countActiveJobsByCompanyAndDateRange(@Param("companyId") UUID companyId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	@Query("SELECT COUNT(j) FROM JobPost j " + "WHERE j.company.companyId = :companyId "
			+ "AND (j.isApprove = false OR j.expireDate < CURRENT_TIMESTAMP) "
			+ "AND j.createDate BETWEEN :startDate AND :endDate")
	long countClosedJobsByCompanyAndDateRange(@Param("companyId") UUID companyId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	long countByCompanyCompanyIdAndExpireDateLessThan(UUID companyId, LocalDateTime date);

	long countByCompanyCompanyIdAndIsApproveFalse(UUID companyId);

	@Query("SELECT COUNT(j) FROM JobPost j " + "WHERE j.company.companyId = :companyId " + "AND j.isApprove = false "
			+ "AND j.createDate BETWEEN :startDate AND :endDate")
	long countPendingJobsByCompanyAndDateRange(@Param("companyId") UUID companyId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	@Query("SELECT COUNT(j) FROM JobPost j WHERE DATE(j.createDate) BETWEEN :startDate AND :endDate")
	long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	Page<JobPost> findByStatusAndIsApproveTrue(String status, Pageable pageable);

	Page<JobPost> findByTitleContainingAndStatusAndIsApproveTrue(String title, String status, Pageable pageable);

	@Query("SELECT j FROM JobPost j WHERE " + "(:title is null OR j.title LIKE %:title%) AND "
			+ "(:status is null OR j.status = :status) AND " + "j.isApprove = true")
	Page<JobPost> findJobsWithFilters(@Param("title") String title, @Param("status") String status, Pageable pageable);

	@Query("SELECT j FROM JobPost j JOIN j.company c JOIN c.industry i "
			+ "WHERE i.industryId IN :industryIds AND j.isApprove = true "
			+ "AND j.expireDate > CURRENT_TIMESTAMP AND j.postId != :excludePostId")
	List<JobPost> findSimilarJobsByIndustryIds(@Param("industryIds") List<Integer> industryIds,
			@Param("excludePostId") UUID excludePostId);

	Optional<JobPost> findTopByCompanyCompanyIdOrderByCreateDateDesc(UUID companyId);

	@Query("SELECT jp FROM JobPost jp "
			+ "WHERE (:title IS NULL OR LOWER(jp.title) LIKE LOWER(CONCAT('%', :title, '%'))) "
			+ "AND (:status IS NULL OR LOWER(jp.status) LIKE LOWER(CONCAT('%', :status, '%'))) "
			+ "AND (:isApprove IS NULL OR jp.isApprove = :isApprove) " + "ORDER BY jp.createDate DESC")
	Page<JobPost> searchJobPosts(@Param("title") String title, @Param("status") String status,
			@Param("isApprove") Boolean isApprove, Pageable pageable);

	@Query("SELECT j FROM JobPost j WHERE j.isApprove = true AND j.expireDate < ?1 AND j.status = 'Hết hạn' AND (j.surveyEmailSent = false OR j.surveyEmailSent IS NULL)")
	List<JobPost> findByExpireDateBeforeAndSurveyEmailSentFalse(LocalDateTime date);

//	@Query(value = "SELECT new com.job_portal.DTO.JobWithApplicationCountDTO("
//			+ "jp.postId, jp.title, jp.description, jp.location, jp.salary, jp.experience, "
//			+ "jp.typeOfWork, jp.createDate, jp.expireDate, " + "COUNT(DISTINCT a.postId), jp.status, i.industryName, jp.isApprove) "
//			+ "FROM JobPost jp " + "LEFT JOIN ApplyJob a ON jp.postId = a.postId "
//			+ "JOIN Company c ON jp.company.companyId = c.companyId "
//			+ "JOIN Industry i ON c.industry.industryId = i.industryId " + "WHERE jp.company.companyId = :companyId "
//			+ "AND (:status IS NULL OR jp.status = :status) "
//			+ "AND (:typeOfWork IS NULL OR jp.typeOfWork = :typeOfWork) "
//			+ "GROUP BY jp.postId, jp.title, jp.description, jp.location, jp.salary, jp.experience, "
//			+ "jp.typeOfWork, jp.createDate, jp.expireDate, jp.status, i.industryName,  jp.isApprove ")
//	List<JobWithApplicationCountDTO> findAllJobsWithFilters(@Param("companyId") UUID companyId,
//			@Param("status") String status, @Param("typeOfWork") String typeOfWork);
@Query(value = """
		    SELECT BIN_TO_UUID(jp.post_id) AS postId, jp.title, jp.description, jp.location, jp.salary, 
		           jp.experience, jp.type_of_work AS typeOfWork, jp.create_date AS createDate, 
		           jp.expire_date AS expireDate, COUNT(DISTINCT a.post_id) AS applicationCount, 
		           jp.status, GROUP_CONCAT(i.industry_name SEPARATOR ', ') AS industryNames, 
		           jp.is_approve AS isApprove
		    FROM job_posts jp
		    LEFT JOIN apply_job a ON jp.post_id = a.post_id
		    JOIN company c ON jp.company_id = c.user_id
		    JOIN company_industries ci ON c.user_id = ci.company_id
		    JOIN industry i ON ci.industry_id = i.industry_id
		    WHERE jp.company_id = UUID_TO_BIN(:companyId)
		      AND (:status IS NULL OR jp.status = :status)
		      AND (:typeOfWork IS NULL OR jp.type_of_work = :typeOfWork)
		    GROUP BY jp.post_id, jp.title, jp.description, jp.location, jp.salary, jp.experience, 
		             jp.type_of_work, jp.create_date, jp.expire_date, jp.status, jp.is_approve
		    ORDER BY jp.create_date DESC, jp.post_id
		    """,
		countQuery = """
		    SELECT COUNT(DISTINCT jp.post_id)
		    FROM job_posts jp
		    JOIN company c ON jp.company_id = c.user_id
		    JOIN company_industries ci ON c.user_id = ci.company_id
		    JOIN industry i ON ci.industry_id = i.industry_id
		    WHERE jp.company_id = UUID_TO_BIN(:companyId)
		      AND (:status IS NULL OR jp.status = :status)
		      AND (:typeOfWork IS NULL OR jp.type_of_work = :typeOfWork)
		    """,
		nativeQuery = true)
List<JobWithApplicationCountProjection> findAllJobsWithFilters(
		@Param("companyId") String companyId,
		@Param("status") String status,
		@Param("typeOfWork") String typeOfWork);

}
