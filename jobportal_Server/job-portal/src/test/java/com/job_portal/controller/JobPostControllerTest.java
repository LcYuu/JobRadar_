package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.job_portal.DTO.JobPostDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.UserAccount;
import com.job_portal.projection.JobWithApplicationCountProjection;
import com.job_portal.repository.CityRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.AccountDetailServiceImpl;
import com.job_portal.service.IJobPostService;
import com.job_portal.service.ISearchHistoryService;
import com.job_portal.service.WebSocketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import org.mockito.ArgumentMatchers;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.CoreMatchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class JobPostControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockBean
	private JobPostRepository jobPostRepository;

	@MockBean
	private UserAccountRepository userAccountRepository;

	@MockBean
	private CompanyRepository companyRepository;

	@MockBean
	private IJobPostService jobPostService;

	@MockBean
	private CityRepository cityRepository;

	@MockBean
	private IndustryRepository industryRepository;

	@MockBean
	private ISearchHistoryService searchHistoryService;

	@MockBean
	private WebSocketService webSocketService;

	@MockBean
	private JwtProvider jwtProvider;

	@MockBean
	private AccountDetailServiceImpl accountDetailService;

	@MockBean
	private RestTemplate restTemplate;

	private UserAccount userAccount;
	private Company company;
	private JobPost jobPost;
	private JobPostDTO jobPostDTO;
	private UUID postId;
	private String jwt;
	private Authentication authentication;
	private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJHaWFUaHVhblNlbnBhaSIsImlhdCI6MTc0NzY2MzY2NiwiZXhwIjoxNzQ3NzUwMDY2LCJlbWFpbCI6ImRhbmdnaWF0aHVhbmhsQGdtYWlsLmNvbSJ9.EENhWi5SWSDw2Wav2-p9s6xqxTPcs0SJQhoP6_Go4Tk";

	@BeforeEach
	void setUp() {
		postId = UUID.randomUUID();

		// Setup UserAccount
		userAccount = new UserAccount();
		userAccount.setUserId(UUID.randomUUID());
		userAccount.setEmail("giathuan@gmail.com");
		userAccount.setUserName("DangGiaThuan");

		// Setup Company
		company = new Company();
		company.setCompanyId(UUID.randomUUID());
		company.setCompanyName("Test Company");
		userAccount.setCompany(company);

		// Setup JobPost
		jobPost = new JobPost();
		jobPost.setPostId(postId);
		jobPost.setTitle("Software Engineer");
		jobPost.setDescription("Develop software solutions");
		jobPost.setSalary(50000L);
		jobPost.setCreateDate(LocalDateTime.now());
		jobPost.setCompany(company);
		jobPost.setApprove(false);
		jobPost.setStatus("Đang mở");

		// Setup JobPostDTO
		jobPostDTO = new JobPostDTO();
		jobPostDTO.setTitle("Software Engineer");
		jobPostDTO.setDescription("Develop software solutions");
		jobPostDTO.setSalary(50000L);

		jwt = "Bearer " + JWT_TOKEN;
		
		objectMapper = new ObjectMapper();
        // Đăng ký module để xử lý LocalDateTime
        objectMapper.registerModule(new JavaTimeModule());

		List<Map<String, Object>> mockSemanticApiResponse = List.of(Map.of("postId", postId.toString()));
		ResponseEntity<List<Map<String, Object>>> responseEntity = new ResponseEntity<>(mockSemanticApiResponse,
				HttpStatus.OK);

		when(restTemplate.exchange(eq("http://localhost:5000/semantic-search"), eq(HttpMethod.POST),
				any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(responseEntity);

	}

	@Test
	void testGetAllJobs_Success() throws Exception {
		List<JobPost> jobPosts = Arrays.asList(jobPost);
		when(jobPostRepository.findAll()).thenReturn(jobPosts);

		mockMvc.perform(get("/job-post/get-all").contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk())
				.andExpect(jsonPath("$[0].postId").value(postId.toString()))
				.andExpect(jsonPath("$[0].title").value("Software Engineer"));

		verify(jobPostRepository).findAll();
	}

	@Test
    void testCreateJobPost_Success() throws Exception {
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
        when(jobPostService.canPostJob(company.getCompanyId())).thenReturn(true);
        when(jobPostService.createJob(any(JobPostDTO.class), eq(company.getCompanyId()))).thenReturn(jobPost);
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("ADD JOB"));

        mockMvc.perform(post("/job-post/create-job")
                .header("Authorization", jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Công việc được tạo thành công. Chờ Admin phê duyệt"));

        verify(jobPostService).createJob(any(JobPostDTO.class), eq(company.getCompanyId()));
        verify(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("ADD JOB"));
    }

	@Test
    void testCreateJobPost_Forbidden_TooFrequent() throws Exception {
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
        when(jobPostService.canPostJob(company.getCompanyId())).thenReturn(false);

        mockMvc.perform(post("/job-post/create-job")
                .header("Authorization", jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO)))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Công ty chỉ được đăng 1 bài trong vòng 1 giờ."));

        verify(jobPostService, never()).createJob(any(JobPostDTO.class), any(UUID.class));
    }

	@Test
    void testUpdateJobPost_Success() throws Exception {
        when(jobPostRepository.findById(postId)).thenReturn(Optional.of(jobPost));
        when(jobPostService.updateJob(any(JobPostDTO.class), eq(postId))).thenReturn(jobPost);
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("UPDATE JOB"));

        mockMvc.perform(put("/job-post/update-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Cập nhật thành công"));

        verify(jobPostService).updateJob(any(JobPostDTO.class), eq(postId));
        verify(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("UPDATE JOB"));
    }

	@Test
    void testUpdateJobPost_NotFound() throws Exception {
        when(jobPostRepository.findById(postId)).thenReturn(Optional.empty());

        mockMvc.perform(put("/job-post/update-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO)))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Công việc không tồn tại"));

        verify(jobPostService, never()).updateJob(any(JobPostDTO.class), any(UUID.class));
    }

	@Test
    void testDeleteJobPost_Success() throws Exception {
        when(jobPostService.deleteJob(postId)).thenReturn(true);
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("DELETE JOB"));

        mockMvc.perform(delete("/job-post/delete-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Xóa thành công"));

        verify(jobPostService).deleteJob(postId);
        verify(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("DELETE JOB"));
    }

	@Test
    void testDeleteJobPost_Failure() throws Exception {
        when(jobPostService.deleteJob(postId)).thenReturn(false);

        mockMvc.perform(delete("/job-post/delete-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Xóa thất bại"));

        verify(jobPostService).deleteJob(postId);
    }

	@Test
	void testSearchJobs_Success_WithJwt() throws Exception {
	    // Arrange
	    String query = "AI"; // Đổi từ title thành query
	    List<String> typesOfWork = Arrays.asList("Toàn thời gian");
	    Long minSalary = 50000L;
	    Long maxSalary = 100000L;
	    Integer cityId = 1;
	    List<Integer> industryIds = Arrays.asList(1, 2);
	    int page = 0;
	    int size = 10;

	    List<JobPost> jobPosts = Arrays.asList(jobPost);
	    Page<JobPost> jobPostPage = new PageImpl<>(jobPosts, PageRequest.of(page, size), 1);

	    UUID seekerId = UUID.randomUUID();
	    if (userAccount.getSeeker() == null) {
	        com.job_portal.models.Seeker seeker = new com.job_portal.models.Seeker();
	        seeker.setUserId(seekerId);
	        userAccount.setSeeker(seeker);
	    }

	    when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
	    when(cityRepository.findCityNameById(cityId)).thenReturn("Hà Nội");
	    when(industryRepository.findIndustryNamesByIds(industryIds))
	            .thenReturn(Arrays.asList("IT phần mềm", "IT phần cứng"));
	    when(jobPostService.semanticSearchWithFilters(
	            eq(query), eq(typesOfWork), eq(minSalary), eq(maxSalary), eq(cityId), eq(industryIds), eq(page), eq(size)))
	            .thenReturn(jobPostPage);
	    doNothing().when(searchHistoryService).exportSearchHistoryToCSV(anyString(), anyString(), any(UUID.class));

	    // Act & Assert
	    mockMvc.perform(get("/job-post/semantic-search")
	            .header("Authorization", jwt)
	            .param("query", query)
	            .param("selectedTypesOfWork", typesOfWork.get(0))
	            .param("minSalary", minSalary.toString())
	            .param("maxSalary", maxSalary.toString())
	            .param("cityId", cityId.toString())
	            .param("selectedIndustryIds", "1", "2")
	            .param("page", String.valueOf(page))
	            .param("size", String.valueOf(size))
	            .contentType(MediaType.APPLICATION_JSON))
	            .andDo(print())
	            .andExpect(status().isOk());

	    // Xác minh tương tác
	    verify(jobPostService).semanticSearchWithFilters(
	            eq(query), eq(typesOfWork), eq(minSalary), eq(maxSalary), eq(cityId), eq(industryIds), eq(page), eq(size));
	    verify(searchHistoryService).exportSearchHistoryToCSV(anyString(), anyString(), any(UUID.class));
	}
	
	@Test
    void testGetJobsByCompanyId_Success() throws Exception {
        // Arrange
        UUID companyId = UUID.randomUUID();
        int page = 0;
        int size = 6;

        List<JobPost> jobPosts = Arrays.asList(jobPost);
        Page<JobPost> jobPostPage = new PageImpl<>(jobPosts, PageRequest.of(page, size), 1);

        when(jobPostService.findJobByCompanyId(eq(companyId), eq(page), eq(size)))
                .thenReturn(jobPostPage);

        // Act & Assert
        mockMvc.perform(get("/job-post/search-by-company/{companyId}", companyId)
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].postId").value(jobPost.getPostId().toString()))
                .andExpect(jsonPath("$.content[0].title").value(jobPost.getTitle()));

        // Xác minh tương tác
        verify(jobPostService).findJobByCompanyId(eq(companyId), eq(page), eq(size));
    }
	
	@Test
	void testGetJobsByCompanyId_InvalidCompanyId() throws Exception {
	    // Arrange
	    UUID companyId = UUID.randomUUID();
	    int page = 0;
	    int size = 6;

	    when(jobPostService.findJobByCompanyId(eq(companyId), eq(page), eq(size)))
	            .thenThrow(new IllegalArgumentException("Công ty không tồn tại"));

	    // Act & Assert
	    mockMvc.perform(get("/job-post/search-by-company/{companyId}", companyId)
	            .param("page", String.valueOf(page))
	            .param("size", String.valueOf(size))
	            .contentType(MediaType.APPLICATION_JSON))
	            .andDo(print())
	            .andExpect(status().isBadRequest()) // Cập nhật thành isBadRequest
	            .andExpect(jsonPath("$.error").value("Đã xảy ra lỗi: Công ty không tồn tại"));

	    // Xác minh tương tác
	    verify(jobPostService).findJobByCompanyId(eq(companyId), eq(page), eq(size));
	}
	
	@Test
    void testGetJobRecommendations_Success() throws Exception {
        // Arrange
        UUID userId = userAccount.getUserId();
        String apiUrl = "http://localhost:5000/recommend-jobs/phobert";

        // Mock UserAccountRepository
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));

        // Mock RestTemplate
        List<Map<String, Object>> jobList = new ArrayList<>();
        Map<String, Object> job = new HashMap<>();
        job.put("postId", UUID.randomUUID().toString());
        job.put("title", "Software Engineer");
        job.put("description", "Develop software solutions");
        job.put("location", "Hà Nội");
        job.put("salary", 50000L);
        job.put("experience", "2 years");
        job.put("typeOfWork", "Toàn thời gian");
        job.put("companyId", UUID.randomUUID().toString());
        job.put("companyName", "Tech Corp");
        job.put("cityName", "Hà Nội");
        job.put("logo", "logo.png");
        job.put("createDate", "2025-05-20T10:00:00.000000");
        job.put("expireDate", "2025-06-20T10:00:00.000000");
        job.put("industryNames", Arrays.asList("IT phần mềm", "Công nghệ"));
        jobList.add(job);

        String jsonResponse = objectMapper.writeValueAsString(jobList);
        when(restTemplate.exchange(
                eq(apiUrl),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)))
                .thenReturn(new ResponseEntity<>(jsonResponse, HttpStatus.OK));

        // Act & Assert
        mockMvc.perform(post("/job-post/recommend-jobs/phobert")
                .header("Authorization", jwt)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].postId").value(job.get("postId")))
                .andExpect(jsonPath("$[0].title").value("Software Engineer"))
                .andExpect(jsonPath("$[0].description").value("Develop software solutions"))
                .andExpect(jsonPath("$[0].location").value("Hà Nội"))
                .andExpect(jsonPath("$[0].salary").value(50000L))
                .andExpect(jsonPath("$[0].experience").value("2 years"))
                .andExpect(jsonPath("$[0].typeOfWork").value("Toàn thời gian"))
                .andExpect(jsonPath("$[0].companyId").value(job.get("companyId")))
                .andExpect(jsonPath("$[0].companyName").value("Tech Corp"))
                .andExpect(jsonPath("$[0].cityName").value("Hà Nội"))
                .andExpect(jsonPath("$[0].logo").value("logo.png"))
                .andExpect(jsonPath("$[0].createDate").value("2025-05-20T10:00:00"))
                .andExpect(jsonPath("$[0].expireDate").value("2025-06-20T10:00:00"))
                .andExpect(jsonPath("$[0].industryNames").isArray())
                .andExpect(jsonPath("$[0].industryNames[0]").value("IT phần mềm"))
                .andExpect(jsonPath("$[0].industryNames[1]").value("Công nghệ"))
        		.andDo(print())
        		.andExpect(status().isOk());

        // Xác minh tương tác
        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
 
        verify(restTemplate).exchange(
                eq(apiUrl),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class));
    }
	
	@Test
    void testGetJobRecommendations_InvalidJsonResponse() throws Exception {
        // Arrange
        String apiUrl = "http://localhost:5000/recommend-jobs/phobert";
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
        when(restTemplate.exchange(
                eq(apiUrl),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)))
                .thenReturn(new ResponseEntity<>("{invalid-json}", HttpStatus.OK));

        // Act & Assert
        mockMvc.perform(post("/job-post/recommend-jobs/phobert")
                .header("Authorization", jwt)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(""));

        // Xác minh tương tác
        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(restTemplate).exchange(
                eq(apiUrl),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class));
    }
	
	@Test
    void testGetFilteredJobs_Success_WithDefaultSorting() throws Exception {
        // Arrange
        String status = "Đang mở";
        String typeOfWork = "Bán thời gian";
        String sortBy = "createDate";
        String sortDirection = "desc";
        int page = 0;
        int size = 5;

        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));

        JobWithApplicationCountProjection jobProjection = mock(JobWithApplicationCountProjection.class);
        when(jobProjection.getPostId()).thenReturn(UUID.randomUUID());
        when(jobProjection.getTitle()).thenReturn("Software Engineer");
        when(jobProjection.getApplicationCount()).thenReturn(10L);
        when(jobProjection.getCreateDate()).thenReturn(LocalDateTime.now());
        when(jobProjection.getExpireDate()).thenReturn(LocalDateTime.now().plusDays(30));

        Page<JobWithApplicationCountProjection> jobPage = new PageImpl<>(
                Collections.singletonList(jobProjection), PageRequest.of(page, size), 1);

        when(jobPostRepository.findJobsWithFiltersAndSorting(
                eq(userAccount.getUserId().toString()), eq(status), eq(typeOfWork),
                eq(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createDate")))))
                .thenReturn(jobPage);

        // Act & Assert
        mockMvc.perform(get("/job-post/employer-company")
                .header("Authorization", jwt)
                .param("status", status)
                .param("typeOfWork", typeOfWork)
                .param("sortBy", sortBy)
                .param("sortDirection", sortDirection)
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].postId").value(jobProjection.getPostId().toString()))
                .andExpect(jsonPath("$.content[0].title").value("Software Engineer"))
                .andExpect(jsonPath("$.content[0].applicationCount").value(10));


        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(jobPostRepository).findJobsWithFiltersAndSorting(
                eq(userAccount.getUserId().toString()), eq(status), eq(typeOfWork),
                eq(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createDate"))));
    }

    @Test
    void testGetFilteredJobs_Success_WithApplicationCountSorting() throws Exception {
        // Arrange
        String status = "Đang mở";
        String typeOfWork = "Toàn thời gian";
        String sortBy = "applicationCount";
        String sortDirection = "asc";
        int page = 0;
        int size = 5;

        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));

        JobWithApplicationCountProjection jobProjection = mock(JobWithApplicationCountProjection.class);
        when(jobProjection.getPostId()).thenReturn(UUID.randomUUID());
        when(jobProjection.getTitle()).thenReturn("Software Engineer");
        when(jobProjection.getApplicationCount()).thenReturn(10L);
        when(jobProjection.getCreateDate()).thenReturn(LocalDateTime.now());
        when(jobProjection.getExpireDate()).thenReturn(LocalDateTime.now().plusDays(30));

        List<JobWithApplicationCountProjection> jobList = Collections.singletonList(jobProjection);
        when(jobPostRepository.findAllJobsWithFilters(
                eq(userAccount.getCompany().getCompanyId().toString()), eq(status), eq(typeOfWork)))
                .thenReturn(jobList);

        // Act & Assert
        mockMvc.perform(get("/job-post/employer-company")
                .header("Authorization", jwt)
                .param("status", status)
                .param("typeOfWork", typeOfWork)
                .param("sortBy", sortBy)
                .param("sortDirection", sortDirection)
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].postId").value(jobProjection.getPostId().toString()))
                .andExpect(jsonPath("$.content[0].title").value("Software Engineer"))
                .andExpect(jsonPath("$.content[0].applicationCount").value(10));



        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(jobPostRepository).findAllJobsWithFilters(
                eq(userAccount.getCompany().getCompanyId().toString()), eq(status), eq(typeOfWork));
    }
}