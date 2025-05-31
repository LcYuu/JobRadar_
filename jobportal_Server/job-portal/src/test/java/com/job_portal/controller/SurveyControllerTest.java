package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.SurveyDTO;
import com.job_portal.DTO.SurveyStatisticsDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Survey;
import com.job_portal.service.ISurveyService;
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
import org.springframework.test.web.servlet.ResultActions;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SurveyController.class)
public class SurveyControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private ISurveyService surveyService;

	@Autowired
	private ObjectMapper objectMapper;

	private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
	private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

	private static final String USER_EMAIL = "test@example.com";
	private static final String SURVEY_ID = "survey123";
	private static final String SURVEY_STATUS = "COMPLETED";
	private static final String FEEDBACK = "Great experience!";
	private static final int HIRED_COUNT = 5;
	private static final int CANDIDATE_QUALITY = 4;
	private String jwtToken;

	@BeforeEach
	void setUp() throws Exception {
		// Mock authentication
		Authentication authentication = Mockito.mock(Authentication.class);
		when(authentication.getName()).thenReturn(USER_EMAIL);
		SecurityContext securityContext = Mockito.mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		// Generate JWT token
		long expirationTime = 24 * 60 * 60 * 1000; // 24 hours
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expirationTime);
		jwtToken = "Bearer " + Jwts.builder().setIssuer("GiaThuanSenpai").setIssuedAt(now).setExpiration(expiryDate)
				.claim("email", authentication.getName()).signWith(key).compact();
		when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testSubmitSurvey_Success() throws Exception {
		// Arrange
		SurveyDTO surveyDTO = new SurveyDTO();
		surveyDTO.setHiredCount(HIRED_COUNT);
		surveyDTO.setCandidateQuality(CANDIDATE_QUALITY);
		surveyDTO.setFeedback(FEEDBACK);

		Survey survey = new Survey();
		survey.setId(SURVEY_ID);
		survey.setHiredCount(HIRED_COUNT);
		survey.setCandidateQuality(CANDIDATE_QUALITY);
		survey.setFeedback(FEEDBACK);
		survey.setSurveyStatus(SURVEY_STATUS);
		survey.setSubmittedAt(LocalDateTime.now());

		when(surveyService.submitSurvey(eq(SURVEY_ID), any(SurveyDTO.class))).thenReturn(survey);

		// Act & Assert
		mockMvc.perform(post("/surveys/" + SURVEY_ID).header("Authorization", jwtToken).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(surveyDTO)))
				.andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(SURVEY_ID))
				.andExpect(jsonPath("$.hiredCount").value(HIRED_COUNT))
				.andExpect(jsonPath("$.candidateQuality").value(CANDIDATE_QUALITY))
				.andExpect(jsonPath("$.feedback").value(FEEDBACK))
				.andExpect(jsonPath("$.surveyStatus").value(SURVEY_STATUS));

		verify(surveyService, times(1)).submitSurvey(eq(SURVEY_ID), any(SurveyDTO.class));
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testSubmitSurvey_NotFound() throws Exception {
		// Arrange
		SurveyDTO surveyDTO = new SurveyDTO();
		surveyDTO.setHiredCount(HIRED_COUNT);
		surveyDTO.setCandidateQuality(CANDIDATE_QUALITY);
		surveyDTO.setFeedback(FEEDBACK);

		when(surveyService.submitSurvey(eq(SURVEY_ID), any(SurveyDTO.class)))
				.thenThrow(new RuntimeException("Survey not found"));

		// Act & Assert
		mockMvc.perform(post("/surveys/" + SURVEY_ID).header("Authorization", jwtToken).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(surveyDTO)))
				.andDo(print()).andExpect(status().isBadRequest()).andExpect(content().string("Survey not found"));

		verify(surveyService, times(1)).submitSurvey(eq(SURVEY_ID), any(SurveyDTO.class));
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testTriggerSurveyCheck_Success() throws Exception {
		// Arrange
		doNothing().when(surveyService).checkAndSendSurveys();

		// Act & Assert
		mockMvc.perform(post("/surveys/trigger-survey-check").header("Authorization", jwtToken).with(csrf()))
				.andDo(print()).andExpect(status().isOk())
				.andExpect(content().string("Survey check triggered successfully."));

		verify(surveyService, times(1)).checkAndSendSurveys();
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testGetSurveyStatistics_Success() throws Exception {
		// Arrange
		SurveyStatisticsDTO statistics = new SurveyStatisticsDTO();
		statistics.setTotalSurveys(100);
		statistics.setCompletedSurveys(60);
		statistics.setPendingSurveys(40);
		statistics.setAverageHiredCount(3.5);

		when(surveyService.getSurveyStatistics()).thenReturn(statistics);

		// Act & Assert
		mockMvc.perform(get("/surveys/statistics").header("Authorization", jwtToken)).andDo(print())
				.andExpect(status().isOk()).andExpect(jsonPath("$.totalSurveys").value(100))
				.andExpect(jsonPath("$.completedSurveys").value(60)).andExpect(jsonPath("$.pendingSurveys").value(40))
				.andExpect(jsonPath("$.averageHiredCount").value(3.5));

		verify(surveyService, times(1)).getSurveyStatistics();
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testGetAllSurveys_Success() throws Exception {
		// Arrange
		Survey survey = new Survey();
		survey.setId(SURVEY_ID);
		survey.setSurveyStatus(SURVEY_STATUS);
		survey.setHiredCount(HIRED_COUNT);
		survey.setCandidateQuality(CANDIDATE_QUALITY);
		survey.setFeedback(FEEDBACK);

		Pageable pageable = PageRequest.of(0, 10);
		Page<Survey> surveyPage = new PageImpl<>(Arrays.asList(survey), pageable, 1);

		when(surveyService.getAllSurveys(pageable)).thenReturn(surveyPage);

		// Act & Assert
		mockMvc.perform(get("/surveys").param("page", "0").param("size", "10").header("Authorization", jwtToken))
				.andDo(print()).andExpect(status().isOk()).andExpect(jsonPath("$.content[0].id").value(SURVEY_ID))
				.andExpect(jsonPath("$.content[0].surveyStatus").value(SURVEY_STATUS))
				.andExpect(jsonPath("$.content[0].hiredCount").value(HIRED_COUNT))
				.andExpect(jsonPath("$.content[0].candidateQuality").value(CANDIDATE_QUALITY))
				.andExpect(jsonPath("$.content[0].feedback").value(FEEDBACK));

		verify(surveyService, times(1)).getAllSurveys(pageable);
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testGetSurveysByStatus_Success() throws Exception {
		// Arrange
		Survey survey = new Survey();
		survey.setId(SURVEY_ID);
		survey.setSurveyStatus(SURVEY_STATUS);
		survey.setHiredCount(HIRED_COUNT);
		survey.setCandidateQuality(CANDIDATE_QUALITY);
		survey.setFeedback(FEEDBACK);

		Pageable pageable = PageRequest.of(0, 10);
		Page<Survey> surveyPage = new PageImpl<>(Arrays.asList(survey), pageable, 1);

		when(surveyService.getSurveysByStatus(SURVEY_STATUS, pageable)).thenReturn(surveyPage);

		// Act & Assert
		mockMvc.perform(get("/surveys/by-status/" + SURVEY_STATUS).param("page", "0").param("size", "10")
				.header("Authorization", jwtToken)).andDo(print()).andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(SURVEY_ID))
				.andExpect(jsonPath("$.content[0].surveyStatus").value(SURVEY_STATUS))
				.andExpect(jsonPath("$.content[0].hiredCount").value(HIRED_COUNT))
				.andExpect(jsonPath("$.content[0].candidateQuality").value(CANDIDATE_QUALITY))
				.andExpect(jsonPath("$.content[0].feedback").value(FEEDBACK));

		verify(surveyService, times(1)).getSurveysByStatus(SURVEY_STATUS, pageable);
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testGetSurveysByDateRange_Success() throws Exception {
		// Arrange
		LocalDateTime startDate = LocalDateTime.of(2025, 5, 1, 0, 0);
		LocalDateTime endDate = LocalDateTime.of(2025, 5, 27, 23, 59);

		Survey survey = new Survey();
		survey.setId(SURVEY_ID);
		survey.setSurveyStatus(SURVEY_STATUS);
		survey.setHiredCount(HIRED_COUNT);
		survey.setCandidateQuality(CANDIDATE_QUALITY);
		survey.setFeedback(FEEDBACK);
		survey.setCreatedAt(startDate);

		List<Survey> surveys = Arrays.asList(survey);

		when(surveyService.getSurveysByDateRange(startDate, endDate)).thenReturn(surveys);

		// Act & Assert
		mockMvc.perform(get("/surveys/by-date-range").param("startDate", "2025-05-01T00:00:00")
				.param("endDate", "2025-05-27T23:59:00").header("Authorization", jwtToken)).andDo(print())
				.andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(SURVEY_ID))
				.andExpect(jsonPath("$[0].surveyStatus").value(SURVEY_STATUS))
				.andExpect(jsonPath("$[0].hiredCount").value(HIRED_COUNT))
				.andExpect(jsonPath("$[0].candidateQuality").value(CANDIDATE_QUALITY))
				.andExpect(jsonPath("$[0].feedback").value(FEEDBACK));

		verify(surveyService, times(1)).getSurveysByDateRange(startDate, endDate);
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testGetSurveysByDateRange_NoSurveysFound() throws Exception {
		// Arrange
		LocalDateTime startDate = LocalDateTime.of(2025, 5, 1, 0, 0);
		LocalDateTime endDate = LocalDateTime.of(2025, 5, 27, 23, 59);

		when(surveyService.getSurveysByDateRange(startDate, endDate)).thenReturn(Arrays.asList());

		// Act & Assert
		mockMvc.perform(get("/surveys/by-date-range").param("startDate", "2025-05-01T00:00:00")
				.param("endDate", "2025-05-27T23:59:00").header("Authorization", jwtToken)).andDo(print())
				.andExpect(status().isOk()).andExpect(jsonPath("$").isArray()).andExpect(jsonPath("$").isEmpty());

		verify(surveyService, times(1)).getSurveysByDateRange(startDate, endDate);
	}
}