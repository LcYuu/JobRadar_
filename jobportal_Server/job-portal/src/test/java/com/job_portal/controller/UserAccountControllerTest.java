package com.job_portal.controller;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.hamcrest.CoreMatchers.containsString;
import static org.mockito.ArgumentMatchers.any;


import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.DailyAccountCount;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IUserAccountService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@WebMvcTest(UserAccountController.class)
public class UserAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private IUserAccountService userAccountService;

    @MockBean
    private JwtProvider jwtProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;
    private UUID userId;
    private UserAccount userAccount;
    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    private static final String USER_EMAIL = "giathuanhl@gmail.com";

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
        when(userAccountService.findUserByJwt(jwtToken)).thenReturn(userAccount);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetAllUsers_Success() throws Exception {
        List<UserAccount> users = Collections.singletonList(userAccount);
        when(userAccountRepository.findAll()).thenReturn(users);

        mockMvc.perform(get("/users/get-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userId").value(userId.toString()));

        verify(userAccountRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testAdminGetAllUsers_Success() throws Exception {
        Pageable pageable = PageRequest.of(0, 5);
        List<UserAccount> users = Collections.singletonList(userAccount);
        Page<UserAccount> userPage = new PageImpl<>(users, pageable, users.size());
        when(userAccountRepository.searchUserAccounts("", null, null, pageable)).thenReturn(userPage);

        mockMvc.perform(get("/users/admin-get-all")
                .param("page", "0")
                .param("size", "5")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].userId").value(userId.toString()))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(userAccountRepository, times(1)).searchUserAccounts("", null, null, pageable);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testAdminGetAllUsers_WithFilters() throws Exception {
        Pageable pageable = PageRequest.of(0, 5);
        List<UserAccount> users = Collections.singletonList(userAccount);
        Page<UserAccount> userPage = new PageImpl<>(users, pageable, users.size());
        String userName = "test";
        Integer userTypeId = 1;
        Boolean active = true;
        when(userAccountRepository.searchUserAccounts(userName, userTypeId, active, pageable)).thenReturn(userPage);

        mockMvc.perform(get("/users/admin-get-all")
                .param("page", "0")
                .param("size", "5")
                .param("userName", userName)
                .param("userTypeId", userTypeId.toString())
                .param("active", active.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].userId").value(userId.toString()));

        verify(userAccountRepository, times(1)).searchUserAccounts(userName, userTypeId, active, pageable);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetUserById_Success() throws Exception {
        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));

        mockMvc.perform(get("/users/{userId}", userId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()));

        verify(userAccountRepository, times(1)).findById(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetUserById_NotFound() throws Exception {
        when(userAccountRepository.findById(userId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/users/{userId}", userId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(userAccountRepository, times(1)).findById(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetUserById_InternalServerError() throws Exception {
        when(userAccountRepository.findById(userId)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/users/{userId}", userId)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isInternalServerError());

        verify(userAccountRepository, times(1)).findById(userId);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateUser_Success() throws Exception {
        UserAccount updatedUser = new UserAccount();
        updatedUser.setUserId(userId);
        updatedUser.setEmail(USER_EMAIL);
        when(userAccountService.updateUser(any(UserAccount.class), eq(userId))).thenReturn(true);

        mockMvc.perform(put("/users/update-user")
                .with(csrf())
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedUser)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Update user success"));

        verify(userAccountService, times(1)).updateUser(any(UserAccount.class), eq(userId));
        verify(userAccountService, times(1)).findUserByJwt(jwtToken);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateUser_UserNotFound() throws Exception {
        UserAccount updatedUser = new UserAccount();
        updatedUser.setUserId(userId);
        when(userAccountService.findUserByJwt(jwtToken)).thenReturn(null);

        mockMvc.perform(put("/users/update-user")
                .with(csrf())
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedUser)))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(userAccountService, times(1)).findUserByJwt(jwtToken);
        verify(userAccountService, times(0)).updateUser(any(UserAccount.class), any(UUID.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateUser_Failure() throws Exception {
        UserAccount updatedUser = new UserAccount();
        updatedUser.setUserId(userId);
        when(userAccountService.updateUser(any(UserAccount.class), eq(userId))).thenReturn(false);

        mockMvc.perform(put("/users/update-user")
                .with(csrf())
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedUser)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Update user failed"));

        verify(userAccountService, times(1)).updateUser(any(UserAccount.class), eq(userId));
        verify(userAccountService, times(1)).findUserByJwt(jwtToken);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateUser_Exception() throws Exception {
        UserAccount updatedUser = new UserAccount();
        updatedUser.setUserId(userId);
        when(userAccountService.updateUser(any(UserAccount.class), eq(userId)))
                .thenThrow(new RuntimeException("Update error"));

        mockMvc.perform(put("/users/update-user")
                .with(csrf())
                .with(jwt().jwt(jwt -> jwt.claim("email", USER_EMAIL)))
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedUser)))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(userAccountService, times(1)).updateUser(any(UserAccount.class), eq(userId));
        verify(userAccountService, times(1)).findUserByJwt(jwtToken);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCountNewAccountsPerDay_Success() throws Exception {
        LocalDateTime start = LocalDateTime.parse("2025-05-01T00:00:00");
        LocalDateTime end = LocalDateTime.parse("2025-05-05T23:59:59");
        DailyAccountCount count = new DailyAccountCount(start, 10L); // Use constructor
        List<DailyAccountCount> counts = Collections.singletonList(count);
        when(userAccountService.getDailyAccountCounts(start, end)).thenReturn(counts);

        mockMvc.perform(post("/users/count-new-accounts-per-day")
                .param("startDate", "2025-05-01T00:00:00")
                .param("endDate", "2025-05-05T23:59:59")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());

        verify(userAccountService, times(1)).getDailyAccountCounts(start, end);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCountNewAccountsPerDay_InvalidDateFormat() throws Exception {
        mockMvc.perform(post("/users/count-new-accounts-per-day")
                .param("startDate", "invalid-date")
                .param("endDate", "2025-05-05T23:59:59")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(userAccountService, times(0)).getDailyAccountCounts(any(LocalDateTime.class), any(LocalDateTime.class));
    }
}