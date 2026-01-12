package com.job_portal.repository;

import java.time.LocalDateTime;
import java.time.LocalDate;
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

import com.job_portal.DTO.CompanyDTO;
import com.job_portal.DTO.CompanyWithAverageStarDTO;
import com.job_portal.DTO.CompanyWithCountJobDTO;
import com.job_portal.DTO.FollowCompanyDTO;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.UserAccount;
import com.job_portal.projection.CompanyProjection;
import com.job_portal.projection.CompanyWithCountJob;

public interface CompanyRepository extends JpaRepository<Company, UUID>, JpaSpecificationExecutor<Company> {

	List<Company> findByBlockedUntilBefore(LocalDateTime now);

	@Query("SELECT c FROM Company c WHERE c.companyName LIKE %:companyName%")
	List<Company> findCompanyByCompanyName(@Param("companyName") String companyName);

	@Query("SELECT c FROM Company c WHERE c.companyId = :companyId")
	Optional<Company> findCompanyByCompanyId(@Param("companyId") UUID companyId);

	@Query("SELECT c FROM Company c JOIN c.jobPosts jp WHERE jp.postId = :postId")
	Optional<Company> findCompanyByPostId(@Param("postId") UUID postId);

	@Query("SELECT c FROM Company c WHERE c.city.cityName LIKE %:cityName%")
	List<Company> findCompaniesByCityName(@Param("cityName") String cityName);

	@Query("SELECT c FROM Company c JOIN c.industry i WHERE i.industryId IN :industryIds")
	List<Company> findTop6CompaniesByIndustryIds(@Param("industryIds") List<Integer> industryIds);

