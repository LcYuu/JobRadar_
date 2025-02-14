package com.job_portal.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.enums.SocialPlatform;
import com.job_portal.enums.UserType;
import com.job_portal.models.Education;
import com.job_portal.models.Seeker;
import com.job_portal.models.SocialLink;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.SocialLinkRepository;
import com.job_portal.repository.UserAccountRepository;
import com.social.exceptions.AllExceptions;

@Service
public class SocialLinkServiceImpl implements ISocialLinkService{

	@Autowired
	private UserAccountRepository userAccountRepository;
	
	@Autowired
	private SocialLinkRepository socialLinkRepository;
	@Override
	public List<SocialLink> getSocialLinksByUserId(UUID userId) {
		return socialLinkRepository.findByUserId(userId);
	}

	@Override
	public boolean createSocialLink(SocialLink socialLink, UUID userId) {
		Optional<UserAccount> userAccount = userAccountRepository.findById(userId);
		UserAccount newUserAccount =  userAccount.get();
		SocialLink newSocialLink = new SocialLink();
		SocialPlatform platform = SocialPlatform.valueOf(socialLink.getPlatform().toString());
        newSocialLink.setPlatform(platform);
		if(newUserAccount.getUserType().getUser_type_name().equalsIgnoreCase("Seeker"))
			newSocialLink.setType(UserType.SEEKER);
		else
			newSocialLink.setType(UserType.EMPLOYER);
		newSocialLink.setUrl(socialLink.getUrl());
		newSocialLink.setUserId(userId);
		try {
			SocialLink saveSocialLink = socialLinkRepository.save(newSocialLink);
			return saveSocialLink != null;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public boolean deleteSocialLink(Long id) throws AllExceptions {
		Optional<SocialLink> socialLink = socialLinkRepository.findById(id);
		socialLinkRepository.delete(socialLink.get());
		return true;
	}

	@Override
	public boolean updateSocialLink(SocialLink socialLink, Long id, UUID userId) throws AllExceptions {
		Optional<SocialLink> existingSocialLink = socialLinkRepository.findById(id);

		SocialLink oldSocialLink = existingSocialLink.get();
		boolean isUpdated = false;

		if (socialLink.getPlatform() != null) {
			oldSocialLink.setPlatform(socialLink.getPlatform());
			isUpdated = true;
		}
		if (socialLink.getUrl() != null) {
			oldSocialLink.setUrl(socialLink.getUrl());
			isUpdated = true;
		}

		if (isUpdated) {
			socialLinkRepository.save(oldSocialLink);
		}
		return isUpdated;
	}

	@Override
	public List<String> getAllPlatformNames() {
		 return Arrays.stream(SocialPlatform.values())
                 .map(SocialPlatform::getDisplayName)
                 .collect(Collectors.toList());
	}
	
}
