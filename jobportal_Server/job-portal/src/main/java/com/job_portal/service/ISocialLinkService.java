package com.job_portal.service;

import java.util.List;
import java.util.UUID;

import com.job_portal.models.SocialLink;
import com.social.exceptions.AllExceptions;

public interface ISocialLinkService {
	public List<SocialLink> getSocialLinksByUserId(UUID userId);
	
	public boolean createSocialLink(SocialLink socialLink, UUID userId);
	public boolean deleteSocialLink(Long id) throws AllExceptions;
	public boolean updateSocialLink(SocialLink socialLink,Long id, UUID userId) throws AllExceptions;
	public List<String> getAllPlatformNames();
}
