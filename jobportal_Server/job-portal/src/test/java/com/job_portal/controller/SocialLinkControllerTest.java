package com.job_portal.controller;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.config.JwtProvider;
import com.job_portal.enums.SocialPlatform;
import com.job_portal.models.SocialLink;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.SocialLinkRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.ISocialLinkService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@WebMvcTest(SocialLinkController.class)
public class SocialLinkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ISocialLinkService socialLinkService;

    @MockBean
    private SocialLinkRepository socialLinkRepository;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private JwtProvider jwtProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;
    private UUID userId;
    private UserAccount userAccount;
    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    private static final String USER_EMAIL = "danggiathuanhl@gmail.com";

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userAccount = new UserAccount();
        userAccount.setUserId(userId);
        userAccount.setEmail(USER_EMAIL);

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
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetAllSocialPlatforms_Success() throws Exception {
        List<String> platforms = Collections.singletonList("LinkedIn");
        when(socialLinkService.getAllPlatformNames()).thenReturn(platforms);

        mockMvc.perform(get("/socialLink/social-platforms")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0]").value("LinkedIn"));

        verify(socialLinkService, times(1)).getAllPlatformNames();
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateSocialLink_Success() throws Exception {
        SocialLink socialLink = new SocialLink();
        socialLink.setPlatform(SocialPlatform.LINKEDIN); // Use enum constant
        socialLink.setUrl("https://linkedin.com/in/testuser");
        socialLink.setUserId(userId); // Set userId to match controller logic
        when(socialLinkService.createSocialLink(any(SocialLink.class), eq(userId))).thenReturn(true);

        mockMvc.perform(post("/socialLink/create-socialLink")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .with(csrf()) // Include CSRF token for state-changing request
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(socialLink)))
                .andDo(print()) // For debugging
                .andExpect(status().isCreated())
                .andExpect(content().string("Thêm thành công"));

        verify(socialLinkService, times(1)).createSocialLink(any(SocialLink.class), eq(userId));
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateSocialLink_Failure() throws Exception {
        SocialLink socialLink = new SocialLink();
        socialLink.setPlatform(SocialPlatform.LINKEDIN); // Use enum constant
        socialLink.setUrl("https://linkedin.com/in/testuser");
        socialLink.setUserId(userId); // Set userId to match controller logic
        when(socialLinkService.createSocialLink(any(SocialLink.class), eq(userId))).thenReturn(false);

        mockMvc.perform(post("/socialLink/create-socialLink")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .with(csrf()) // Include CSRF token for state-changing request
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(socialLink)))
                .andDo(print()) // For debugging
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Thêm thất bại"));

        verify(socialLinkService, times(1)).createSocialLink(any(SocialLink.class), eq(userId));
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateSocialLink_Success() throws Exception {
        Long id = 1L;
        SocialLink socialLink = new SocialLink();
        socialLink.setId(id);
        socialLink.setPlatform(SocialPlatform.LINKEDIN);
        socialLink.setUrl("https://linkedin.com/in/updateduser");
        socialLink.setUserId(userId);
        when(socialLinkService.updateSocialLink(any(SocialLink.class), eq(id), eq(userId))).thenReturn(true);

        mockMvc.perform(put("/socialLink/update-socialLink/{id}", id)
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(socialLink)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Cập nhật thành công"));

        verify(socialLinkService, times(1)).updateSocialLink(any(SocialLink.class), eq(id), eq(userId));
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateSocialLink_NotFound() throws Exception {
        Long socialLinkId = 1L;
        SocialLink socialLink = new SocialLink();
        socialLink.setId(socialLinkId); // Set ID to match the path variable
        socialLink.setPlatform(SocialPlatform.LINKEDIN); // Use enum constant
        socialLink.setUrl("https://linkedin.com/in/updateduser");
        socialLink.setUserId(userId); // Set userId to match the controller's logic
        when(socialLinkService.updateSocialLink(any(SocialLink.class), eq(socialLinkId), eq(userId)))
                .thenThrow(new RuntimeException("Social link not found"));

        mockMvc.perform(put("/socialLink/update-socialLink/{id}", socialLinkId)
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .with(csrf()) // Include CSRF token for state-changing request
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(socialLink)))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(socialLinkService, times(1)).updateSocialLink(any(SocialLink.class), eq(socialLinkId), eq(userId));
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteSocialLink_Success() throws Exception {
        Long socialLinkId = 1L;
        when(socialLinkService.deleteSocialLink(socialLinkId)).thenReturn(true);

        mockMvc.perform(delete("/socialLink/delete-socialLink/{id}", socialLinkId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Xóa thành công"));

        verify(socialLinkService, times(1)).deleteSocialLink(socialLinkId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteSocialLink_Failure() throws Exception {
        Long socialLinkId = 1L;
        when(socialLinkService.deleteSocialLink(socialLinkId)).thenReturn(false);

        mockMvc.perform(delete("/socialLink/delete-socialLink/{id}", socialLinkId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Xóa thất bại"));

        verify(socialLinkService, times(1)).deleteSocialLink(socialLinkId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteSocialLink_NotFound() throws Exception {
        Long socialLinkId = 1L;
        when(socialLinkService.deleteSocialLink(socialLinkId))
                .thenThrow(new RuntimeException("Social link not found"));

        mockMvc.perform(delete("/socialLink/delete-socialLink/{id}", socialLinkId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(socialLinkService, times(1)).deleteSocialLink(socialLinkId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetSocialLinkByUserId_Authenticated_Success() throws Exception {
        SocialLink socialLink = new SocialLink();
        socialLink.setPlatform(SocialPlatform.LINKEDIN); // Use enum constant
        socialLink.setUrl("https://linkedin.com/in/testuser");
        List<SocialLink> socialLinks = Collections.singletonList(socialLink);
        when(socialLinkService.getSocialLinksByUserId(userId)).thenReturn(socialLinks);

        mockMvc.perform(get("/socialLink/get-socialLink-by-userId")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());


        verify(socialLinkService, times(1)).getSocialLinksByUserId(userId);
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetSocialLinkByUserId_Authenticated_Failure() throws Exception {
        when(socialLinkService.getSocialLinksByUserId(userId))
                .thenThrow(new RuntimeException("Error processing request"));

        mockMvc.perform(get("/socialLink/get-socialLink-by-userId")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Đã xảy ra lỗi trong quá trình xử lý yêu cầu."));

        verify(socialLinkService, times(1)).getSocialLinksByUserId(userId);
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetSocialLinkByUserId_Param_Success() throws Exception {
        SocialLink socialLink = new SocialLink();
        socialLink.setPlatform(SocialPlatform.LINKEDIN); // Use enum constant
        socialLink.setUrl("https://linkedin.com/in/testuser");
        List<SocialLink> socialLinks = Collections.singletonList(socialLink);
        when(socialLinkService.getSocialLinksByUserId(userId)).thenReturn(socialLinks);

        mockMvc.perform(get("/socialLink/profile-socialLink")
                .param("userId", userId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(socialLinkService, times(1)).getSocialLinksByUserId(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetSocialLinkByUserId_Param_Failure() throws Exception {
        when(socialLinkService.getSocialLinksByUserId(userId))
                .thenThrow(new RuntimeException("Error processing request"));

        mockMvc.perform(get("/socialLink/profile-socialLink")
                .param("userId", userId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Đã xảy ra lỗi trong quá trình xử lý yêu cầu."));

        verify(socialLinkService, times(1)).getSocialLinksByUserId(userId);
    }
}