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
			Optional<City> city = cityRepository.findById(jobPostDTO.getCityId());
			Optional<Company> company = companyRepository.findById(companyId);
			
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
	    List<JobRecommendationProjection> jobProjections = jobPostRepository.findJobPostSave();

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


		// Nếu không có dữ liệu cache, thực hiện truy vấn từ DB
		Specification<JobPost> spec = JobPostSpecification.withFilters(title, selectedTypesOfWork, minSalary, maxSalary,
				cityId, selectedIndustryIds);
		Page<JobPost> jobPosts = jobPostRepository.findByIsApproveTrue(spec, pageable);
		return jobPosts;
	}

	public Page<JobPost> findJobByCompanyId(UUID companyId, int page, int size) {
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

	@Override
	@Transactional
	public boolean increaseViewCountWithUserCheck(UUID postId, UUID userId, String userRole) {
		try {
			JobPost jobPost = jobPostRepository.findById(postId)
					.orElseThrow(() -> new RuntimeException("Job post not found"));
					
			// Kiểm tra vai trò người dùng
			if ("ADMIN".equalsIgnoreCase(userRole)) {
				// Admin xem không tính lượt xem
				return false;
			}
			
			// Kiểm tra xem người xem có phải chủ bài đăng không
			if (jobPost.getCompany() != null && 
				jobPost.getCompany().getCompanyId().equals(userId)) {
				// Người đăng bài xem bài của mình, không tính lượt xem
				return false;
			}
			
			// Tăng lượt xem
			jobPost.setViewCount(jobPost.getViewCount() + 1);
			jobPostRepository.save(jobPost);
			
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
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

	@Override
	public List<JobPost> findAllJobsByCompany(UUID companyId) {
		// Using the existing repository method that returns all jobs for a company
		return jobPostRepository.findJobByCompany(companyId);
	}

	@Override
	public List<Map<String, Object>> getBestPerformingJobs(UUID companyId) {
		// Lấy tất cả các bài đăng của công ty
		List<JobPost> companyJobs = jobPostRepository.findJobByCompany(companyId);
		
		// Tạo danh sách để lưu trữ kết quả
		List<Map<String, Object>> bestPerformingJobs = new ArrayList<>();
		
		// Đối với mỗi bài đăng, tính toán hiệu suất
		for (JobPost job : companyJobs) {
			// Sử dụng viewCount thay vì đếm từ viewedBy
			int viewCount = job.getViewCount() != null ? job.getViewCount() : 0;
			
			// Bỏ qua các bài đăng không có lượt xem
			if (viewCount <= 0) continue;
			
			// Lấy số lượng ứng viên đã apply
			long applicationCount = applyJobRepository.countByPostId(job.getPostId());
			
			// Tính tỉ lệ chuyển đổi dựa trên lượt xem
			double conversionRate = (double) applicationCount / viewCount * 100;
			
			// Tạo map lưu thông tin
			Map<String, Object> jobPerformance = new HashMap<>();
			jobPerformance.put("jobId", job.getPostId());
			jobPerformance.put("jobTitle", job.getTitle());
			jobPerformance.put("viewCount", viewCount);
			jobPerformance.put("applicationCount", applicationCount);
			jobPerformance.put("conversionRate", Math.round(conversionRate * 100.0) / 100.0);
			jobPerformance.put("createDate", job.getCreateDate());
			jobPerformance.put("expireDate", job.getExpireDate());
			jobPerformance.put("status", job.getStatus());
			
			bestPerformingJobs.add(jobPerformance);
		}
		
		// Sắp xếp theo tỷ lệ chuyển đổi (cao -> thấp)
		bestPerformingJobs.sort((a, b) -> {
			Double rateA = (Double) a.get("conversionRate");
			Double rateB = (Double) b.get("conversionRate");
			return rateB.compareTo(rateA);
		});
		
		// Trả về top 5 bài đăng có hiệu suất tốt nhất
		int limit = Math.min(5, bestPerformingJobs.size());
		return bestPerformingJobs.subList(0, limit);
	}
	
	@Override
	public List<Map<String, Object>> getJobPerformanceTrend(UUID companyId, String period) {
		// Lấy tất cả các bài đăng của công ty
		List<JobPost> companyJobs = jobPostRepository.findJobByCompany(companyId);
		
		// Xác định khoảng thời gian dựa trên tham số period
		LocalDateTime endDate = LocalDateTime.now();
		LocalDateTime startDate;
		
		if ("week".equals(period)) {
			startDate = endDate.minusWeeks(1);
		} else if ("month".equals(period)) {
			startDate = endDate.minusMonths(1);
		} else if ("quarter".equals(period)) {
			startDate = endDate.minusMonths(3);
		} else if ("year".equals(period)) {
			startDate = endDate.minusYears(1);
		} else {
			// Mặc định là 7 ngày gần nhất
			startDate = endDate.minusWeeks(1);
		}
		
		// Tạo danh sách các ngày trong khoảng thời gian
		List<LocalDate> datesInRange = new ArrayList<>();
		LocalDate currentDate = startDate.toLocalDate();
		LocalDate endLocalDate = endDate.toLocalDate();
		
		while (!currentDate.isAfter(endLocalDate)) {
			datesInRange.add(currentDate);
			currentDate = currentDate.plusDays(1);
		}
		
		// Nhóm các bài đăng theo ngày và tính tổng số lượt xem, số lượt ứng tuyển và tỷ lệ chuyển đổi
		Map<LocalDate, Map<String, Object>> dailyStats = new HashMap<>();
		
		// Tạo map thống kê trống cho mỗi ngày trong khoảng thời gian
		for (LocalDate date : datesInRange) {
			Map<String, Object> dayStats = new HashMap<>();
			dayStats.put("date", date.toString());
			dayStats.put("totalViews", 0);
			dayStats.put("totalApplications", 0);
			dayStats.put("jobCount", 0);
			dayStats.put("avgConversionRate", 0.0);
			dailyStats.put(date, dayStats);
		}
		
		// Cập nhật thống kê cho mỗi bài đăng
		for (JobPost job : companyJobs) {
			// Sử dụng viewCount thay vì đếm từ viewedBy
			int viewCount = job.getViewCount() != null ? job.getViewCount() : 0;
			
			// Đếm số lượng ứng viên đã apply cho bài đăng này
			long applicationCount = applyJobRepository.countByPostId(job.getPostId());
			
			// Ngày tạo bài đăng
			LocalDate jobCreateDate = job.getCreateDate().toLocalDate();
			
			// Thống kê bài đăng cho ngày tạo (nếu nằm trong khoảng thời gian)
			if (dailyStats.containsKey(jobCreateDate)) {
				Map<String, Object> createDayStats = dailyStats.get(jobCreateDate);
				createDayStats.put("jobCount", (int) createDayStats.get("jobCount") + 1);
			}
			
			// Cập nhật thống kê lượt xem và ứng tuyển cho tất cả các ngày sau ngày tạo bài đăng
			for (LocalDate date : datesInRange) {
				// Chỉ tính thống kê cho các ngày sau khi bài đăng được tạo
				if (date.isAfter(jobCreateDate) || date.isEqual(jobCreateDate)) {
					Map<String, Object> dayStats = dailyStats.get(date);
					dayStats.put("totalViews", (int) dayStats.get("totalViews") + viewCount);
					dayStats.put("totalApplications", (int) dayStats.get("totalApplications") + applicationCount);
				}
			}
		}
		
		// Tính toán tỷ lệ chuyển đổi trung bình cho mỗi ngày
		for (Map<String, Object> dayStats : dailyStats.values()) {
			int totalViews = (int) dayStats.get("totalViews");
			int totalApplications = (int) dayStats.get("totalApplications");
			
			double avgConversionRate = 0;
			if (totalViews > 0) {
				avgConversionRate = (double) totalApplications / totalViews * 100;
			}
			
			dayStats.put("avgConversionRate", Math.round(avgConversionRate * 100.0) / 100.0);
		}
		
		// Chuyển đổi Map thành List và sắp xếp theo ngày
		List<Map<String, Object>> result = new ArrayList<>(dailyStats.values());
		result.sort((a, b) -> {
			String dateA = (String) a.get("date");
			String dateB = (String) b.get("date");
			return dateA.compareTo(dateB);
		});
		
		return result;
	}
}