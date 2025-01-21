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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.config.JwtProvider;
import com.job_portal.models.SocialLink;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.SocialLinkRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.ISocialLinkService;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/socialLink")
public class SocialLinkController {

	@Autowired
	private ISocialLinkService socialLinkService;
	@Autowired
	private SocialLinkRepository socialLinkRepository;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@GetMapping("/social-platforms")
	public ResponseEntity<List<String>> getAllSocialPlatforms() {
		List<String> platformNames = socialLinkService.getAllPlatformNames();
		return ResponseEntity.ok(platformNames);
	}

	@PostMapping("/create-socialLink")
	public ResponseEntity<String> createSocialLink(@RequestHeader("Authorization") String jwt,
			@RequestBody SocialLink socialLink) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		boolean isCreated = socialLinkService.createSocialLink(socialLink, user.get().getUserId());
		if (isCreated) {
			return new ResponseEntity<>("Thêm thành công", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Thêm thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PutMapping("/update-socialLink/{id}")
	public ResponseEntity<String> updateSocialLink(@RequestHeader("Authorization") String jwt,
			@RequestBody SocialLink socialLink, @PathVariable("id") Long id) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		try {
			boolean isUpdated = socialLinkService.updateSocialLink(socialLink, id, user.get().getUserId());
			if (isUpdated) {
				return new ResponseEntity<>("Cập nhật thành công", HttpStatus.CREATED);
			} else {
				return new ResponseEntity<>("Cập nhật thất bại", HttpStatus.BAD_REQUEST);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@DeleteMapping("/delete-socialLink/{id}")
	public ResponseEntity<String> deleteSocialLink(@PathVariable("id") Long id) {
		try {
			boolean isDeleted = socialLinkService.deleteSocialLink(id);
			if (isDeleted) {
				return new ResponseEntity<>("Xóa thành công", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Xóa thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
		}
	}

	@GetMapping("/get-socialLink-by-userId")
	public ResponseEntity<Object> getSocialLinkByUserId(@RequestHeader("Authorization") String jwt) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
	Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		try {
			List<SocialLink> socialLinks = socialLinkService.getSocialLinksByUserId(user.get().getUserId());
			return ResponseEntity.ok(socialLinks);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}
	
	@GetMapping("/	")
	public ResponseEntity<Object> getSocialLinkByUserId(@RequestParam("userId") UUID userId) {
		try {
			List<SocialLink> socialLinks = socialLinkService.getSocialLinksByUserId(userId);
			return ResponseEntity.ok(socialLinks);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

}
