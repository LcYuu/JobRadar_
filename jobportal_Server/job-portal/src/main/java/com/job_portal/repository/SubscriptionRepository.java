package com.job_portal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.models.CV;
import com.job_portal.models.Subscription;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
	@Query("SELECT s FROM Subscription s WHERE s.seeker.userId = :userId")
	Subscription findSubscriptionBySeekerId(@Param("userId") UUID userId);
    
}
