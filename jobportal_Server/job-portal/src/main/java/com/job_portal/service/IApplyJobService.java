package com.job_portal.service;

import java.util.UUID;

import com.job_portal.models.ApplyJob;
import com.social.exceptions.AllExceptions;

public interface IApplyJobService {
	public boolean createApplyJob(ApplyJob applyJob) throws AllExceptions;
	public boolean updateApplyJob(ApplyJob applyJob) throws AllExceptions;
	public boolean isEligibleForRating(UUID userId, UUID companyId);
	public boolean hasApplied(UUID postId, UUID userId);
}
