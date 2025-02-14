package com.job_portal.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.job_portal.enums.UserType;
import com.job_portal.models.SocialLink;

public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
	List<SocialLink> findByType(UserType type);

	List<SocialLink> findByUserId(UUID userId);
}
