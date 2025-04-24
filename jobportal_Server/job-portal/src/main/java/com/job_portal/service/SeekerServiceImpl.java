package com.job_portal.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.SeekerDTO;
import com.job_portal.models.Industry;
import com.job_portal.models.Seeker;
import com.job_portal.models.Skills;
import com.job_portal.models.SocialLink;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.SkillRepository;
import com.job_portal.repository.UserAccountRepository;
import com.social.exceptions.AllExceptions;

@Service
public class SeekerServiceImpl implements ISeekerService {

	@Autowired
	private SeekerRepository seekerRepository;

	@Autowired
	private IndustryRepository industryRepository;

	@Autowired
	private SkillRepository skillRepository;

	@Autowired
	private UserAccountRepository accountRepository;

	@Override
	public boolean deleteSeeker(UUID userId) throws AllExceptions {
		Optional<Seeker> seeker = seekerRepository.findById(userId);

		if (seeker.isEmpty()) {
			throw new AllExceptions("Seeker not exist with id: " + userId);
		}

		seekerRepository.delete(seeker.get());
		return true;
	}

	@Override
	public boolean updateSeeker(SeekerDTO seekerDTO, UUID userId) throws AllExceptions {
	    // Tìm kiếm Seeker theo id
	    Optional<Seeker> existingSeekerOpt = seekerRepository.findById(userId);

	    // Lấy đối tượng Seeker cũ
	    Seeker oldSeeker = existingSeekerOpt.get();
	    boolean isUpdated = false;

	    // Cập nhật các trường cơ bản
	    if (seekerDTO.getAddress() != null) {
	        oldSeeker.setAddress(seekerDTO.getAddress());
	        isUpdated = true;
	    }
	    if (seekerDTO.getGender() != null) {
	        oldSeeker.setGender(seekerDTO.getGender());
	        isUpdated = true;
	    }
	    if (seekerDTO.getDateOfBirth() != null) {
	        oldSeeker.setDateOfBirth(seekerDTO.getDateOfBirth());
	        isUpdated = true;
	    }
	    if (seekerDTO.getPhoneNumber() != null) {
	        oldSeeker.setPhoneNumber(seekerDTO.getPhoneNumber());
	        isUpdated = true;
	    }
	    if (seekerDTO.getDescription() != null) {
	        oldSeeker.setDescription(seekerDTO.getDescription());
	        isUpdated = true;
	    }
	    if (seekerDTO.getEmailContact() != null) {
	        oldSeeker.setEmailContact(seekerDTO.getEmailContact());
	        isUpdated = true;
	    }

	    if (seekerDTO.getIndustryIds() != null && !seekerDTO.getIndustryIds().isEmpty()) {
	        List<Industry> industriesList = new ArrayList<>();
	        for (Integer industryId : seekerDTO.getIndustryIds()) {
	            Optional<Industry> industryOpt = industryRepository.findById(industryId);
	            industryOpt.ifPresent(industriesList::add);
	        }
	        // Only update if the new list is different from the old one
	        if (!industriesList.equals(oldSeeker.getIndustry())) {
	            oldSeeker.setIndustry(industriesList);
	            isUpdated = true;
	        }
	    }

	    // Cập nhật danh sách kỹ năng
	    if (seekerDTO.getSkillIds() != null && !seekerDTO.getSkillIds().isEmpty()) {
	        List<Skills> skillsList = new ArrayList<>();
	        for (Integer skillId : seekerDTO.getSkillIds()) {
	            Optional<Skills> skillOpt = skillRepository.findById(skillId);
	            skillOpt.ifPresent(skillsList::add);
	        }
	        oldSeeker.setSkills(skillsList);
	        isUpdated = true;
	    }

	    if (isUpdated) {
	        seekerRepository.save(oldSeeker);
	    }

	    return isUpdated;
	}

	@Override
	public Seeker findSeekerById(UUID userId) throws AllExceptions {
		try {
			Optional<Seeker> seeker = seekerRepository.findById(userId);
			return seeker.get();
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

}
