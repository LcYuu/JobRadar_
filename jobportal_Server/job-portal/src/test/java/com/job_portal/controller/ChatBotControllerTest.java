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

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestTemplate;

import com.job_portal.DTO.ChatRequest;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.UserAccountRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@WebMvcTest(ChatBotController.class)
public class ChatBotControllerTest {

	@InjectMocks
    private ChatBotController chatBotController;

    @MockBean
    private RestTemplate restTemplate;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @Autowired
    private MockMvc mockMvc;
    
    private String jwtToken;

    private final String RASA_URL = "http://localhost:5005/webhooks/rest/webhook";
   
    private final String USER_EMAIL = "giathuanhl@gmail.com";
    private final String MESSAGE = "Xin chào";
    
    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
	private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(chatBotController).build();
        
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(USER_EMAIL);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Generate jwtToken token
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
                .header("Authorization", jwtToken)
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
                .header("Authorization", jwtToken)
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
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\": \"" + MESSAGE + "\"}"))
        		.andDo(print())
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error communicating with Rasa: Rasa server error"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(restTemplate, times(1)).postForObject(eq(RASA_URL), any(), eq(Object[].class));
    }
}
