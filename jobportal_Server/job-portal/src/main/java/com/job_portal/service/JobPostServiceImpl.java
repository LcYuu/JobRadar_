package com.job_portal.service;

import java.io.FileWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.DailyJobCount;
import com.job_portal.DTO.JobCountType;
import com.job_portal.DTO.JobPostDTO;
import com.job_portal.DTO.JobRecommendationDTO;
import com.job_portal.DTO.JobWithApplicationCountDTO;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.Industry;
import com.job_portal.models.JobPost;
import com.job_portal.models.SearchHistory;
import com.job_portal.models.Seeker;
import com.job_portal.models.Skills;
import com.job_portal.repository.CityRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.SearchHistoryRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.SkillRepository;
import com.job_portal.specification.JobPostSpecification;
import com.opencsv.CSVWriter;
import com.social.exceptions.AllExceptions;

@Service
public class JobPostServiceImpl implements IJobPostService {

	@Autowired
	private JobPostRepository jobPostRepository;
	@Autowired
	CityRepository cityRepository;
	@Autowired
	CompanyRepository companyRepository;

	@Autowired
	private SkillRepository skillRepository;

	@Autowired
	private SearchHistoryRepository searchHistoryRepository;

	@Autowired
	private SeekerRepository seekerRepository;
	@Autowired
	ISearchHistoryService searchHistoryService;

	String filePath = "D:\\\\JobRadar_\\\\search_history.csv";

