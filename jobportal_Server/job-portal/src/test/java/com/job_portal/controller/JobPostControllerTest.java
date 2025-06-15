package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.job_portal.DTO.JobPostApproveDTO;
import com.job_portal.DTO.JobPostDTO;
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
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.AccountDetailServiceImpl;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.IJobPostService;
import com.job_portal.service.INotificationService;
import com.job_portal.service.ISearchHistoryService;
import com.job_portal.service.WebSocketService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;
import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobPostController.class)
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

    @MockBean
    private ICompanyService companyService;

    @MockBean
    private INotificationService notificationService;

    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    private static final String USER_EMAIL = "danggiathuanhl@gmail.com";

    private UserAccount userAccount;
    private Company company;
    private JobPost jobPost;
    private JobPostDTO jobPostDTO;
    private UUID postId;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        postId = UUID.randomUUID();

        // Setup UserAccount
        userAccount = new UserAccount();
        userAccount.setUserId(UUID.randomUUID());
        userAccount.setEmail(USER_EMAIL);
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

        // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(USER_EMAIL);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Generate JWT token
        long expirationTime = 24 * 60 * 60 * 1000; // 24 hours
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        List<Map<String, Object>> mockSemanticApiResponse = List.of(Map.of("postId", postId.toString()));
        ResponseEntity<List<Map<String, Object>>> responseEntity = new ResponseEntity<>(mockSemanticApiResponse, HttpStatus.OK);
        when(restTemplate.exchange(eq("http://localhost:5000/semantic-search"), eq(HttpMethod.POST),
                any(HttpEntity.class), any(ParameterizedTypeReference.class))).thenReturn(responseEntity);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetAllJobs_Success() throws Exception {
        List<JobPost> jobPosts = Collections.singletonList(jobPost);
        when(jobPostRepository.findAll()).thenReturn(jobPosts);

        mockMvc.perform(get("/job-post/get-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].postId").value(postId.toString()))
                .andExpect(jsonPath("$[0].title").value("Software Engineer"));

        verify(jobPostRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateJobPost_Success() throws Exception {
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(jobPostService.canPostJob(company.getCompanyId())).thenReturn(true);
        when(jobPostService.createJob(any(JobPostDTO.class), eq(company.getCompanyId()))).thenReturn(jobPost);
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("ADD JOB"));

        mockMvc.perform(post("/job-post/create-job")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Công việc được tạo thành công. Chờ Admin phê duyệt"));

        verify(jobPostService, times(1)).createJob(any(JobPostDTO.class), eq(company.getCompanyId()));
        verify(webSocketService, times(1)).sendUpdate(eq("/topic/job-updates"), eq("ADD JOB"));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateJobPost_Forbidden_TooFrequent() throws Exception {
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(jobPostService.canPostJob(company.getCompanyId())).thenReturn(false);

        mockMvc.perform(post("/job-post/create-job")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isForbidden())
                .andExpect(content().string("Công ty chỉ được đăng 1 bài trong vòng 1 giờ."));

        verify(jobPostService, never()).createJob(any(JobPostDTO.class), any(UUID.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateJobPost_Success() throws Exception {
        when(jobPostRepository.findById(postId)).thenReturn(Optional.of(jobPost));
        when(jobPostService.updateJob(any(JobPostDTO.class), eq(postId))).thenReturn(jobPost);
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("UPDATE JOB"));

        mockMvc.perform(put("/job-post/update-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Cập nhật thành công"));

        verify(jobPostService, times(1)).updateJob(any(JobPostDTO.class), eq(postId));
        verify(webSocketService, times(1)).sendUpdate(eq("/topic/job-updates"), eq("UPDATE JOB"));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateJobPost_NotFound() throws Exception {
        when(jobPostRepository.findById(postId)).thenReturn(Optional.empty());

        mockMvc.perform(put("/job-post/update-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Công việc không tồn tại"));

        verify(jobPostService, never()).updateJob(any(JobPostDTO.class), any(UUID.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateJobPost_AlreadyApproved_Failure() throws Exception {
        JobPost approvedJobPost = new JobPost();
        approvedJobPost.setPostId(postId);
        approvedJobPost.setTitle("Software Engineer");
        approvedJobPost.setDescription("Develop software solutions");
        approvedJobPost.setSalary(50000L);
        approvedJobPost.setCreateDate(LocalDateTime.now());
        approvedJobPost.setCompany(company);
        approvedJobPost.setApprove(true);
        approvedJobPost.setStatus("Đang mở");

        when(jobPostRepository.findById(postId)).thenReturn(Optional.of(approvedJobPost));

        mockMvc.perform(put("/job-post/update-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobPostDTO))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Bài viết đã được chấp thuận, không được thay đổi"));

        verify(jobPostService, never()).updateJob(any(JobPostDTO.class), any(UUID.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteJobPost_Success() throws Exception {
        when(jobPostService.deleteJob(postId)).thenReturn(true);
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("DELETE JOB"));

        mockMvc.perform(delete("/job-post/delete-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Xóa thành công"));

        verify(jobPostService, times(1)).deleteJob(postId);
        verify(webSocketService, times(1)).sendUpdate(eq("/topic/job-updates"), eq("DELETE JOB"));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteJobPost_Failure() throws Exception {
        when(jobPostService.deleteJob(postId)).thenReturn(false);

        mockMvc.perform(delete("/job-post/delete-job/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Xóa thất bại"));

        verify(jobPostService, times(1)).deleteJob(postId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testSearchJobs_Success_WithJwt() throws Exception {
        String query = "AI";
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
            Seeker seeker = new Seeker();
            seeker.setUserId(seekerId);
            userAccount.setSeeker(seeker);
        }

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(cityRepository.findCityNameById(cityId)).thenReturn("Hà Nội");
        when(industryRepository.findIndustryNamesByIds(industryIds))
                .thenReturn(Arrays.asList("IT phần mềm", "IT phần cứng"));
        when(jobPostService.semanticSearchWithFilters(
                eq(query), eq(typesOfWork), eq(minSalary), eq(maxSalary), eq(cityId), eq(industryIds), eq(page), eq(size)))
                .thenReturn(jobPostPage);
        doNothing().when(searchHistoryService).exportSearchHistoryToCSV(anyString(), anyString(), any(UUID.class));

        mockMvc.perform(get("/job-post/semantic-search")
                .header("Authorization", jwtToken)
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
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].postId").value(jobPost.getPostId().toString()))
                .andExpect(jsonPath("$.content[0].title").value(jobPost.getTitle()));

        verify(jobPostService, times(1)).semanticSearchWithFilters(
                eq(query), eq(typesOfWork), eq(minSalary), eq(maxSalary), eq(cityId), eq(industryIds), eq(page), eq(size));
        verify(searchHistoryService, times(1)).exportSearchHistoryToCSV(anyString(), anyString(), any(UUID.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobsByCompanyId_Success() throws Exception {
        UUID companyId = UUID.randomUUID();
        int page = 0;
        int size = 6;

        List<JobPost> jobPosts = Arrays.asList(jobPost);
        Page<JobPost> jobPostPage = new PageImpl<>(jobPosts, PageRequest.of(page, size), 1);

        when(jobPostService.findJobByCompanyId(eq(companyId), eq(page), eq(size)))
                .thenReturn(jobPostPage);

        mockMvc.perform(get("/job-post/search-by-company/{companyId}", companyId)
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].postId").value(jobPost.getPostId().toString()))
                .andExpect(jsonPath("$.content[0].title").value(jobPost.getTitle()));

        verify(jobPostService, times(1)).findJobByCompanyId(eq(companyId), eq(page), eq(size));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobsByCompanyId_InvalidCompanyId() throws Exception {
        UUID companyId = UUID.randomUUID();
        int page = 0;
        int size = 6;

        when(jobPostService.findJobByCompanyId(eq(companyId), eq(page), eq(size)))
                .thenThrow(new IllegalArgumentException("Công ty không tồn tại"));

        mockMvc.perform(get("/job-post/search-by-company/{companyId}", companyId)
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Đã xảy ra lỗi: Công ty không tồn tại"));

        verify(jobPostService, times(1)).findJobByCompanyId(eq(companyId), eq(page), eq(size));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobRecommendations_Success() throws Exception {
        UUID userId = userAccount.getUserId();
        String apiUrl = "http://localhost:5000/recommend-jobs/phobert";

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));

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

        mockMvc.perform(post("/job-post/recommend-jobs/phobert")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].postId").value(job.get("postId")))
                .andExpect(jsonPath("$[0].title").value("Software Engineer"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(restTemplate, times(1)).exchange(
                eq(apiUrl),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobRecommendations_InvalidJsonResponse() throws Exception {
        String apiUrl = "http://localhost:5000/recommend-jobs/phobert";
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(restTemplate.exchange(
                eq(apiUrl),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)))
                .thenReturn(new ResponseEntity<>("{invalid-json}", HttpStatus.OK));

        mockMvc.perform(post("/job-post/recommend-jobs/phobert")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(""));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(restTemplate, times(1)).exchange(
                eq(apiUrl),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetFilteredJobs_Success_WithDefaultSorting() throws Exception {
        String status = "Đang mở";
        String typeOfWork = "Bán thời gian";
        String sortBy = "createDate";
        String sortDirection = "desc";
        int page = 0;
        int size = 5;

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));

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

        mockMvc.perform(get("/job-post/employer-company")
                .header("Authorization", jwtToken)
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

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(jobPostRepository, times(1)).findJobsWithFiltersAndSorting(
                eq(userAccount.getUserId().toString()), eq(status), eq(typeOfWork),
                eq(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createDate"))));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetFilteredJobs_Success_WithApplicationCountSorting() throws Exception {
        String status = "Đang mở";
        String typeOfWork = "Toàn thời gian";
        String sortBy = "applicationCount";
        String sortDirection = "asc";
        int page = 0;
        int size = 5;

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));

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

        mockMvc.perform(get("/job-post/employer-company")
                .header("Authorization", jwtToken)
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

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(jobPostRepository, times(1)).findAllJobsWithFilters(
                eq(userAccount.getCompany().getCompanyId().toString()), eq(status), eq(typeOfWork));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = "ADMIN")
    void testGetAllJobsForAdmin_Success() throws Exception {
        int page = 0;
        int size = 12;
        String searchTerm = "Software";
        String status = "Open";

        List<JobPost> jobPosts = Collections.singletonList(jobPost);
        Page<JobPost> jobPostPage = new PageImpl<>(jobPosts, PageRequest.of(page, size), 1);

        when(jobPostRepository.findByTitleContainingAndStatusAndIsApproveTrue(eq(searchTerm), eq(status), any(Pageable.class)))
                .thenReturn(jobPostPage);

        mockMvc.perform(get("/job-post/admin-get-all")
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .param("searchTerm", searchTerm)
                .param("status", status)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].postId").value(jobPost.getPostId().toString()))
                .andExpect(jsonPath("$.currentPage").value(page))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(jobPostRepository, times(1)).findByTitleContainingAndStatusAndIsApproveTrue(eq(searchTerm), eq(status), any(Pageable.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = "ADMIN")
    void testGetAllJobsForAdmin_EmptyResults() throws Exception {
        int page = 0;
        int size = 12;
        String searchTerm = "NonExistent";
        String status = "Open";

        Page<JobPost> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(page, size), 0);

        when(jobPostRepository.findByTitleContainingAndStatusAndIsApproveTrue(eq(searchTerm), eq(status), any(Pageable.class)))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/job-post/admin-get-all")
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .param("searchTerm", searchTerm)
                .param("status", status)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.currentPage").value(page))
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.totalPages").value(0));

        verify(jobPostRepository, times(1)).findByTitleContainingAndStatusAndIsApproveTrue(eq(searchTerm), eq(status), any(Pageable.class));
    }

//    @Test
//    @WithMockUser(username = USER_EMAIL)
//    void testGetTop8LatestJobPosts_Success() throws Exception {
//        List<JobPostApproveDTO> jobPosts = Collections.singletonList(jobPost);
//        when(jobPostService.getTop8LatestJobPosts()).thenReturn(jobPosts);
//
//        mockMvc.perform(get("/job-post/get-top8-lastest-job")
//                .contentType(MediaType.APPLICATION_JSON))
//                .andDo(print())
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$").isArray())
//                .andExpect(jsonPath("$[0].postId").value(jobPost.getPostId().toString()))
//                .andExpect(jsonPath("$[0].title").value("Software Engineer"));
//
//        verify(jobPostService, times(1)).getTop8LatestJobPosts();
//    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = "ADMIN")
    void testApproveJobPost_Success() throws Exception {
        when(jobPostService.approveJob(postId)).thenReturn(true);
        when(companyRepository.findCompanyByPostId(postId)).thenReturn(Optional.of(company));
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("APPROVE JOB"));

        mockMvc.perform(post("/job-post/approve/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Chấp thuận thành công"));

        verify(jobPostService, times(1)).approveJob(postId);
        verify(companyRepository, times(1)).findCompanyByPostId(postId);
        verify(notificationService, times(1)).notifyNewJobPost(any(UUID.class), eq(postId));
        verify(webSocketService, times(1)).sendUpdate(eq("/topic/job-updates"), eq("APPROVE JOB"));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = "ADMIN")
    void testApproveJobPost_NotFound() throws Exception {
        when(jobPostService.approveJob(postId)).thenReturn(null);

        mockMvc.perform(post("/job-post/approve/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Không thể tìm thấy công việc"));

        verify(jobPostService, times(1)).approveJob(postId);
        verify(companyRepository, never()).findCompanyByPostId(any(UUID.class));
        verify(notificationService, never()).notifyNewJobPost(any(UUID.class), any(UUID.class));
        verify(webSocketService, never()).sendUpdate(anyString(), anyString());
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testSetExpireJobPost_Success() throws Exception {
        when(jobPostRepository.findById(postId)).thenReturn(Optional.of(jobPost));
        when(jobPostRepository.save(any(JobPost.class))).thenReturn(jobPost);
        doNothing().when(webSocketService).sendUpdate(eq("/topic/job-updates"), eq("EXPIRE JOB"));

        mockMvc.perform(put("/job-post/set-expire/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk());

        verify(jobPostRepository, times(1)).findById(postId);
        verify(jobPostRepository, times(1)).save(any(JobPost.class));
        verify(webSocketService, times(1)).sendUpdate(eq("/topic/job-updates"), eq("EXPIRE JOB"));
    }



    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobById_Success_WithJwt() throws Exception {
        when(jobPostService.searchJobByPostId(postId)).thenReturn(jobPost);
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));

        mockMvc.perform(get("/job-post/findJob/{postId}", postId)
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId").value(postId.toString()))
                .andExpect(jsonPath("$.title").value("Software Engineer"));

        verify(jobPostService, times(1)).searchJobByPostId(postId);
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(jobPostService, times(1)).increaseViewCountWithUserCheck(eq(postId), any(UUID.class), anyString());
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobById_Success_WithoutJwt() throws Exception {
        when(jobPostService.searchJobByPostId(postId)).thenReturn(jobPost);
        doNothing().when(jobPostService).increaseViewCount(postId);

        mockMvc.perform(get("/job-post/findJob/{postId}", postId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postId").value(postId.toString()))
                .andExpect(jsonPath("$.title").value("Software Engineer"));

        verify(jobPostService, times(1)).searchJobByPostId(postId);
        verify(userAccountRepository, never()).findByEmail(anyString());
        verify(jobPostService, times(1)).increaseViewCount(postId);
        verify(jobPostService, never()).increaseViewCountWithUserCheck(any(UUID.class), any(UUID.class), anyString());
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobById_NotFound() throws Exception {
        when(jobPostService.searchJobByPostId(postId)).thenThrow(new RuntimeException("Job not found"));

        mockMvc.perform(get("/job-post/findJob/{postId}", postId)
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(jobPostService, times(1)).searchJobByPostId(postId);
        verify(userAccountRepository, never()).findByEmail(anyString());
        verify(jobPostService, never()).increaseViewCount(any(UUID.class));
        verify(jobPostService, never()).increaseViewCountWithUserCheck(any(UUID.class), any(UUID.class), anyString());
    }
}