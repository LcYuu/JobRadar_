package com.job_portal.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.hamcrest.CoreMatchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestTemplate;

import com.job_portal.DTO.ChatRequest;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.UserAccountRepository;

@WebMvcTest(ChatBotController.class)
public class ChatBotControllerTest {

	@InjectMocks
    private ChatBotController chatBotController;

    @MockBean
    private RestTemplate restTemplate;

    @MockBean
    private UserAccountRepository userAccountRepository;

    private MockMvc mockMvc;

    private final String RASA_URL = "http://localhost:5005/webhooks/rest/webhook";
    private static final String JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJHaWFUaHVhblNlbnBhaSIsImlhdCI6MTc0NzczNDYzOSwiZXhwIjoxNzQ3ODIxMDM5LCJlbWFpbCI6ImdpYXRodWFuaGxAZ21haWwuY29tIn0.iYEamuMvZTJPWJx1BlO_GIwaSsd2kcWXXJ8WQZF_2_s";
    private final String USER_EMAIL = "giathuanhl@gmail.com";
    private final String MESSAGE = "Xin chào";
    
    private String jwt;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(chatBotController).build();
        
        jwt = "Bearer " + JWT_TOKEN;
    }
    
    @Test
    @WithMockUser(username = "giathuanhl@gmail.com")
    void testSendMessage_Success() throws Exception {
        // Arrange
        ChatRequest chatRequest = new ChatRequest();
        chatRequest.setMessage(MESSAGE);
        
        UUID userId = UUID.randomUUID();

        UserAccount user = new UserAccount();
        user.setUserId(userId);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(restTemplate.postForObject(eq(RASA_URL), any(), eq(Object[].class)))
                .thenReturn(new Object[]{"response from Rasa"});

        // Act & Assert
        mockMvc.perform(post("/chatbot/send")
                .header("Authorization", jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\": \"" + MESSAGE + "\"}"))
        		.andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("response from Rasa"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(restTemplate, times(1)).postForObject(eq(RASA_URL), any(), eq(Object[].class));
    }

    @Test
    void testSendMessage_UserNotFound() throws Exception {
        // Arrange
        ChatRequest chatRequest = new ChatRequest();
        chatRequest.setMessage(MESSAGE);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/chatbot/send")
                .header("Authorization", jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\": \"" + MESSAGE + "\"}"))
        		.andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Error communicating with Rasa")));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(restTemplate, never()).postForObject(anyString(), any(), any());
    }

    @Test
    void testSendMessage_RasaServerError() throws Exception {
        // Arrange
        ChatRequest chatRequest = new ChatRequest();
        chatRequest.setMessage(MESSAGE);

        UUID userId = UUID.randomUUID();
        
        UserAccount user = new UserAccount();
        user.setUserId(userId);
        user.setEmail(USER_EMAIL);

        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(restTemplate.postForObject(eq(RASA_URL), any(), eq(Object[].class)))
                .thenThrow(new RuntimeException("Rasa server error"));

        // Act & Assert
        mockMvc.perform(post("/chatbot/send")
                .header("Authorization", jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\": \"" + MESSAGE + "\"}"))
        		.andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error communicating with Rasa: Rasa server error"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(restTemplate, times(1)).postForObject(eq(RASA_URL), any(), eq(Object[].class));
    }
}
