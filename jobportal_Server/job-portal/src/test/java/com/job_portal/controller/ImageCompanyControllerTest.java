
package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.ImageDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Company;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.ImageRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IImageCompanyService;
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
import java.util.Date;
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

@WebMvcTest(ImageCompanyController.class)
public class ImageCompanyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImageRepository imageRepository;

    @MockBean
    private IImageCompanyService imageCompanyService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USER_EMAIL = "giathuanhl@gmail.com";
    private static final Integer IMAGE_ID = 1;
    private static final String IMAGE_URL = "http://example.com/image.jpg";
    private String jwtToken;
    
    private UUID companyId;

    private UserAccount user;
    private Company company;
    private ImageDTO imageDTO;

    @BeforeEach
    void setUp() {
    	companyId = UUID.randomUUID();
    	
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

        company = new Company();
        company.setCompanyId(companyId);
        user.setCompany(company);

        imageDTO = new ImageDTO();
        imageDTO.setPathImg(IMAGE_URL);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateImage_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(imageCompanyService.createImg(any(ImageDTO.class), eq(companyId))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/image-company/create-image")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"imageUrl\": \"" + IMAGE_URL + "\"}"))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Thêm hình ảnh thành công"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(imageCompanyService, times(1)).createImg(any(ImageDTO.class), eq(companyId));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateImage_UserNotFound() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/image-company/create-image")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"imageUrl\": \"" + IMAGE_URL + "\"}"))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(imageCompanyService, never()).createImg(any(), any());
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateImage_ServiceFailure() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(imageCompanyService.createImg(any(ImageDTO.class), eq(companyId))).thenReturn(false);

        // Act & Assert
        mockMvc.perform(post("/image-company/create-image")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"imageUrl\": \"" + IMAGE_URL + "\"}"))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Thêm hình ảnh thất bại"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(imageCompanyService, times(1)).createImg(any(ImageDTO.class), eq(companyId));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteImage_Success() throws Exception {
        // Arrange
        when(imageCompanyService.deleteImg(IMAGE_ID)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/image-company/delete-image/" + IMAGE_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Xóa hình ảnh thành công"));

        verify(imageCompanyService, times(1)).deleteImg(IMAGE_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteImage_ServiceFailure() throws Exception {
        // Arrange
        when(imageCompanyService.deleteImg(IMAGE_ID)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/image-company/delete-image/" + IMAGE_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Xóa hình ảnh thất bại"));

        verify(imageCompanyService, times(1)).deleteImg(IMAGE_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteImage_NotFound() throws Exception {
        // Arrange
        when(imageCompanyService.deleteImg(IMAGE_ID)).thenThrow(new AllExceptions("Image not found"));

        // Act & Assert
        mockMvc.perform(delete("/image-company/delete-image/" + IMAGE_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Image not found"));

        verify(imageCompanyService, times(1)).deleteImg(IMAGE_ID);
    }
}