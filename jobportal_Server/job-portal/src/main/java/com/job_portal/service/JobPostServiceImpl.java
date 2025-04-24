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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.PageImpl;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.job_portal.projection.JobRecommendationProjection;
import com.job_portal.repository.CityRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.SearchHistoryRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.SkillRepository;
import com.job_portal.specification.JobPostSpecification;
import com.opencsv.CSVWriter;
import com.social.exceptions.AllExceptions;

@Service
public class JobPostServiceImpl extends RedisServiceImpl implements IJobPostService {

	@Autowired
	private IndustryRepository industryRepository;
	@Autowired
	private JobPostRepository jobPostRepository;
	@Autowired
	private CityRepository cityRepository;
	@Autowired
	private CompanyRepository companyRepository;
	@Autowired
	private SkillRepository skillRepository;
	@Autowired
	private SearchHistoryRepository searchHistoryRepository;
	@Autowired
	private SeekerRepository seekerRepository;
	@Autowired
	private ISearchHistoryService searchHistoryService;

	private static final String FILE_PATH = "D:\\\\JobRadar_\\\\search_history.csv";

	public JobPostServiceImpl(RedisTemplate<String, Object> redisTemplate) {
		super(redisTemplate);
	}

	long TIME_OUT = 1 * 24 * 60 * 60;

	@Override
	public JobPost createJob(JobPostDTO jobPostDTO, UUID companyId) {
		JobPost savedJobPost = new JobPost();

		try {
			City city = cityRepository.findById(jobPostDTO.getCityId()).orElseThrow(
					() -> new IllegalArgumentException("City with ID " + jobPostDTO.getCityId() + " does not exist"));

			Company company = companyRepository.findById(companyId).orElseThrow(
					() -> new IllegalArgumentException("Company with ID " + companyId + " does not exist"));

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
			jobPost.setCompany(company);
			jobPost.setCity(city);
			jobPost.setApprove(false);
			jobPost.setNiceToHaves(jobPostDTO.getNiceToHaves());

			if (jobPostDTO.getSkillIds() != null && !jobPostDTO.getSkillIds().isEmpty()) {
				List<Skills> skillsList = skillRepository.findAllById(jobPostDTO.getSkillIds());
				jobPost.setSkills(skillsList);
			}

			if (jobPostDTO.getIndustryIds() != null && !jobPostDTO.getIndustryIds().isEmpty()) {
				List<Industry> industryList = industryRepository.findAllById(jobPostDTO.getIndustryIds());
				jobPost.setIndustry(industryList);
			}

			savedJobPost = jobPostRepository.save(jobPost);

		} catch (Exception e) {
			e.printStackTrace(); // Log lỗi để dễ debug
		}
		return savedJobPost;
	}

	@Override
	public boolean deleteJob(UUID postId) throws AllExceptions {
		Optional<JobPost> jobPost = jobPostRepository.findById(postId);

		if (jobPost.isEmpty()) {
			throw new AllExceptions("Không thể tìm thấy công việc này");
		}

		// Xóa công việc trong database
		jobPostRepository.delete(jobPost.get());

		// Xóa công việc trong Redis
		String redisKey = "jobPost:" + postId;
		this.delete(redisKey);

		return true;
	}

	@Override
	public JobPost updateJob(JobPostDTO jobPostDTO, UUID postId) throws AllExceptions {
		// Tìm kiếm Company theo id
		Optional<JobPost> existingJob = jobPostRepository.findById(postId);

		// Lấy đối tượng Company cũ
		JobPost oldJob = existingJob.get();

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getCreateDate() != null) {
			oldJob.setCreateDate(jobPostDTO.getCreateDate());
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getExpireDate() != null) {
			oldJob.setExpireDate(jobPostDTO.getExpireDate());
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getTitle() != null) {
			oldJob.setTitle(jobPostDTO.getTitle());

		}
		// Cập nhật các trường cơ bản
		if (jobPostDTO.getDescription() != null) {
			oldJob.setDescription(jobPostDTO.getDescription());
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getBenefit() != null) {
			oldJob.setBenefit(jobPostDTO.getBenefit());
		}

		// Cập nhật các trường cơ bản
		if (jobPostDTO.getExperience() != null) {
			oldJob.setExperience(jobPostDTO.getExperience());
		}

		if (jobPostDTO.getSalary() != null) {
			oldJob.setSalary(jobPostDTO.getSalary());
		}

		if (jobPostDTO.getRequirement() != null) {
			oldJob.setRequirement(jobPostDTO.getRequirement());
		}
		if (jobPostDTO.getLocation() != null) {
			oldJob.setLocation(jobPostDTO.getLocation());
		}
		if (jobPostDTO.getTypeOfWork() != null) {
			oldJob.setTypeOfWork(jobPostDTO.getTypeOfWork());
		}
		if (jobPostDTO.getPosition() != null) {
			oldJob.setPosition(jobPostDTO.getPosition());
		}

