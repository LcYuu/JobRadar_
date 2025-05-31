package com.job_portal.controller;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.job_portal.DTO.ApplyJobDTO;
import com.job_portal.DTO.ApplyJobEmployerDTO;
import com.job_portal.DTO.ApplyJobInProfile;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.ApplyJob;
import com.job_portal.models.Company;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.models.UserType;
import com.job_portal.repository.ApplyJobRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IApplyJobService;
import com.job_portal.service.INotificationService;
import com.job_portal.service.WebSocketService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import static org.mockito.ArgumentMatchers.any;

@WebMvcTest(ApplyJobController.class)
public class ApplyJobControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private ApplyJobRepository applyJobRepository;

	@MockBean
	private IApplyJobService applyJobService;

	@MockBean
	private UserAccountRepository userAccountRepository;

	@MockBean
	private INotificationService notificationService;

	@MockBean
	private WebSocketService webSocketService;

	@MockBean
	private JwtProvider jwtProvider;

	private UserAccount userAccountSeeker;

	private UserAccount userAccountCompany;
	private String jwtToken;
	private ApplyJob applyJob;
	private ObjectMapper objectMapper;
	
	private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
	private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
	
	private static final String EMAIL_COMPANY = "danggiathuanhl@gmail.com";

	private static final String EMAIL_SEEKER = "giathuanhl@gmail.com";
	@BeforeEach
	void setUp() throws Exception {

//		mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
//				.apply(SecurityMockMvcConfigurers.springSecurity()).build();

		userAccountSeeker = new UserAccount();
		userAccountSeeker.setUserId(UUID.randomUUID());
		userAccountSeeker.setEmail(EMAIL_SEEKER);

		userAccountCompany = new UserAccount();
		userAccountCompany.setUserId(UUID.randomUUID());
		userAccountCompany.setEmail(EMAIL_COMPANY);

		;
		UserType userTypeCompany = new UserType();
		userTypeCompany.setUserTypeId(3);
		userAccountCompany.setUserType(userTypeCompany);

		UserType userTypeSeeker = new UserType();
		userTypeSeeker.setUserTypeId(2);
		userAccountSeeker.setUserType(userTypeSeeker);

		Seeker seeker = new Seeker();
		seeker.setUserId(userAccountSeeker.getUserId());
		userAccountSeeker.setSeeker(seeker);

		Company company = new Company();
		company.setCompanyId(userAccountCompany.getUserId());
		userAccountCompany.setCompany(company);
	

		applyJob = new ApplyJob();
		applyJob.setPostId(UUID.randomUUID());
		applyJob.setUserId(userAccountSeeker.getUserId());
		applyJob.setPathCV("http://res.cloudinary.com/ddqygrb0g/raw/upload/v1731213251/DangGiaThuan_CV_wmlwrw.pdf");
		applyJob.setApplyDate(LocalDateTime.now());
		applyJob.setFullName("DangGiaThuan");
		applyJob.setEmail(EMAIL_SEEKER);
		applyJob.setDescription("Application description");
		applyJob.setSave(false);
		applyJob.setViewed(false);

		objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule());
	}

	// Test for createApply
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testCreateApply_Success() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		ApplyJobDTO applyDTO = new ApplyJobDTO();
		applyDTO.setPostId(postId);
		applyDTO.setPathCV("http://res.cloudinary.com/ddqygrb0g/raw/upload/v1731213251/DangGiaThuan_CV_wmlwrw.pdf");
		applyDTO.setFullName("DangGiaThuan");
		applyDTO.setEmail(EMAIL_SEEKER);
		applyDTO.setDescription("Application description");
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_SEEKER);
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
		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(userAccountSeeker));
		when(applyJobService.createApplyJob(any(ApplyJob.class))).thenReturn(true);
		doNothing().when(webSocketService).sendUpdate(anyString(), anyString());

		// Act & Assert
		mockMvc.perform(post("/apply-job/create-apply/{postId}", postId).header("Authorization", jwtToken).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(applyDTO)))
				.andDo(print()).andExpect(status().isCreated()).andExpect(content().string("Nộp đơn thành công"));

		verify(userAccountRepository).findByEmail(EMAIL_SEEKER);
		verify(applyJobService).createApplyJob(any(ApplyJob.class));
		verify(webSocketService).sendUpdate("/topic/apply-updates", "ADD APPLY");
	}

	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testCreateApply_Failure() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		ApplyJobDTO applyDTO = new ApplyJobDTO();
		applyDTO.setPathCV("http://res.cloudinary.com/ddqygrb0g/raw/upload/v1731213251/DangGiaThuan_CV_wmlwrw.pdf");

		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_SEEKER);
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
		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(userAccountSeeker));
		when(applyJobService.createApplyJob(any(ApplyJob.class))).thenReturn(false);

		// Act & Assert
		mockMvc.perform(post("/apply-job/create-apply/{postId}", postId).header("Authorization", jwtToken).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(applyDTO)))
				.andDo(print()).andExpect(status().isInternalServerError())
				.andExpect(content().string("Nộp đơn thất bại"));

		verify(userAccountRepository).findByEmail(EMAIL_SEEKER);
		verify(applyJobService).createApplyJob(any(ApplyJob.class));
		verify(webSocketService, never()).sendUpdate(anyString(), anyString());
	}

	// Test for checkIfApplied
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testCheckIfApplied_Success() throws Exception {
		UUID postId = UUID.randomUUID();
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_SEEKER);
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
		
		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(userAccountSeeker));
		when(applyJobService.hasApplied(postId, userAccountSeeker.getSeeker().getUserId())).thenReturn(true);

		// Act & Assert
		mockMvc.perform(get("/apply-job/checkApply/{postId}", postId).header("Authorization", jwtToken)
				.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isOk())
				.andExpect(content().string("true"));

		verify(userAccountRepository).findByEmail(EMAIL_SEEKER);
		verify(applyJobService).hasApplied(postId, userAccountSeeker.getSeeker().getUserId());
	}

	// Test for getCandidateApplyInfo
	@Test
	@WithMockUser(username = EMAIL_COMPANY)
	void testGetCandidateApplyInfo_Success() throws Exception {
		// Arrange
		UUID userId = UUID.randomUUID();
		UUID postId = UUID.randomUUID();
		when(applyJobRepository.findByPostIdAndUserId(postId, userId)).thenReturn(Optional.of(applyJob));

		// Act & Assert
		mockMvc.perform(get("/apply-job/candidate-apply/{userId}/{postId}", userId, postId)
				.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value(EMAIL_SEEKER))
				.andExpect(jsonPath("$.description").value("Application description"));

		verify(applyJobRepository).findByPostIdAndUserId(postId, userId);
	}

	@Test
	@WithMockUser(username = EMAIL_COMPANY)
	void testGetCandidateApplyInfo_NotFound() throws Exception {
		// Arrange
		UUID userId = UUID.randomUUID();
		UUID postId = UUID.randomUUID();
		when(applyJobRepository.findByPostIdAndUserId(postId, userId)).thenReturn(Optional.empty());

		// Act & Assert
		mockMvc.perform(get("/apply-job/candidate-apply/{userId}/{postId}", userId, postId).with(csrf())
				.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isNotFound());

		verify(applyJobRepository).findByPostIdAndUserId(postId, userId);
	}

	// Test for findApplyJobById
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testFindApplyJobById_Success() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_SEEKER);
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

		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(userAccountSeeker));
		when(applyJobRepository.findByPostIdAndUserId(postId, userAccountSeeker.getSeeker().getUserId()))
				.thenReturn(Optional.of(applyJob));

		// Act & Assert
		mockMvc.perform(get("/apply-job/find/{postId}", postId).header("Authorization", jwtToken)
				.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isOk())
				.andExpect(jsonPath("$.postId").value(applyJob.getPostId().toString()))
				.andExpect(jsonPath("$.userId").value(applyJob.getUserId().toString()));

		verify(userAccountRepository).findByEmail(EMAIL_SEEKER);
		verify(applyJobRepository).findByPostIdAndUserId(postId, userAccountSeeker.getSeeker().getUserId());
	}

	// Test for updateApprove
	@Test
    @WithMockUser(username = EMAIL_COMPANY)
    void testUpdateApprove_Success() throws Exception {
        // Arrange
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        
        // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_COMPANY);
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


        when(userAccountRepository.findByEmail(EMAIL_COMPANY)).thenReturn(Optional.of(userAccountCompany));
        when(applyJobRepository.findByPostIdAndUserId(eq(postId), eq(userId))).thenReturn(Optional.of(applyJob));
        when(applyJobRepository.save(any(ApplyJob.class))).thenReturn(applyJob);
        doNothing().when(webSocketService).sendUpdate(anyString(), anyString());

        // Act & Assert
        mockMvc.perform(post("/apply-job/setApprove/{postId}/{userId}", postId, userId)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Approve successfully"));

        verify(userAccountRepository).findByEmail(EMAIL_COMPANY);
        verify(applyJobRepository).findByPostIdAndUserId(eq(postId), eq(userId));
        verify(applyJobRepository).save(any(ApplyJob.class));
        verify(webSocketService).sendUpdate("/topic/apply-updates", "APPROVE APPLY");
    }

	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testUpdateApprove_NoPermission() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		UUID userId = UUID.randomUUID();
		UserAccount unauthorizedUser = new UserAccount();
		unauthorizedUser.setUserId(UUID.randomUUID());
		unauthorizedUser.setEmail(EMAIL_SEEKER);
		UserType userType = new UserType();
		userType.setUserTypeId(2);
		unauthorizedUser.setUserType(userType);
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_SEEKER);
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
		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(unauthorizedUser));

		// Act & Assert
		mockMvc.perform(post("/apply-job/setApprove/{postId}/{userId}", postId, userId).header("Authorization", jwtToken)
				.with(csrf()).contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isForbidden())
				.andExpect(content().string("User does not have permission to approve"));

		verify(userAccountRepository).findByEmail(EMAIL_SEEKER);
		verify(applyJobRepository, never()).findByPostIdAndUserId(any(), any());
	}

	// Test for updateApply
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testUpdateApply_Success() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		ApplyJobDTO applyDTO = new ApplyJobDTO();
		applyDTO.setPathCV("http://res.cloudinary.com/ddqygrb0g/raw/upload/v1731213251/DangGiaThuan_CV_wmlwrw.pdf");
		applyDTO.setFullName("DangGiaThuan");
		applyDTO.setEmail(EMAIL_SEEKER);
		applyDTO.setDescription("Updated description");
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_SEEKER);
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

		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(userAccountSeeker));
		when(applyJobRepository.findByPostIdAndUserId(postId, userAccountSeeker.getUserId()))
				.thenReturn(Optional.of(applyJob));
		when(applyJobService.updateApplyJob(any(ApplyJob.class))).thenReturn(true);
		doNothing().when(webSocketService).sendUpdate(anyString(), anyString());

		// Act & Assert
		mockMvc.perform(put("/apply-job/update-apply/{postId}", postId).header("Authorization", jwtToken)
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(applyDTO)))
				.andDo(print()).andExpect(status().isOk())
				.andExpect(content().string("Cập nhật đơn ứng tuyển thành công"));

		verify(userAccountRepository).findByEmail(EMAIL_SEEKER);
		verify(applyJobRepository).findByPostIdAndUserId(postId, userAccountSeeker.getUserId());
		verify(applyJobService).updateApplyJob(any(ApplyJob.class));
		verify(webSocketService).sendUpdate("/topic/apply-updates", "UPDATE APPLY");
	}

	void testUpdateApply_InvalidPathCV() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		ApplyJobDTO applyDTO = new ApplyJobDTO();
		applyDTO.setPathCV("");

		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(userAccountSeeker));

		// Act & Assert
		mockMvc.perform(put("/apply-job/update-apply/{postId}", postId).header("Authorization", jwtToken)
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(applyDTO)))
				.andDo(print()).andExpect(status().isBadRequest())
				.andExpect(content().string("Đường dẫn CV không được để trống"));

		verify(userAccountRepository).findByEmail("test@example.com");
		verify(applyJobRepository, never()).findByPostIdAndUserId(any(), any());
	}

