package com.job_portal.controller;

import com.job_portal.DTO.ExperienceDTO;
import com.job_portal.models.Experience;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.ExperienceRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IExperienceService;
import com.job_portal.config.JwtProvider;
import com.social.exceptions.AllExceptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ExperienceControllerTest {

    @InjectMocks
    private ExperienceController experienceController;

    @Mock
    private ExperienceRepository experienceRepository;

    @Mock
    private IExperienceService experienceService;

    @Mock
    private UserAccountRepository userAccountRepository;

    private String jwt;
    private UserAccount user;
    private ExperienceDTO experienceDTO;
    private UUID userId;
	private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJHaWFUaHVhblNlbnBhaSIsImlhdCI6MTc0NzczNDYzOSwiZXhwIjoxNzQ3ODIxMDM5LCJlbWFpbCI6ImdpYXRodWFuaGxAZ21haWwuY29tIn0.iYEamuMvZTJPWJx1BlO_GIwaSsd2kcWXXJ8WQZF_2_s";
	private static final LocalDate START_DATE = LocalDate.parse("2025-05-10");
	private static final LocalDate END_DATE = LocalDate.parse("2025-09-01");
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        jwt = "Bearer " + JWT_TOKEN;
        userId = UUID.randomUUID();
        user = new UserAccount();
        user.setUserId(userId);
        user.setEmail("giathuanhl@gmail.com");

        experienceDTO = new ExperienceDTO();
        experienceDTO.setJobTitle("Software Engineer");
        experienceDTO.setCompanyName("Tech Corp");
        experienceDTO.setDescription("Developed applications");
        experienceDTO.setStartDate(START_DATE);
        experienceDTO.setEndDate(END_DATE);
    }

    @Test
    void testGetAllExperiences() {
        // Arrange
        List<Experience> experiences = Arrays.asList(new Experience(), new Experience());
        when(experienceRepository.findAll()).thenReturn(experiences);

        // Act
        ResponseEntity<List<Experience>> response = experienceController.getExperience();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(experiences, response.getBody());
        verify(experienceRepository, times(1)).findAll();
    }

    @Test
    void testCreateExperienceSuccess() {
        // Arrange
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(user));
        when(experienceService.createExp(any(ExperienceDTO.class), eq(userId))).thenReturn(true);

        // Act
        ResponseEntity<String> response = experienceController.createExperience(jwt, experienceDTO);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Experience created successfully.", response.getBody());
        verify(experienceService, times(1)).createExp(any(ExperienceDTO.class), eq(userId));
    }

    @Test
    void testCreateExperienceFailure() {
        // Arrange
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(user));
        when(experienceService.createExp(any(ExperienceDTO.class), eq(userId))).thenReturn(false);

        // Act
        ResponseEntity<String> response = experienceController.createExperience(jwt, experienceDTO);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Failed to create Experience.", response.getBody());
        verify(experienceService, times(1)).createExp(any(ExperienceDTO.class), eq(userId));
    }

    @Test
    void testUpdateExperienceSuccess() throws AllExceptions {
        // Arrange
        Integer experienceId = 1;
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(user));
        when(experienceService.updateExp(any(Experience.class), eq(experienceId), eq(userId))).thenReturn(true);

        // Act
        ResponseEntity<String> response = experienceController.updateExperience(jwt, experienceDTO, experienceId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Update Experience success", response.getBody());
        verify(experienceService, times(1)).updateExp(any(Experience.class), eq(experienceId), eq(userId));
    }

    @Test
    void testUpdateExperienceNotFound() throws AllExceptions {
        // Arrange
        Integer experienceId = 1;
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(user));
        when(experienceService.updateExp(any(Experience.class), eq(experienceId), eq(userId)))
                .thenThrow(new AllExceptions("Experience not found"));

        // Act
        ResponseEntity<String> response = experienceController.updateExperience(jwt, experienceDTO, experienceId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Experience not found", response.getBody());
    }

    @Test
    void testDeleteExperienceSuccess() throws AllExceptions {
        // Arrange
        Integer experienceId = 1;
        when(experienceService.deleteExp(experienceId)).thenReturn(true);

        // Act
        ResponseEntity<String> response = experienceController.deleteUser(experienceId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Experience deleted successfully", response.getBody());
        verify(experienceService, times(1)).deleteExp(experienceId);
    }

    @Test
    void testDeleteExperienceFailure() throws AllExceptions {
        // Arrange
        Integer experienceId = 1;
        when(experienceService.deleteExp(experienceId)).thenReturn(false);

        // Act
        ResponseEntity<String> response = experienceController.deleteUser(experienceId);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Experience deletion failed", response.getBody());
        verify(experienceService, times(1)).deleteExp(experienceId);
    }

    @Test
    void testSearchExpByUserIdSuccess() throws AllExceptions {
        // Arrange
        List<Experience> experiences = Arrays.asList(new Experience());
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(user));
        when(experienceService.searchExpByUserId(userId)).thenReturn(experiences);

        // Act
        ResponseEntity<Object> response = experienceController.searchExpByUserId(jwt);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(experiences, response.getBody());
        verify(experienceService, times(1)).searchExpByUserId(userId);
    }

    @Test
    void testSearchExperienceByUserIdSuccess() throws AllExceptions {
        // Arrange
        List<Experience> experiences = Arrays.asList(new Experience());
        when(experienceService.searchExpByUserId(userId)).thenReturn(experiences);

        // Act
        ResponseEntity<Object> response = experienceController.searchExperienceByUserId(userId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(experiences, response.getBody());
        verify(experienceService, times(1)).searchExpByUserId(userId);
    }

    @Test
    void testSearchExperienceByUserIdNotFound() throws AllExceptions {
        // Arrange
        when(experienceService.searchExpByUserId(userId))
                .thenThrow(new AllExceptions("No experience found"));

        // Act
        ResponseEntity<Object> response = experienceController.searchExperienceByUserId(userId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No experience found", response.getBody());
    }
}