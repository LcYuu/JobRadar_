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
import com.job_portal.projection.ApplicantProfileProjection;

public interface SeekerRepository extends JpaRepository<Seeker, UUID> {

	public Optional<Seeker> findById(UUID userId);

	@Query(value = """
		    SELECT 
		        BIN_TO_UUID(p.post_id) AS postId, 
		        BIN_TO_UUID(sp.user_id) AS userId, 
		        sp.address AS address, 
		        sp.date_of_birth AS dateOfBirth, 
		        sp.description AS description, 
		        sp.email_contact AS emailContact, 
		        sp.gender AS gender, 
		        sp.phone_number AS phoneNumber, 
		        a.apply_date AS applyDate, 
		        a.path_cv AS pathCV, 
		        a.full_name AS fullName, 
		        BIN_TO_UUID(c.user_id) AS companyId, 
		        ua.avatar AS avatar, 
		        p.type_of_work AS typeOfWork, 
		        p.title AS title, 
		        GROUP_CONCAT(i.industry_name SEPARATOR ', ') AS industryName
		    FROM seeker_profile sp 
		    JOIN apply_job a ON a.user_id = sp.user_id
		    JOIN job_posts p ON a.post_id = p.post_id
		    JOIN company c ON p.company_id = c.user_id
		    JOIN seeker_industries si ON si.user_id = sp.user_id
		    JOIN industry i ON si.industry_id = i.industry_id
		    JOIN user_account ua ON sp.user_id = ua.user_id
		    WHERE sp.user_id = UUID_TO_BIN(:userId) 
		    AND p.post_id = UUID_TO_BIN(:postId)
		    GROUP BY p.post_id, sp.user_id, sp.address, sp.date_of_birth, sp.description, 
		             sp.email_contact, sp.gender, sp.phone_number, a.apply_date, a.path_cv, 
		             a.full_name, c.user_id, ua.avatar, p.type_of_work, p.title
		    """, nativeQuery = true)
		ApplicantProfileProjection findCandidateDetails(@Param("userId") String userId, @Param("postId") String postId);

	@Query("SELECT new com.job_portal.DTO.FollowSeekerDTO(s.userId, s.userAccount.userName) "
			+ "FROM Company c " + "JOIN c.follows s " + "WHERE c.companyId = :companyId")
	List<FollowSeekerDTO> findSeekersFollowingCompany(@Param("companyId") UUID companyId);
}
