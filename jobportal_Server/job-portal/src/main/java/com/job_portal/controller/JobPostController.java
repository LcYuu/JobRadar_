package com.job_portal.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import com.job_portal.DTO.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.job_portal.config.JwtProvider;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.projection.JobWithApplicationCountProjection;

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
import com.job_portal.service.WebSocketService;
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

	@Autowired
	private WebSocketService webSocketService;

	String filePath = "D:\\JobRadar_\\search.csv";
	
	private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

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

			JobPost createdJob = jobPostService.createJob(jobPostDTO, user.get().getCompany().getCompanyId());

			if (createdJob != null) {
				webSocketService.sendUpdate("/topic/job-updates", "ADD JOB"); // Gửi JobPost qua WebSocket
				return new ResponseEntity<>("Công việc được tạo thành công. Chờ Admin phê duyệt", HttpStatus.CREATED);
			} else {
				return new ResponseEntity<>("Công việc tạo thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			return new ResponseEntity<>("Đã có lỗi xảy ra: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/approve/{postId}")
	public ResponseEntity<String> approveJobPost(@PathVariable UUID postId) {
		JobPost approvedJob = jobPostService.approveJob(postId);
		if (approvedJob != null) {
			Optional<Company> company = companyRepository.findCompanyByPostId(postId);
			if (company.isPresent()) {
				notificationService.notifyNewJobPost(company.get().getCompanyId(), postId);
			}
			webSocketService.sendUpdate("/topic/job-updates", "APPROVE JOB"); // Gửi JobPost qua WebSocket
			return ResponseEntity.ok("Chấp thuận thành công");
		} else {
			return ResponseEntity.status(404).body("Không thể tìm thấy công việc");
		}
	}

	@PutMapping("/update-job/{postId}")
	public ResponseEntity<String> updateJobPost(
//			@RequestHeader("Authorization") String jwt,
			@RequestBody JobPostDTO jobPost, @PathVariable("postId") UUID postId) throws AllExceptions {
		Optional<JobPost> oldJobPost = jobPostRepository.findById(postId);
		if (!oldJobPost.isPresent()) {
			return new ResponseEntity<>("Công việc không tồn tại", HttpStatus.NOT_FOUND);
		}
//		if (!oldJobPost.get().isApprove()) {
			JobPost updatedJob = jobPostService.updateJob(jobPost, postId);
			if (updatedJob != null) {
				webSocketService.sendUpdate("/topic/job-updates", "UPDATE JOB"); // Gửi JobPost qua WebSocket
				return new ResponseEntity<>("Cập nhật thành công", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Cập nhật thất bại", HttpStatus.BAD_REQUEST);
			}
//		} else {
//			return new ResponseEntity<>("Bài viết đã được chấp thuận, không được thay đổi", HttpStatus.BAD_REQUEST);
//		}
	}

	@PutMapping("/set-expire/{postId}")
	public ResponseEntity<Boolean> updateExpireJobPost(@PathVariable("postId") UUID postId) {
		try {
			Optional<JobPost> oldJobPostOptional = jobPostRepository.findById(postId);

			if (oldJobPostOptional.isEmpty()) {
				return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
			}

			JobPost oldJobPost = oldJobPostOptional.get();
			oldJobPost.setExpireDate(LocalDateTime.now());
			oldJobPost.setStatus("Hết hạn");
			jobPostRepository.save(oldJobPost);

			webSocketService.sendUpdate("/topic/job-updates", "EXPIRE JOB");

			return new ResponseEntity<>(true, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/delete-job/{postId}")
	public ResponseEntity<String> deleteJob(@PathVariable("postId") UUID postId) {
		try {
			boolean isDeleted = jobPostService.deleteJob(postId);
			if (isDeleted) {
				webSocketService.sendUpdate("/topic/job-updates", "DELETE JOB");
				return new ResponseEntity<>("Xóa thành công", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Xóa thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
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



//	@GetMapping("/min-salary/{minSalary}")
//	public ResponseEntity<Object> findBySalaryGreaterThanEqual(@PathVariable("minSalary") Long minSalary) {
//		try {
//			List<JobPost> jobs = jobPostService.findBySalaryGreaterThanEqual(minSalary);
//			return ResponseEntity.ok(jobs);
//		} catch (AllExceptions e) {
//			// Trả về thông báo từ service
//			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//		} catch (Exception e) {
//			// Trả về thông báo lỗi chung
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
//		}
//	}
//
//	@GetMapping("/max-salary/{maxSalary}")
//	public ResponseEntity<Object> findBySalaryLessThanEqual(@PathVariable("maxSalary") Long maxSalary) {
//		try {
//			List<JobPost> jobs = jobPostService.findBySalaryLessThanEqual(maxSalary);
//			return ResponseEntity.ok(jobs);
//		} catch (AllExceptions e) {
//			// Trả về thông báo từ service
//			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//		} catch (Exception e) {
//			// Trả về thông báo lỗi chung
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
//		}
//	}
//
//	@GetMapping("/salary-between")
//	public ResponseEntity<Object> findBySalaryBetween(@RequestParam Long minSalary, @RequestParam Long maxSalary) {
//		try {
//			List<JobPost> jobs = jobPostService.findBySalaryBetween(minSalary, maxSalary);
//			return ResponseEntity.ok(jobs);
//		} catch (AllExceptions e) {
//			// Trả về thông báo từ service
//			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//		} catch (Exception e) {
//			// Trả về thông báo lỗi chung
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
//		}
//	}

	@GetMapping("/findJob/{postId}")
	public ResponseEntity<JobPost> getJobById(@PathVariable("postId") UUID postId) throws AllExceptions {
		try {
			JobPost jobPost = jobPostService.searchJobByPostId(postId);
			jobPostService.increaseViewCount(postId);
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

	@PostMapping("/recommend-jobs/phobert")
	public ResponseEntity<List<JobRecommendationDTO>> getJobRecommendations(
	        @RequestHeader("Authorization") String jwt) {
	    // Lấy email từ JWT
	    String email;
	    try {
	        email = JwtProvider.getEmailFromJwtToken(jwt);
	    } catch (Exception e) {
	        System.out.println("Lỗi giải mã JWT: " + e.getMessage());
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
	    }

		// Tìm người dùng bằng email
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
		if (!userOptional.isPresent()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}
		
		UUID userId = userOptional.get().getUserId();

	    // Gửi yêu cầu đến API Python
	    String apiUrl = "http://localhost:5000/recommend-jobs/phobert";
	    HttpHeaders headers = new HttpHeaders();
	    headers.set("X-User-Id", userId.toString());
	    headers.setContentType(MediaType.APPLICATION_JSON);

	    // Chuẩn bị request body (có thể bỏ trống vì API Python không yêu cầu body)
	    HttpEntity<String> entity = new HttpEntity<>("{}", headers);

	    // Định dạng ngày giờ phù hợp
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

	    try {
	        // Gửi request tới API Python
	        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
	        ObjectMapper objectMapper = new ObjectMapper();
	        JsonNode jsonResponse = objectMapper.readTree(response.getBody());

	        // Kiểm tra nếu phản hồi là một mảng
	        if (!jsonResponse.isArray()) {
	            System.out.println("Phản hồi từ API Python không phải là mảng JSON");
	            return ResponseEntity.ok(new ArrayList<>());
	        }

	        List<JobRecommendationDTO> jobs = new ArrayList<>();

	        // Duyệt qua từng phần tử trong mảng
	        for (JsonNode jobNode : jsonResponse) {
	            JobRecommendationDTO job = new JobRecommendationDTO();

	            // Ánh xạ các trường từ JSON sang DTO
	            JsonNode postIdNode = jobNode.get("postId");
	            if (postIdNode != null && !postIdNode.isNull()) {
	                try {
	                    job.setPostId(UUID.fromString(postIdNode.asText()));
	                } catch (IllegalArgumentException e) {
	                    System.out.println("postId không hợp lệ: " + postIdNode.asText());
	                    continue;
	                }
	            } else {
	                System.out.println("postId bị thiếu hoặc null");
	                continue;
	            }

	            job.setTitle(jobNode.get("title") != null ? jobNode.get("title").asText(null) : null);
	            job.setDescription(jobNode.get("description") != null ? jobNode.get("description").asText(null) : null);
	            job.setLocation(jobNode.get("location") != null ? jobNode.get("location").asText(null) : null);

	            JsonNode salaryNode = jobNode.get("salary");
	            job.setSalary(salaryNode != null && !salaryNode.isNull() ? salaryNode.asLong(0) : 0);

	            job.setExperience(jobNode.get("experience") != null ? jobNode.get("experience").asText(null) : null);
	            job.setTypeOfWork(jobNode.get("typeOfWork") != null ? jobNode.get("typeOfWork").asText(null) : null);

	            JsonNode companyIdNode = jobNode.get("companyId");
	            if (companyIdNode != null && !companyIdNode.isNull()) {
	                try {
	                    job.setCompanyId(UUID.fromString(companyIdNode.asText()));
	                } catch (IllegalArgumentException e) {
	                    System.out.println("companyId không hợp lệ: " + companyIdNode.asText());
	                    continue;
	                }
	            } else {
	                System.out.println("companyId bị thiếu hoặc null");
	                continue;
	            }

	            job.setCompanyName(jobNode.get("companyName") != null ? jobNode.get("companyName").asText(null) : null);
	            job.setCityName(jobNode.get("cityName") != null ? jobNode.get("cityName").asText(null) : null);
	            job.setLogo(jobNode.get("logo") != null ? jobNode.get("logo").asText(null) : null);

	            // Xử lý createDate
	            String createDateStr = jobNode.get("createDate") != null ? jobNode.get("createDate").asText(null) : null;
	            if (createDateStr != null && !createDateStr.isEmpty()) {
	                try {
	                    job.setCreateDate(LocalDateTime.parse(createDateStr, formatter));
	                } catch (DateTimeParseException e) {
	                    System.out.println("Lỗi chuyển đổi createDate: " + createDateStr + " - " + e.getMessage());
	                }
	            }

	            // Xử lý expireDate
	            String expireDateStr = jobNode.get("expireDate") != null ? jobNode.get("expireDate").asText(null) : null;
	            if (expireDateStr != null && !expireDateStr.isEmpty()) {
	                try {
	                    job.setExpireDate(LocalDateTime.parse(expireDateStr, formatter));
	                } catch (DateTimeParseException e) {
	                    System.out.println("Lỗi chuyển đổi expireDate: " + expireDateStr + " - " + e.getMessage());
	                }
	            }

	            // Xử lý danh sách industryNames
	            JsonNode industriesNode = jobNode.get("industryNames");
	            if (industriesNode != null && industriesNode.isArray()) {
	                List<String> industryList = new ArrayList<>();
	                for (JsonNode industry : industriesNode) {
	                    industryList.add(industry.asText());
	                }
	                job.setIndustryNames(industryList);
	            } else {
	                job.setIndustryNames(new ArrayList<>());
	            }
	        }


	        return ResponseEntity.ok(jobs);
	    } catch (HttpClientErrorException e) {
	        System.out.println("Lỗi gọi API Python: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
	        return ResponseEntity.status(e.getStatusCode()).body(null);
	    } catch (JsonProcessingException e) {
	        System.out.println("Lỗi xử lý JSON: " + e.getMessage());
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	    } catch (Exception e) {
	        System.out.println("Lỗi chung: " + e.getMessage());
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


	       
	@PostMapping("/recommend-jobs/collaborative")
	public ResponseEntity<List<JobRecommendationDTO>> getJobRecommendationCollaborative(
			@RequestHeader("Authorization") String jwt) {
		// Lấy email từ JWT
		String email = JwtProvider.getEmailFromJwtToken(jwt);

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

		// Tìm người dùng bằng email
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
		if (!userOptional.isPresent()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}

		UserAccount user = userOptional.get();
		UUID userId = user.getUserId();

		// Gửi yêu cầu đến API Python
		String apiUrl = "http://localhost:5000/recommend-jobs/collaborative";
		HttpHeaders headers = new HttpHeaders();
		headers.set("X-User-Id", userId.toString());
		headers.setContentType(MediaType.APPLICATION_JSON);

		// Chuẩn bị request body
		Map<String, String> requestBody = new HashMap<>();
		requestBody.put("userId", userId.toString());

		ObjectMapper objectMapper = new ObjectMapper();
		String jsonRequestBody;
		try {
			jsonRequestBody = objectMapper.writeValueAsString(requestBody);
		} catch (JsonProcessingException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
		HttpEntity<String> entity = new HttpEntity<>(jsonRequestBody, headers);

		try {
			// Gửi request tới API Python
			ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
			JsonNode jsonResponse = objectMapper.readTree(response.getBody());

			List<JobRecommendationDTO> jobs = new ArrayList<>();

			for (JsonNode jobNode : jsonResponse) {
				JobRecommendationDTO job = new JobRecommendationDTO();

				job.setPostId(UUID.fromString(jobNode.get("postId").asText()));
				job.setTitle(jobNode.get("title").asText(null));
				job.setDescription(jobNode.get("description").asText(null));
				job.setLocation(jobNode.get("location").asText(null));
				job.setSalary(jobNode.get("salary").asLong());
				job.setExperience(jobNode.get("experience").asText(null));
				job.setTypeOfWork(jobNode.get("typeOfWork").asText(null));
				job.setCompanyId(UUID.fromString(jobNode.get("companyId").asText()));
				job.setCompanyName(jobNode.get("companyName").asText(null));
				job.setCityName(jobNode.get("cityName").asText(null));
				job.setLogo(jobNode.get("logo").asText(null));

				// Xử lý createDate
				String createDateStr = jobNode.get("createDate").asText(null);
				if (createDateStr != null && !createDateStr.isEmpty()) {
					try {
						job.setCreateDate(LocalDateTime.parse(createDateStr, formatter));
					} catch (DateTimeParseException e) {
						System.out.println("Lỗi chuyển đổi createDate: " + createDateStr + " - " + e.getMessage());
					}
				}

				// Xử lý expireDate
				String expireDateStr = jobNode.get("expireDate").asText(null);
				if (expireDateStr != null && !expireDateStr.isEmpty()) {
					try {
						job.setExpireDate(LocalDateTime.parse(expireDateStr, formatter));
					} catch (DateTimeParseException e) {
						System.out.println("Lỗi chuyển đổi expireDate: " + expireDateStr + " - " + e.getMessage());
					}
				}

				// Xử lý danh sách industryNames
				JsonNode industriesNode = jobNode.get("industryNames");
				if (industriesNode != null && industriesNode.isArray()) {
					List<String> industryList = new ArrayList<>();
					for (JsonNode industry : industriesNode) {
						industryList.add(industry.asText());
					}
					job.setIndustryNames(industryList);
				}

				jobs.add(job);
			}

			return ResponseEntity.ok(jobs);
		} catch (JsonProcessingException e) {
			System.out.println("Lỗi xử lý JSON: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		} catch (Exception e) {
			System.out.println("Lỗi chung: " + e.getMessage());
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
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) throws IOException {

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

		return jobPostService.searchJobs(title, selectedTypesOfWork, minSalary, maxSalary, cityId, selectedIndustryIds,
				page, size);

	}

	@GetMapping("/semantic-search")
	public ResponseEntity<Map<String, Object>> semanticSearch(
			@RequestHeader(value = "Authorization", required = false) String jwt,
			@RequestParam(required = false) String query,
			@RequestParam(required = false) List<String> selectedTypesOfWork,
			@RequestParam(required = false) Long minSalary, 
			@RequestParam(required = false) Long maxSalary,
			@RequestParam(required = false) Integer cityId,
			@RequestParam(required = false) List<Integer> selectedIndustryIds,
			@RequestParam(defaultValue = "0") int page, 
			@RequestParam(defaultValue = "7") int size) {
		
		try {
			// Lưu lịch sử tìm kiếm nếu người dùng đã đăng nhập
			if (jwt != null) {
				String email = JwtProvider.getEmailFromJwtToken(jwt);
				Optional<UserAccount> user = userAccountRepository.findByEmail(email);

				if (user.isPresent() && user.get().getSeeker() != null) {
					StringBuilder searchQuery = new StringBuilder();
					if (query != null && !query.isEmpty()) {
						searchQuery.append("Semantic Query: ").append(query).append(" | ");
					}
					if (selectedTypesOfWork != null && !selectedTypesOfWork.isEmpty()) {
						searchQuery.append("TypesOfWork: ").append(String.join(", ", selectedTypesOfWork)).append(" | ");
					}
					if (maxSalary != null) {
						searchQuery.append("MaxSalary: ").append(maxSalary).append(" | ");
					}
					if (cityId != null) {
						String cityName = cityRepository.findCityNameById(cityId);
						if (cityName != null && !cityName.isEmpty()) {
							searchQuery.append("CityName: ").append(cityName).append(" | ");
						}
					}
					if (selectedIndustryIds != null && !selectedIndustryIds.isEmpty()) {
						List<String> industryNames = industryRepository.findIndustryNamesByIds(selectedIndustryIds);
						searchQuery.append("IndustryNames: ").append(String.join(", ", industryNames)).append(" | ");
					}
					
					if (searchQuery.length() > 0) {
						searchQuery.setLength(searchQuery.length() - 3);
					}
					
					searchHistoryService.exportSearchHistoryToCSV(filePath, searchQuery.toString(),
							user.get().getSeeker().getUserId());
				}
			}
			
			// Gọi service để thực hiện tìm kiếm ngữ nghĩa với các bộ lọc
			Page<JobPost> results = jobPostService.semanticSearchWithFilters(
					query, selectedTypesOfWork, minSalary, maxSalary, cityId, selectedIndustryIds, page, size);
			
			Map<String, Object> response = new HashMap<>();
			response.put("content", results.getContent());
			response.put("currentPage", results.getNumber());
			response.put("totalElements", results.getTotalElements());
			response.put("totalPages", results.getTotalPages());
			
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "Đã xảy ra lỗi khi thực hiện tìm kiếm ngữ nghĩa: " + e.getMessage()));
		}
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

	    // Lấy email từ JWT
	    String email = JwtProvider.getEmailFromJwtToken(jwt);

	    // Lấy user từ email
	    Optional<UserAccount> user = userAccountRepository.findByEmail(email);

	    if (user.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
	    }

	    UUID userId = user.get().getUserId();

	    // Gọi repository để lấy danh sách công việc
	    List<JobWithApplicationCountProjection> projections = jobPostRepository
	            .findJobsByCompanyIdSortedByCreateDateDesc(userId.toString());



	    return ResponseEntity.ok(projections.stream()
	            .map(p -> new JobWithApplicationCountDTO(p.getPostId(), p.getTitle(), p.getDescription(),
	                    p.getLocation(), p.getSalary(), p.getExperience(), p.getTypeOfWork(), p.getCreateDate(),
	                    p.getExpireDate(), p.getApplicationCount(), p.getStatus(),
	                    p.getIndustryNames() != null ? Arrays.asList(p.getIndustryNames().split(", ")) : null,
	                    p.getIsApprove()))
	            .collect(Collectors.toList()));
	}

//	@GetMapping("/employer-company")
//	public ResponseEntity<Page<JobWithApplicationCountDTO>> getFilteredJobs(@RequestHeader("Authorization") String jwt,
//			@RequestParam(required = false) String status, @RequestParam(required = false) String typeOfWork,
//			@RequestParam(required = false) String sortBy, @RequestParam(required = false) String sortDirection,
//			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
//		String email = JwtProvider.getEmailFromJwtToken(jwt);
//		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
//		// Xác định hướng sắp xếp (mặc định là giảm dần)
//		Sort.Direction direction = Sort.Direction.DESC;
//		if (sortDirection != null && sortDirection.equalsIgnoreCase("asc")) {
//			direction = Sort.Direction.ASC;
//		}
//
//		// Xác định trường sắp xếp (mặc định là createDate)
//		String sortField = "createDate";
//		if (sortBy != null) {
//			switch (sortBy.toLowerCase()) {
//				case "title":
//					sortField = "title";
//					break;
//				case "createdate":
//					sortField = "createDate";
//					break;
//				case "expiredate":
//					sortField = "expireDate";
//					break;
//				case "applicationcount":
//					// ApplicationCount được xử lý đặc biệt bên dưới
//					break;
//				default:
//					sortField = "createDate";
//			}
//		}
//
//		// Lấy dữ liệu từ repository
//		Page<JobWithApplicationCountDTO> jobs;
//		
//		if (sortBy != null && sortBy.equalsIgnoreCase("applicationcount")) {
//			// Trường hợp đặc biệt: sắp xếp theo số lượng ứng viên
//			// Ở đây chúng ta không thể sử dụng trực tiếp Pageable vì cần xử lý ở mức ứng dụng
//			// Lấy tất cả jobs phù hợp với filter
//			List<JobWithApplicationCountDTO> allJobs = jobPostRepository
//				.findAllJobsWithFilters(user.get().getCompany().getCompanyId(), status, typeOfWork);
//			
//			// Sắp xếp theo applicationCount với hướng thích hợp
//			if (direction == Sort.Direction.ASC) {
//				allJobs.sort((job1, job2) -> Long.compare(job1.getApplicationCount(), job2.getApplicationCount()));
//			} else {
//				allJobs.sort((job1, job2) -> Long.compare(job2.getApplicationCount(), job1.getApplicationCount()));
//			}
//			
//			// Tạo phân trang thủ công
//			int start = (int) Math.min(page * size, allJobs.size());
//			int end = (int) Math.min((page + 1) * size, allJobs.size());
//			List<JobWithApplicationCountDTO> pageContent = allJobs.subList(start, end);
//			
//			jobs = new PageImpl<>(pageContent, PageRequest.of(page, size), allJobs.size());
//		} else {
//			// Trường hợp thông thường: sắp xếp theo các trường khác
//			Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
//			jobs = jobPostRepository
//					.findJobsWithFiltersAndSorting(user.get().getCompany().getCompanyId().toString(), status, typeOfWork, pageable);
//      Page<JobWithApplicationCountDTO> jobDTOs = pro.map(p -> new JobWithApplicationCountDTO(
//	    	    p.getPostId(), p.getTitle(), p.getDescription(), p.getLocation(),
//	    	    p.getSalary(), p.getExperience(), p.getTypeOfWork(), p.getCreateDate(),
//	    	    p.getExpireDate(), p.getApplicationCount(), p.getStatus(),
//	    	    p.getIndustryNames() != null ? Arrays.asList(p.getIndustryNames().split(", ")) : null,
//	    	    p.getIsApprove()
//	    	));
//		}
//  return ResponseEntity.ok(jobs);
//	}
	@GetMapping("/employer-company")
	public ResponseEntity<Page<JobWithApplicationCountDTO>> getFilteredJobs(
	        @RequestHeader("Authorization") String jwt,
	        @RequestParam(required = false) String status,
	        @RequestParam(required = false) String typeOfWork,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "5") int size) {

	    // Lấy email từ JWT
	    String email = JwtProvider.getEmailFromJwtToken(jwt);
	    Optional<UserAccount> user = userAccountRepository.findByEmail(email);

	    if (user.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
	    }

	    UUID userId = user.get().getUserId();
	    Pageable pageable = PageRequest.of(page, size);

	    // Lấy dữ liệu từ repository
	    Page<JobWithApplicationCountProjection> pro = jobPostRepository
	            .findJobsWithFiltersAndSorting(userId.toString(), status, typeOfWork, pageable);

	    Page<JobWithApplicationCountDTO> jobDTOs = pro.map(p -> new JobWithApplicationCountDTO(
	    	    p.getPostId(), p.getTitle(), p.getDescription(), p.getLocation(),
	    	    p.getSalary(), p.getExperience(), p.getTypeOfWork(), p.getCreateDate(),
	    	    p.getExpireDate(), p.getApplicationCount(), p.getStatus(),
	    	    p.getIndustryNames() != null ? Arrays.asList(p.getIndustryNames().split(", ")) : null,
	    	    p.getIsApprove()
	    	));

	    	System.out.println("Total elements: " + jobDTOs.getTotalElements());
	    	System.out.println("Total pages: " + jobDTOs.getTotalPages());
	    	System.out.println("Number of jobs in page: " + jobDTOs.getContent().size());

	    return ResponseEntity.ok(jobDTOs);
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

//	@GetMapping("/company/{companyId}/approved")
//	public ResponseEntity<Page<JobPost>> getApprovedJobsByCompany(@PathVariable UUID companyId,
//			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
//		try {
//			Pageable pageable = PageRequest.of(page, size);
//			Page<JobPost> jobs = jobPostService.findApprovedJobsByCompany(companyId, pageable);
//			return ResponseEntity.ok(jobs);
//		} catch (Exception e) {
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
//		}
//	}

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

			List<Integer> industryId = companyService.getIndustryIdsByCompanyId(companyId);
			List<JobPost> similarJobs = jobPostService.getSimilarJobsByIndustry(industryId, excludePostId);
			return ResponseEntity.ok(similarJobs);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}
	// Thêm endpoint mới
	@GetMapping("/candidates-by-job")
	public ResponseEntity<Map<String, List<CandidateWithScoreDTO>>> getCandidatesByJob(
			@RequestHeader("Authorization") String jwt,
			@RequestParam(required = false) String sortDirection, 
			@RequestParam(required = false) String sortBy
	) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);
			UUID companyId = user.get().getCompany().getCompanyId();

			// Lấy danh sách ứng viên được nhóm theo job và sắp xếp theo điểm
			Map<String, List<CandidateWithScoreDTO>> groupedCandidates = 
					jobPostService.getCandidatesByJobForCompany(companyId, sortDirection, sortBy);

			return ResponseEntity.ok(groupedCandidates);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

}