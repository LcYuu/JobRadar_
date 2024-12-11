package com.job_portal.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.ApplicantProfileDTO;
import com.job_portal.DTO.FollowCompanyDTO;
import com.job_portal.DTO.FollowSeekerDTO;
import com.job_portal.DTO.SeekerDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.JobPost;
import com.job_portal.models.Notification;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.NotificationRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.INotificationService;
import com.job_portal.service.ISeekerService;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/seeker")
public class SeekerController {

	@Autowired
	private SeekerRepository seekerRepository;
	@Autowired
	ICompanyService companyService;
	@Autowired
	private ISeekerService seekerService;
	@Autowired
	private UserAccountRepository userAccountRepository;
	@Autowired
	private CompanyRepository companyRepository;
	@Autowired
	private INotificationService notificationService;
	@Autowired
	private NotificationRepository notificationRepository;


	@GetMapping("/get-all")
	public ResponseEntity<List<Seeker>> getSeeker() {
		List<Seeker> seekers = seekerRepository.findAll();
		return new ResponseEntity<>(seekers, HttpStatus.OK);
	}

	@GetMapping("/search-by-name")
	public ResponseEntity<Object> searchSeekersByName(@RequestParam("userName") String userName) {
		try {
			List<Seeker> seekers = seekerService.searchSeekerByName(userName);
			return ResponseEntity.ok(seekers);
		} catch (AllExceptions e) {
			// Trả về thông báo từ service
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/candidate-skills")
	public ResponseEntity<Seeker> getProfileCandidateById(@RequestParam("userId") UUID userId) throws AllExceptions {
		try {
			Seeker seeker = seekerService.findSeekerById(userId);
			return new ResponseEntity<>(seeker, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}

	@GetMapping("/seeker-profile")
	public ResponseEntity<Seeker> getSeekerById(@RequestHeader("Authorization") String jwt) throws AllExceptions {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);
			Seeker seeker = seekerService.findSeekerById(user.get().getUserId());
			return new ResponseEntity<>(seeker, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}

	@GetMapping("/search-by-industry")
	public ResponseEntity<Object> searchSeekersByIndustry(@RequestParam("industryName") String industryName) {
		try {
			List<Seeker> seekers = seekerService.searchSeekerByIndustry(industryName);
			return ResponseEntity.ok(seekers);
		} catch (AllExceptions e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@DeleteMapping("/delete-social/{socialName}")
	public ResponseEntity<String> deleteSocialLink(@RequestHeader("Authorization") String jwt,
			@PathVariable("socialName") String socialName) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		try {
			boolean isDeleted = seekerService.deleteSocialLink(user.get().getUserId(), socialName);
			if (isDeleted) {
				return ResponseEntity.ok("SocialLink deleted successfully.");
			} else {
				return ResponseEntity.status(404).body("SocialLink not found.");
			}
		} catch (AllExceptions e) {
			return ResponseEntity.status(400).body(e.getMessage());
		}
	}

	@PutMapping("/update-seeker")
	public ResponseEntity<String> updateSeeker(@RequestHeader("Authorization") String jwt,
			@RequestBody SeekerDTO seeker) throws AllExceptions, JsonProcessingException {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		boolean isUpdated = seekerService.updateSeeker(seeker, user.get().getSeeker().getUserId());
		if (isUpdated) {
			return new ResponseEntity<>("Cập nhật thông tin thành công", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Cập nhật thông tin thất bại", HttpStatus.BAD_REQUEST);
		}
	}

	@PutMapping("/follow/{companyId}")
	public ResponseEntity<Map<String, Object>> followCompany(@PathVariable("companyId") UUID companyId,
			@RequestHeader("Authorization") String jwt) throws Exception {

		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> reqUser = userAccountRepository.findByEmail(email);

		Map<String, Object> result = companyService.followCompany(companyId, reqUser.get().getUserId());

		return new ResponseEntity<>(result, HttpStatus.ACCEPTED);
	}

	@GetMapping("/followed-companies")
	public ResponseEntity<List<FollowCompanyDTO>> findCompaniesBySeekerId(@RequestHeader("Authorization") String jwt) {

		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		List<FollowCompanyDTO> companies = companyRepository
				.findCompaniesFollowedBySeeker(user.get().getSeeker().getUserId());
		return ResponseEntity.ok(companies);
	}

	@GetMapping("/profile-apply")
	public ResponseEntity<ApplicantProfileDTO> getCandidateDetails(@RequestParam UUID userId,
			@RequestParam UUID postId) {
		try {
			ApplicantProfileDTO profile = seekerRepository.findCandidateDetails(userId, postId);
			return ResponseEntity.ok(profile); 

		} catch (Exception e) {
			return ResponseEntity.status(500).body(null);
		}
	}

	@GetMapping("/{companyId}/followers")
	public List<FollowSeekerDTO> getSeekersFollowingCompany(@PathVariable UUID companyId) {
		return seekerRepository.findSeekersFollowingCompany(companyId);
	}

	@PatchMapping("/read/{notificationId}")

	public ResponseEntity<?> markNotificationAsRead(@PathVariable UUID notificationId) {
	    try {
	        boolean updated = notificationService.updateNotificationReadStatus(notificationId);
	        if (updated) {
	            return ResponseEntity.ok().build();
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	    } catch (Exception e) {
	        return ResponseEntity.internalServerError().build();
	    }
	}
	
	@GetMapping("/notifications/{userId}")
	public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable UUID userId) {
	    try {
	        List<Notification> notifications = notificationRepository.findNotificationByUserId(userId);
	        return ResponseEntity.ok()
	            .contentType(MediaType.APPLICATION_JSON)
	            .body(notifications);
	    } catch (Exception e) {
	        System.err.println("Error getting notifications: " + e.getMessage());
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .contentType(MediaType.APPLICATION_JSON)
	            .body(Collections.emptyList()); 
	    }
	}

	@GetMapping("/unread-count/{userId}")
	public ResponseEntity<Long> getUnreadNotificationCount(@PathVariable UUID userId) {
	    try {
	        long unreadCount = notificationService.countUnreadNotifications(userId);
	        return ResponseEntity.ok()
	            .contentType(MediaType.APPLICATION_JSON)
	            .body(unreadCount);
	    } catch (Exception e) {
	        System.err.println("Error getting unread count: " + e.getMessage());
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .contentType(MediaType.APPLICATION_JSON)
	            .body(0L);
	    }
	}
}
