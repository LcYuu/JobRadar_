package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.EducationDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Education;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.EducationRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IEducationService;
import com.social.exceptions.AllExceptions;

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
import org.springframework.test.web.servlet.ResultActions;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EducationController.class)
public class EducationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EducationRepository educationRepository;

    @MockBean
    private IEducationService educationService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    
    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USER_EMAIL = "giathuanhl@gmail.com";
    private String jwtToken;
    private static final Integer EDUCATION_ID = 1;
    private static final String CERTIFICATE_NAME = "Bachelor's Degree";
    private static final String MAJOR = "Software Engineering";
    private static final String UNIVERSITY_NAME = "HCMUTE";
    private static final String START_DATE = "2025-05-10";
    private static final String END_DATE = "2025-09-01";
    private static final String GPA = "3.6";

    @BeforeEach
    void setUp() throws Exception {
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
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateEducation_Success() throws Exception {
        // Arrange
        EducationDTO educationDTO = new EducationDTO();
        educationDTO.setCertificateDegreeName(CERTIFICATE_NAME);
        educationDTO.setMajor(MAJOR);
        educationDTO.setUniversityName(UNIVERSITY_NAME);
        educationDTO.setStartDate(java.time.LocalDate.parse(START_DATE));
        educationDTO.setEndDate(java.time.LocalDate.parse(END_DATE));
        educationDTO.setGpa(GPA);

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(educationService.createEdu(any(EducationDTO.class), eq(USER_ID))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/education/create-education")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"certificateDegreeName\": \"" + CERTIFICATE_NAME + "\", \"major\": \"" + MAJOR + "\", \"universityName\": \"" + UNIVERSITY_NAME + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\", \"gpa\": \"" + GPA + "\"}"))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Education created successfully."));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(educationService, times(1)).createEdu(any(EducationDTO.class), eq(USER_ID));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateEducation_UserNotFound() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/education/create-education")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"certificateDegreeName\": \"" + CERTIFICATE_NAME + "\", \"major\": \"" + MAJOR + "\", \"universityName\": \"" + UNIVERSITY_NAME + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\", \"gpa\": \"" + GPA + "\"}"))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(educationService, never()).createEdu(any(), any());
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateEducation_Success() throws Exception {
        // Arrange
        EducationDTO educationDTO = new EducationDTO();
        educationDTO.setCertificateDegreeName(CERTIFICATE_NAME);
        educationDTO.setMajor(MAJOR);
        educationDTO.setUniversityName(UNIVERSITY_NAME);
        educationDTO.setStartDate(java.time.LocalDate.parse(START_DATE));
        educationDTO.setEndDate(java.time.LocalDate.parse(END_DATE));
        educationDTO.setGpa(GPA);

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);
        Seeker seeker = new Seeker();
        seeker.setUserId(USER_ID);
        user.setSeeker(seeker);

        Education existingEducation = new Education();
        existingEducation.setEducationId(EDUCATION_ID);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(educationRepository.findById(EDUCATION_ID)).thenReturn(Optional.of(existingEducation));
        when(educationService.updateEdu(any(Education.class), eq(EDUCATION_ID), eq(USER_ID))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(put("/education/update-education/" + EDUCATION_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"certificateDegreeName\": \"" + CERTIFICATE_NAME + "\", \"major\": \"" + MAJOR + "\", \"universityName\": \"" + UNIVERSITY_NAME + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\", \"gpa\": \"" + GPA + "\"}"))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Update Education success"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(educationRepository, times(1)).findById(EDUCATION_ID);
        verify(educationService, times(1)).updateEdu(any(Education.class), eq(EDUCATION_ID), eq(USER_ID));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateEducation_EducationNotFound() throws Exception {
        // Arrange
        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);
        Seeker seeker = new Seeker();
        seeker.setUserId(USER_ID);
        user.setSeeker(seeker);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(educationRepository.findById(EDUCATION_ID)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put("/education/update-education/" + EDUCATION_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"certificateDegreeName\": \"" + CERTIFICATE_NAME + "\", \"major\": \"" + MAJOR + "\", \"universityName\": \"" + UNIVERSITY_NAME + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\", \"gpa\": \"" + GPA + "\"}"))
                .andDo(print())
                .andExpect(status().isNotFound());

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(educationRepository, times(1)).findById(EDUCATION_ID);
        verify(educationService, never()).updateEdu(any(), any(), any());
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteEducation_Success() throws Exception {
        // Arrange
        when(educationService.deleteEdu(EDUCATION_ID)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/education/delete-education/" + EDUCATION_ID)
                .header("Authorization", jwtToken)
                .with(csrf())) 
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Education deleted successfully"));

        verify(educationService, times(1)).deleteEdu(EDUCATION_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteEducation_NotFound() throws Exception {
        // Arrange
        when(educationService.deleteEdu(EDUCATION_ID)).thenThrow(new AllExceptions("Education not found"));

        // Act & Assert
        mockMvc.perform(delete("/education/delete-education/" + EDUCATION_ID)
                .header("Authorization", jwtToken)
                .with(csrf())) // Added CSRF token
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Education not found"));

        verify(educationService, times(1)).deleteEdu(EDUCATION_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchEduByUserId_Success() throws Exception {
        // Arrange
        Education education = new Education();
        education.setEducationId(EDUCATION_ID);
        education.setCertificateDegreeName(CERTIFICATE_NAME);
        education.setMajor(MAJOR);
        education.setUniversityName(UNIVERSITY_NAME);
        education.setStartDate(java.time.LocalDate.parse(START_DATE));
        education.setEndDate(java.time.LocalDate.parse(END_DATE));
        education.setGpa(GPA);

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(educationService.searchEduByUserId(USER_ID)).thenReturn(List.of(education));

        // Act & Assert
        mockMvc.perform(get("/education/seeker")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].educationId").value(EDUCATION_ID))
                .andExpect(jsonPath("$[0].certificateDegreeName").value(CERTIFICATE_NAME))
                .andExpect(jsonPath("$[0].major").value(MAJOR))
                .andExpect(jsonPath("$[0].universityName").value(UNIVERSITY_NAME))
                .andExpect(jsonPath("$[0].startDate").value(START_DATE))
                .andExpect(jsonPath("$[0].endDate").value(END_DATE))
                .andExpect(jsonPath("$[0].gpa").value(GPA));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(educationService, times(1)).searchEduByUserId(USER_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchEduByUserId_NotFound() throws Exception {
        // Arrange
        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(educationService.searchEduByUserId(USER_ID)).thenThrow(new AllExceptions("Education not found"));

        // Act & Assert
        mockMvc.perform(get("/education/seeker")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Education not found"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(educationService, times(1)).searchEduByUserId(USER_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchEducationByUserId_Success() throws Exception {
        // Arrange
        Education education = new Education();
        education.setEducationId(EDUCATION_ID);
        education.setCertificateDegreeName(CERTIFICATE_NAME);
        education.setMajor(MAJOR);
        education.setUniversityName(UNIVERSITY_NAME);
        education.setStartDate(java.time.LocalDate.parse(START_DATE));
        education.setEndDate(java.time.LocalDate.parse(END_DATE));
        education.setGpa(GPA);

        when(educationService.searchEduByUserId(USER_ID)).thenReturn(List.of(education));

        // Act & Assert
        mockMvc.perform(get("/education/profile-seeker")
                .param("userId", USER_ID.toString())
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].educationId").value(EDUCATION_ID))
                .andExpect(jsonPath("$[0].certificateDegreeName").value(CERTIFICATE_NAME))
                .andExpect(jsonPath("$[0].major").value(MAJOR))
                .andExpect(jsonPath("$[0].universityName").value(UNIVERSITY_NAME))
                .andExpect(jsonPath("$[0].startDate").value(START_DATE))
                .andExpect(jsonPath("$[0].endDate").value(END_DATE))
                .andExpect(jsonPath("$[0].gpa").value(GPA));

        verify(educationService, times(1)).searchEduByUserId(USER_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchEducationByUserId_NotFound() throws Exception {
        // Arrange
        when(educationService.searchEduByUserId(USER_ID)).thenThrow(new AllExceptions("Education not found"));

        // Act & Assert
        mockMvc.perform(get("/education/profile-seeker")
                .param("userId", USER_ID.toString())
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Education not found"));

        verify(educationService, times(1)).searchEduByUserId(USER_ID);
    }
}