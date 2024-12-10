package com.job_portal.repository;

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
import com.job_portal.DTO.CompanyWithCountJobDTO;
import com.job_portal.DTO.FollowCompanyDTO;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;

public interface CompanyRepository extends JpaRepository<Company, UUID>, JpaSpecificationExecutor<Company> {

	@Query("SELECT c FROM Company c WHERE c.companyName LIKE %:companyName%")
	List<Company> findCompanyByCompanyName(@Param("companyName") String companyName);

	@Query("SELECT c FROM Company c WHERE c.companyId = :companyId")
	Optional<Company> findCompanyByCompanyId(@Param("companyId") UUID companyId);
	
	@Query("SELECT c FROM Company c JOIN c.jobPosts jp WHERE jp.postId = :postId")
    Optional<Company> findCompanyByPostId(@Param("postId") UUID postId);

	@Query("SELECT c FROM Company c WHERE c.city.cityName LIKE %:cityName%")
	List<Company> findCompaniesByCityName(@Param("cityName") String cityName);

	@Query("SELECT c FROM Company c WHERE c.industry.industryName LIKE %:industryName%")
	List<Company> findCompaniesByIndustryName(@Param("industryName") String industryName);

	@Query("SELECT c FROM Company c WHERE c.industry.industryId = :industryId")
	List<Company> findTop6CompaniesByIndustryId(@Param("industryId") Integer industryId);

	@Query("SELECT new com.job_portal.DTO.CompanyDTO(" + "c.companyId, " + "c.companyName, " + "COUNT(a.postId), "
			+ "c.industry.industryId, " + "c.city.cityId, " + "c.address, " + "c.description, " + "c.logo, "
			+ "c.contact, " + "c.email, " + "c.establishedTime, c.taxCode) " + "FROM Company c "
			+ "LEFT JOIN c.jobPosts jp " + "LEFT JOIN ApplyJob a ON jp.postId = a.jobPost.postId "
			+ "WHERE (a.isSave = true OR a.postId IS NULL) "
			+ "AND (jp.isApprove = true AND jp.expireDate >= CURRENT_DATE) " + "GROUP BY c.companyId, c.companyName, "
			+ "c.industry.industryId, " + "c.city.cityId, " + "c.address, " + "c.description, " + "c.logo, "
			+ "c.contact, " + "c.email, " + "c.establishedTime, c.taxCode " + "ORDER BY COUNT(a.postId) DESC")
	List<CompanyDTO> findCompaniesWithSavedApplications();

//	@Query("SELECT new com.job_portal.DTO.CompanyWithCountJobDTO(c.companyId, c.companyName, i.industryId, c.description, i.industryName, c.city.cityId, COUNT(j)) "
//			+ "FROM Company c " + "JOIN c.jobPosts j " + "JOIN c.industry i " + "WHERE j.isApprove = true "
//			+ "GROUP BY c.companyId, c.companyName, c.description, i.industryName")
//	Page<CompanyWithCountJobDTO> findCompanyWithCountJob(Specification<Company> spec, Pageable pageable);

	@Query("SELECT new com.job_portal.DTO.CompanyWithCountJobDTO(c.companyId, c.companyName, c.logo, i.industryId, "
			+ "c.description, i.industryName, c.city.cityId, COUNT(j)) " + "FROM Company c "
			+ "LEFT JOIN c.jobPosts j ON j.isApprove = true AND j.expireDate >= CURRENT_DATE " + // Dùng LEFT JOIN với
																									// điều kiện
			"JOIN c.industry i "
			+ "WHERE (:title IS NULL OR (LOWER(c.companyName) LIKE LOWER(CONCAT('%', :title, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%')))) "
			+ "AND (:cityId IS NULL OR c.city.cityId = :cityId) "
			+ "AND (:industryId IS NULL OR i.industryId = :industryId) "
			+ "GROUP BY c.companyId, c.companyName, c.logo, c.description, i.industryId, i.industryName, c.city.cityId")
	Page<CompanyWithCountJobDTO> findCompaniesByFilters(@Param("title") String title, @Param("cityId") Integer cityId,
			@Param("industryId") Integer industryId, Pageable pageable);

	@Query("SELECT new com.job_portal.DTO.FollowCompanyDTO(c.companyId, c.logo, c.companyName) " + "FROM Company c "
			+ "JOIN c.follows s " + "WHERE s.userId = :seekerId")
	List<FollowCompanyDTO> findCompaniesFollowedBySeeker(@Param("seekerId") UUID seekerId);

	@Query("SELECT c " + "FROM Company c " + "JOIN c.industry i "
			+ "WHERE (:companyName IS NULL OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :companyName, '%'))) "
			+ "AND (:industryName IS NULL OR LOWER(i.industryName) LIKE LOWER(CONCAT('%', :industryName, '%'))) "
			+ "ORDER BY c.companyName ASC")
	Page<Company> findCompaniesWithFilters(@Param("companyName") String companyName,
			@Param("industryName") String industryName, Pageable pageable);

}
