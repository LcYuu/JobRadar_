package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.ExperienceDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Experience;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.ExperienceRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IExperienceService;
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
import java.time.LocalDate;
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

@WebMvcTest(ExperienceController.class)
class ExperienceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExperienceRepository experienceRepository;

    @MockBean
    private IExperienceService experienceService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USER_EMAIL = "giathuanhl@gmail.com";
    private String jwtToken;
    private static final Integer EXPERIENCE_ID = 1;
    private static final String JOB_TITLE = "Software Engineer";
    private static final String COMPANY_NAME = "Tech Corp";
    private static final String DESCRIPTION = "Developed applications";
    private static final String START_DATE = "2025-05-10";
    private static final String END_DATE = "2025-09-01";

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
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetAllExperiences() throws Exception {
        // Arrange
        Experience experience = new Experience();
        experience.setExperienceId(EXPERIENCE_ID);
        experience.setJobTitle(JOB_TITLE);
        experience.setCompanyName(COMPANY_NAME);
        experience.setDescription(DESCRIPTION);
        experience.setStartDate(LocalDate.parse(START_DATE));
        experience.setEndDate(LocalDate.parse(END_DATE));
        List<Experience> experiences = Arrays.asList(experience);
        when(experienceRepository.findAll()).thenReturn(experiences);

        // Act & Assert
        mockMvc.perform(get("/experience/get-all")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].experienceId").value(EXPERIENCE_ID))
                .andExpect(jsonPath("$[0].jobTitle").value(JOB_TITLE))
                .andExpect(jsonPath("$[0].companyName").value(COMPANY_NAME))
                .andExpect(jsonPath("$[0].description").value(DESCRIPTION))
                .andExpect(jsonPath("$[0].startDate").value(START_DATE))
                .andExpect(jsonPath("$[0].endDate").value(END_DATE));

        verify(experienceRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateExperienceSuccess() throws Exception {
        // Arrange
        ExperienceDTO experienceDTO = new ExperienceDTO();
        experienceDTO.setJobTitle(JOB_TITLE);
        experienceDTO.setCompanyName(COMPANY_NAME);
        experienceDTO.setDescription(DESCRIPTION);
        experienceDTO.setStartDate(LocalDate.parse(START_DATE));
        experienceDTO.setEndDate(LocalDate.parse(END_DATE));

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(experienceService.createExp(any(ExperienceDTO.class), eq(USER_ID))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/experience/create-experience")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobTitle\": \"" + JOB_TITLE + "\", \"companyName\": \"" + COMPANY_NAME + "\", \"description\": \"" + DESCRIPTION + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\"}"))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Experience created successfully."));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(experienceService, times(1)).createExp(any(ExperienceDTO.class), eq(USER_ID));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateExperienceFailure() throws Exception {
        // Arrange
        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(experienceService.createExp(any(ExperienceDTO.class), eq(USER_ID))).thenReturn(false);

        // Act & Assert
        mockMvc.perform(post("/experience/create-experience")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobTitle\": \"" + JOB_TITLE + "\", \"companyName\": \"" + COMPANY_NAME + "\", \"description\": \"" + DESCRIPTION + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\"}"))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to create Experience."));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(experienceService, times(1)).createExp(any(ExperienceDTO.class), eq(USER_ID));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateExperienceSuccess() throws Exception {
        // Arrange
        ExperienceDTO experienceDTO = new ExperienceDTO();
        experienceDTO.setJobTitle(JOB_TITLE);
        experienceDTO.setCompanyName(COMPANY_NAME);
        experienceDTO.setDescription(DESCRIPTION);
        experienceDTO.setStartDate(LocalDate.parse(START_DATE));
        experienceDTO.setEndDate(LocalDate.parse(END_DATE));

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        Experience existingExperience = new Experience();
        existingExperience.setExperienceId(EXPERIENCE_ID);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(experienceRepository.findById(EXPERIENCE_ID)).thenReturn(Optional.of(existingExperience));
        when(experienceService.updateExp(any(Experience.class), eq(EXPERIENCE_ID), eq(USER_ID))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(put("/experience/update-experience/" + EXPERIENCE_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobTitle\": \"" + JOB_TITLE + "\", \"companyName\": \"" + COMPANY_NAME + "\", \"description\": \"" + DESCRIPTION + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\"}"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Update Experience success"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(experienceService, times(1)).updateExp(any(Experience.class), eq(EXPERIENCE_ID), eq(USER_ID));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateExperienceNotFound() throws Exception {
        // Arrange
        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(experienceService.updateExp(any(Experience.class), eq(EXPERIENCE_ID), eq(USER_ID)))
                .thenThrow(new AllExceptions("Experience not found"));

        // Act & Assert
        mockMvc.perform(put("/experience/update-experience/" + EXPERIENCE_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobTitle\": \"" + JOB_TITLE + "\", \"companyName\": \"" + COMPANY_NAME + "\", \"description\": \"" + DESCRIPTION + "\", \"startDate\": \"" + START_DATE + "\", \"endDate\": \"" + END_DATE + "\"}"))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Experience not found"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(experienceRepository, never()).findById(anyInt()); // Service handles the check
        verify(experienceService, times(1)).updateExp(any(Experience.class), eq(EXPERIENCE_ID), eq(USER_ID));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteExperienceSuccess() throws Exception {
        // Arrange
        when(experienceService.deleteExp(EXPERIENCE_ID)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/experience/delete-experience/" + EXPERIENCE_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Experience deleted successfully"));

        verify(experienceService, times(1)).deleteExp(EXPERIENCE_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteExperienceFailure() throws Exception {
        // Arrange
        when(experienceService.deleteExp(EXPERIENCE_ID)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/experience/delete-experience/" + EXPERIENCE_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Experience deletion failed"));

        verify(experienceService, times(1)).deleteExp(EXPERIENCE_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchExpByUserIdSuccess() throws Exception {
        // Arrange
        Experience experience = new Experience();
        experience.setExperienceId(EXPERIENCE_ID);
        experience.setJobTitle(JOB_TITLE);
        experience.setCompanyName(COMPANY_NAME);
        experience.setDescription(DESCRIPTION);
        experience.setStartDate(LocalDate.parse(START_DATE));
        experience.setEndDate(LocalDate.parse(END_DATE));
        List<Experience> experiences = Arrays.asList(experience);

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(experienceService.searchExpByUserId(USER_ID)).thenReturn(experiences);

        // Act & Assert
        mockMvc.perform(get("/experience/seeker")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].experienceId").value(EXPERIENCE_ID))
                .andExpect(jsonPath("$[0].jobTitle").value(JOB_TITLE))
                .andExpect(jsonPath("$[0].companyName").value(COMPANY_NAME))
                .andExpect(jsonPath("$[0].description").value(DESCRIPTION))
                .andExpect(jsonPath("$[0].startDate").value(START_DATE))
                .andExpect(jsonPath("$[0].endDate").value(END_DATE));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(experienceService, times(1)).searchExpByUserId(USER_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchExpByUserIdNotFound() throws Exception {
        // Arrange
        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(experienceService.searchExpByUserId(USER_ID)).thenThrow(new AllExceptions("No experience found"));

        // Act & Assert
        mockMvc.perform(get("/experience/seeker")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("No experience found"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(experienceService, times(1)).searchExpByUserId(USER_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchExperienceByUserIdSuccess() throws Exception {
        // Arrange
        Experience experience = new Experience();
        experience.setExperienceId(EXPERIENCE_ID);
        experience.setJobTitle(JOB_TITLE);
        experience.setCompanyName(COMPANY_NAME);
        experience.setDescription(DESCRIPTION);
        experience.setStartDate(LocalDate.parse(START_DATE));
        experience.setEndDate(LocalDate.parse(END_DATE));
        List<Experience> experiences = Arrays.asList(experience);

        when(experienceService.searchExpByUserId(USER_ID)).thenReturn(experiences);

        // Act & Assert
        mockMvc.perform(get("/experience/profile-seeker")
                .param("userId", USER_ID.toString())
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].experienceId").value(EXPERIENCE_ID))
                .andExpect(jsonPath("$[0].jobTitle").value(JOB_TITLE))
                .andExpect(jsonPath("$[0].companyName").value(COMPANY_NAME))
                .andExpect(jsonPath("$[0].description").value(DESCRIPTION))
                .andExpect(jsonPath("$[0].startDate").value(START_DATE))
                .andExpect(jsonPath("$[0].endDate").value(END_DATE));

        verify(experienceService, times(1)).searchExpByUserId(USER_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchExperienceByUserIdNotFound() throws Exception {
        // Arrange
        when(experienceService.searchExpByUserId(USER_ID)).thenThrow(new AllExceptions("No experience found"));

        // Act & Assert
        mockMvc.perform(get("/experience/profile-seeker")
                .param("userId", USER_ID.toString())
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("No experience found"));

        verify(experienceService, times(1)).searchExpByUserId(USER_ID);
    }
}