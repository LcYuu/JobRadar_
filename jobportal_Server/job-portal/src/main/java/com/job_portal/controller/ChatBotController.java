package com.job_portal.controller;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.job_portal.DTO.ChatRequest;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.UserAccountRepository;

@RestController
@RequestMapping("/chatbot")
public class ChatBotController {
	
	@Autowired
	private RestTemplate restTemplate;
	
	@Autowired
	private UserAccountRepository userAccountRepository;
	
	private final String RASA_URL = "http://localhost:5005/webhooks/rest/webhook";

	public ChatBotController(RestTemplate restTemplate) {
	     this.restTemplate = restTemplate;
	}

	@PostMapping("/send")
	public ResponseEntity<?> sendMessage(@RequestBody ChatRequest request, 
	                                    @RequestHeader(value = "Authorization", required = false) String jwt) {
	    try {
	        UUID senderId = UUID.randomUUID();// UUID mặc định cho khách
	        if (jwt != null && !jwt.isEmpty()) {
	            String email = JwtProvider.getEmailFromJwtToken(jwt);
	            Optional<UserAccount> user = userAccountRepository.findByEmail(email);
	            if (user.isPresent()) {
	                senderId = user.get().getUserId(); // UUID từ UserAccount
	            }
	        }
	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_JSON);
	        String rasaRequestBody = String.format("{\"sender\": \"%s\", \"message\": \"%s\"}", 
	                                              senderId, request.getMessage());
	        HttpEntity<String> rasaRequest = new HttpEntity<>(rasaRequestBody, headers);
	        Object[] rasaResponse = restTemplate.postForObject(RASA_URL, rasaRequest, Object[].class);
	        return ResponseEntity.ok(rasaResponse);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("Lỗi khi giao tiếp với Rasa: " + e.getMessage());
	    }
	}
}