//	// Test for getApply
//	@Test
//	@WithMockUser(username = EMAIL_SEEKER)
//    void testGetApply_Success() throws Exception {
//        // Arrange
//        when(applyJobRepository.findAll()).thenReturn(Collections.singletonList(applyJob));
//
//        // Act & Assert
//        mockMvc.perform(get("/apply-job/get-all")
//                .contentType(MediaType.APPLICATION_JSON))
//                .andDo(print())
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$").isArray())
//                .andExpect(jsonPath("$[0].postId").value(applyJob.getPostId().toString()));
//
//        verify(applyJobRepository).findAll();
//    }

	// Test for findApplyJobByUserId
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testFindApplyJobByUserId_Success() throws Exception {
		// Arrange
		int page = 0;
		int size = 3;
		ApplyJobInProfile applyJobInProfile = new ApplyJobInProfile();
		applyJobInProfile.setPostId(applyJob.getPostId());
		Page<ApplyJobInProfile> applyJobPage = new PageImpl<>(Collections.singletonList(applyJobInProfile),
				PageRequest.of(page, size), 1);
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_SEEKER);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Generate jwtToken token
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
		when(userAccountRepository.findByEmail(EMAIL_SEEKER)).thenReturn(Optional.of(userAccountSeeker));
		when(applyJobRepository.findApplyJobByUserId(userAccountSeeker.getSeeker().getUserId(),
				PageRequest.of(page, size))).thenReturn(applyJobPage);

		// Act & Assert
		mockMvc.perform(
				get("/apply-job/get-apply-job-by-user").header("Authorization", jwtToken).param("page", String.valueOf(page))
						.param("size", String.valueOf(size)).contentType(MediaType.APPLICATION_JSON))
				.andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray())
				.andExpect(jsonPath("$.content[0].postId").value(applyJob.getPostId().toString()));

		verify(userAccountRepository).findByEmail(EMAIL_SEEKER);
		verify(applyJobRepository).findApplyJobByUserId(userAccountSeeker.getSeeker().getUserId(),
				PageRequest.of(page, size));
	}

	// Test for findApplyJobByCompanyId
	@Test
	@WithMockUser(username = EMAIL_COMPANY)
	void testFindApplyJobByCompanyId_Success() throws Exception {
		// Arrange
		int page = 0;
		int size = 5;
		String fullName = "DangGiaThuan";
		Boolean isSave = true;
		String title = "AI";
		String sortBy = "applyDate";
		String sortDirection = "desc";
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_COMPANY);
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

		ApplyJobEmployerDTO applyJobEmployerDTO = new ApplyJobEmployerDTO();
		applyJobEmployerDTO.setPostId(applyJob.getPostId());
		Page<ApplyJobEmployerDTO> applyJobPage = new PageImpl<>(Collections.singletonList(applyJobEmployerDTO),
				PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "applyDate")), 1);

		when(userAccountRepository.findByEmail(EMAIL_COMPANY)).thenReturn(Optional.of(userAccountCompany));
		when(applyJobRepository.findApplyJobsWithFilters(eq(userAccountCompany.getUserId()), eq(fullName), eq(isSave),
				eq(title), eq(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "applyDate")))))
				.thenReturn(applyJobPage);

		// Act & Assert
		mockMvc.perform(get("/apply-job/get-apply-job-by-company").header("Authorization", jwtToken)
				.param("page", String.valueOf(page)).param("size", String.valueOf(size)).param("fullName", fullName)
				.param("isSave", String.valueOf(isSave)).param("title", title).param("sortBy", sortBy)
				.param("sortDirection", sortDirection).contentType(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray())
				.andExpect(jsonPath("$.content[0].postId").value(applyJob.getPostId().toString()));

		verify(userAccountRepository).findByEmail(EMAIL_COMPANY);
		verify(applyJobRepository).findApplyJobsWithFilters(eq(userAccountCompany.getCompany().getCompanyId()),
				eq(fullName), eq(isSave), eq(title),
				eq(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "applyDate"))));
	}

	@Test
	@WithMockUser(username = EMAIL_COMPANY)
	void testFindApplyJobByCompanyId_NoCompany() throws Exception {
		// Arrange
		UserAccount userWithoutCompany = new UserAccount();
		userWithoutCompany.setUserId(UUID.randomUUID());
		userWithoutCompany.setEmail(EMAIL_COMPANY);
		
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_COMPANY);
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

		when(userAccountRepository.findByEmail(EMAIL_COMPANY)).thenReturn(Optional.of(userWithoutCompany));

		// Act & Assert
		mockMvc.perform(get("/apply-job/get-apply-job-by-company").header("Authorization", jwtToken)
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isNotFound());

		verify(userAccountRepository).findByEmail(EMAIL_COMPANY);
		verify(applyJobRepository, never()).findApplyJobsWithFilters(any(), any(), any(), any(), any());
	}

	@Test
	@WithMockUser(username = EMAIL_COMPANY)
	void testViewApplyJob_AlreadyViewed() throws Exception {
		// Arrange
		UUID userId = UUID.randomUUID();
		UUID postId = UUID.randomUUID();
		applyJob.setViewed(true);
		
		 // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL_COMPANY);
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

		when(userAccountRepository.findByEmail(EMAIL_COMPANY)).thenReturn(Optional.of(userAccountCompany));
		when(applyJobRepository.findByPostIdAndUserId(postId, userId)).thenReturn(Optional.of(applyJob));

		// Act & Assert
		mockMvc.perform(post("/apply-job/viewApply/{userId}/{postId}", userId, postId).header("Authorization", jwtToken)
				.with(csrf())
				.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isOk());

		verify(userAccountRepository).findByEmail(EMAIL_COMPANY);
		verify(applyJobRepository).findByPostIdAndUserId(postId, userId);
		verify(applyJobRepository, never()).save(any());
		verify(notificationService, never()).notifyApplicationReviewed(any(), any(), any());
	}

	// Test for updateMatchingScore
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testUpdateMatchingScore_Success() throws Exception {
		// Arrange
		Map<String, Object> payload = new HashMap<>();
		UUID postId = UUID.randomUUID();
		UUID userId = UUID.randomUUID();
		payload.put("postId", postId.toString());
		payload.put("userId", userId.toString());
		payload.put("matchingScore", 0.85);

		doNothing().when(applyJobService).updateMatchingScore(eq(postId), eq(userId), eq(0.85));

		// Act & Assert
		mockMvc.perform(post("/apply-job/update-matching-score").contentType(MediaType.APPLICATION_JSON)
				.with(csrf())
				.content(objectMapper.writeValueAsString(payload))).andDo(print()).andExpect(status().isOk());

		verify(applyJobService).updateMatchingScore(eq(postId), eq(userId), eq(0.85));
	}

	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testUpdateMatchingScore_InvalidUUID() throws Exception {
		// Arrange
		Map<String, Object> payload = new HashMap<>();
		payload.put("postId", "invalid-uuid");
		payload.put("userId", UUID.randomUUID().toString());
		payload.put("matchingScore", 0.85);

		// Act & Assert
		mockMvc.perform(post("/apply-job/update-matching-score").contentType(MediaType.APPLICATION_JSON).with(csrf())
				.content(objectMapper.writeValueAsString(payload))).andDo(print()).andExpect(status().isBadRequest())
				.andExpect(jsonPath("$").value("Invalid UUID format: Invalid UUID string: invalid-uuid"));

		verify(applyJobService, never()).updateMatchingScore(any(), any(), any());
	}

	// Test for getMatchingScores
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testGetMatchingScores_Success() throws Exception {
		// Arrange
		Map<String, Object> scoreEntry = new HashMap<>();
		scoreEntry.put("postId", UUID.randomUUID().toString());
		scoreEntry.put("userId", UUID.randomUUID().toString());
		scoreEntry.put("matchingScore", 0.85);
		when(applyJobRepository.findAllWithMatchingScore()).thenReturn(Collections.singletonList(scoreEntry));

		// Act & Assert
		mockMvc.perform(get("/apply-job/get-matching-scores").contentType(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk()).andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$[0].matchingScore").value(0.85));

		verify(applyJobRepository).findAllWithMatchingScore();
	}

	// Test for updateFullAnalysis
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testUpdateFullAnalysis_Success() throws Exception {
		// Arrange
		Map<String, Object> payload = new HashMap<>();
		UUID postId = UUID.randomUUID();
		UUID userId = UUID.randomUUID();
		payload.put("postId", postId.toString());
		payload.put("userId", userId.toString());
		payload.put("matchingScore", 0.85);
		payload.put("analysisResult", "Candidate is a good fit");

		doNothing().when(applyJobService).updateFullAnalysisResult(eq(postId), eq(userId), eq(0.85),
				eq("Candidate is a good fit"));

		// Act & Assert
		mockMvc.perform(post("/apply-job/update-full-analysis").contentType(MediaType.APPLICATION_JSON).with(csrf())
				.content(objectMapper.writeValueAsString(payload))).andDo(print()).andExpect(status().isOk());

		verify(applyJobService).updateFullAnalysisResult(eq(postId), eq(userId), eq(0.85),
				eq("Candidate is a good fit"));
	}

	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testUpdateFullAnalysis_EmptyAnalysisResult() throws Exception {
		// Arrange
		Map<String, Object> payload = new HashMap<>();
		payload.put("postId", UUID.randomUUID().toString());
		payload.put("userId", UUID.randomUUID().toString());
		payload.put("matchingScore", 0.85);
		payload.put("analysisResult", "");

		// Act & Assert
		mockMvc.perform(post("/apply-job/update-full-analysis").contentType(MediaType.APPLICATION_JSON)
				.with(csrf())
				.content(objectMapper.writeValueAsString(payload))).andDo(print()).andExpect(status().isBadRequest())
				.andExpect(jsonPath("$").value("Analysis result cannot be empty"));

		verify(applyJobService, never()).updateFullAnalysisResult(any(), any(), any(), any());
	}

	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testUpdateFullAnalysis_InvalidUUID() throws Exception {
		// Arrange
		Map<String, Object> payload = new HashMap<>();
		payload.put("postId", "invalid-uuid");
		payload.put("userId", UUID.randomUUID().toString());
		payload.put("matchingScore", 0.85);
		payload.put("analysisResult", "Candidate is a good fit");

		// Act & Assert
		mockMvc.perform(post("/apply-job/update-full-analysis").contentType(MediaType.APPLICATION_JSON)
				.with(csrf())
				.content(objectMapper.writeValueAsString(payload))).andDo(print()).andExpect(status().isBadRequest());

		verify(applyJobService, never()).updateFullAnalysisResult(any(), any(), any(), any());
	}

	// Test for getAnalysisResult
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testGetAnalysisResult_Success() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		UUID userId = UUID.randomUUID();
		String analysisResult = "Candidate is a good fit";
		when(applyJobService.getAnalysisResult(postId, userId)).thenReturn(analysisResult);

		// Act & Assert
		mockMvc.perform(get("/apply-job/get-analysis-result/{postId}/{userId}", postId, userId)).andDo(print())
				.andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(content().string(analysisResult));

		verify(applyJobService).getAnalysisResult(postId, userId);
	}

	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testGetAnalysisResult_NoResult() throws Exception {
		// Arrange
		UUID postId = UUID.randomUUID();
		UUID userId = UUID.randomUUID();
		when(applyJobService.getAnalysisResult(postId, userId)).thenReturn(null);

		// Act & Assert
		mockMvc.perform(get("/apply-job/get-analysis-result/{postId}/{userId}", postId, userId)
				.contentType(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isOk())
				.andExpect(content().string(""));

		verify(applyJobService).getAnalysisResult(postId, userId);
	}


	// Test for getMatchingScoresWithDetails
	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testGetMatchingScoresWithDetails_Success() throws Exception {
		// Arrange
		Map<String, Object> scoreEntry = new HashMap<>();
		scoreEntry.put("postId", UUID.randomUUID().toString());
		scoreEntry.put("userId", UUID.randomUUID().toString());
		scoreEntry.put("matchingScore", 0.85);
		scoreEntry.put("analysisResult", "Candidate is a good fit");
		when(applyJobRepository.findAllWithMatchingScoreAndAnalysis())
				.thenReturn(Collections.singletonList(scoreEntry));

		// Act & Assert
		mockMvc.perform(get("/apply-job/get-matching-scores-with-details").contentType(MediaType.APPLICATION_JSON))
				.andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$[0].matchingScore").value(0.85))
				.andExpect(jsonPath("$[0].analysisResult").value("Candidate is a good fit"));

		verify(applyJobRepository).findAllWithMatchingScoreAndAnalysis();
	}

	@Test
	@WithMockUser(username = EMAIL_SEEKER)
	void testGetMatchingScoresWithDetails_Error() throws Exception {
	    // Arrange
	    when(applyJobRepository.findAllWithMatchingScoreAndAnalysis()).thenThrow(new RuntimeException("Database error"));

	    // Act & Assert
	    mockMvc.perform(get("/apply-job/get-matching-scores-with-details"))
	            .andDo(print())
	            .andExpect(status().isInternalServerError())
	            .andExpect(content().string("Error retrieving matching scores with details: Database error"));

	    verify(applyJobRepository).findAllWithMatchingScoreAndAnalysis();
	}
}
