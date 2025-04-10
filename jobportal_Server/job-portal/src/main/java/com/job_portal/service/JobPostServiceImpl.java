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
import java.util.Comparator;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.job_portal.DTO.*;
import com.job_portal.models.*;
import com.job_portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;


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
	private ApplyJobRepository applyJobRepository;
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
	@Autowired
	private RestTemplate restTemplate;

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

	    try (FileWriter fileWriter = new FileWriter(filePath);
	         CSVWriter writer = new CSVWriter(fileWriter)) {

	        // Viết tiêu đề
	        String[] header = { 
	            "postId", "title", "description", "location", "salary", "experience", 
	            "typeOfWork", "companyId", "companyName", 
	            "cityName", "industryNames"
	        };
	        writer.writeNext(header);

	        // Viết dữ liệu
	        for (JobRecommendationProjection job : jobProjections) {
	            String[] data = { 
	                Objects.toString(job.getPostId(), ""),
	                Objects.toString(job.getTitle(), ""),
	                cleanText(job.getDescription()), // Xử lý mô tả tránh lỗi CSV
	                Objects.toString(job.getLocation(), ""),
	                Objects.toString(job.getSalary(), ""),
	                Objects.toString(job.getExperience(), ""),
	                Objects.toString(job.getTypeOfWork(), ""),
	                Objects.toString(job.getCompanyId(), ""),
	                Objects.toString(job.getCompanyName(), ""),
	                Objects.toString(job.getCityName(), ""),
	                formatIndustryNames(Objects.toString(job.getIndustryNames(), "")),

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

	    List<JobPost> latestJobs = jobPostRepository.findTop8LatestJobPosts()
	                                                .stream()
	                                                .limit(8)
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


		// Nếu không có dữ liệu cache, thực hiện truy vấn từ DB
		Specification<JobPost> spec = JobPostSpecification.withFilters(title, selectedTypesOfWork, minSalary, maxSalary,
				cityId, selectedIndustryIds);
		Page<JobPost> jobPosts = jobPostRepository.findByIsApproveTrue(spec, pageable);



		return jobPosts;
	}

	public Page<JobPost> findJobByCompanyId(UUID companyId, int page, int size) {
	    // Tạo redis key dựa trên companyId, page, size

	    
	    // Kiểm tra cache

	    
	    // Nếu không có trong cache, truy vấn từ database
	    Page<JobPost> jobPosts = jobPostRepository.findJobByCompanyId(companyId, PageRequest.of(page, size));

	    
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

	public Page<JobPost> searchJobs(String title, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, int page, int size) {
	    Specification<JobPost> spec = Specification
	            .where(jobPostRepository.alwaysActiveJobs())
	            .and(JobPostSpecification.withFilters(title, selectedTypesOfWork, minSalary, maxSalary, cityId, selectedIndustryIds));

	    Page<JobPost> result = jobPostRepository.findAll(spec, PageRequest.of(page, size));

	    return result;
	}
	
	@Override
	public Page<JobPost> semanticSearchWithFilters(String query, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds, int page, int size) {
		// Tạo specification cho các bộ lọc
		Specification<JobPost> filterSpec = Specification
				.where(jobPostRepository.alwaysActiveJobs())
				.and(JobPostSpecification.withFilters(null, selectedTypesOfWork, minSalary, maxSalary, cityId, selectedIndustryIds));
		
		// Lấy tất cả job posts phù hợp với bộ lọc
		List<JobPost> filteredJobs = jobPostRepository.findAll(filterSpec);
		
		// Nếu không có query, trả về kết quả đã lọc với phân trang
		if (query == null || query.trim().isEmpty()) {
			int start = (int) Math.min(page * size, filteredJobs.size());
			int end = (int) Math.min((page + 1) * size, filteredJobs.size());
			List<JobPost> pageContent = filteredJobs.subList(start, end);
			return new PageImpl<>(pageContent, PageRequest.of(page, size), filteredJobs.size());
		}
		
		// Thực hiện tìm kiếm ngữ nghĩa trên các job posts đã lọc
		List<JobPost> semanticResults = new ArrayList<>();
		
		// Sử dụng Gemini API để tìm kiếm ngữ nghĩa
		try {
			// Tạo danh sách các job posts để gửi đến Gemini API
			List<Map<String, Object>> jobsForSemanticSearch = filteredJobs.stream()
					.map(job -> {
						Map<String, Object> jobMap = new HashMap<>();
						jobMap.put("postId", job.getPostId().toString());
						jobMap.put("title", job.getTitle());
						jobMap.put("description", job.getDescription());
						jobMap.put("requirement", job.getRequirement());
						jobMap.put("experience", job.getExperience());
						jobMap.put("typeOfWork", job.getTypeOfWork());
						jobMap.put("location", job.getLocation());
						jobMap.put("salary", job.getSalary());
						return jobMap;
					})
					.collect(Collectors.toList());
			
			// Gọi Gemini API để tìm kiếm ngữ nghĩa
			Map<String, Object> requestBody = new HashMap<>();
			requestBody.put("query", query);
			requestBody.put("jobs", jobsForSemanticSearch);
			
			// Gửi yêu cầu đến Gemini API
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			
			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
			
			// Thay thế URL bằng URL thực tế của Gemini API
			String geminiApiUrl = "http://localhost:5000/semantic-search";
			
			ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
					geminiApiUrl,
					HttpMethod.POST,
					entity,
					new ParameterizedTypeReference<List<Map<String, Object>>>() {}
			);
			
			// Xử lý kết quả từ Gemini API
			List<Map<String, Object>> semanticResultsFromApi = response.getBody();
			
			if (semanticResultsFromApi != null) {
				// Lấy danh sách các postId từ kết quả tìm kiếm ngữ nghĩa
				List<UUID> semanticPostIds = semanticResultsFromApi.stream()
						.map(result -> UUID.fromString((String) result.get("postId")))
						.collect(Collectors.toList());
				
				// Lọc các job posts dựa trên kết quả tìm kiếm ngữ nghĩa
				semanticResults = filteredJobs.stream()
						.filter(job -> semanticPostIds.contains(job.getPostId()))
						.collect(Collectors.toList());
				
				// Sắp xếp kết quả theo thứ tự từ kết quả tìm kiếm ngữ nghĩa
				semanticResults.sort((job1, job2) -> {
					int index1 = semanticPostIds.indexOf(job1.getPostId());
					int index2 = semanticPostIds.indexOf(job2.getPostId());
					return Integer.compare(index1, index2);
				});
			} else {
				// Nếu không có kết quả từ Gemini API, sử dụng tìm kiếm thông thường
				semanticResults = filteredJobs.stream()
						.filter(job -> job.getTitle().toLowerCase().contains(query.toLowerCase()) ||
								(job.getDescription() != null && job.getDescription().toLowerCase().contains(query.toLowerCase())))
						.collect(Collectors.toList());
			}
		} catch (Exception e) {
			// Nếu có lỗi khi gọi Gemini API, sử dụng tìm kiếm thông thường
			semanticResults = filteredJobs.stream()
					.filter(job -> job.getTitle().toLowerCase().contains(query.toLowerCase()) ||
							(job.getDescription() != null && job.getDescription().toLowerCase().contains(query.toLowerCase())))
					.collect(Collectors.toList());
			e.printStackTrace();
		}
		
		// Áp dụng phân trang cho kết quả tìm kiếm ngữ nghĩa
		int start = (int) Math.min(page * size, semanticResults.size());
		int end = (int) Math.min((page + 1) * size, semanticResults.size());
		List<JobPost> pageContent = semanticResults.subList(start, end);
		
		return new PageImpl<>(pageContent, PageRequest.of(page, size), semanticResults.size());
	}

	@Override
	public Map<String, List<CandidateWithScoreDTO>> getCandidatesByJobForCompany(UUID companyId, String sortDirection, String sortBy) {
		// Lấy tất cả ứng viên cho công ty
		List<ApplyJob> applications = applyJobRepository.findByCompanyId(companyId);

		// Nhóm ứng viên theo job và sắp xếp theo điểm matching
		Map<String, List<CandidateWithScoreDTO>> groupedCandidates = applications.stream()
				.map(app -> {
					CandidateWithScoreDTO dto = new CandidateWithScoreDTO();
					dto.setUserId(app.getUserId());
					dto.setPostId(app.getPostId());
					dto.setFullName(app.getFullName());
					dto.setPathCV(app.getPathCV());
					dto.setSave(app.isSave());
					dto.setApplyDate(app.getApplyDate());
					dto.setTitle(app.getJobPost().getTitle());
					dto.setMatchingScore(app.getMatchingScore());
					return dto;
				})
				.collect(Collectors.groupingBy(
						CandidateWithScoreDTO::getTitle,
						Collectors.collectingAndThen(
								Collectors.toList(),
								list -> {
									// Sắp xếp dựa trên tham số đầu vào
									if (sortBy != null && sortBy.equals("title")) {
										if (sortDirection != null && sortDirection.equals("asc")) {
											list.sort(Comparator.comparing(CandidateWithScoreDTO::getTitle));
										} else {
											list.sort(Comparator.comparing(CandidateWithScoreDTO::getTitle).reversed());
										}
									} else {
										// Mặc định sắp xếp theo matchingScore
										if (sortDirection != null && sortDirection.equals("asc")) {
											list.sort(Comparator.comparing(CandidateWithScoreDTO::getMatchingScore));
										} else {
											list.sort(Comparator.comparing(CandidateWithScoreDTO::getMatchingScore).reversed());
										}
									}
									return list;
								}
						)
				));

		return groupedCandidates;
	}


}