	@Query(value = "SELECT \r\n"
            + "    BIN_TO_UUID(c.user_id) AS companyId, \r\n"
            + "    c.company_name AS companyName, \r\n"
            + "    COUNT(a.post_id) AS applicationCount, \r\n"
            + "    GROUP_CONCAT(DISTINCT ci.industry_id SEPARATOR ',') AS industryIds, \r\n"
            + "    c.city_id AS cityId, \r\n"
            + "    c.address, \r\n"
            + "    c.description, \r\n"
            + "    c.logo, \r\n"
            + "    c.contact, \r\n"
            + "    c.email, \r\n"
            + "    c.established_time, \r\n"
            + "    c.tax_code, \r\n"
            + "    AVG(r.star) AS averageStar \r\n"
            + "FROM company c \r\n"
            + "LEFT JOIN job_posts jp ON c.user_id = jp.company_id \r\n"
            + "LEFT JOIN apply_job a ON jp.post_id = a.post_id \r\n"
            + "LEFT JOIN company_industries ci ON c.user_id = ci.company_id \r\n"
            + "LEFT JOIN review r ON c.user_id = r.company_id \r\n"
            + "WHERE (a.is_save = true OR a.post_id IS NULL) \r\n"
            + "AND jp.is_approve = true \r\n"
            + "GROUP BY c.user_id, c.company_name, c.city_id, c.address, \r\n"
            + "         c.description, c.logo, c.contact, c.email, \r\n"
            + "         c.established_time, c.tax_code \r\n"
            + "ORDER BY AVG(r.star) DESC, COUNT(a.post_id) DESC;", nativeQuery = true)
    List<CompanyProjection> findCompaniesWithSavedApplications();
	
//	@Query(value = """
//		    SELECT BIN_TO_UUID(c.user_id) AS companyId, 
//		           c.company_name AS companyName, 
//		           c.logo AS logo, 
//		           GROUP_CONCAT(DISTINCT ci.industry_id SEPARATOR ',') AS industryIds, 
//		           c.description AS description, 
//		           c.city_id AS cityId, 
//		           COALESCE(COUNT(DISTINCT j.post_id), 0) AS countJob 
//		    FROM company c 
//		    LEFT JOIN job_posts j ON c.user_id = j.company_id 
//		         AND j.is_approve = true 
//		         AND j.expire_date >= CURRENT_DATE 
//		    LEFT JOIN company_industries ci ON c.user_id = ci.company_id  
//		    WHERE (:title IS NULL OR LOWER(c.company_name) LIKE LOWER(CONCAT('%', :title, '%')) 
//		           OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%'))) 
//		          AND (:cityId IS NULL OR c.city_id = :cityId) 
//		          AND (:industryId IS NULL OR ci.industry_id = :industryId) 
//		    GROUP BY c.user_id, c.company_name, c.logo, c.description, c.city_id
//		    ORDER BY c.company_name ASC
//		""",
//		countQuery = """
//		    SELECT COUNT(DISTINCT c.user_id)
//		    FROM company c 
//		    LEFT JOIN company_industries ci ON c.user_id = ci.company_id  
//		    WHERE (:title IS NULL OR LOWER(c.company_name) LIKE LOWER(CONCAT('%', :title, '%')) 
//		           OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%'))) 
//		          AND (:cityId IS NULL OR c.city_id = :cityId) 
//		          AND (:industryId IS NULL OR ci.industry_id = :industryId)
//		""",
//		nativeQuery = true)
//		Page<CompanyWithCountJob> findCompaniesByFilters(
//		    @Param("title") String title, 
//		    @Param("cityId") Integer cityId,
//		    @Param("industryId") Integer industryId, 
//		    Pageable pageable
//		);
//
//

//	@Query(value = """
//		    SELECT BIN_TO_UUID(c.user_id) AS companyId, 
//		           c.company_name AS companyName, 
//		           c.logo AS logo, 
//		           GROUP_CONCAT(DISTINCT ci.industry_id SEPARATOR ',') AS industryIds, 
//		           c.description AS description, 
//		           c.city_id AS cityId, 
//		           COALESCE(COUNT(DISTINCT j.post_id), 0) AS countJob 
//		    FROM company c 
//		    LEFT JOIN job_posts j ON c.user_id = j.company_id 
//		         AND j.is_approve = true 
//		         AND j.expire_date >= CURRENT_DATE 
//		    LEFT JOIN company_industries ci ON c.user_id = ci.company_id  
//		    WHERE (:title IS NULL OR LOWER(c.company_name) LIKE LOWER(CONCAT('%', :title, '%')) 
//		           OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%'))) 
//		          AND (:cityId IS NULL OR c.city_id = :cityId) 
//		          AND (:industryId IS NULL OR ci.industry_id = :industryId) 
//		    GROUP BY c.user_id, c.company_name, c.logo, c.description, c.city_id
//		    ORDER BY c.company_name ASC
//		""",
//		countQuery = """
//		    SELECT COUNT(DISTINCT c.user_id)
//		    FROM company c 
//		    LEFT JOIN company_industries ci ON c.user_id = ci.company_id  
//		    WHERE (:title IS NULL OR LOWER(c.company_name) LIKE LOWER(CONCAT('%', :title, '%')) 
//		           OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%'))) 
//		          AND (:cityId IS NULL OR c.city_id = :cityId) 
//		          AND (:industryId IS NULL OR ci.industry_id = :industryId)
//		""",
//		nativeQuery = true)
//		Page<CompanyWithCountJob> findCompaniesByFilters(
//		    @Param("title") String title, 
//		    @Param("cityId") Integer cityId,
//		    @Param("industryId") Integer industryId, 
//		    Pageable pageable
//		);

