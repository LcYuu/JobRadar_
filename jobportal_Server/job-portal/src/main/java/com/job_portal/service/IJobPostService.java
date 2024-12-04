package com.job_portal.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.job_portal.DTO.DailyJobCount;
import com.job_portal.DTO.JobCountType;
import com.job_portal.DTO.JobPostDTO;
import com.job_portal.DTO.JobWithApplicationCountDTO;
import com.job_portal.models.JobPost;
import com.social.exceptions.AllExceptions;

public interface IJobPostService {
	public boolean createJob(JobPostDTO jobPostDTO, UUID companyId);
	public boolean deleteJob(UUID postId) throws AllExceptions;
	public boolean updateJob(JobPostDTO jobPost, UUID postId) throws AllExceptions;	
	public List<JobPost> searchJobByJobName(String title, UUID userId) throws AllExceptions;
	public List<JobPost> searchJobByExperience(String experience) throws AllExceptions;
	public Page<JobPost> findJobByCompanyId(UUID companyId, int page, int size);
//	public List<JobPost> findBySalaryGreaterThanEqual(Long minSalary) throws AllExceptions;
//	public List<JobPost> findBySalaryLessThanEqual(Long maxSalary) throws AllExceptions;
//	public List<JobPost> findBySalaryBetween(Long minSalary, Long maxSalary) throws AllExceptions;
	public boolean approveJob(UUID postId);
	public JobPost searchJobByPostId(UUID postId) throws AllExceptions;
	public List<DailyJobCount> getDailyJobPostCounts(LocalDateTime startDate, LocalDateTime endDate);
	public Page<JobPost>findByIsApprove(Pageable pageable);
	public void exportJobPostToCSV(String filePath) throws IOException;
	public List<JobPost> getTop8LatestJobPosts();
	public List<JobCountType> getJobCountByType();
	public Page<JobPost> searchJobsWithPagination(String title, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, Pageable pageable);
	public Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable);
	public Page<JobWithApplicationCountDTO> getTop5JobsWithApplications(UUID companyId, int page, int size);
	public Page<JobPost> findJobsByCompany(UUID companyId, Pageable pageable);
	public Page<JobPost> findApprovedJobsByCompany(UUID companyId, Pageable pageable);
	public Map<String, Long> countAllJobsByCompany(UUID companyId);
	public List<Map<String, Object>> getCompanyJobStats(UUID companyId, LocalDateTime startDate, LocalDateTime endDate);
	List<JobPost> getSimilarJobsByIndustry(Integer industryId, UUID jobPostId);
	public void updateExpiredJobs();
	public boolean canPostJob(UUID companyId);
}