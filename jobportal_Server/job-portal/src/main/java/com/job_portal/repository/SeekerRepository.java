package com.job_portal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.DTO.ApplicantProfileDTO;
import com.job_portal.DTO.FollowSeekerDTO;
import com.job_portal.models.Company;
import com.job_portal.models.Seeker;

public interface SeekerRepository extends JpaRepository<Seeker, UUID> {

	public Optional<Seeker> findById(UUID userId);

	@Query("SELECT s FROM Seeker s WHERE s.userAccount.userName LIKE %:userName%")
	public List<Seeker> findSeekerByUserName(@Param("userName") String userName);

	@Query("SELECT s FROM Seeker s WHERE s.industry.industryName LIKE %:industryName%")
	public List<Seeker> findSeekerByIndustryName(@Param("industryName") String industryName);

	@Query("SELECT new com.job_portal.DTO.ApplicantProfileDTO("
			+ "p.postId, sp.userId, sp.address, sp.dateOfBirth, sp.description, sp.emailContact, sp.gender, "
			+ "sp.phoneNumber, a.applyDate, a.pathCV, a.fullName, c.companyId, ua.avatar, p.typeOfWork, p.title, i.industryName) "
			+ "FROM Seeker sp " + "JOIN ApplyJob a ON a.seeker.userId = sp.userId " + // Sử dụng WHERE trong điều kiện
																						// join
			"JOIN a.jobPost p " + "JOIN p.company c " + "JOIN c.industry i " + "JOIN sp.userAccount ua "
			+ "WHERE sp.userId = :userId " + "AND p.postId = :postId")
	ApplicantProfileDTO findCandidateDetails(@Param("userId") UUID userId, @Param("postId") UUID postId);

	@Query("SELECT new com.job_portal.DTO.FollowSeekerDTO(s.userId, s.userAccount.userName) "
			+ "FROM Company c " + "JOIN c.follows s " + "WHERE c.companyId = :companyId")
	List<FollowSeekerDTO> findSeekersFollowingCompany(@Param("companyId") UUID companyId);
}
