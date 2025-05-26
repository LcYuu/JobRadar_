
package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.CVDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.CV;
import com.job_portal.models.Company;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.models.UserType;
import com.job_portal.repository.CVRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.ICVService;
import com.social.exceptions.AllExceptions;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
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

@WebMvcTest(CVController.class)
public class CVControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CVRepository cvRepository;

    @MockBean
    private ICVService cvService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;
    
    private String jwt;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USER_EMAIL = "giathuanhl@gmail.com";
    private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJHaWFUaHVhblNlbnBhaSIsImlhdCI6MTc0NzczNDYzOSwiZXhwIjoxNzQ3ODIxMDM5LCJlbWFpbCI6ImdpYXRodWFuaGxAZ21haWwuY29tIn0.iYEamuMvZTJPWJx1BlO_GIwaSsd2kcWXXJ8WQZF_2_s";
    private static final Integer CV_ID = 1;
    private static final String CV_NAME = "MyCV";
    private static final String CV_PATH = "/path/to/cv.pdf";
    
    @BeforeEach
	void setUp() throws Exception {
		jwt = "Bearer " + JWT_TOKEN;
    }
		

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testGetCV_Success() throws Exception {
        // Arrange
        CV cv = new CV();
        cv.setCvId(CV_ID);
        cv.setCvName(CV_NAME);
        cv.setPathCV(CV_PATH);
        when(cvRepository.findAll()).thenReturn(List.of(cv));

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/cv/get-all"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$[0].cvId").value(CV_ID))
                .andExpect(jsonPath("$[0].cvName").value(CV_NAME))
                .andExpect(jsonPath("$[0].pathCV").value(CV_PATH));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(cvRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetCV_EmptyList() throws Exception {
        // Arrange
        when(cvRepository.findAll()).thenReturn(List.of());

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/cv/get-all"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(cvRepository, times(1)).findAll();
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateCV_Success() throws Exception {
        // Arrange
        CVDTO cvDto = new CVDTO();
        cvDto.setCvName(CV_NAME);
        cvDto.setPathCV(CV_PATH);

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        // Mock File object
        File file = mock(File.class);
        when(file.exists()).thenReturn(true);
        when(file.getAbsolutePath()).thenReturn(CV_PATH);

        try (var mockedJwtStatic = mockStatic(JwtProvider.class);
             var mockedFilesStatic = mockStatic(Files.class)) {
            // Mock JwtProvider
            mockedJwtStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
                    .thenReturn(USER_EMAIL);

            // Mock Files.size
            mockedFilesStatic.when(() -> Files.size(any(Path.class)))
                    .thenReturn(5 * 1024 * 1024L); // 5MB in bytes

            // Mock repository and service
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(cvService.createCV(any(CVDTO.class), eq(USER_ID))).thenAnswer(invocation -> {
                CVDTO dto = invocation.getArgument(0);
                // Giả lập logic kiểm tra tệp trong cvService
                if (dto.getPathCV().equals(CV_PATH)) {
                    return true;
                }
                throw new IllegalArgumentException("Đường dẫn CV không hợp lệ");
            });

            // Act
            ResultActions result = mockMvc.perform(post("/cv/create-cv")
                    .header("Authorization", JWT_TOKEN)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(cvDto)))
                    .andDo(print());

            // Assert
            result.andExpect(status().isCreated())
                    .andExpect(content().string("Tạo CV thành công"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            // Verify interactions
            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(cvService, times(1)).createCV(any(CVDTO.class), eq(USER_ID));
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateCV_EmptyPathCV() throws Exception {
        // Arrange
        CVDTO cvDto = new CVDTO();
        cvDto.setCvName(CV_NAME);
        cvDto.setPathCV(""); // Empty pathCV

        // Act & Assert
        ResultActions result = mockMvc.perform(post("/cv/create-cv")
                .header("Authorization", JWT_TOKEN)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cvDto)))
                .andDo(print());

        result.andExpect(status().isBadRequest())
                .andExpect(content().string("Đường dẫn CV không được để trống"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(userAccountRepository, never()).findByEmail(anyString());
        verify(cvService, never()).createCV(any(), any());
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateCV_FileLargerThan5MB_Fails() throws Exception {
        // Arrange
        CVDTO cvDto = new CVDTO();
        cvDto.setCvName(CV_NAME);
        cvDto.setPathCV(CV_PATH);

        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        // Mock File object
        File file = mock(File.class);
        when(file.exists()).thenReturn(true);
        when(file.getAbsolutePath()).thenReturn(CV_PATH);
        when(file.toPath()).thenReturn(Path.of(CV_PATH));

        try (var mockedJwtStatic = mockStatic(JwtProvider.class);
             var mockedFilesStatic = mockStatic(Files.class)) {
            // Mock JwtProvider
            mockedJwtStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
                    .thenReturn(USER_EMAIL);

            // Mock Files.size to return 6MB
            mockedFilesStatic.when(() -> Files.size(any(Path.class)))
                    .thenReturn(6 * 1024 * 1024L); // 6MB in bytes

            // Mock repository (cvService.createCV không được gọi vì lỗi kích thước)
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));

            // Act
            ResultActions result = mockMvc.perform(post("/cv/create-cv")
                    .header("Authorization", JWT_TOKEN)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(cvDto)))
                    .andDo(print());

            // Assert
            result.andExpect(status().isBadRequest())
                    .andExpect(content().string("File CV phải có kích thước nhỏ hơn hoặc bằng 5MB"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(cvService, never()).createCV(any(CVDTO.class), eq(USER_ID)); // cvService không được gọi
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateIsMain_Success() throws Exception {
        // Arrange
        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(cvService.updateIsMain(CV_ID, USER_ID)).thenReturn(true);

            // Act & Assert
            ResultActions result = mockMvc.perform(post("/cv/cv-main/" + CV_ID)
                    .header("Authorization", JWT_TOKEN)
                    .with(csrf()))
                    .andDo(print());

            result.andExpect(status().isCreated())
                    .andExpect(content().string("Đặt thành CV chính thành công"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(cvService, times(1)).updateIsMain(CV_ID, USER_ID);
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateIsMain_Failure() throws Exception {
        // Arrange
        UserAccount user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);

        try (var mockedStatic = mockStatic(JwtProvider.class)) {
            mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(JWT_TOKEN.replace("Bearer ", "")))
                    .thenReturn(USER_EMAIL);
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(cvService.updateIsMain(CV_ID, USER_ID)).thenReturn(false);

            // Act & Assert
            ResultActions result = mockMvc.perform(post("/cv/cv-main/" + CV_ID)
                    .header("Authorization", JWT_TOKEN)
                    .with(csrf()))
                    .andDo(print());

            result.andExpect(status().isInternalServerError())
                    .andExpect(content().string("Thất bại trong việc đặt thành CV chính"));

            // Log response
            System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

            verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
            verify(cvService, times(1)).updateIsMain(CV_ID, USER_ID);
        }
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteCV_Success() throws Exception {
        // Arrange
        when(cvService.deleteCV(CV_ID)).thenReturn(true);

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/cv/delete-cv/" + CV_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(content().string("Xóa CV thành công"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(cvService, times(1)).deleteCV(CV_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteCV_Failure() throws Exception {
        // Arrange
        when(cvService.deleteCV(CV_ID)).thenReturn(false);

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/cv/delete-cv/" + CV_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isInternalServerError())
                .andExpect(content().string("Xóa CV thất bại"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(cvService, times(1)).deleteCV(CV_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testDeleteCV_NotFound() throws Exception {
        // Arrange
        when(cvService.deleteCV(CV_ID)).thenThrow(new AllExceptions("CV not found"));

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/cv/delete-cv/" + CV_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isNotFound())
                .andExpect(content().string("CV not found"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(cvService, times(1)).deleteCV(CV_ID);
    }
}
