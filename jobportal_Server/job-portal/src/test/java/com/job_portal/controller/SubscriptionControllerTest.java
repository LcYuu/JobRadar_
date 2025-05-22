package com.job_portal.controller;

import static org.mockito.Mockito.doThrow;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Seeker;
import com.job_portal.models.Subscription;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.SubscriptionServiceImpl;
import com.job_portal.utils.EmailUtil;
import com.social.exceptions.AllExceptions;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@WebMvcTest(SubscriptionController.class)
public class SubscriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubscriptionServiceImpl subscriptionService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private EmailUtil emailUtil;

    @MockBean
    private JwtProvider jwtProvider;

    @Autowired
    private ObjectMapper objectMapper;

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
        userAccount.setEmail(USER_EMAIL);
        
        seeker = new Seeker();
        seeker.setUserAccount(userAccount);

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
    void testCreateSubscription_Success() throws Exception {
        Subscription subscription = new Subscription();
        
        subscription.setSeeker(seeker);
        when(subscriptionService.createSubscription(any(Subscription.class), eq(userId))).thenReturn(true);

        mockMvc.perform(post("/subscription/create")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(subscription)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Đăng ký thành công!"));

        verify(subscriptionService, times(1)).createSubscription(any(Subscription.class), eq(userId));
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateSubscription_Failure() throws Exception {
        Subscription subscription = new Subscription();
        subscription.setSeeker(seeker);
        when(subscriptionService.createSubscription(any(Subscription.class), eq(userId))).thenReturn(false);

        mockMvc.perform(post("/subscription/create")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(subscription)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Đăng ký thất bại!"));

        verify(subscriptionService, times(1)).createSubscription(any(Subscription.class), eq(userId));
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteSubscription_Success() throws Exception {
        UUID subId = UUID.randomUUID();
        when(subscriptionService.deleteSubscription(subId)).thenReturn(true);

        mockMvc.perform(delete("/subscription/delete/{subId}", subId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Hủy đăng ký thành công!"));

        verify(subscriptionService, times(1)).deleteSubscription(subId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteSubscription_Failure() throws Exception {
        UUID subId = UUID.randomUUID();
        when(subscriptionService.deleteSubscription(subId))
                .thenThrow(new AllExceptions("Subscription not found"));

        mockMvc.perform(delete("/subscription/delete/{subId}", subId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Subscription not found"));

        verify(subscriptionService, times(1)).deleteSubscription(subId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetAllSubscriptions_Success() throws Exception {
        List<Subscription> subscriptions = Collections.singletonList(new Subscription());
        when(subscriptionService.getAllSubscriptions()).thenReturn(subscriptions);

        mockMvc.perform(get("/subscription/get-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(subscriptionService, times(1)).getAllSubscriptions();
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCheckAndSendEmails_Success() throws Exception {
        // No need to mock return value for void method
        mockMvc.perform(post("/subscription/send-emails")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Đã kiểm tra và gửi email nếu cần thiết!"));

        verify(subscriptionService, times(1)).checkAndSendEmails();
    }
    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCheckAndSendEmails_Failure() throws Exception {
    	
    	doThrow(new RuntimeException("Email sending failed")).when(subscriptionService).checkAndSendEmails();

        mockMvc.perform(post("/subscription/send-emails")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Lỗi khi kiểm tra và gửi email: Email sending failed"));

        verify(subscriptionService, times(1)).checkAndSendEmails();
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateSubscription_Success() throws Exception {
        UUID subId = UUID.randomUUID();
        when(subscriptionService.updateSubscription(USER_EMAIL, subId)).thenReturn(true);

        mockMvc.perform(put("/subscription/update/{subId}", subId)
                .param("email", USER_EMAIL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Cập nhật thành công"));

        verify(subscriptionService, times(1)).updateSubscription(USER_EMAIL, subId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateSubscription_NotFound() throws Exception {
        UUID subId = UUID.randomUUID();
        when(subscriptionService.updateSubscription(USER_EMAIL, subId)).thenReturn(false);

        mockMvc.perform(put("/subscription/update/{subId}", subId)
                .param("email", USER_EMAIL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Không thể tìm thấy việc đăng ký"));

        verify(subscriptionService, times(1)).updateSubscription(USER_EMAIL, subId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateSubscription_Failure() throws Exception {
        UUID subId = UUID.randomUUID();
        when(subscriptionService.updateSubscription(USER_EMAIL, subId))
                .thenThrow(new AllExceptions("Update error"));

        mockMvc.perform(put("/subscription/update/{subId}", subId)
                .param("email", USER_EMAIL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Có lỗi xảy ra: Update error"));

        verify(subscriptionService, times(1)).updateSubscription(USER_EMAIL, subId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testFindSubBySeekerId_Success() throws Exception {
        Subscription subscription = new Subscription();
        subscription.setSeeker(seeker);
        when(subscriptionService.findSubBySeekerId(userId)).thenReturn(subscription);

        mockMvc.perform(get("/subscription/findBySeekerId")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());

        verify(subscriptionService, times(1)).findSubBySeekerId(userId);
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testFindSubBySeekerId_NotFound() throws Exception {
        when(subscriptionService.findSubBySeekerId(userId)).thenReturn(null);

        mockMvc.perform(get("/subscription/findBySeekerId")
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(subscriptionService, times(1)).findSubBySeekerId(userId);
        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
    }
}