package com.job_portal.controller;

import java.time.LocalDateTime;
import java.util.List;
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

	@PostMapping("/create-apply/{postId}")
	public ResponseEntity<String> createApply(@RequestBody ApplyJobDTO applyDTO,
			@RequestHeader("Authorization") String jwt, @PathVariable("postId") UUID postId) throws AllExceptions {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		ApplyJob apply = convertToEntity(applyDTO, user.get().getUserId(), postId);
		boolean isCreated = applyJobService.createApplyJob(apply);
		if (isCreated) {
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

		ApplyJob existingApply = applyOptional.get();

		// Cập nhật trạng thái đơn ứng tuyển
		existingApply.setSave(true);

		try {
			applyJobRepository.save(existingApply);
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
			@RequestParam(required = false) String title // Thêm filter theo title
	) {
		// Lấy email từ JWT
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		if (user.isEmpty() || user.get().getCompany() == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy công ty của người dùng");
		}

		UUID companyId = user.get().getCompany().getCompanyId();

		// Tạo pageable với sắp xếp mặc định
		Pageable pageable = PageRequest.of(page, size, Sort.by("applyDate").descending());

		// Gọi repository với các tham số lọc
		return applyJobRepository.findApplyJobsWithFilters(companyId, fullName, isSave, title, pageable);
	}

	@PostMapping("/viewApply/{userId}/{postId}")
	public ResponseEntity<Void> viewApplyJob(@RequestHeader("Authorization") String jwt, @PathVariable UUID userId,
			@PathVariable UUID postId) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		if (user.isPresent()) {
		    Optional<ApplyJob> apply = applyJobRepository.findByPostIdAndUserId(postId, userId);

		    if (apply.isPresent()) {
		        // In ra nguyên ApplyJob
		        System.out.println("ApplyJob: " + apply.get().toString());

		        if (!apply.get().isViewed()) {
		            apply.get().setViewed(true);
		            applyJobRepository.save(apply.get());
		            notificationService.notifyApplicationReviewed(userId, postId, user.get().getCompany().getCompanyId());
		            System.out.println("Notification sent");
		        } else {
		            System.out.println("Already viewed, no notification sent.");
		        }
		    } else {
		        System.out.println("Apply job not found.");
		    }

		    return ResponseEntity.ok().build();
		} else {
		    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
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
