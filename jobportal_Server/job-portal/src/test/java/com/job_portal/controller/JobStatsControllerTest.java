
package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.UserAccount;
import com.job_portal.models.UserType;
import com.job_portal.repository.ApplyJobRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IJobPostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobStatsController.class)
public class JobStatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobPostRepository jobPostRepository;

    @MockBean
    private ApplyJobRepository applyJobRepository;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private IJobPostService jobPostService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String USER_EMAIL = "giathuanhl@gmail.com";
    private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJHaWFUaHVhblNlbnBhaSIsImlhdCI6MTc0NzgzNDAyMSwiZXhwIjoxNzQ3OTIwNDIxLCJlbWFpbCI6ImdpYXRodWFuaGxAZ21haWwuY29tIn0.Q5fqfExrB8dXDm40gze-MwunQzhJY4BGbOTPUbirAAY";
    private static final String JWT_HEADER = "Bearer " + JWT_TOKEN;
    private static final UUID COMPANY_ID = UUID.randomUUID();
    private static final UUID JOB_POST_ID = UUID.randomUUID();
    private static final String JOB_TITLE = "Software Engineer";
    private static final int VIEW_COUNT = 100;
    private static final long APPLICATION_COUNT = 10;
    private static final LocalDateTime CREATE_DATE = LocalDateTime.of(2025, 5, 1, 10, 0);
    private static final LocalDateTime EXPIRE_DATE = LocalDateTime.of(2025, 6, 1, 10, 0);

    private UserAccount user;
    private Company company;
    private JobPost jobPost;
    private UserType employerType;

    @BeforeEach
    void setUp() {
        employerType = new UserType();
        employerType.setUser_type_name("Employer");

        company = new Company();
        company.setCompanyId(COMPANY_ID);

        user = new UserAccount();
        user.setEmail(USER_EMAIL);
        user.setUserType(employerType);
        user.setCompany(company);

        jobPost = new JobPost();
        jobPost.setPostId(JOB_POST_ID);
        jobPost.setTitle(JOB_TITLE);
        jobPost.setCreateDate(CREATE_DATE);
        jobPost.setExpireDate(EXPIRE_DATE);
        jobPost.setViewCount(VIEW_COUNT);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetViewStats_Success() throws Exception {
        // Arrange
        List<JobPost> jobPosts = Collections.singletonList(jobPost);
        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(jobPostService.findAllJobsByCompany(COMPANY_ID)).thenReturn(jobPosts);
            when(applyJobRepository.countByPostId(JOB_POST_ID)).thenReturn(APPLICATION_COUNT);

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/view-stats")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalViews").value(VIEW_COUNT))
                    .andExpect(jsonPath("$.totalJobs").value(1))
                    .andExpect(jsonPath("$.avgViewsPerJob").value(VIEW_COUNT))
                    .andExpect(jsonPath("$.jobViewDetails[0].jobId").value(JOB_POST_ID.toString()))
                    .andExpect(jsonPath("$.jobViewDetails[0].title").value(JOB_TITLE))
                    .andExpect(jsonPath("$.jobViewDetails[0].viewCount").value(VIEW_COUNT))
                    .andExpect(jsonPath("$.jobViewDetails[0].applicationCount").value(APPLICATION_COUNT))
                    .andExpect(jsonPath("$.jobViewDetails[0].conversionRate").value(10.0));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, times(1)).findAllJobsByCompany(COMPANY_ID);
            verify(applyJobRepository, times(1)).countByPostId(JOB_POST_ID);
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetViewStats_UserNotFound() throws Exception {
        // Arrange
        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/view-stats")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isUnauthorized())
                    .andExpect(content().string("Người dùng không tồn tại"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, never()).findAllJobsByCompany(any());
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetViewStats_NotEmployer() throws Exception {
        // Arrange
        UserType candidateType = new UserType();
        candidateType.setUser_type_name("Candidate");
        user.setUserType(candidateType);

        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/view-stats")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isForbidden())
                    .andExpect(content().string("Bạn không có quyền truy cập tính năng này"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, never()).findAllJobsByCompany(any());
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobPerformance_Success() throws Exception {
        // Arrange
        List<JobPost> jobPosts = Collections.singletonList(jobPost);
        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(jobPostService.findAllJobsByCompany(COMPANY_ID)).thenReturn(jobPosts);
            when(applyJobRepository.countByPostId(JOB_POST_ID)).thenReturn(APPLICATION_COUNT);

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/job-performance")
                    .header("Authorization", JWT_HEADER)
                    .param("startDate", "2025-05-01")
                    .param("endDate", "2025-06-01"))
                    .andDo(print());

            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].jobId").value(JOB_POST_ID.toString()))
                    .andExpect(jsonPath("$[0].jobTitle").value(JOB_TITLE))
                    .andExpect(jsonPath("$[0].viewCount").value(VIEW_COUNT))
                    .andExpect(jsonPath("$[0].applicationCount").value(APPLICATION_COUNT))
                    .andExpect(jsonPath("$[0].conversionRate").value(10.0));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, times(1)).findAllJobsByCompany(COMPANY_ID);
            verify(applyJobRepository, times(1)).countByPostId(JOB_POST_ID);
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobPerformance_UserNotFound() throws Exception {
        // Arrange
        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/job-performance")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isUnauthorized())
                    .andExpect(content().string("Người dùng không tồn tại"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, never()).findAllJobsByCompany(any());
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetJobPerformance_NotEmployer() throws Exception {
        // Arrange
        UserType candidateType = new UserType();
        candidateType.setUser_type_name("Candidate");
        user.setUserType(candidateType);

        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/job-performance")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isForbidden())
                    .andExpect(content().string("Bạn không có quyền truy cập tính năng này"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, never()).findAllJobsByCompany(any());
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetBestPerformingJobs_Success() throws Exception {
        // Arrange
        Map<String, Object> jobPerformance = new HashMap<>();
        jobPerformance.put("jobId", JOB_POST_ID);
        jobPerformance.put("jobTitle", JOB_TITLE);
        jobPerformance.put("viewCount", VIEW_COUNT);
        List<Map<String, Object>> bestJobs = Collections.singletonList(jobPerformance);

        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(jobPostService.getBestPerformingJobs(COMPANY_ID)).thenReturn(bestJobs);

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/best-performing-jobs")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].jobId").value(JOB_POST_ID.toString()))
                    .andExpect(jsonPath("$[0].jobTitle").value(JOB_TITLE))
                    .andExpect(jsonPath("$[0].viewCount").value(VIEW_COUNT));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, times(1)).getBestPerformingJobs(COMPANY_ID);
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetBestPerformingJobs_UserNotFound() throws Exception {
        // Arrange
        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/best-performing-jobs")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isUnauthorized())
                    .andExpect(content().string("Người dùng không tồn tại"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, never()).getBestPerformingJobs(any());
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetBestPerformingJobs_NotEmployer() throws Exception {
        // Arrange
        UserType candidateType = new UserType();
        candidateType.setUser_type_name("Candidate");
        user.setUserType(candidateType);

        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_HEADER))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));

            // Act & Assert
            ResultActions result = mockMvc.perform(get("/job-stats/best-performing-jobs")
                    .header("Authorization", JWT_HEADER))
                    .andDo(print());

            result.andExpect(status().isForbidden())
                    .andExpect(content().string("Bạn không có quyền truy cập tính năng này"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(jobPostService, never()).getBestPerformingJobs(any());
        }
    }
}