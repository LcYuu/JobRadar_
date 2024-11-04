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
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;

public interface CompanyRepository extends JpaRepository<Company, UUID>, JpaSpecificationExecutor<Company>{

	@Query("SELECT c FROM Company c WHERE c.companyName LIKE %:companyName%")
	List<Company> findCompanyByCompanyName(@Param("companyName") String companyName);

	@Query("SELECT c FROM Company c WHERE c.companyId = :companyId")
	Optional<Company> findCompanyByCompanyId(@Param("companyId") UUID companyId);

	@Query("SELECT c FROM Company c WHERE c.city.cityName LIKE %:cityName%")
	List<Company> findCompaniesByCityName(@Param("cityName") String cityName);

	@Query("SELECT c FROM Company c WHERE c.industry.industryName LIKE %:industryName%")
	List<Company> findCompaniesByIndustryName(@Param("industryName") String industryName);

	@Query("SELECT c FROM Company c WHERE c.industry.industryId = :industryId")
	List<Company> findTop6CompaniesByIndustryId(@Param("industryId") Integer industryId);
	
	@Query("SELECT new com.job_portal.DTO.CompanyDTO(" + "c.companyName, " + // Lấy userId từ UserAccount
			"COUNT(a.postId), " + // Đếm số lượng đơn ứng tuyển
			"c.industry.industryId, " + "c.city.cityId, " + "c.address, " + "c.description, " + "c.logo, "
			+ "c.contact, " + "c.email, " + "c.establishedTime) " + "FROM Company c " + "LEFT JOIN c.jobPosts jp " + // Kết
																														// nối																				// ty
			"LEFT JOIN ApplyJob a ON jp.postId = a.jobPost.postId " + // Kết nối với đơn ứng tuyển
			"WHERE a.isSave = true OR a.postId IS NULL " + // Cho phép kết quả NULL
			"GROUP BY c.companyName, " + // Sử dụng userId từ UserAccount
			"c.industry.industryId, " + "c.city.cityId, " + "c.address, " + "c.description, " + "c.logo, "
			+ "c.contact, " + "c.email, " + "c.establishedTime " + "ORDER BY COUNT(a.postId) DESC") // Sắp xếp giảm dần
																									// theo số lượng đơn
																									// ứng tuyển
	List<CompanyDTO> findCompaniesWithSavedApplications();

//	@Query("SELECT new com.job_portal.DTO.CompanyWithCountJobDTO(c.companyId, c.companyName, i.industryId, c.description, i.industryName, c.city.cityId, COUNT(j)) "
//			+ "FROM Company c " + "JOIN c.jobPosts j " + "JOIN c.industry i " + "WHERE j.isApprove = true "
//			+ "GROUP BY c.companyId, c.companyName, c.description, i.industryName")
//	Page<CompanyWithCountJobDTO> findCompanyWithCountJob(Specification<Company> spec, Pageable pageable);
	
	@Query("SELECT new com.job_portal.DTO.CompanyWithCountJobDTO(c.companyId, c.companyName,c.logo, i.industryId, c.description, i.industryName, c.city.cityId, COUNT(j)) "
		     + "FROM Company c "
		     + "JOIN c.jobPosts j "
		     + "JOIN c.industry i "
		     + "WHERE j.isApprove = true "
		     + "AND (:title IS NULL OR (LOWER(c.companyName) LIKE LOWER(CONCAT('%', :title, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :title, '%')))) "
		     + "AND (:cityId IS NULL OR c.city.id = :cityId) "
		     + "AND (:industryId IS NULL OR i.industryId = :industryId) "
		     + "GROUP BY c.companyId, c.companyName, c.description, i.industryName")
		Page<CompanyWithCountJobDTO> findCompaniesByFilters(@Param("title") String title,
		                                                    @Param("cityId") Integer cityId,
		                                                    @Param("industryId") Integer industryId,
		                                                    Pageable pageable);


}
