package com.job_portal.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.models.UserAccount;

import jakarta.transaction.Transactional;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
	public Optional<UserAccount> findByEmail(String email);

	public Optional<UserAccount> findById(UUID userId);

	@Query("SELECT u FROM UserAccount u WHERE u.userName LIKE %:query% OR u.email LIKE %:query%")
	public List<UserAccount> searchUser(@Param("query") String query);

	@Transactional
	@Modifying
	@Query("UPDATE UserAccount u SET u.password = :password WHERE u.email = :email")
	void updatePassword(@Param("email") String email, @Param("password") String password);

	@Query(value = "SELECT create_date as date, COUNT(user_id) as count " +
	       "FROM user_account " +
	       "WHERE create_date BETWEEN :startDate AND :endDate " +
	       "GROUP BY create_date " +
	       "ORDER BY date", nativeQuery = true)
	List<Object[]> countNewAccountsPerDay(
	    @Param("startDate") LocalDateTime startDate,
	    @Param("endDate") LocalDateTime endDate
	);

	@Query("SELECT COUNT(u) FROM UserAccount u WHERE DATE(u.createDate) BETWEEN :startDate AND :endDate")
	long countByCreatedAtBetween(
	    @Param("startDate") LocalDate startDate,
	    @Param("endDate") LocalDate endDate
	);

	Page<UserAccount> findByUserNameContainingOrEmailContainingIgnoreCase(
        String userName, String email, Pageable pageable);
    
    Page<UserAccount> findByUserType_UserTypeId(Integer userTypeId, Pageable pageable);
    
    Page<UserAccount> findByIsActive(boolean isActive, Pageable pageable);
    
    Page<UserAccount> findByUserType_UserTypeIdAndIsActive(Integer userTypeId, boolean isActive, Pageable pageable);

	@Query("SELECT ua FROM UserAccount ua WHERE " + "(:userName IS NULL OR ua.userName LIKE %:userName%) AND "
			+ "(:userTypeId IS NULL OR ua.userType.userTypeId = :userTypeId) AND "
			+ "(:isActive IS NULL OR ua.isActive = :isActive)")
	Page<UserAccount> searchUserAccounts(@Param("userName") String userName, @Param("userTypeId") Integer userTypeId,
			@Param("isActive") Boolean isActive, Pageable pageable);

}
