package com.job_portal.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.CompanyDTO;
import com.job_portal.DTO.DailyJobCount;
import com.job_portal.DTO.JobCountType;
import com.job_portal.DTO.JobPostDTO;
import com.job_portal.DTO.JobRecommendationDTO;
import com.job_portal.DTO.JobWithApplicationCountDTO;
import com.job_portal.DTO.SeekerDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.CityRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.NotificationRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.IJobPostService;
import com.job_portal.service.INotificationService;
import com.job_portal.service.SearchHistoryServiceImpl;
import com.job_portal.specification.JobPostSpecification;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/job-post")
public class JobPostController {

	@Autowired
	private RestTemplate restTemplate;
	@Autowired
	JobPostRepository jobPostRepository;
	@Autowired
	IndustryRepository industryRepository;
	@Autowired
	CityRepository cityRepository;

	@Autowired
	IJobPostService jobPostService;

	@Autowired
	ICompanyService companyService;
	@Autowired
	private CompanyRepository companyRepository;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private SearchHistoryServiceImpl searchHistoryService;

	@Autowired
	private INotificationService notificationService;

	String filePath = "D:\\JobRadar_\\search.csv";

	@GetMapping("/get-all")
	public ResponseEntity<List<JobPost>> getJob() {
		List<JobPost> jobs = jobPostRepository.findAll();
		return new ResponseEntity<>(jobs, HttpStatus.OK);
	}

