package com.job_portal.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.job_portal.DTO.ApplyJobDTO;
import com.job_portal.DTO.ApplyJobEmployerDTO;
import com.job_portal.DTO.ApplyJobInProfile;
import com.job_portal.DTO.CompanyWithCountJobDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.ApplyJob;

import com.job_portal.models.UserAccount;
import com.job_portal.repository.ApplyJobRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IApplyJobService;
import com.job_portal.service.INotificationService;
import com.job_portal.service.WebSocketService;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/apply-job")
public class ApplyJobController {
	@Autowired
	ApplyJobRepository applyJobRepository;
	@Autowired
	IApplyJobService applyJobService;
	@Autowired
	UserAccountRepository userAccountRepository;
	@Autowired
	INotificationService notificationService;

	@Autowired
    private WebSocketService webSocketService;

	@PostMapping("/create-apply/{postId}")
	public ResponseEntity<String> createApply(@RequestBody ApplyJobDTO applyDTO,
			@RequestHeader("Authorization") String jwt, @PathVariable("postId") UUID postId) throws AllExceptions {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		ApplyJob apply = convertToEntity(applyDTO, user.get().getUserId(), postId);
		boolean isCreated = applyJobService.createApplyJob(apply);
		if (isCreated) {
			webSocketService.sendUpdate("/topic/apply-updates", "ADD APPLY");
			return new ResponseEntity<>("Nộp đơn thành công", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Nộp đơn thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/checkApply/{postId}")
	public ResponseEntity<Boolean> checkIfApplied(@PathVariable("postId") UUID postId,
			@RequestHeader("Authorization") String jwt) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		boolean hasApplied = applyJobService.hasApplied(postId, user.get().getSeeker().getUserId());
		return ResponseEntity.ok(hasApplied);
	}

	@GetMapping("/candidate-apply/{userId}/{postId}")
	public ResponseEntity<ApplyJobDTO> getCandidateApplyInfo(@PathVariable("userId") UUID userId,
			@PathVariable("postId") UUID postId) {

		Optional<ApplyJob> applyJob = applyJobRepository.findByPostIdAndUserId(postId, userId);

		if (applyJob.isPresent()) {
			ApplyJobDTO applyJobDTO = new ApplyJobDTO();
			applyJobDTO.setEmail(applyJob.get().getEmail());
			applyJobDTO.setDescription(applyJob.get().getDescription());
			return ResponseEntity.ok(applyJobDTO);
		}

		return ResponseEntity.notFound().build();
	}

	@GetMapping("/find/{postId}")
	public ResponseEntity<Optional<ApplyJob>> findApplyJobById(@PathVariable("postId") UUID postId,
			@RequestHeader("Authorization") String jwt) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		Optional<ApplyJob> apply = applyJobRepository.findByPostIdAndUserId(postId, user.get().getSeeker().getUserId());
		return ResponseEntity.ok(apply);
	}

	@PostMapping("/setApprove/{postId}/{userId}")
	public ResponseEntity<String> updateApprove(@RequestHeader("Authorization") String jwt,
			@PathVariable("postId") UUID postId, @PathVariable("userId") UUID userId) throws AllExceptions {

		// Lấy email từ JWT token
		String email = JwtProvider.getEmailFromJwtToken(jwt);

		// Tìm kiếm người dùng theo email
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);

		UserAccount user = userOptional.get();

		// Kiểm tra quyền của người dùng
		if (user.getUserType().getUserTypeId() != 3) { // Chỉ cho phép người dùng có quyền ID = 3
			return new ResponseEntity<>("User does not have permission to approve", HttpStatus.FORBIDDEN);
		}

		Optional<ApplyJob> applyOptional = applyJobRepository.findByPostIdAndUserId(postId, userId);
		System.out.print(applyOptional);
		// Kiểm tra nếu đơn ứng tuyển không tồn tại
		if (applyOptional.isEmpty()) {
			return new ResponseEntity<>("Apply job not found", HttpStatus.NOT_FOUND);
		}
		try {
			ApplyJob existingApply = applyOptional.get();
			// Cập nhật trạng thái đơn ứng tuyển
			existingApply.setSave(true);
			applyJobRepository.save(existingApply);
			webSocketService.sendUpdate("/topic/apply-updates", "APPROVE APPLY");
			return new ResponseEntity<>("Approve successfully", HttpStatus.OK);
		} catch (Exception e) {
			// Ghi log lỗi nếu cần thiết
			return new ResponseEntity<>("Approve failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PutMapping("/update-apply/{postId}")
	public ResponseEntity<String> updateApply(@RequestBody ApplyJobDTO applyDTO,
			@RequestHeader("Authorization") String jwt, @PathVariable("postId") UUID postId) throws AllExceptions {

		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		ApplyJob apply = convertToEntity(applyDTO, user.get().getUserId(), postId);
		boolean isCreated = applyJobService.updateApplyJob(apply);
		if (isCreated) {
			webSocketService.sendUpdate("/topic/apply-updates", "UPDATE APPLY");
			return new ResponseEntity<>("Update successfully.", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Failed to update.", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/get-all")
	public ResponseEntity<List<ApplyJob>> getApply() {
		List<ApplyJob> apply = applyJobRepository.findAll();
		return new ResponseEntity<>(apply, HttpStatus.OK);
	}

	@GetMapping("/get-apply-job-by-user")
	public Page<ApplyJobInProfile> findApplyJobByUserId(@RequestHeader("Authorization") String jwt,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "3") int size) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		Pageable pageable = PageRequest.of(page, size);
		return applyJobRepository.findApplyJobByUserId(user.get().getSeeker().getUserId(), pageable);
	}

	@GetMapping("/get-apply-job-by-company")
	public Page<ApplyJobEmployerDTO> findApplyJobByCompanyId(@RequestHeader("Authorization") String jwt,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size,
			@RequestParam(required = false) String fullName, // Thêm search theo fullName
			@RequestParam(required = false) Boolean isSave, // Thêm filter theo isSave
			@RequestParam(required = false) String title, // Thêm filter theo title
			@RequestParam(defaultValue = "applyDate") String sortBy, // Thêm sắp xếp theo trường
			@RequestParam(defaultValue = "desc") String sortDirection // Thêm hướng sắp xếp
	) {
		// Lấy email từ JWT
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		if (user.isEmpty() || user.get().getCompany() == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy công ty của người dùng");
		}

		UUID companyId = user.get().getCompany().getCompanyId();

		// Tạo hướng sắp xếp từ tham số
		Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
		
		// Tạo phương thức sắp xếp dựa trên trường và hướng
		Sort sort;
		
		// Xử lý sắp xếp tùy chỉnh
		switch (sortBy.toLowerCase()) {
			case "matchingscore":
				// Sắp xếp theo điểm tương đồng
				sort = Sort.by(direction, "matchingScore").and(Sort.by(Sort.Direction.DESC, "applyDate"));
				break;
			case "applydate":
				// Sắp xếp theo ngày nộp đơn
				sort = Sort.by(direction, "applyDate");
				break;
			case "fullname":
				// Sắp xếp theo tên
				sort = Sort.by(direction, "fullName");
				break;
			case "title":
				// Sắp xếp theo vị trí công việc
				sort = Sort.by(direction, "title");
				break;
			default:
				// Mặc định sắp xếp theo ngày nộp đơn
				sort = Sort.by(Sort.Direction.DESC, "applyDate");
				break;
		}

		// Tạo pageable với sắp xếp đã chọn
		Pageable pageable = PageRequest.of(page, size, sort);

		// Gọi repository với các tham số lọc
		return applyJobRepository.findApplyJobsWithFilters(companyId, fullName, isSave, title, pageable);
	}

	@PostMapping("/viewApply/{userId}/{postId}")
	public ResponseEntity<Void> viewApplyJob(@RequestHeader("Authorization") String jwt, @PathVariable UUID userId,
	                                         @PathVariable UUID postId) {
	    try {
	        // Lấy email từ JWT
	        String email = JwtProvider.getEmailFromJwtToken(jwt);
	        Optional<UserAccount> user = userAccountRepository.findByEmail(email);

	        if (user.isEmpty()) {
	            System.out.println("User not found with email: " + email);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	        }

	        // Lấy thông tin ApplyJob
	        Optional<ApplyJob> apply = applyJobRepository.findByPostIdAndUserId(postId, userId);

	        if (apply.isPresent()) {
	            ApplyJob applyJob = apply.get();
	            // Nếu chưa xem, đánh dấu là đã xem
	            if (!applyJob.isViewed()) {
	                applyJob.setViewed(true);
	                applyJobRepository.save(applyJob);
	                notificationService.notifyApplicationReviewed(userId, postId, user.get().getCompany().getCompanyId());
	                System.out.println("Notification sent for userId: " + userId + ", postId: " + postId);
	            } else {
	                System.out.println("Already viewed, no notification sent.");
	            }
	        } else {
	            System.out.println("Apply job not found for userId: " + userId + ", postId: " + postId);
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	        }

	        return ResponseEntity.ok().build();
	    } catch (Exception e) {
	        System.err.println("Error occurred while processing viewApplyJob: " + e.getMessage());
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}


	@PostMapping("/update-matching-score")
	public ResponseEntity<?> updateMatchingScore(@RequestBody Map<String, Object> payload) {
		try {
			System.out.println("Received payload: " + payload);
			
			String postId = String.valueOf(payload.get("postId"));
			String userId = String.valueOf(payload.get("userId"));
			Double matchingScore = ((Number) payload.get("matchingScore")).doubleValue();

			System.out.println("Extracted data - postId: " + postId + ", userId: " + userId + ", score: " + matchingScore);

			// Validate UUIDs
			if (postId == null || userId == null || postId.equals("null") || userId.equals("null")) {
				return ResponseEntity.badRequest().body("Invalid postId or userId");
			}

			try {
				// Chuyển đổi String ID thành UUID
				UUID postUuid = UUID.fromString(postId);
				UUID userUuid = UUID.fromString(userId);

				// Gọi service để cập nhật điểm
				applyJobService.updateMatchingScore(postUuid, userUuid, matchingScore);
				
				System.out.println("Successfully updated matching score");
				return ResponseEntity.ok().build();
			} catch (IllegalArgumentException e) {
				System.err.println("Invalid UUID format: " + e.getMessage());
				return ResponseEntity.badRequest().body("Invalid UUID format: " + e.getMessage());
			}
		} catch (Exception e) {
			System.err.println("Error updating matching score: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error updating matching score: " + e.getMessage());
		}
	}

	@GetMapping("/get-matching-scores")
	public ResponseEntity<?> getMatchingScores() {
		try {
			List<Map<String, Object>> results = applyJobRepository.findAllWithMatchingScore();
			System.out.println("Retrieved " + results.size() + " entries with matching scores");
			return ResponseEntity.ok(results);
		} catch (Exception e) {
			System.err.println("Error retrieving matching scores: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error retrieving matching scores: " + e.getMessage());
		}
	}

	@PostMapping("/update-full-analysis")
	public ResponseEntity<?> updateFullAnalysis(@RequestBody Map<String, Object> payload) {
		try {
			System.out.println("Received full analysis payload");
			
			String postId = String.valueOf(payload.get("postId"));
			String userId = String.valueOf(payload.get("userId"));
			Double matchingScore = ((Number) payload.get("matchingScore")).doubleValue();
			String analysisResult = (String) payload.get("analysisResult");

			System.out.println("Extracted data - postId: " + postId + ", userId: " + userId + ", score: " + matchingScore);

			// Validate UUIDs
			if (postId == null || userId == null || postId.equals("null") || userId.equals("null")) {
				return ResponseEntity.badRequest().body("Invalid postId or userId");
			}

			// Validate analysis result
			if (analysisResult == null || analysisResult.isEmpty()) {
				return ResponseEntity.badRequest().body("Analysis result cannot be empty");
			}

			try {
				// Chuyển đổi String ID thành UUID
				UUID postUuid = UUID.fromString(postId);
				UUID userUuid = UUID.fromString(userId);

				// Gọi service để cập nhật điểm và kết quả phân tích
				applyJobService.updateFullAnalysisResult(postUuid, userUuid, matchingScore, analysisResult);
				
				System.out.println("Successfully updated full analysis");
				return ResponseEntity.ok().build();
			} catch (IllegalArgumentException e) {
				System.err.println("Invalid UUID format: " + e.getMessage());
				return ResponseEntity.badRequest().body("Invalid UUID format: " + e.getMessage());
			}
		} catch (Exception e) {
			System.err.println("Error updating full analysis: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error updating full analysis: " + e.getMessage());
		}
	}

	@GetMapping("/get-analysis-result/{postId}/{userId}")
	public ResponseEntity<?> getAnalysisResult(@PathVariable String postId, @PathVariable String userId) {
		try {
			System.out.println("Getting analysis result for postId: " + postId + ", userId: " + userId);
			
			// Validate UUIDs
			if (postId == null || userId == null || postId.isEmpty() || userId.isEmpty()) {
				return ResponseEntity.badRequest().body("Invalid postId or userId");
			}

			try {
				// Chuyển đổi String ID thành UUID
				UUID postUuid = UUID.fromString(postId);
				UUID userUuid = UUID.fromString(userId);

				// Gọi service để lấy kết quả phân tích
				String analysisResult = applyJobService.getAnalysisResult(postUuid, userUuid);
				
				if (analysisResult == null || analysisResult.isEmpty()) {
					return ResponseEntity.ok().body(null);
				}
				
				System.out.println("Successfully retrieved analysis result");
				
				// Sử dụng org.springframework.http.MediaType để đảm bảo trả về dữ liệu dạng JSON
				// thay vì chuỗi văn bản
				return ResponseEntity
					.ok()
					.contentType(org.springframework.http.MediaType.APPLICATION_JSON)
					.body(analysisResult);
			} catch (IllegalArgumentException e) {
				System.err.println("Invalid UUID format: " + e.getMessage());
				return ResponseEntity.badRequest().body("Invalid UUID format: " + e.getMessage());
			}
		} catch (Exception e) {
			System.err.println("Error retrieving analysis result: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error retrieving analysis result: " + e.getMessage());
		}
	}

	@GetMapping("/get-matching-scores-with-details")
	public ResponseEntity<?> getMatchingScoresWithDetails() {
		try {
			List<Map<String, Object>> results = applyJobRepository.findAllWithMatchingScoreAndAnalysis();
			System.out.println("Retrieved " + results.size() + " entries with matching scores and analysis details");
			return ResponseEntity.ok(results);
		} catch (Exception e) {
			System.err.println("Error retrieving matching scores with details: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error retrieving matching scores with details: " + e.getMessage());
		}
	}

	private ApplyJob convertToEntity(ApplyJobDTO applyDTO, UUID userId, UUID postId) {
		ApplyJob apply = new ApplyJob();
		apply.setPostId(postId);
		apply.setUserId(userId);
		apply.setPathCV(applyDTO.getPathCV());
		apply.setApplyDate(LocalDateTime.now());
		apply.setFullName(applyDTO.getFullName());
		apply.setDescription(applyDTO.getDescription());
		apply.setEmail(applyDTO.getEmail());
		apply.setSave(false);
		apply.setViewed(false);
		return apply;
	}

}