		if (jobPostDTO.getStatus() != null) {
			oldJob.setStatus(jobPostDTO.getStatus());
		}

		if (jobPostDTO.getNiceToHaves() != null) {
			oldJob.setNiceToHaves(jobPostDTO.getNiceToHaves());
		}

		if (jobPostDTO.getCityId() != null) {
			Optional<City> newCity = cityRepository.findById(jobPostDTO.getCityId());

			if (!newCity.get().equals(oldJob.getCity())) {
				oldJob.setCity(newCity.get());
			}
		}
		if (jobPostDTO.getSkillIds() != null && !jobPostDTO.getSkillIds().isEmpty()) {
			List<Skills> skillsList = new ArrayList<>();
			for (Integer skillId : jobPostDTO.getSkillIds()) {
				Optional<Skills> skillOpt = skillRepository.findById(skillId);
				skillsList.add(skillOpt.get());
			}
			oldJob.setSkills(skillsList);
		}

		if (jobPostDTO.getIndustryIds() != null && !jobPostDTO.getIndustryIds().isEmpty()) {
			List<Industry> industryList = new ArrayList<>();
			for (Integer industryId : jobPostDTO.getIndustryIds()) {
				Optional<Industry> industryOpt = industryRepository.findById(industryId);
				industryList.add(industryOpt.get());
			}
			oldJob.setIndustry(industryList);
		}
		return jobPostRepository.save(oldJob);
	}

	@Override
	public JobPost approveJob(UUID postId) {
		Optional<JobPost> jobPostOpt = jobPostRepository.findById(postId);
		if (jobPostOpt.isPresent()) {
			JobPost jobPost = jobPostOpt.get();
			jobPost.setApprove(true); // Đặt isApprove thành true
			jobPost.setStatus("Đang mở");

			// Lưu vào database
			jobPostRepository.save(jobPost);
			this.delete("searchJobs:*");
		}
		return null;
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
		List<JobRecommendationProjection> jobProjections = jobPostRepository.findApprovedAndActiveJobs();

		try (FileWriter fileWriter = new FileWriter(filePath); CSVWriter writer = new CSVWriter(fileWriter)) {

			// Viết tiêu đề
			String[] header = { "postId", "title", "description", "location", "salary", "experience", "typeOfWork",
					"companyId", "companyName", "cityName", "industryNames", "createDate", "expireDate", "logo" };
			writer.writeNext(header);

			// Viết dữ liệu
			for (JobRecommendationProjection job : jobProjections) {
				String[] data = {
					Objects.toString(job.getPostId(), ""),
					Objects.toString(job.getTitle(), ""),
					cleanText(job.getDescription()),
					Objects.toString(job.getLocation(), ""),
					Objects.toString(job.getSalary(), ""),
					Objects.toString(job.getExperience(), ""),
					Objects.toString(job.getTypeOfWork(), ""),
					Objects.toString(job.getCompanyId(), ""),
					Objects.toString(job.getCompanyName(), ""),
					Objects.toString(job.getCityName(), ""),
					formatIndustryNames(Objects.toString(job.getIndustryNames(), "")),
					Objects.toString(job.getCreateDate(), ""),
					Objects.toString(job.getExpireDate(), ""),
					Objects.toString(job.getLogo(), ""),
				};
				writer.writeNext(data);
			}
			
		}
	}

	// Chuyển danh sách ngành nghề thành chuỗi phân tách bằng "|"
	// Chuyển danh sách ngành nghề từ chuỗi GROUP_CONCAT thành định dạng mong muốn
	private String formatIndustryNames(String industryNames) {
		return (industryNames == null || industryNames.isBlank()) ? "" : industryNames.replace(",", " | ");
	}

	private String cleanText(String text) {
		return text == null ? "" : text.replaceAll("[\\r\\n]+", " ").trim();
	}

	@Override
	public List<JobPost> getTop8LatestJobPosts() {
		List<JobPost> latestJobs = jobPostRepository.findTop8LatestJobPosts().stream().limit(8)
				.collect(Collectors.toList());
		return latestJobs;
	}

	@Override
	public List<JobCountType> getJobCountByType() {
		return jobPostRepository.countJobsByType();
	}

	@SuppressWarnings("unchecked")
	@Override
	public Page<JobPost> searchJobsWithPagination(String title, List<String> selectedTypesOfWork, Long minSalary,
			Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, Pageable pageable) {

		// Tạo key cho Redis dựa trên tham số tìm kiếm
		String redisKey = "searchJobs:" + title + ":" + selectedTypesOfWork + ":" + minSalary + ":" + maxSalary + ":"
				+ cityId + ":" + selectedIndustryIds + ":" + pageable.getPageNumber() + ":" + pageable.getPageSize();

		// Kiểm tra Redis có dữ liệu không
		Page<JobPost> cachedJobs = null; // 👉 Thêm dòng này để khai báo biến trước

		Object cachedObject = this.get(redisKey);
		if (cachedObject instanceof Page) {
			cachedJobs = (Page<JobPost>) cachedObject;
		}

		if (cachedJobs != null) {
			return cachedJobs; // Trả về dữ liệu cache nếu có
		}

		// Nếu không có dữ liệu cache, thực hiện truy vấn từ DB
		Specification<JobPost> spec = JobPostSpecification.withFilters(title, selectedTypesOfWork, minSalary, maxSalary,
				cityId, selectedIndustryIds);
		Page<JobPost> jobPosts = jobPostRepository.findByIsApproveTrue(spec, pageable);

		this.set(redisKey, jobPosts);
		this.setTimeToLive(redisKey, TIME_OUT);

		return jobPosts;
	}

	public Page<JobPost> findJobByCompanyId(UUID companyId, int page, int size) {
		// Tạo redis key dựa trên companyId, page, size
//	    String redisKey = "jobByCompany:" + companyId + ":" + page + ":" + size;
//	    
//	    // Kiểm tra cache
//	    Page<JobPost> cachedPage = (Page<JobPost>) this.get(redisKey);
//	    if (cachedPage != null) {
//	        return cachedPage;
//	    }

		// Nếu không có trong cache, truy vấn từ database
		Page<JobPost> jobPosts = jobPostRepository.findJobByCompanyId(companyId, PageRequest.of(page, size));

//	    // Lưu kết quả vào Redis và thiết lập TTL (ví dụ: 7 ngày)
//	    this.set(redisKey, jobPosts);
//	    this.setTimeToLive(redisKey, TIME_OUT);

		return jobPosts;
	}

	public Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable) {
		return jobPostRepository.findByCompanyCompanyIdAndApproveTrue(companyId, pageable);
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
	public List<Map<String, Object>> getCompanyJobStats(UUID companyId, LocalDateTime startDate,
			LocalDateTime endDate) {
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
	public List<JobPost> getSimilarJobsByIndustry(List<Integer> industryIds, UUID excludePostId) {
		return jobPostRepository.findSimilarJobsByIndustryIds(industryIds, excludePostId);
	}

	@Override
	public void updateExpiredJobs() {
		List<JobPost> expiredJobs = jobPostRepository.findAllByExpireDateBeforeAndStatus(LocalDateTime.now(),
				"Đang mở");
		// Cập nhật trạng thái thành EXPIRED
		for (JobPost job : expiredJobs) {
			job.setStatus("Hết hạn");
			String redisKey = "jobPost:" + job.getPostId();
			this.delete(redisKey);
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

	@Transactional
	public void increaseViewCount(UUID postId) {
		JobPost jobPost = jobPostRepository.findById(postId)
				.orElseThrow(() -> new RuntimeException("Job post not found"));
		jobPost.setViewCount(jobPost.getViewCount() + 1);
		jobPostRepository.save(jobPost);
	}

	public Page<JobPost> searchJobs(String title, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary,
			Integer cityId, List<Integer> selectedIndustryIds, int page, int size) {
//	    String redisKey = "searchJobs:" + title + ":" + selectedTypesOfWork + ":" + minSalary + ":" + maxSalary + ":"
//	            + cityId + ":" + selectedIndustryIds + ":" + page + ":" + size;
//
//	    // Kiểm tra xem cache có kết quả không
//	    Object cachedData = this.get(redisKey);
//	    if (cachedData instanceof List<?>) {
//	        List<JobPost> jobList = (List<JobPost>) cachedData;
//	        Pageable pageable = PageRequest.of(page, size);
//	        return new PageImpl<>(jobList, pageable, jobList.size());
//	    }
//	    
		System.out.print("selected "  + selectedIndustryIds);
		Specification<JobPost> spec = Specification.where(jobPostRepository.alwaysActiveJobs()).and(JobPostSpecification
				.withFilters(title, selectedTypesOfWork, minSalary, maxSalary, cityId, selectedIndustryIds));

		Page<JobPost> result = jobPostRepository.findAll(spec, PageRequest.of(page, size));

//	    // Lưu kết quả vào Redis
//	    this.set(redisKey, result);
//	    this.setTimeToLive(redisKey, TIME_OUT); // Cache hết hạn sau 1 ngày

		return result;
	}

//	public Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable) {
//		return jobPostRepository.findByCompanyCompanyIdAndApproveTrue(companyId, pageable);
//	}
//
//	@Override
//	public Page<JobWithApplicationCountDTO> getTop5JobsWithApplications(UUID companyId, int page, int size) {
////		Pageable pageable = PageRequest.of(page, size); // Trang bắt đầu từ 0
////		return jobPostRepository.findTop5JobsWithApplicationCountStatusAndIndustryName(companyId, pageable);
//		return null;
//	}
//
//	public Page<JobPost> findJobsByCompany(UUID companyId, Pageable pageable) {
//		return jobPostRepository.findByCompanyCompanyId(companyId, pageable);
//	}
//
//	@Override
//	public Page<JobPost> findApprovedJobsByCompany(UUID companyId, Pageable pageable) {
//		return jobPostRepository.findByCompanyCompanyIdAndIsApproveTrue(companyId, pageable);
//	}
//
//	@Override
//	public Map<String, Long> countAllJobsByCompany(UUID companyId) {
//		Map<String, Long> jobCounts = new HashMap<>();
//		LocalDateTime now = LocalDateTime.now();
//
//		// Đếm tổng số công việc
//		long totalJobs = jobPostRepository.countByCompanyCompanyId(companyId);
//
//		// Đếm số công việc đang hoạt động (đã approve và chưa hết hạn)
//		long activeJobs = jobPostRepository
//				.countByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(companyId, now);
//
//		// Đếm số công việc đã đóng (chỉ đếm những tin đã hết hạn)
//		long closedJobs = jobPostRepository.countByCompanyCompanyIdAndExpireDateLessThan(companyId, now);
//
//		// Đếm số công việc chưa được duyệt
//		long pendingJobs = jobPostRepository.countByCompanyCompanyIdAndIsApproveFalse(companyId);
//
//		jobCounts.put("totalJobs", totalJobs);
//		jobCounts.put("activeJobs", activeJobs);
//		jobCounts.put("closedJobs", closedJobs);
//		jobCounts.put("pendingJobs", pendingJobs);
//
//		return jobCounts;
//	}
//
//	@Override
//	public List<Map<String, Object>> getCompanyJobStats(UUID companyId, LocalDateTime startDate, LocalDateTime endDate) {
//		List<Map<String, Object>> stats = new ArrayList<>();
//		LocalDateTime currentDate = startDate;
//		
//		while (!currentDate.isAfter(endDate)) {
//			// Đếm số lượng job theo trạng thái
//			long totalJobs = jobPostRepository.countJobsByCompanyAndDateRange(companyId, currentDate, currentDate);
//			long activeJobs = jobPostRepository.countActiveJobsByCompanyAndDateRange(companyId, currentDate,
//					currentDate);
//			long closedJobs = jobPostRepository.countClosedJobsByCompanyAndDateRange(companyId, currentDate,
//					currentDate);
//			long pendingJobs = jobPostRepository.countPendingJobsByCompanyAndDateRange(companyId, currentDate,
//					currentDate);
//
//			Map<String, Object> dayStat = new HashMap<>();
//			dayStat.put("date", currentDate.toString());
//			dayStat.put("totalJobs", totalJobs);
//			dayStat.put("activeJobs", activeJobs);
//			dayStat.put("closedJobs", closedJobs);
//			dayStat.put("pendingJobs", pendingJobs);
//
//			stats.add(dayStat);
//			currentDate = currentDate.plusDays(1);
//		}
//
//		return stats;
//	}
//
//	@Override
//	public List<JobPost> getSimilarJobsByIndustry(Integer industryId, UUID excludePostId) {
//		return jobPostRepository.findSimilarJobsByIndustry(industryId, excludePostId);
//	}
//
//	@Override
//	public void updateExpiredJobs() {
//		List<JobPost> expiredJobs = jobPostRepository.findAllByExpireDateBeforeAndStatus(LocalDateTime.now(), "Đang mở");
//		// Cập nhật trạng thái thành EXPIRED
//		for (JobPost job : expiredJobs) {
//			job.setStatus("Hết hạn");
//		}
//
//		// Lưu các thay đổi vào cơ sở dữ liệu
//		jobPostRepository.saveAll(expiredJobs);
//	}
//
//	@Override
//	public boolean canPostJob(UUID companyId) {
//		Optional<JobPost> latestJob = jobPostRepository.findTopByCompanyCompanyIdOrderByCreateDateDesc(companyId);
//		if (latestJob.isPresent()) {
//			LocalDateTime now = LocalDateTime.now();
//			LocalDateTime lastPosted = latestJob.get().getCreateDate();
//			return Duration.between(lastPosted, now).toHours() >= 1;
//		}
//		return true; // Nếu chưa có bài đăng nào, cho phép tạo bài
//	}
}