	@GetMapping("/admin-get-all")
	public ResponseEntity<Map<String, Object>> getAllJobs(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "12") int size, @RequestParam(required = false) String searchTerm,
			@RequestParam(required = false, defaultValue = "Open") String status) {
		try {
			Pageable paging = PageRequest.of(page, size);
			Page<JobPost> pageJobs;

			if (searchTerm != null && !searchTerm.isEmpty()) {
				pageJobs = jobPostRepository.findByTitleContainingAndStatusAndIsApproveTrue(searchTerm, status, paging);
			} else {
				pageJobs = jobPostRepository.findByStatusAndIsApproveTrue(status, paging);
			}

			Map<String, Object> response = new HashMap<>();
			response.put("content", pageJobs.getContent());
			response.put("currentPage", pageJobs.getNumber());
			response.put("totalElements", pageJobs.getTotalElements());
			response.put("totalPages", pageJobs.getTotalPages());

			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	@GetMapping("/get-top8-lastest-job")
	public ResponseEntity<List<JobPost>> getTop8LatestJobPosts() {
		List<JobPost> jobs = jobPostService.getTop8LatestJobPosts();
		return new ResponseEntity<>(jobs, HttpStatus.OK);
	}

	@GetMapping("/get-job-approve")
	public ResponseEntity<Page<JobPost>> getJobApprove(Pageable pageable) {
		Page<JobPost> res = jobPostService.findByIsApprove(pageable);
		return new ResponseEntity<>(res, HttpStatus.OK);
	}

	@PostMapping("/create-job")
	public ResponseEntity<String> createJobPost(@RequestHeader("Authorization") String jwt,
			@RequestBody JobPostDTO jobPostDTO) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);

			if (!jobPostService.canPostJob(user.get().getCompany().getCompanyId())) {
				return new ResponseEntity<>("Công ty chỉ được đăng 1 bài trong vòng 1 giờ.", HttpStatus.FORBIDDEN);
			}
			boolean isCreated = jobPostService.createJob(jobPostDTO, user.get().getCompany().getCompanyId());
			if (isCreated) {
				return new ResponseEntity<>("Công việc được tạo thành công. Chờ Admin phê duyệt", HttpStatus.CREATED);
			} else {
				return new ResponseEntity<>("Công việc tạo thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			// Log lỗi và trả về lỗi chi tiết
			e.printStackTrace();
			return new ResponseEntity<>("Đã có lỗi xảy ra: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/approve/{postId}")
	public ResponseEntity<String> approveJobPost(@PathVariable UUID postId) {
		boolean isApproved = jobPostService.approveJob(postId);
		Optional<Company> company = companyRepository.findCompanyByPostId(postId);
		if (isApproved) {
			notificationService.notifyNewJobPost(company.get().getCompanyId(),postId);
			return ResponseEntity.ok("Chấp thuận thành công");
		} else {
			return ResponseEntity.status(404).body("Không thể tìm thấy công việc");
		}
	}
	
	

	@PutMapping("/update-job/{postId}")
	public ResponseEntity<String> updateJobPost(@RequestHeader("Authorization") String jwt,
			@RequestBody JobPostDTO jobPost, @PathVariable("postId") UUID postId) throws AllExceptions {
		Optional<JobPost> oldJobPost = jobPostRepository.findById(postId);
		if (oldJobPost.get().isApprove() == false) {
			boolean isUpdated = jobPostService.updateJob(jobPost, postId);
			if (isUpdated) {
				return new ResponseEntity<>("Cập nhật thành công", HttpStatus.CREATED);
			} else {
				return new ResponseEntity<>("Cập nhật thất bại", HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>("Bài viết đã được chấp thuận, không được thay đổi", HttpStatus.BAD_REQUEST);
		}
	}

	@PutMapping("/set-expire/{postId}")
	public ResponseEntity<Boolean> updateExpireJobPost(@PathVariable("postId") UUID postId) throws AllExceptions {
		Optional<JobPost> oldJobPostOptional = jobPostRepository.findById(postId);

		if (oldJobPostOptional.isEmpty()) {
			return new ResponseEntity<>(false, HttpStatus.NOT_FOUND); // Trả về false nếu công việc không tồn tại
		}

		JobPost oldJobPost = oldJobPostOptional.get();
		oldJobPost.setExpireDate(LocalDateTime.now()); // Cập nhật ngày hết hạn
		oldJobPost.setStatus("Hết hạn"); // Đặt trạng thái công việc thành "Hết hạn"

		jobPostRepository.save(oldJobPost); // Lưu công việc đã cập nhật

		return new ResponseEntity<>(true, HttpStatus.OK); // Trả về true khi cập nhật thành công
	}

	@DeleteMapping("/delete-job/{postId}")
	public ResponseEntity<String> deleteJob(@PathVariable("postId") UUID postId) {
		try {
			boolean isDeleted = jobPostService.deleteJob(postId);
			if (isDeleted) {
				return new ResponseEntity<>("Xóa thành công", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Xóa thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
		}
	}

	@GetMapping("/search-by-job-name")
	public ResponseEntity<Object> searchJobByJobName(@RequestHeader("Authorization") String jwt,
			@RequestParam("title") String title) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);
			UUID userId = null;
			if (user.get().getUserId() != null) {
				userId = user.get().getUserId();
			}

			List<JobPost> jobs = jobPostService.searchJobByJobName(title, userId);

			return ResponseEntity.ok(jobs);
		} catch (AllExceptions e) {
			// Trả về thông báo từ service
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/search-by-experience")
	public ResponseEntity<Object> searchJobByExperience(@RequestParam("experience") String experience) {
		try {
			List<JobPost> jobs = jobPostService.searchJobByExperience(experience);
			return ResponseEntity.ok(jobs);
		} catch (AllExceptions e) {

			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/search-by-company/{companyId}")
	public ResponseEntity<Page<JobPost>> getJobsByCompanyId(@PathVariable UUID companyId,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "6") int size) {

		Page<JobPost> jobPosts = jobPostService.findJobByCompanyId(companyId, page, size);
		return ResponseEntity.ok(jobPosts);
	}

	@GetMapping("/search-by-company")
	public ResponseEntity<List<JobPost>> getJobsByCompanyId(@RequestHeader("Authorization") String jwt) {

		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		List<JobPost> jobPosts = jobPostRepository.findJobByCompany(user.get().getCompany().getCompanyId());
		return ResponseEntity.ok(jobPosts);
	}

	@GetMapping("/findJob/{postId}")
	public ResponseEntity<JobPost> getJobById(@PathVariable("postId") UUID postId) throws AllExceptions {
		try {
			JobPost jobPost = jobPostService.searchJobByPostId(postId);
			return new ResponseEntity<>(jobPost, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}

	@PostMapping("/count-new-jobs-per-day")
	public List<DailyJobCount> countNewJobsPerDay(@RequestParam String startDate, @RequestParam String endDate) {
		LocalDateTime start = LocalDateTime.parse(startDate);
		LocalDateTime end = LocalDateTime.parse(endDate);

		return jobPostService.getDailyJobPostCounts(start, end);
	}

	@PostMapping("/recommend-jobs")
	public ResponseEntity<List<JobRecommendationDTO>> getJobRecommendations(
			@RequestHeader("Authorization") String jwt) {
		// Lấy email từ JWT
		String email = JwtProvider.getEmailFromJwtToken(jwt);

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss z");

		// Tìm người dùng bằng email
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
		if (!userOptional.isPresent()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}

		UserAccount user = userOptional.get();
		UUID userId = user.getUserId();

		// Tạo body để gửi đến API Python
		Map<String, String> requestBody = new HashMap<>();
		requestBody.put("userId", userId.toString());
		System.out.println("User ID sent to Python API: " + userId);

		// Gửi yêu cầu đến API Python
		String apiUrl = "http://localhost:5000/recommend-jobs";
		HttpHeaders headers = new HttpHeaders();
		// Thêm userId vào header với tên rõ ràng hơn, ví dụ "X-User-Id"
		headers.set("X-User-Id", userId.toString());

		// Sử dụng ObjectMapper để chuyển đổi requestBody thành JSON
		ObjectMapper objectMapper = new ObjectMapper();
		String jsonRequestBody;
		try {
			jsonRequestBody = objectMapper.writeValueAsString(requestBody);
		} catch (JsonProcessingException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}

		HttpEntity<String> entity = new HttpEntity<>(jsonRequestBody, headers);

		try {
			// Gửi yêu cầu đến API Python
			ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

			// Chuyển đổi JSON Response thành JsonNode
			JsonNode jsonResponse = objectMapper.readTree(response.getBody());

			// Tạo danh sách JobPost
			List<JobRecommendationDTO> jobs = new ArrayList<>();

			// Duyệt qua từng đối tượng trong JsonNode và thiết lập từng giá trị cho JobPost
			for (JsonNode jobNode : jsonResponse) {
				JobRecommendationDTO job = new JobRecommendationDTO();
				String createDateStr = jobNode.get("createDate").asText(null);
				if (createDateStr != null && !createDateStr.isEmpty()) {
					try {
						job.setCreateDate(LocalDateTime.parse(createDateStr, formatter));
					} catch (Exception e) {
						System.out.println("Error parsing createDate: " + createDateStr + " - " + e.getMessage());
					}
				}

				// Xử lý expireDate với kiểm tra null và định dạng
				String expireDateStr = jobNode.get("expireDate").asText(null);
				if (expireDateStr != null && !expireDateStr.isEmpty()) {
					try {
						job.setExpireDate(LocalDateTime.parse(expireDateStr, formatter));
					} catch (Exception e) {
						System.out.println("Error parsing expireDate: " + expireDateStr + " - " + e.getMessage());
					}
				}
				job.setDescription(jobNode.get("description").asText(null));
				job.setExperience(jobNode.get("experience").asText(null));
				job.setLocation(jobNode.get("location").asText(null));
				job.setPostId(UUID.fromString(jobNode.get("postId").asText()));
				job.setSalary(jobNode.get("salary").asLong());
				job.setTitle(jobNode.get("title").asText(null));
				job.setTypeOfWork(jobNode.get("typeOfWork").asText(null));
				job.setCompanyId(UUID.fromString(jobNode.get("companyId").asText(null)));
				job.setCompanyName(jobNode.get("companyName").asText(null));
				job.setCityName(jobNode.get("cityName").asText(null));
				job.setIndustryName(jobNode.get("industryName").asText(null));
				job.setLogo(jobNode.get("logo").asText(null));
				jobs.add(job);
			}

			return ResponseEntity.ok(jobs); // Trả về danh sách việc làm
		} catch (JsonProcessingException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/count-job-by-type")
	public List<JobCountType> getCountJobByTypeOfWork() {
		return jobPostService.getJobCountByType();
	}

	@GetMapping("/search-job-by-feature")
	public Page<JobPost> searchJobs(@RequestHeader(value = "Authorization", required = false) String jwt, // Jwt không
																											// bắt buộc
			@RequestParam(required = false) String title,
			@RequestParam(required = false) List<String> selectedTypesOfWork,
			@RequestParam(required = false) Long minSalary, @RequestParam(required = false) Long maxSalary,
			@RequestParam(required = false) Integer cityId,
			@RequestParam(required = false) List<Integer> selectedIndustryIds,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "7") int size) throws IOException {

		// Gom các thuộc tính tìm kiếm vào một chuỗi duy nhất
		StringBuilder searchQuery = new StringBuilder();

		if (title != null && !title.isEmpty()) {
			searchQuery.append("Title: ").append(title).append(" | ");
		}
		if (selectedTypesOfWork != null && !selectedTypesOfWork.isEmpty()) {
			searchQuery.append("TypesOfWork: ").append(String.join(", ", selectedTypesOfWork)).append(" | ");
		}
//	    if (minSalary != null) {
//	        searchQuery.append("MinSalary: ").append(minSalary).append(" | ");
//	    }
		if (maxSalary != null) {
			searchQuery.append("MaxSalary: ").append(maxSalary).append(" | ");
		}
		if (cityId != null) {
			// Giả sử bạn có một service để lấy tên thành phố từ cityId
			String cityName = cityRepository.findCityNameById(cityId); // Gọi service để lấy tên thành phố
			if (cityName != null && !cityName.isEmpty()) {
				searchQuery.append("CityName: ").append(cityName).append(" | ");
			}
		}
		if (selectedIndustryIds != null && !selectedIndustryIds.isEmpty()) {
			// Giả sử bạn có một service để lấy tên ngành từ ID
			List<String> industryNames = industryRepository.findIndustryNamesByIds(selectedIndustryIds);
			searchQuery.append("IndustryNames: ").append(String.join(", ", industryNames)).append(" | ");
		}

		// Loại bỏ dấu " | " cuối cùng nếu có
		if (searchQuery.length() > 0) {
			searchQuery.setLength(searchQuery.length() - 3); // Xóa dấu " | " cuối
		}

		// Kiểm tra và lưu lịch sử tìm kiếm nếu người dùng đã đăng nhập
		if (jwt != null) {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);

			// Lưu lịch sử tìm kiếm nếu người dùng đã đăng nhập
			if (user.isPresent() && user.get().getSeeker() != null) {
				System.out.print(searchQuery.toString());
				searchHistoryService.exportSearchHistoryToCSV(filePath, searchQuery.toString(),
						user.get().getSeeker().getUserId());

			}
		}

		// Tiến hành tìm kiếm công việc với các filter đã xác định
		Specification<JobPost> spec = Specification.where(jobPostRepository.alwaysActiveJobs()).and(JobPostSpecification
				.withFilters(title, selectedTypesOfWork, minSalary, maxSalary, cityId, selectedIndustryIds));

		Pageable pageable = PageRequest.of(page, size);
		return jobPostRepository.findAll(spec, pageable);
	}

	@GetMapping("/salary-range")
	public ResponseEntity<Map<String, Long>> getSalaryRange() {
		Long minSalary = jobPostRepository.findMinSalary(); // Tạo phương thức trong repository
		Long maxSalary = jobPostRepository.findMaxSalary(); // Tạo phương thức trong repository

		Map<String, Long> salaryRange = new HashMap<>();
		salaryRange.put("minSalary", minSalary);
		salaryRange.put("maxSalary", maxSalary);

		return ResponseEntity.ok(salaryRange);
	}

	@GetMapping("/count-by-company/{companyId}")
	public ResponseEntity<Long> countJobsByCompany(@PathVariable UUID companyId) {
		long totalJobs = jobPostRepository
				.countByCompanyCompanyIdAndIsApproveTrueAndExpireDateGreaterThanEqual(companyId, LocalDateTime.now());
		return ResponseEntity.ok(totalJobs);

	}

	@GetMapping("/top-5-job-lastest")
	public ResponseEntity<List<JobWithApplicationCountDTO>> getTop5JobsWithApplications(
			@RequestHeader("Authorization") String jwt) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		List<JobWithApplicationCountDTO> jobs = jobPostRepository
				.findJobsByCompanyIdSortedByCreateDateDesc(user.get().getCompany().getCompanyId());
		return ResponseEntity.ok(jobs);
	}

	@GetMapping("/employer-company")
	public ResponseEntity<Page<JobWithApplicationCountDTO>> getFilteredJobs(@RequestHeader("Authorization") String jwt,
			@RequestParam(required = false) String status, @RequestParam(required = false) String typeOfWork,
//	                                                                        @RequestParam(required = false) String sortByCreateDate,
//	                                                                        @RequestParam(required = false) String sortByExpireDate, 
//	                                                                        @RequestParam(required = false) String sortByCount,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		if (user.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
		}

//	    String sortOrder = null;
//
//	    // Xử lý sắp xếp theo các tham số
//	    if (sortByCreateDate != null) {
//	        sortOrder = "createDate " + (sortByCreateDate.equalsIgnoreCase("ASC") ? "ASC" : "DESC");
//	    } else if (sortByExpireDate != null) {
//	        sortOrder = "expireDate " + (sortByExpireDate.equalsIgnoreCase("ASC") ? "ASC" : "DESC");
//	    } else if (sortByCount != null) {
//	        sortOrder = "applicationCount " + (sortByCount.equalsIgnoreCase("ASC") ? "ASC" : "DESC");
//	    }
//
//	    // Mặc định sắp xếp theo createDate DESC
//	    if (sortOrder == null) {
//	        sortOrder = "createDate DESC";
//	    }

		Pageable pageable = PageRequest.of(page, size);
		Page<JobWithApplicationCountDTO> jobs = jobPostRepository
				.findJobsWithFiltersAndSorting(user.get().getCompany().getCompanyId(), status, typeOfWork,
//	            sortByCreateDate, sortByExpireDate, sortByCount
						pageable);

		return ResponseEntity.ok(jobs);
	}

	@GetMapping("/stats/daily")
	public ResponseEntity<?> getDailyStats(@RequestParam String startDate, @RequestParam String endDate) {
		try {
			LocalDate start = LocalDate.parse(startDate);
			LocalDate end = LocalDate.parse(endDate);

			List<Map<String, Object>> dailyStats = new ArrayList<>();

			LocalDate current = start;
			while (!current.isAfter(end)) {
				long newUsers = userAccountRepository.countByCreatedAtBetween(current, current.plusDays(1));
				long newJobs = jobPostRepository.countByCreatedAtBetween(current, current.plusDays(1));

				Map<String, Object> dayStat = new HashMap<>();
				dayStat.put("date", current.toString());
				dayStat.put("newUsers", newUsers);
				dayStat.put("newJobs", newJobs);

				dailyStats.add(dayStat);
				current = current.plusDays(1);
			}

			return ResponseEntity.ok(dailyStats);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error fetching daily stats: " + e.getMessage());
		}
	}

	@GetMapping("/company/{companyId}")
	public ResponseEntity<Page<JobPost>> getJobsByCompany(@PathVariable UUID companyId,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		try {
			Pageable pageable = PageRequest.of(page, size);
			Page<JobPost> jobs = jobPostService.findJobsByCompany(companyId, pageable);
			return ResponseEntity.ok(jobs);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/company/{companyId}/approved")
	public ResponseEntity<Page<JobPost>> getApprovedJobsByCompany(@PathVariable UUID companyId,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
		try {
			Pageable pageable = PageRequest.of(page, size);
			Page<JobPost> jobs = jobPostService.findApprovedJobsByCompany(companyId, pageable);
			return ResponseEntity.ok(jobs);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/count-jobs-by-company/{companyId}")
	public ResponseEntity<Map<String, Long>> countJobsByCompanyStatus(@PathVariable UUID companyId) {
		try {
			Map<String, Long> jobCounts = jobPostService.countAllJobsByCompany(companyId);
			return ResponseEntity.ok(jobCounts);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/company/{companyId}/job-stats")

	public ResponseEntity<?> getCompanyJobStats(@PathVariable UUID companyId, @RequestParam String startDate,
			@RequestParam String endDate) {
		try {
			// Parse ngày với định dạng ISO và set time
			LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
			LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);

			System.out.println("Start date: " + start);
			System.out.println("End date: " + end);

			List<Map<String, Object>> stats = jobPostService.getCompanyJobStats(companyId, start, end);
			return ResponseEntity.ok(stats);
		} catch (DateTimeParseException e) {
			System.err.println("Date parsing error: " + e.getMessage());
			return ResponseEntity.badRequest().body("Invalid date format. Use YYYY-MM-DD");
		} catch (Exception e) {
			System.err.println("Error in getCompanyJobStats: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error getting job stats: " + e.getMessage());
		}
	}

	@GetMapping("/admin/all-jobs")
	public ResponseEntity<Page<JobPost>> getAllJobsForAdmin(
			@RequestParam(required = false, defaultValue = "") String title,
			@RequestParam(required = false, defaultValue = "") String status,
			@RequestParam(required = false, defaultValue = "") Boolean isApprove,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<JobPost> jobPosts = jobPostRepository.searchJobPosts(title, status, isApprove, pageable);
		return ResponseEntity.ok(jobPosts);

	}

	@GetMapping("/similar-jobs")
	public ResponseEntity<Object> getSimilarJobs(@RequestParam UUID companyId,
			@RequestParam(required = false) UUID excludePostId) {
		try {
			// Fetch the industryId based on the companyId
			Integer industryId = companyService.getIndustryIdByCompanyId(companyId);
			List<JobPost> similarJobs = jobPostService.getSimilarJobsByIndustry(industryId, excludePostId);
			return ResponseEntity.ok(similarJobs);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}
}