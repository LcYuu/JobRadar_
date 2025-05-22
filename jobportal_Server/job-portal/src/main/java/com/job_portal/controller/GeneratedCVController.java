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

import com.job_portal.DTO.CVDTO;
import com.job_portal.DTO.GeneratedCVDTO;
import com.job_portal.DTO.JobPostDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.CV;
import com.job_portal.models.GeneratedCV;
import com.job_portal.models.JobPost;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.GeneratedCVRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IGeneratedCVService;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/generated-cv")
public class GeneratedCVController {

	@Autowired
	GeneratedCVRepository generatedCVRepository;
	@Autowired
	UserAccountRepository userAccountRepository;
	@Autowired
	IGeneratedCVService generatedCVService;

	@GetMapping("/get-all")
	public ResponseEntity<List<GeneratedCV>> getCV() {
		List<GeneratedCV> cvs = generatedCVRepository.findAll();
		return new ResponseEntity<>(cvs, HttpStatus.OK);
	}

	@GetMapping("/get-gencv-by-id/{genCvId}")
	public ResponseEntity<GeneratedCV> getGenCVById(@PathVariable("genCvId") Integer genCvId) {
		Optional<GeneratedCV> cv = generatedCVRepository.findById(genCvId);

		if (cv.isPresent()) {
			return ResponseEntity.ok(cv.get());
		} else {
			return ResponseEntity.noContent().build();
		}
	}

	@PostMapping("/create-cv")
	public ResponseEntity<?> createCV(@RequestHeader("Authorization") String jwt,
			@RequestBody GeneratedCVDTO genCVdto) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);
			if (user.isEmpty()) {
				return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
			}
			GeneratedCV savedCV = generatedCVService.createGeneratedCV(genCVdto, user.get().getUserId());
			return ResponseEntity.ok(savedCV);
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to create CV: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

//	@GetMapping("/search-cv")
//	public ResponseEntity<Object> searchCV(@RequestHeader("Authorization") String jwt) {
//		String email = JwtProvider.getEmailFromJwtToken(jwt);
//		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
//		try {
//			List<GeneratedCV> cvs = generatedCVService.findGenCVBySeekerId(user.get().getUserId());
//			return ResponseEntity.ok(cvs);
//		} catch (AllExceptions e) {
//			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//		} catch (Exception e) {
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
//		}
//	}

	@DeleteMapping("/delete-cv/{genCvId}")
	public ResponseEntity<String> deleteCV(@PathVariable("genCvId") Integer genCvId) {
		try {
			boolean isDeleted = generatedCVService.deleteCV(genCvId);
			if (isDeleted) {
				return new ResponseEntity<>("Xóa CV thành công", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Xóa CV thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
		}
	}

	@PutMapping("/update-cv/{genCvId}")
	public ResponseEntity<String> updateCV(@PathVariable Integer genCvId, @RequestBody GeneratedCVDTO genCVdto) {
		boolean isUpdated = generatedCVService.updateGeneratedCV(genCvId, genCVdto);
		if (isUpdated) {
			return new ResponseEntity<>("Cập nhật thành công", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Cập nhật thất bại", HttpStatus.BAD_REQUEST);
		}
	}

}
