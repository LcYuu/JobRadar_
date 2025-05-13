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
		try {
			// Tìm kiếm ApplyJob hiện có dựa trên postId và userId
			Optional<ApplyJob> existingApplyJob = applyJobRepository.findByPostIdAndUserId(
					applyJob.getPostId(), applyJob.getUserId());
			
			// Nếu không tìm thấy, trả về false
			if (existingApplyJob.isEmpty()) {
				System.err.println("Không tìm thấy đơn apply với postId: " + applyJob.getPostId() + 
						" và userId: " + applyJob.getUserId());
				return false;
			}
			
			// Kiểm tra tồn tại của JobPosts và SeekerProfile
			Optional<JobPost> jobPost = jobPostRepository.findById(applyJob.getPostId());
			Optional<Seeker> seeker = seekerRepository.findById(applyJob.getUserId());
			
			if (jobPost.isEmpty() || seeker.isEmpty()) {
				System.err.println("Không tìm thấy thông tin công việc hoặc người dùng");
				return false;
			}
			
			// Sao chép thuộc tính từ đối tượng mới sang đối tượng hiện có
			ApplyJob updateApplyJob = existingApplyJob.get();
			updateApplyJob.setFullName(applyJob.getFullName());
			updateApplyJob.setEmail(applyJob.getEmail());
			updateApplyJob.setDescription(applyJob.getDescription());
			updateApplyJob.setPathCV(applyJob.getPathCV());
			
			// Cập nhật thời gian mới nhất khi sửa đơn
			updateApplyJob.setApplyDate(java.time.LocalDateTime.now());
			
			// Lưu lại đối tượng đã cập nhật
			ApplyJob savedApplyJob = applyJobRepository.save(updateApplyJob);
			return savedApplyJob != null;
		} catch (Exception e) {
			System.err.println("Lỗi khi cập nhật đơn apply: " + e.getMessage());
			e.printStackTrace();
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

	@Override
	public void updateMatchingScore(UUID postId, UUID userId, Double matchingScore) throws AllExceptions {
		// Tìm đơn ứng tuyển
		Optional<ApplyJob> applyJobOpt = applyJobRepository.findByPostIdAndUserId(postId, userId);

		if (applyJobOpt.isPresent()) {
			ApplyJob applyJob = applyJobOpt.get();
			// Cập nhật điểm phù hợp
			applyJob.setMatchingScore(matchingScore);
			applyJobRepository.save(applyJob);
		} else {
			throw new RuntimeException("Apply job not found for postId: " + postId + " and userId: " + userId);
		}
	}

	@Override
	public void updateFullAnalysisResult(UUID postId, UUID userId, Double matchingScore, String analysisResult) throws AllExceptions {
		// Tìm đơn ứng tuyển
		Optional<ApplyJob> applyJobOpt = applyJobRepository.findByPostIdAndUserId(postId, userId);

		if (applyJobOpt.isPresent()) {
			ApplyJob applyJob = applyJobOpt.get();
			// Cập nhật điểm phù hợp và kết quả phân tích chi tiết
			applyJob.setMatchingScore(matchingScore);
			applyJob.setAnalysisResult(analysisResult);
			applyJobRepository.save(applyJob);
		} else {
			throw new RuntimeException("Apply job not found for postId: " + postId + " and userId: " + userId);
		}
	}

	@Override
	public String getAnalysisResult(UUID postId, UUID userId) throws AllExceptions {
		Optional<ApplyJob> applyJobOpt = applyJobRepository.findByPostIdAndUserId(postId, userId);

		if (applyJobOpt.isPresent()) {
			ApplyJob applyJob = applyJobOpt.get();
			return applyJob.getAnalysisResult();
		} else {
			throw new RuntimeException("Apply job not found for postId: " + postId + " and userId: " + userId);
		}

	}

}
