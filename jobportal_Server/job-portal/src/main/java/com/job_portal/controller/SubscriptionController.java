package com.job_portal.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.config.JwtProvider;
import com.job_portal.models.Subscription;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.SubscriptionServiceImpl;
import com.job_portal.utils.EmailUtil;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/subscription")
public class SubscriptionController {

	@Autowired
	private EmailUtil emailUtil;

	@Autowired
	private SubscriptionServiceImpl subscriptionService;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@PostMapping("/create")
	public ResponseEntity<String> createSubscription(@RequestHeader("Authorization") String jwt,
			@RequestBody Subscription subscription) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		boolean success = subscriptionService.createSubscription(subscription, user.get().getUserId());
		return success ? ResponseEntity.ok("Đăng ký thành công!")
				: ResponseEntity.badRequest().body("Đăng ký thất bại!");
	}

	@DeleteMapping("/delete/{subId}")
	public ResponseEntity<String> deleteSubscription(@PathVariable UUID subId) {
		try {
			subscriptionService.deleteSubscription(subId);
			return ResponseEntity.ok("Hủy đăng ký thành công!");
		} catch (AllExceptions e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@GetMapping("/get-all")
	public ResponseEntity<List<Subscription>> getAllSubscriptions() {
		return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
	}

	@PostMapping("/send-emails")
	public ResponseEntity<String> checkAndSendEmails() {
		try {
			subscriptionService.checkAndSendEmails();
//    		emailUtil.testEmail("giathuanhl@gmail.com");
			return ResponseEntity.ok("Đã kiểm tra và gửi email nếu cần thiết!");
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Lỗi khi kiểm tra và gửi email: " + e.getMessage());
		}
	}

	@PutMapping("/update/{subId}")
	public ResponseEntity<?> updateSubscription(@PathVariable UUID subId, String email) {
		try {
			boolean isUpdated = subscriptionService.updateSubscription(email, subId);

			if (isUpdated) {
				return ResponseEntity.ok("Cập nhật thành công");
			} else {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không thể tìm thấy việc đăng ký");
			}
		} catch (AllExceptions e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Có lỗi xảy ra: " + e.getMessage());
		}
	}
	
	@GetMapping("/findBySeekerId")
	public Subscription findSubBySeekerId(@RequestHeader("Authorization") String jwt){
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		return subscriptionService.findSubBySeekerId(user.get().getUserId());
		
	}
}