	@Override
	public boolean createJob(JobPostDTO jobPostDTO, UUID companyId) {
		Optional<City> city = cityRepository.findById(jobPostDTO.getCityId());
		if (!city.isPresent()) {
			throw new IllegalArgumentException("City with ID " + jobPostDTO.getCityId() + " does not exist");
		}
		Optional<Company> company = companyRepository.findById(companyId);
		if (!company.isPresent()) {
			throw new IllegalArgumentException("Company with ID " + companyId + " does not exist");
		}
		// Build the JobPost entity
		JobPost jobPost = new JobPost(); 	
		jobPost.setCreateDate(LocalDateTime.now());
		jobPost.setExpireDate(jobPostDTO.getExpireDate());
		jobPost.setTitle(jobPostDTO.getTitle());
		jobPost.setDescription(jobPostDTO.getDescription());
		jobPost.setBenefit(jobPostDTO.getBenefit());
		jobPost.setExperience(jobPostDTO.getExperience());
		jobPost.setSalary(jobPostDTO.getSalary());
		jobPost.setRequirement(jobPostDTO.getRequirement());
		jobPost.setLocation(jobPostDTO.getLocation());
		jobPost.setTypeOfWork(jobPostDTO.getTypeOfWork());
		jobPost.setPosition(jobPostDTO.getPosition());
		jobPost.setStatus("Chờ duyệt");
		jobPost.setCompany(company.get());
		jobPost.setCity(city.get());
		jobPost.setApprove(false);
		jobPost.setNiceToHaves(jobPostDTO.getNiceToHaves());

		// Liên kết với Skills nếu có
		if (jobPostDTO.getSkillIds() != null && !jobPostDTO.getSkillIds().isEmpty()) {
			List<Skills> skillsList = new ArrayList<>();
			for (Integer skillId : jobPostDTO.getSkillIds()) {
				Optional<Skills> skillOpt = skillRepository.findById(skillId);
				skillsList.add(skillOpt.get());
			}
			jobPost.setSkills(skillsList);
		}

		try {
			JobPost saveJobPost = jobPostRepository.save(jobPost);
			return saveJobPost != null;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public boolean deleteJob(UUID postId) throws AllExceptions {
		Optional<JobPost> jobPost = jobPostRepository.findById(postId);

		if (jobPost.isEmpty()) {
			throw new AllExceptions("Không thể tìm thấy công việc này");
		}

		jobPostRepository.delete(jobPost.get());
		return true;
	}

	@Override
	public boolean updateJob(JobPostDTO jobPostDTO, UUID postId) throws AllExceptions {
		// Tìm kiếm Company theo id
		Optional<JobPost> existingJob = jobPostRepository.findById(postId);

		// Lấy đối tượng Company cũ
		JobPost oldJob = existingJob.get();
		boolean isUpdated = false;

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getCreateDate() != null) {
			oldJob.setCreateDate(jobPostDTO.getCreateDate());
			isUpdated = true;
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getExpireDate() != null) {
			oldJob.setExpireDate(jobPostDTO.getExpireDate());
			isUpdated = true;
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getTitle() != null) {
			oldJob.setTitle(jobPostDTO.getTitle());
			isUpdated = true;
		}
		// Cập nhật các trường cơ bản
		if (jobPostDTO.getDescription() != null) {
			oldJob.setDescription(jobPostDTO.getDescription());
			isUpdated = true;
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getBenefit() != null) {
			oldJob.setBenefit(jobPostDTO.getBenefit());
			isUpdated = true;
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getExperience() != null) {
			oldJob.setExperience(jobPostDTO.getExperience());
			isUpdated = true;
		}

		if (jobPostDTO.getSalary() != null) {
			oldJob.setSalary(jobPostDTO.getSalary());
			isUpdated = true;
		}

		if (jobPostDTO.getRequirement() != null) {
			oldJob.setRequirement(jobPostDTO.getRequirement());
			isUpdated = true;
		}
		if (jobPostDTO.getLocation() != null) {
			oldJob.setLocation(jobPostDTO.getLocation());
			isUpdated = true;
		}
		if (jobPostDTO.getTypeOfWork() != null) {
			oldJob.setTypeOfWork(jobPostDTO.getTypeOfWork());
			isUpdated = true;
		}
		if (jobPostDTO.getPosition() != null) {
			oldJob.setPosition(jobPostDTO.getPosition());
			isUpdated = true;
		}

		if (jobPostDTO.getStatus() != null) {
			oldJob.setStatus(jobPostDTO.getStatus());
			isUpdated = true;
		}

		if (jobPostDTO.getNiceToHaves() != null) {
			oldJob.setNiceToHaves(jobPostDTO.getNiceToHaves());
			isUpdated = true;
		}

		if (jobPostDTO.getCityId() != null) {
			Optional<City> newCity = cityRepository.findById(jobPostDTO.getCityId());

			if (!newCity.get().equals(oldJob.getCity())) {
				oldJob.setCity(newCity.get());
				isUpdated = true;
			}
		}
		if (jobPostDTO.getSkillIds() != null && !jobPostDTO.getSkillIds().isEmpty()) {
			List<Skills> skillsList = new ArrayList<>();
			for (Integer skillId : jobPostDTO.getSkillIds()) {
				Optional<Skills> skillOpt = skillRepository.findById(skillId);
				skillsList.add(skillOpt.get());
			}
			oldJob.setSkills(skillsList);
			isUpdated = true; // Thêm dòng này
		}

		if (isUpdated) {
			jobPostRepository.save(oldJob);
		}

		return isUpdated;
	}

	@Override
	public List<JobPost> searchJobByJobName(String title, UUID userId) throws AllExceptions {
		try {
			// Chỉ lưu lịch sử tìm kiếm nếu có userId (người dùng seeker)
			if (userId != null) {
				Seeker seeker = seekerRepository.findById(userId).orElse(null);
				SearchHistory searchHistory = new SearchHistory();
				searchHistory.setSeeker(seeker);
				searchHistory.setSearchQuery(title);
				searchHistory.setSearchDate(LocalDate.now());
				searchHistoryRepository.save(searchHistory);
			}

			// Tìm kiếm công việc theo tên
			List<JobPost> jobs = jobPostRepository.findJobByJobName(title);

			if (jobs.isEmpty()) {
				throw new AllExceptions("Không tìm thấy công việc nào");
			}
//			searchHistoryService.exportSearchHistoryToCSV(filePath);
			return jobs;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

	@Override
	public List<JobPost> searchJobByExperience(String experience) throws AllExceptions {
		try {

			List<JobPost> jobs = jobPostRepository.findJobByExperience(experience);
			if (jobs.isEmpty()) {
				throw new AllExceptions("Không tìm thấy công viêc nào với kinh nghiệm nào");
			}

			return jobs;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

//	@Override
//	public List<JobPost> findBySalaryGreaterThanEqual(Long minSalary) throws AllExceptions {
//		try {
//			List<JobPost> jobPosts = jobPostRepository.findBySalaryGreaterThanEqualAndIsApproveTrue(minSalary);
//			if (jobPosts.isEmpty()) {
//				throw new AllExceptions("Không tìm thấy công việc với lương >= " + minSalary);
//			}
//			return jobPosts;
//		} catch (AllExceptions e) {
//			throw e; // Ném lại ngoại lệ đã định nghĩa
//		} catch (Exception e) {
//			throw new AllExceptions("Lỗi khi tìm kiếm công việc với lương >= " + minSalary);
//		}
//	}

//	@Override
//	public List<JobPost> findBySalaryLessThanEqual(Long maxSalary) throws AllExceptions {
//		try {
//			List<JobPost> jobPosts = jobPostRepository.findBySalaryLessThanEqualAndIsApproveTrue(maxSalary);
//			if (jobPosts.isEmpty()) {
//				throw new AllExceptions("Không tìm thấy công việc với lương >= " + maxSalary);
//			}
//			return jobPosts;
//		} catch (AllExceptions e) {
//			throw e; // Ném lại ngoại lệ đã định nghĩa
//		} catch (Exception e) {
//			throw new AllExceptions("Lỗi khi tìm kiếm công việc với lương < " + maxSalary);
//		}
//	}
//
//	@Override
//	public List<JobPost> findBySalaryBetween(Long minSalary, Long maxSalary) throws AllExceptions {
//		if (minSalary == null || maxSalary == null) {
//			throw new AllExceptions("minSalary và maxSalary không được để trống");
//		}
//		if (minSalary > maxSalary) {
//			throw new AllExceptions("minSalary không thể lớn hơn maxSalary");
//		}
//		try {
//			List<JobPost> jobPosts = jobPostRepository.findBySalaryBetweenAndIsApproveTrue(minSalary, maxSalary);
//			if (jobPosts.isEmpty()) {
//				throw new AllExceptions("Không tìm thấy công việc với lương >= " + minSalary + " và < " + maxSalary);
//			}
//			return jobPosts;
//		} catch (AllExceptions e) {
//			throw e; // Ném lại ngoại lệ đã định nghĩa
//		} catch (Exception e) {
//			throw new AllExceptions("Lỗi khi tìm kiếm công việc với lương >= " + minSalary + " và < " + maxSalary);
//		}
//
//	}

	@Override
	public boolean approveJob(UUID postId) {
		Optional<JobPost> jobPostOpt = jobPostRepository.findById(postId);
		if (jobPostOpt.isPresent()) {
			JobPost jobPost = jobPostOpt.get();
			jobPost.setApprove(true); // Đặt trường isApprove thành true
			jobPost.setStatus("Đang mở");
			jobPostRepository.save(jobPost); // Lưu công việc đã cập nhật
			return true;
		}
		return false; // Trả về false nếu không tìm thấy công việc
	}

	@Override
	public JobPost searchJobByPostId(UUID postId) throws AllExceptions {
		Optional<JobPost> jobPost = jobPostRepository.findById(postId);
		return jobPost.get();

	}

	@Override
	public List<DailyJobCount> getDailyJobPostCounts(LocalDateTime startDate, LocalDateTime endDate) {
	    List<Object[]> results = jobPostRepository.countNewJobsPerDay(startDate, endDate);
	    List<DailyJobCount> dailyJobPostCounts = new ArrayList<>();

	    for (Object[] result : results) {
	        String dateStr = (String) result[0];
	        LocalDateTime date = LocalDateTime.parse(dateStr.substring(0, 26)); // Cắt đến microseconds
	        Long count = ((Number) result[1]).longValue();
	        
	        dailyJobPostCounts.add(new DailyJobCount(date, count));
	    }

	    return dailyJobPostCounts;

	}

	@Override
	public Page<JobPost> findByIsApprove(Pageable pageable) {
		Page<JobPost> jobPost = jobPostRepository.findJobPostActive(pageable);
		return jobPost;

	}

	@Override
	public void exportJobPostToCSV(String filePath) throws IOException {
		List<JobRecommendationDTO> jobPosts = jobPostRepository.findApprovedAndActiveJobs();
		try (CSVWriter writer = new CSVWriter(new FileWriter(filePath))) {
			// Viết tiêu đề
			String[] header = { "postId", "title", "description", "location", "salary", "experience", "typeOfWork",
					"createDate", "expireDate", "companyId", "companyName", "cityName", "industryName", "logo" };
			writer.writeNext(header);

			// Viết dữ liệu
			for (JobRecommendationDTO jobPost : jobPosts) {
				String[] data = { jobPost.getPostId().toString(), jobPost.getTitle(), jobPost.getDescription(),
						jobPost.getLocation(), jobPost.getSalary().toString(), jobPost.getExperience(),
						jobPost.getTypeOfWork(), jobPost.getCreateDate().toString(), jobPost.getExpireDate().toString(),
						jobPost.getCompanyId().toString(), jobPost.getCompanyName(), jobPost.getCityName(),
						jobPost.getIndustryName(), jobPost.getLogo() };
				writer.writeNext(data);
			}
		}
	}

	@Override
	public List<JobPost> getTop8LatestJobPosts() {
		return jobPostRepository.findTop8LatestJobPosts().stream().limit(8).collect(Collectors.toList());
	}

	@Override
	public List<JobCountType> getJobCountByType() {
		return jobPostRepository.countJobsByType();
	}

	@Override
	public Page<JobPost> searchJobsWithPagination(String title, List<String> selectedTypesOfWork, Long minSalary,
			Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, Pageable pageable) {
		Specification<JobPost> spec = JobPostSpecification.withFilters(title, selectedTypesOfWork, minSalary, maxSalary,
				cityId, selectedIndustryIds);
		return jobPostRepository.findByIsApproveTrue(spec, pageable);
	}

	public Page<JobPost> findJobByCompanyId(UUID companyId, int page, int size) {
		return jobPostRepository.findJobByCompanyId(companyId, PageRequest.of(page, size));
	}

	public Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable) {
		return jobPostRepository.findByCompanyCompanyIdAndApproveTrue(companyId, pageable);
	}

	@Override
	public Page<JobWithApplicationCountDTO> getTop5JobsWithApplications(UUID companyId, int page, int size) {
//		Pageable pageable = PageRequest.of(page, size); // Trang bắt đầu từ 0
//		return jobPostRepository.findTop5JobsWithApplicationCountStatusAndIndustryName(companyId, pageable);
		return null;
	}

	public Page<JobPost> findJobsByCompany(UUID companyId, Pageable pageable) {
		return jobPostRepository.findByCompanyCompanyId(companyId, pageable);
	}

	@Override
	public Page<JobPost> findApprovedJobsByCompany(UUID companyId, Pageable pageable) {
		return jobPostRepository.findByCompanyCompanyIdAndIsApproveTrue(companyId, pageable);
	}

	@Override
	public Map<String, Long> countAllJobsByCompany(UUID companyId) {
		Map<String, Long> jobCounts = new HashMap<>();
		LocalDateTime now = LocalDateTime.now();

		// Đếm tổng số công việc
		long totalJobs = jobPostRepository.countByCompanyCompanyId(companyId);

		// Đếm số công việc đang hoạt động (đã approve và chưa hết hạn)
		long activeJobs = jobPostRepository
				.countByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(companyId, now);

		// Đếm số công việc đã đóng (chỉ đếm những tin đã hết hạn)
		long closedJobs = jobPostRepository.countByCompanyCompanyIdAndExpireDateLessThan(companyId, now);

		// Đếm số công việc chưa được duyệt
		long pendingJobs = jobPostRepository.countByCompanyCompanyIdAndIsApproveFalse(companyId);

		jobCounts.put("totalJobs", totalJobs);
		jobCounts.put("activeJobs", activeJobs);
		jobCounts.put("closedJobs", closedJobs);
		jobCounts.put("pendingJobs", pendingJobs);

		return jobCounts;
	}

	@Override
	public List<Map<String, Object>> getCompanyJobStats(UUID companyId, LocalDateTime startDate, LocalDateTime endDate) {
		List<Map<String, Object>> stats = new ArrayList<>();
		LocalDateTime currentDate = startDate;
		
		while (!currentDate.isAfter(endDate)) {
			// Đếm số lượng job theo trạng thái
			long totalJobs = jobPostRepository.countJobsByCompanyAndDateRange(companyId, currentDate, currentDate);
			long activeJobs = jobPostRepository.countActiveJobsByCompanyAndDateRange(companyId, currentDate,
					currentDate);
			long closedJobs = jobPostRepository.countClosedJobsByCompanyAndDateRange(companyId, currentDate,
					currentDate);
			long pendingJobs = jobPostRepository.countPendingJobsByCompanyAndDateRange(companyId, currentDate,
					currentDate);

			Map<String, Object> dayStat = new HashMap<>();
			dayStat.put("date", currentDate.toString());
			dayStat.put("totalJobs", totalJobs);
			dayStat.put("activeJobs", activeJobs);
			dayStat.put("closedJobs", closedJobs);
			dayStat.put("pendingJobs", pendingJobs);

			stats.add(dayStat);
			currentDate = currentDate.plusDays(1);
		}

		return stats;
	}

	@Override
	public List<JobPost> getSimilarJobsByIndustry(Integer industryId, UUID excludePostId) {
		return jobPostRepository.findSimilarJobsByIndustry(industryId, excludePostId);
	}

	@Override
	public void updateExpiredJobs() {
		List<JobPost> expiredJobs = jobPostRepository.findAllByExpireDateBeforeAndStatus(LocalDateTime.now(), "Đang mở");
		// Cập nhật trạng thái thành EXPIRED
		for (JobPost job : expiredJobs) {
			job.setStatus("Hết hạn");
		}

		// Lưu các thay đổi vào cơ sở dữ liệu
		jobPostRepository.saveAll(expiredJobs);
	}

	@Override
	public boolean canPostJob(UUID companyId) {
		Optional<JobPost> latestJob = jobPostRepository.findTopByCompanyCompanyIdOrderByCreateDateDesc(companyId);
		if (latestJob.isPresent()) {
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime lastPosted = latestJob.get().getCreateDate();
			return Duration.between(lastPosted, now).toHours() >= 1;
		}
		return true; // Nếu chưa có bài đăng nào, cho phép tạo bài
	}
}