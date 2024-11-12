package com.job_portal.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.models.ApplyJob;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.Seeker;
import com.job_portal.repository.ApplyJobRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.SeekerRepository;
import com.social.exceptions.AllExceptions;

@Service
public class ApplyJobServiceImpl implements IApplyJobService {

	@Autowired
	ApplyJobRepository applyJobRepository;
	@Autowired
	JobPostRepository jobPostRepository;
	@Autowired
	SeekerRepository seekerRepository;

	@Override
	public boolean createApplyJob(ApplyJob applyJob) throws AllExceptions {
		ApplyJob saveApplyJob = applyJobRepository.save(applyJob);
		return saveApplyJob != null;
	}

	@Override
	public boolean updateApplyJob(ApplyJob applyJob) throws AllExceptions {
		// Kiểm tra tồn tại của JobPosts và SeekerProfile
		Optional<JobPost> jobPost = jobPostRepository.findById(applyJob.getPostId());
		Optional<Seeker> seeker = seekerRepository.findById(applyJob.getUserId());
		try {
			ApplyJob saveApplyJob = applyJobRepository.save(applyJob);
			return saveApplyJob != null;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public boolean isEligibleForRating(UUID userId, UUID companyId) {
		return applyJobRepository.existsByUserIdAndCompanyId(userId, companyId);
	}

	@Override
	public boolean hasApplied(UUID postId, UUID userId) {
		 return applyJobRepository.existsByPostIdAndUserId(postId, userId);
	}

}
