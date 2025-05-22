package com.job_portal.controller;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.oauth2.jwt.Jwt;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.FollowCompanyDTO;
import com.job_portal.DTO.SeekerDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Notification;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.projection.ApplicantProfileProjection;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.NotificationRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.INotificationService;
import com.job_portal.service.ISeekerService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;

@WebMvcTest(SeekerController.class)
public class SeekerControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SeekerRepository seekerRepository;

    @MockBean
    private ICompanyService companyService;

    @MockBean
    private ISeekerService seekerService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private CompanyRepository companyRepository;

    @MockBean
    private INotificationService notificationService;

    @MockBean
    private NotificationRepository notificationRepository;

    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private JwtProvider jwtProvider;

    private String jwtToken;
    private UUID userId;
    private UserAccount userAccount;
    private Seeker seeker;
    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    
    private static final String USER_EMAIL = "giathuanhl@gmail.com";

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userAccount = new UserAccount();
        userAccount.setUserId(userId);
        userAccount.setEmail("giathuanhl@gmail.com");
        seeker = new Seeker();
        seeker.setUserId(userId);

        userAccount.setSeeker(seeker);

        // Mock Authentication object
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("giathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Tạo JWT thực tế bằng jjwt trước khi thiết lập mock
        long expirationTime = 24 * 60 * 60 * 1000; // 24 tiếng
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
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetAllSeekers() throws Exception {
        List<Seeker> seekers = Collections.singletonList(seeker);
        when(seekerRepository.findAll()).thenReturn(seekers);

        mockMvc.perform(get("/seeker/get-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userId").value(userId.toString()));

        verify(seekerRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetSeekerById_Success() throws Exception {
        when(seekerService.findSeekerById(userId)).thenReturn(seeker);

        mockMvc.perform(get("/seeker/candidate-skills")
                .param("userId", userId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()));

        verify(seekerService, times(1)).findSeekerById(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetSeekerById_NotFound() throws Exception {
        when(seekerService.findSeekerById(userId)).thenThrow(new RuntimeException("Seeker not found"));

        mockMvc.perform(get("/seeker/candidate-skills")
                .param("userId", userId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(seekerService, times(1)).findSeekerById(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetSeekerProfile_Success() throws Exception {
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(seekerService.findSeekerById(userId)).thenReturn(seeker);

        System.out.println("TOKEN: " + jwtToken);
        mockMvc.perform(get("/seeker/seeker-profile")
                .with(jwt().jwt((Jwt.Builder jwt) -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andDo(print())
                .andExpect(jsonPath("$.userId").value(userId.toString()));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(seekerService, times(1)).findSeekerById(userId);
    }

    @Test
    void testGetSeekerProfile_UserAccountNotFound() throws Exception {
        // Simulate UserAccount not found
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        mockMvc.perform(get("/seeker/seeker-profile")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)  
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().isNotFound());

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(seekerService, times(0)).findSeekerById(any());
    }
    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateSeeker_Success() throws Exception {
        SeekerDTO seekerDTO = new SeekerDTO();
        when(seekerService.updateSeeker(Mockito.any(SeekerDTO.class), eq(userId))).thenReturn(true);

        mockMvc.perform(put("/seeker/update-seeker")
                .with(jwt().jwt(jwt -> jwt.claim("email", "giathuanhl@gmail.com")))
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", jwtToken)
                .content(objectMapper.writeValueAsString(seekerDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Cập nhật thông tin thành công"));

        verify(seekerService, times(1)).updateSeeker(Mockito.any(SeekerDTO.class), eq(userId));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateSeeker_Failure() throws Exception {
        SeekerDTO seekerDTO = new SeekerDTO();
        when(seekerService.updateSeeker(Mockito.any(SeekerDTO.class), eq(userId))).thenReturn(false);

        mockMvc.perform(put("/seeker/update-seeker")
                .with(jwt().jwt(jwt -> jwt.claim("email", "giathuanhl@gmail.com")))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(seekerDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Cập nhật thông tin thất bại"));

        verify(seekerService, times(1)).updateSeeker(Mockito.any(SeekerDTO.class), eq(userId));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testFollowCompany_Success() throws Exception {
        UUID companyId = UUID.randomUUID();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        when(companyService.followCompany(companyId, userId)).thenReturn(result);

        mockMvc.perform(put("/seeker/follow/{companyId}", companyId)
                .with(jwt().jwt(jwt -> jwt.claim("email", "giathuanhl@gmail.com")))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success").value(true));

        verify(companyService, times(1)).followCompany(companyId, userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetFollowedCompanies() throws Exception {
        List<FollowCompanyDTO> companies = Collections.singletonList(new FollowCompanyDTO());
        when(companyRepository.findCompaniesFollowedBySeeker(userId)).thenReturn(companies);

        mockMvc.perform(get("/seeker/followed-companies")
                .with(jwt().jwt(jwt -> jwt.claim("email", "giathuanhl@gmail.com")))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(companyRepository, times(1)).findCompaniesFollowedBySeeker(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetCandidateDetails_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        ApplicantProfileProjection projection = Mockito.mock(ApplicantProfileProjection.class);
        when(projection.getUserId()).thenReturn(userId);
        when(projection.getPostId()).thenReturn(postId);
        when(projection.getIndustryName()).thenReturn("Tech, IT");
        when(seekerRepository.findCandidateDetails(userId.toString(), postId.toString())).thenReturn(projection);

        mockMvc.perform(get("/seeker/profile-apply")
                .param("userId", userId.toString())
                .param("postId", postId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()));

        verify(seekerRepository, times(1)).findCandidateDetails(userId.toString(), postId.toString());
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetNotificationsByUserId_Success() throws Exception {
        List<Notification> notifications = Collections.singletonList(new Notification());
        when(notificationRepository.findNotificationByUserId(userId)).thenReturn(notifications);

        mockMvc.perform(get("/seeker/notifications/{userId}", userId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(notificationRepository, times(1)).findNotificationByUserId(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetUnreadNotificationCount_Success() throws Exception {
        when(notificationService.countUnreadNotifications(userId)).thenReturn(5L);

        mockMvc.perform(get("/seeker/unread-count/{userId}", userId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));

        verify(notificationService, times(1)).countUnreadNotifications(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testMarkNotificationAsRead_Success() throws Exception {
        UUID notificationId = UUID.randomUUID();
        when(notificationService.updateNotificationReadStatus(notificationId)).thenReturn(true);

        mockMvc.perform(patch("/seeker/read/{notificationId}", notificationId)
        		.with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(notificationService, times(1)).updateNotificationReadStatus(notificationId);
    }
}