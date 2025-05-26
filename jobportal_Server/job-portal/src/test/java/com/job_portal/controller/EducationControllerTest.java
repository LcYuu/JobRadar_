
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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

	private static final UUID USER_ID = UUID.randomUUID();
	private static final String USER_EMAIL = "giathuanhl@gmail.com";
	private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJHaWFUaHVhblNlbnBhaSIsImlhdCI6MTc0NzczNDYzOSwiZXhwIjoxNzQ3ODIxMDM5LCJlbWFpbCI6ImdpYXRodWFuaGxAZ21haWwuY29tIn0.iYEamuMvZTJPWJx1BlO_GIwaSsd2kcWXXJ8WQZF_2_s";
	private static final Integer EDUCATION_ID = 1;
	private static final String CERTIFICATE_NAME = "Bachelor's Degree";
	private static final String MAJOR = "Software Engineering";
	private static final String UNIVERSITY_NAME = "HCMUTE";
	private static final LocalDate START_DATE = LocalDate.parse("2025-05-10");
	private static final LocalDate END_DATE = LocalDate.parse("2025-09-01");
	private static final String GPA = "3.6";

	private String jwt;

	@BeforeEach
	void setUp() throws Exception {
		jwt = "Bearer " + JWT_TOKEN;
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testCreateEducation_Success() throws Exception {
		// Arrange
		EducationDTO educationDTO = new EducationDTO();
		educationDTO.setCertificateDegreeName(CERTIFICATE_NAME);
		educationDTO.setMajor(MAJOR);
		educationDTO.setUniversityName(UNIVERSITY_NAME);
		educationDTO.setStartDate(START_DATE);
		educationDTO.setEndDate(END_DATE);
		educationDTO.setGpa(GPA);

		UserAccount user = new UserAccount();
		user.setUserId(USER_ID);
		user.setEmail(USER_EMAIL);

		try (var mockedStatic = mockStatic(JwtProvider.class)) {
			mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
					.thenReturn(USER_EMAIL);
			when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
			when(educationService.createEdu(any(EducationDTO.class), eq(USER_ID))).thenReturn(true);

			// Act & Assert
			ResultActions result = mockMvc.perform(post("/education/create-education")
					.header("Authorization", JWT_TOKEN).with(csrf()).contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(educationDTO))).andDo(print());

			result.andExpect(status().isCreated()).andExpect(content().string("Education created successfully."));

			// Log response
			System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

			verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
			verify(educationService, times(1)).createEdu(any(EducationDTO.class), eq(USER_ID));
		}
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testCreateEducation_UserNotFound() throws Exception {
		// Arrange
		EducationDTO educationDTO = new EducationDTO();
		educationDTO.setCertificateDegreeName(CERTIFICATE_NAME);
		educationDTO.setMajor(MAJOR);
		educationDTO.setUniversityName(UNIVERSITY_NAME);
		educationDTO.setStartDate(START_DATE);
		educationDTO.setEndDate(END_DATE);
		educationDTO.setGpa(GPA);
		educationDTO.setUserId(USER_ID);

		when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

		// Act & Assert
		ResultActions result = mockMvc
				.perform(post("/education/create-education").header("Authorization", jwt).with(csrf())
						.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(educationDTO)))
				.andDo(print());

		result.andExpect(status().isNotFound()).andExpect(content().string("User not found"));

		// Log response
		System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

		verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
		verify(educationService, never()).createEdu(any(), any());
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testUpdateEducation_Success() throws Exception {
		// Arrange
		EducationDTO educationDTO = new EducationDTO();
		educationDTO.setCertificateDegreeName(CERTIFICATE_NAME);
		educationDTO.setMajor(MAJOR);
		educationDTO.setUniversityName(UNIVERSITY_NAME);
		educationDTO.setStartDate(START_DATE);
		educationDTO.setEndDate(END_DATE);
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
		ResultActions result = mockMvc
				.perform(put("/education/update-education/" + EDUCATION_ID).header("Authorization", jwt).with(csrf())
						.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(educationDTO)))
				.andDo(print());

		result.andExpect(status().isCreated()).andExpect(content().string("Update Education success"));

		// Log response
		System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

		verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
		verify(educationRepository, times(1)).findById(EDUCATION_ID);
		verify(educationService, times(1)).updateEdu(any(Education.class), eq(EDUCATION_ID), eq(USER_ID));
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testUpdateEducation_EducationNotFound() throws Exception {
		// Arrange
		EducationDTO educationDTO = new EducationDTO();
		educationDTO.setCertificateDegreeName(CERTIFICATE_NAME);
		educationDTO.setMajor(MAJOR);
		educationDTO.setUniversityName(UNIVERSITY_NAME);
		educationDTO.setStartDate(START_DATE);
		educationDTO.setEndDate(END_DATE);
		educationDTO.setGpa(GPA);

		UserAccount user = new UserAccount();
		user.setUserId(USER_ID);
		user.setEmail(USER_EMAIL);
		Seeker seeker = new Seeker();
		seeker.setUserId(USER_ID);
		user.setSeeker(seeker);

		try (var mockedStatic = mockStatic(JwtProvider.class)) {
			mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
					.thenReturn(USER_EMAIL);
			when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
			when(educationRepository.findById(EDUCATION_ID)).thenReturn(Optional.empty());

			// Act & Assert
			ResultActions result = mockMvc.perform(put("/education/update-education/" + EDUCATION_ID)
					.header("Authorization", JWT_TOKEN).with(csrf()).contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(educationDTO))).andDo(print());

			result.andExpect(status().isNotFound());

			// Log response
			System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

			verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
			verify(educationRepository, times(1)).findById(EDUCATION_ID);
			verify(educationService, never()).updateEdu(any(), any(), any());
		}
	}

	@Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteEducation_Success() throws Exception {
        // Arrange
        when(educationService.deleteEdu(EDUCATION_ID)).thenReturn(true);

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/education/delete-education/" + EDUCATION_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(content().string("Education deleted successfully"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(educationService, times(1)).deleteEdu(EDUCATION_ID);
    }

	@Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteEducation_NotFound() throws Exception {
        // Arrange
        when(educationService.deleteEdu(EDUCATION_ID)).thenThrow(new AllExceptions("Education not found"));

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/education/delete-education/" + EDUCATION_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isNotFound())
                .andExpect(content().string("Education not found"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(educationService, times(1)).deleteEdu(EDUCATION_ID);
    }

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testSearchEduByUserId_Success() throws Exception {
		// Arrange
		Education education = new Education();
		education.setEducationId(EDUCATION_ID);
		education.setCertificateDegreeName(CERTIFICATE_NAME);
		education.setMajor(MAJOR);
		education.setUniversityName(UNIVERSITY_NAME);
		education.setStartDate(START_DATE);
		education.setEndDate(END_DATE);
		education.setGpa(GPA);

		UserAccount user = new UserAccount();
		user.setUserId(USER_ID);
		user.setEmail(USER_EMAIL);

		try (var mockedStatic = mockStatic(JwtProvider.class)) {
			mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
					.thenReturn(USER_EMAIL);
			when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
			when(educationService.searchEduByUserId(USER_ID)).thenReturn(List.of(education));

			// Act & Assert
			ResultActions result = mockMvc.perform(get("/education/seeker").header("Authorization", JWT_TOKEN))
					.andDo(print());

			result.andExpect(status().isOk()).andExpect(jsonPath("$[0].educationId").value(EDUCATION_ID))
					.andExpect(jsonPath("$[0].certificateDegreeName").value(CERTIFICATE_NAME))
					.andExpect(jsonPath("$[0].major").value(MAJOR))
					.andExpect(jsonPath("$[0].universityName").value(UNIVERSITY_NAME))
					.andExpect(jsonPath("$[0].startDate").value("2025-05-10")) // Expect string
					.andExpect(jsonPath("$[0].endDate").value("2025-09-01")) // Expect string
					.andExpect(jsonPath("$[0].gpa").value(GPA)); // Expect string

			// Log response
			System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

			verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
			verify(educationService, times(1)).searchEduByUserId(USER_ID);
		}
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testSearchEduByUserId_NotFound() throws Exception {
		// Arrange
		UserAccount user = new UserAccount();
		user.setUserId(USER_ID);
		user.setEmail(USER_EMAIL);

		try (var mockedStatic = mockStatic(JwtProvider.class)) {
			mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
					.thenReturn(USER_EMAIL);
			when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
			when(educationService.searchEduByUserId(USER_ID)).thenThrow(new AllExceptions("Education not found"));

			// Act & Assert
			ResultActions result = mockMvc.perform(get("/education/seeker").header("Authorization", JWT_TOKEN))
					.andDo(print());

			result.andExpect(status().isNotFound()).andExpect(content().string("Education not found"));

			// Log response
			System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

			verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
			verify(educationService, times(1)).searchEduByUserId(USER_ID);
		}
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testSearchEducationByUserId_Success() throws Exception {
		// Arrange
		Education education = new Education();
		education.setEducationId(EDUCATION_ID);
		education.setCertificateDegreeName(CERTIFICATE_NAME);
		education.setMajor(MAJOR);
		education.setUniversityName(UNIVERSITY_NAME);
		education.setStartDate(START_DATE);
		education.setEndDate(END_DATE);
		education.setGpa(GPA);

		when(educationService.searchEduByUserId(USER_ID)).thenReturn(List.of(education));

		// Act & Assert
		ResultActions result = mockMvc.perform(get("/education/profile-seeker").param("userId", USER_ID.toString()))
				.andDo(print());

		result.andExpect(status().isOk()).andExpect(jsonPath("$[0].educationId").value(EDUCATION_ID))
				.andExpect(jsonPath("$[0].certificateDegreeName").value(CERTIFICATE_NAME))
				.andExpect(jsonPath("$[0].major").value(MAJOR))
				.andExpect(jsonPath("$[0].universityName").value(UNIVERSITY_NAME))
				.andExpect(jsonPath("$[0].startDate").value("2025-05-10"))
				.andExpect(jsonPath("$[0].endDate").value("2025-09-01")).andExpect(jsonPath("$[0].gpa").value(GPA));

		// Log response
		System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

		verify(educationService, times(1)).searchEduByUserId(USER_ID);
	}

	@Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchEducationByUserId_NotFound() throws Exception {
        // Arrange
        when(educationService.searchEduByUserId(USER_ID)).thenThrow(new AllExceptions("Education not found"));

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/education/profile-seeker")
                .param("userId", USER_ID.toString()))
                .andDo(print());

        result.andExpect(status().isNotFound())
                .andExpect(content().string("Education not found"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(educationService, times(1)).searchEduByUserId(USER_ID);
    }
}
