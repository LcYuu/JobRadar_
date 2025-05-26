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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Arrays;
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

	private static final UUID USER_ID = UUID.randomUUID();
	private static final String USER_EMAIL = "giathuanhl@gmail.com";
	private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJHaWFUaHVhblNlbnBhaSIsImlhdCI6MTc0NzgzNDAyMSwiZXhwIjoxNzQ3OTIwNDIxLCJlbWFpbCI6ImdpYXRodWFuaGxAZ21haWwuY29tIn0.Q5fqfExrB8dXDm40gze-MwunQzhJY4BGbOTPUbirAAY";
	private static final Integer CV_ID = 1;
	private static final String CV_CONTENT = "Sample CV content";

	private String jwt;
	private GeneratedCVDTO generatedCVDTO;
	private UserAccount user;
	private GeneratedCV generatedCV;

	@BeforeEach
	void setUp() {
		jwt = "Bearer " + JWT_TOKEN;
		user = new UserAccount();
		user.setUserId(USER_ID);
		user.setEmail(USER_EMAIL);

		generatedCVDTO = new GeneratedCVDTO();
		generatedCVDTO.setCvContent(CV_CONTENT); // Adjust field as per your GeneratedCVDTO

		generatedCV = new GeneratedCV();
		generatedCV.setGeneratedCvId(CV_ID);
		generatedCV.setCvContent(CV_CONTENT);
	}

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testGetAllCVs_Success() throws Exception {
		// Arrange
		List<GeneratedCV> cvs = Arrays.asList(generatedCV);
		when(generatedCVRepository.findAll()).thenReturn(cvs);

		// Act & Assert
		ResultActions result = mockMvc.perform(get("/generated-cv/get-all")).andDo(print());

		result.andExpect(status().isOk()).andExpect(jsonPath("$[0].generatedCvId").value(CV_ID))
				.andExpect(jsonPath("$[0].cvContent").value(CV_CONTENT));

		// Log response
		System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

		verify(generatedCVRepository, times(1)).findAll();
	}

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testGetGenCVById_Success() throws Exception {
        // Arrange
        when(generatedCVRepository.findById(CV_ID)).thenReturn(Optional.of(generatedCV));

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/generated-cv/get-gencv-by-id/" + CV_ID))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedCvId").value(CV_ID))
                .andExpect(jsonPath("$.cvContent").value(CV_CONTENT));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(generatedCVRepository, times(1)).findById(CV_ID);
    }

	@Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetGenCVById_NotFound() throws Exception {
        // Arrange
        when(generatedCVRepository.findById(CV_ID)).thenReturn(Optional.empty());

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/generated-cv/get-gencv-by-id/" + CV_ID))
                .andDo(print());

        result.andExpect(status().isNoContent());

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(generatedCVRepository, times(1)).findById(CV_ID);
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateCV_Success() throws Exception {
        // Arrange
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(generatedCVService.createGeneratedCV(any(GeneratedCVDTO.class), eq(USER_ID))).thenReturn(generatedCV);

            // Act & Assert
            ResultActions result = mockMvc.perform(post("/generated-cv/create-cv")
                    .header("Authorization", jwt)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(generatedCVDTO)))
                    .andDo(print());

            result.andExpect(status().isOk())
                    .andExpect(jsonPath("$.generatedCvId").value(CV_ID))
                    .andExpect(jsonPath("$.cvContent").value(CV_CONTENT));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(generatedCVService, times(1)).createGeneratedCV(any(GeneratedCVDTO.class), eq(USER_ID));
        }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateCV_UserNotFound() throws Exception {
        // Arrange
        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(jwt))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

            // Act & Assert
            ResultActions result = mockMvc.perform(post("/generated-cv/create-cv")
                    .header("Authorization", jwt)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(generatedCVDTO)))
                    .andDo(print());

            result.andExpect(status().isNotFound())
                    .andExpect(content().string("User not found"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(generatedCVService, never()).createGeneratedCV(any(), any());
        }
    }


	@Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteCV_Success() throws Exception {
        // Arrange
        when(generatedCVService.deleteCV(CV_ID)).thenReturn(true);

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/generated-cv/delete-cv/" + CV_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(content().string("Xóa CV thành công"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(generatedCVService, times(1)).deleteCV(CV_ID);
    }

	@Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteCV_NotFound() throws Exception {
        // Arrange
        when(generatedCVService.deleteCV(CV_ID)).thenThrow(new AllExceptions("CV not found"));

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/generated-cv/delete-cv/" + CV_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isNotFound())
                .andExpect(content().string("CV not found"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(generatedCVService, times(1)).deleteCV(CV_ID);
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateCV_Success() throws Exception {
        // Arrange
        when(generatedCVService.updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class))).thenReturn(true);

        // Act & Assert
        ResultActions result = mockMvc.perform(put("/generated-cv/update-cv/" + CV_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(generatedCVDTO)))
                .andDo(print());

        result.andExpect(status().isCreated())
                .andExpect(content().string("Cập nhật thành công"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(generatedCVService, times(1)).updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class));
    }

	@Test
	@WithMockUser(username = USER_EMAIL, roles = { "USER" })
	void testUpdateCV_Failure() throws Exception {

			when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
			when(generatedCVService.updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class))).thenReturn(false);

			// Act & Assert
			ResultActions result = mockMvc.perform(put("/generated-cv/update-cv/" + CV_ID)
					.with(csrf()).contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(generatedCVDTO))).andDo(print());

			result.andExpect(status().isBadRequest()).andExpect(content().string("Cập nhật thất bại"));

			// Log response
			System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

			verify(generatedCVService, times(1)).updateGeneratedCV(eq(CV_ID), any(GeneratedCVDTO.class));
		}
}