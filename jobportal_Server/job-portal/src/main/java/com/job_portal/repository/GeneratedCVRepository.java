package com.job_portal.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.job_portal.models.GeneratedCV;

public interface GeneratedCVRepository extends JpaRepository<GeneratedCV, Integer> {

	@Query("SELECT c FROM GeneratedCV c WHERE c.seeker.userId = :userId")
	List<GeneratedCV> findGenCVBySeekerId(@Param("userId") UUID userId);
}
