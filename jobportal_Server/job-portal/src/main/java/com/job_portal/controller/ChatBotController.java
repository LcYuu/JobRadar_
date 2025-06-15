package com.job_portal.controller;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
	                                    @RequestHeader(value = "Authorization", required = false) String jwt,
	                                    @AuthenticationPrincipal UserDetails userDetails) {
	    try {
	        String senderId;
	        if (userDetails != null) {
	            // Người dùng đã đăng nhập
	            Optional<UserAccount> user = userAccountRepository.findByEmail(userDetails.getUsername());
	            senderId = user.isPresent() ? user.get().getUserId().toString() : UUID.randomUUID().toString();
	        } else {
	            // Khách
	            senderId = UUID.randomUUID().toString();
	        }

	        // Prepare request to Rasa
	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_JSON);
	        if (jwt != null) {
	            headers.set("Authorization", jwt);
	        }
	        String rasaRequestBody = String.format("{\"sender\": \"%s\", \"message\": \"%s\"}", 
	                                              senderId, request.getMessage());
	        HttpEntity<String> rasaRequest = new HttpEntity<>(rasaRequestBody, headers);

	        // Send request to Rasa
	        Object[] rasaResponse = restTemplate.postForObject(RASA_URL, rasaRequest, Object[].class);

	        return ResponseEntity.ok(rasaResponse);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("Error communicating with Rasa: " + e.getMessage());
	    }
	}
}

