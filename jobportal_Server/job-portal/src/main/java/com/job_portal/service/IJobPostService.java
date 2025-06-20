package com.job_portal.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.job_portal.DTO.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.job_portal.models.JobPost;
import com.social.exceptions.AllExceptions;

public interface IJobPostService {
	public JobPost createJob(JobPostDTO jobPostDTO, UUID companyId);
	public boolean deleteJob(UUID postId) throws AllExceptions;
	public JobPost updateJob(JobPostDTO jobPost, UUID postId) throws AllExceptions;	
//	public List<JobPost> searchJobByJobName(String title, UUID userId) throws AllExceptions;
//	public List<JobPost> searchJobByExperience(String experience) throws AllExceptions;
	public Page<JobPost> findJobByCompanyId(UUID companyId, int page, int size);
//	public List<JobPost> findBySalaryGreaterThanEqual(Long minSalary) throws AllExceptions;
//	public List<JobPost> findBySalaryLessThanEqual(Long maxSalary) throws AllExceptions;
//	public List<JobPost> findBySalaryBetween(Long minSalary, Long maxSalary) throws AllExceptions;
	public boolean approveJob(UUID postId);
	public JobPost searchJobByPostId(UUID postId) throws AllExceptions;
	public List<DailyJobCount> getDailyJobPostCounts(LocalDateTime startDate, LocalDateTime endDate);
	public Page<JobPostApproveDTO> findByIsApprove(Pageable pageable);
	public Page<JobPost> findAllJobApprove(Pageable pageable);
	public void exportJobPostToCSV(String filePath) throws IOException;
	public List<JobPostApproveDTO> getTop8LatestJobPosts();
	public List<JobCountType> getJobCountByType();
	public Page<JobPost> searchJobsWithPagination(String title, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, Pageable pageable);
//	public Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable);
//	public Page<JobWithApplicationCountDTO> getTop5JobsWithApplications(UUID companyId, int page, int size);
	public Page<JobPost> findJobsByCompany(UUID companyId, Pageable pageable);
	public List<JobPost> findAllJobsByCompany(UUID companyId);
	public Page<JobPost> findApprovedJobsByCompany(UUID companyId, Pageable pageable);
	public Map<String, Long> countAllJobsByCompany(UUID companyId);
	public List<Map<String, Object>> getCompanyJobStats(UUID companyId, LocalDateTime startDate, LocalDateTime endDate);
	public List<JobPost> getSimilarJobsByIndustry(List<Integer> industryIds, UUID excludePostId);
	public void updateExpiredJobs();
	public boolean canPostJob(UUID companyId);
	public void increaseViewCount(UUID postId);
	
	// Thêm phương thức mới để tăng lượt xem với kiểm tra người dùng
	public boolean increaseViewCountWithUserCheck(UUID postId, UUID userId, String userRole);
	
//	public Page<JobWithApplicationCountDTO> getJobsWithFiltersAndSorting(String title, List<String> selectedTypesOfWork, Long minSalary,
//			Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, Pageable pageable);
	public Page<JobPost> searchJobs(String title, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, int page, int size);
	Map<String, List<CandidateWithScoreDTO>> getCandidatesByJobForCompany(UUID companyId, String sortDirection, String sortBy);
	Page<JobPost> semanticSearchWithFilters(String query, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, int page, int size);
	List<Map<String, Object>> getBestPerformingJobs(UUID companyId);
	List<Map<String, Object>> getJobPerformanceTrend(UUID companyId, String period);
}