	@Query(value = """
		    SELECT
		        BIN_TO_UUID(c.user_id) AS companyId,
		        c.company_name AS companyName,
		        c.logo AS logo,
		        GROUP_CONCAT(DISTINCT ci_all.industry_id SEPARATOR ',') AS industryIds,
		        c.description AS description,
		        c.city_id AS cityId,
		        COALESCE(COUNT(DISTINCT j.post_id), 0) AS countJob,
		        COALESCE(AVG(r.star), 0.0) AS averageStar
		    FROM company c
		    -- Lọc industry để tìm công ty phù hợp
		    LEFT JOIN company_industries ci_filter ON c.user_id = ci_filter.company_id
		    -- Lấy tất cả industry của công ty để hiển thị
		    LEFT JOIN company_industries ci_all ON c.user_id = ci_all.company_id
		    LEFT JOIN job_posts j ON c.user_id = j.company_id
		        AND j.is_approve = true
		        AND j.expire_date >= CURRENT_DATE
		    LEFT JOIN review r ON c.user_id = r.company_id
		    WHERE
		        (:title IS NULL OR LOWER(c.company_name) LIKE LOWER(CONCAT('%', :title, '%'))
		         OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%')))
		        AND (:cityId IS NULL OR c.city_id = :cityId)
		        AND (:industryId IS NULL OR ci_filter.industry_id = :industryId)
		    GROUP BY c.user_id, c.company_name, c.logo, c.description, c.city_id
		    ORDER BY c.company_name ASC
		""", countQuery = """
		    SELECT COUNT(DISTINCT c.user_id)
		    FROM company c
		    LEFT JOIN company_industries ci_filter ON c.user_id = ci_filter.company_id
		    WHERE
		        (:title IS NULL OR LOWER(c.company_name) LIKE LOWER(CONCAT('%', :title, '%'))
		         OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%')))
		        AND (:cityId IS NULL OR c.city_id = :cityId)
		        AND (:industryId IS NULL OR ci_filter.industry_id = :industryId)
		""", nativeQuery = true)
		Page<CompanyWithCountJob> findCompaniesByFilters(@Param("title") String title, @Param("cityId") Integer cityId,
		        @Param("industryId") Integer industryId, Pageable pageable);
	
//	@Query("SELECT new com.job_portal.DTO.CompanyWithCountJobDTO(c.companyId, c.companyName, i.industryId, c.description, i.industryName, c.city.cityId, COUNT(j)) "
//			+ "FROM Company c " + "JOIN c.jobPosts j " + "JOIN c.industry i " + "WHERE j.isApprove = true "
//			+ "GROUP BY c.companyId, c.companyName, c.description, i.industryName")
//	Page<CompanyWithCountJobDTO> findCompanyWithCountJob(Specification<Company> spec, Pageable pageable);

//	@Query("SELECT new com.job_portal.DTO.CompanyWithCountJobDTO(c.companyId, c.companyName, c.logo, i.industryId, "
//			+ "c.description, i.industryName, c.city.cityId, COUNT(j)) " + "FROM Company c "
//			+ "LEFT JOIN c.jobPosts j ON j.isApprove = true AND j.expireDate >= CURRENT_DATE " + // Dùng LEFT JOIN với
//																									// điều kiện
//			"JOIN c.industry i "
//			+ "WHERE (:title IS NULL OR (LOWER(c.companyName) LIKE LOWER(CONCAT('%', :title, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%')))) "
//			+ "AND (:cityId IS NULL OR c.city.cityId = :cityId) "
//			+ "AND (:industryId IS NULL OR i.industryId = :industryId) "
//			+ "GROUP BY c.companyId, c.companyName, c.logo, c.description, i.industryId, i.industryName, c.city.cityId")
//	Page<CompanyWithCountJobDTO> findCompaniesByFilters(@Param("title") String title, @Param("cityId") Integer cityId,
//			@Param("industryId") Integer industryId, Pageable pageable);

	@Query("SELECT new com.job_portal.DTO.FollowCompanyDTO(c.companyId, c.logo, c.companyName) " + "FROM Company c "
			+ "JOIN c.follows s " + "WHERE s.userId = :seekerId")
	List<FollowCompanyDTO> findCompaniesFollowedBySeeker(@Param("seekerId") UUID seekerId);

	@Query("""
		    SELECT DISTINCT c FROM Company c 
		    LEFT JOIN c.industry i 
		    WHERE (:companyName IS NULL OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :companyName, '%'))) 
		    AND (:industryName IS NULL OR :industryName = '' OR LOWER(i.industryName) LIKE LOWER(CONCAT('%', :industryName, '%'))) 
		    ORDER BY c.companyName ASC
		    """)
		Page<Company> findCompaniesWithFilters(
		    @Param("companyName") String companyName,
		    @Param("industryName") String industryName,
		    Pageable pageable
		);

	@Query("SELECT new com.job_portal.DTO.CompanyWithAverageStarDTO(" +
	           "c.companyId, c.companyName, AVG(r.star)) " +
	           "FROM Company c LEFT JOIN c.reviews r " +
	           "GROUP BY c.companyId, c.companyName")
	    List<CompanyWithAverageStarDTO> findCompaniesWithAverageStar();
	
	@Query("SELECT COUNT(c) FROM Company c WHERE DATE(c.userAccount.createDate) = :date")
	long countNewCompaniesByDate(@Param("date") LocalDate date);

	@Query("SELECT COUNT(c) FROM Company c WHERE DATE(c.userAccount.createDate) >= :startDate AND DATE(c.userAccount.createDate) < :endDate")
	long countNewCompaniesByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

}
