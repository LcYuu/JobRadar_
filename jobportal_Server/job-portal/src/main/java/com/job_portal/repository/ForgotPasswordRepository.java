package com.job_portal.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.models.ForgotPassword;
import com.job_portal.models.UserAccount;

import jakarta.transaction.Transactional;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Integer> {
	@Modifying
    @Transactional
    @Query("DELETE FROM ForgotPassword fp WHERE fp.userAccount.email = :email")
    void deleteByUserAccountEmail(@Param("email") String email);

	 Optional<ForgotPassword> findByOtpAndUserAccount(String otp, UserAccount userAccount);
	 List<ForgotPassword> findByExpirationTimeBefore(LocalDateTime now);
}
