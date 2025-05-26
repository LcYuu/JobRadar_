package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.GeneratedCVDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.GeneratedCV;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.GeneratedCVRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IGeneratedCVService;
import com.social.exceptions.AllExceptions;
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

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GeneratedCVController.class)
public class GeneratedCVControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GeneratedCVRepository generatedCVRepository;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private IGeneratedCVService generatedCVService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USER_EMAIL = "giathuanhl@gmail.com";
    private String jwtToken;
    private static final Integer CV_ID = 1;
    private static final String CV_CONTENT = "Sample CV content";

    private GeneratedCVDTO generatedCVDTO;
    private UserAccount user;
    private GeneratedCV generatedCV;

    @BeforeEach
    void setUp() {
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(USER_EMAIL);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Generate jwtToken
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

        user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        generatedCVDTO = new GeneratedCVDTO();
        generatedCVDTO.setCvContent(CV_CONTENT);

        generatedCV = new GeneratedCV();
        generatedCV.setGeneratedCvId(CV_ID);
        generatedCV.setCvContent(CV_CONTENT);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetAllCVs_Success() throws Exception {
        // Arrange
        List<GeneratedCV> cvs = Arrays.asList(generatedCV);
        when(generatedCVRepository.findAll()).thenReturn(cvs);

        // Act & Assert
        mockMvc.perform(get("/generated-cv/get-all")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].generatedCvId").value(CV_ID))
                .andExpect(jsonPath("$[0].cvContent").value(CV_CONTENT));

        verify(generatedCVRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetGenCVById_Success() throws Exception {
        // Arrange
        when(generatedCVRepository.findById(CV_ID)).thenReturn(Optional.of(generatedCV));

        // Act & Assert
        mockMvc.perform(get("/generated-cv/get-gencv-by-id/" + CV_ID)
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedCvId").value(CV_ID))
                .andExpect(jsonPath("$.cvContent").value(CV_CONTENT));

        verify(generatedCVRepository, times(1)).findById(CV_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetGenCVById_NotFound() throws Exception {
        // Arrange
        when(generatedCVRepository.findById(CV_ID)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/generated-cv/get-gencv-by-id/" + CV_ID)
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("CV not found"));

        verify(generatedCVRepository, times(1)).findById(CV_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateCV_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(generatedCVService.createGeneratedCV(any(GeneratedCVDTO.class), eq(USER_ID))).thenReturn(generatedCV);

        // Act & Assert
        mockMvc.perform(post("/generated-cv/create-cv")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cvContent\": \"" + CV_CONTENT + "\"}"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedCvId").value(CV_ID))
                .andExpect(jsonPath("$.cvContent").value(CV_CONTENT));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(generatedCVService, times(1)).createGeneratedCV(any(GeneratedCVDTO.class), eq(USER_ID));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateCV_UserNotFound() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/generated-cv/create-cv")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cvContent\": \"" + CV_CONTENT + "\"}"))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(generatedCVService, never()).createGeneratedCV(any(), any());
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteCV_Success() throws Exception {
        // Arrange
        when(generatedCVService.deleteCV(CV_ID)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/generated-cv/delete-cv/" + CV_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Xóa CV thành công"));

        verify(generatedCVService, times(1)).deleteCV(CV_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteCV_NotFound() throws Exception {
        // Arrange
        when(generatedCVService.deleteCV(CV_ID)).thenThrow(new AllExceptions("CV not found"));

        // Act & Assert
        mockMvc.perform(delete("/generated-cv/delete-cv/" + CV_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("CV not found"));

        verify(generatedCVService, times(1)).deleteCV(CV_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateCV_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(generatedCVService.updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(put("/generated-cv/update-cv/" + CV_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cvContent\": \"" + CV_CONTENT + "\"}"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Cập nhật thành công"));

        verify(generatedCVService, times(1)).updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateCV_Failure() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(generatedCVService.updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class))).thenReturn(false);

        // Act & Assert
        mockMvc.perform(put("/generated-cv/update-cv/" + CV_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cvContent\": \"" + CV_CONTENT + "\"}"))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Cập nhật thất bại"));

        verify(generatedCVService, times(1)).updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class));
    }
}