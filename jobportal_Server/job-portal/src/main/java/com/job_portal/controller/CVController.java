package com.job_portal.controller;

import java.io.File;
import java.nio.file.Files;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.DTO.CVDTO;
import com.job_portal.DTO.ImageDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.CV;
import com.job_portal.models.ImageCompany;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.CVRepository;
import com.job_portal.repository.ExperienceRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.ICVService;
import com.job_portal.service.IExperienceService;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/cv")
public class CVController {
	@Autowired
	CVRepository cvRepository;

	@Autowired
	ICVService cvService;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@GetMapping("/get-all")
	public ResponseEntity<List<CV>> getCV() {
		List<CV> cvs = cvRepository.findAll();
		return new ResponseEntity<>(cvs, HttpStatus.OK);
	}

	@GetMapping("/searchCV")
	public ResponseEntity<List<CV>> findCVBySeekerId(@RequestHeader("Authorization") String jwt) throws AllExceptions {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		List<CV> cvs = cvService.findCVBySeekerId(user.get().getUserId());
		return new ResponseEntity<List<CV>>(cvs, HttpStatus.CREATED);

	}

	@PostMapping("/create-cv")
	public ResponseEntity<String> createCV(@RequestHeader("Authorization") String jwt, @RequestBody CVDTO cvdto) {
	    try {
	        // Validate input data
	        if (cvdto.getPathCV() == null || cvdto.getPathCV().isEmpty()) {
	            return new ResponseEntity<>("Đường dẫn CV không được để trống", HttpStatus.BAD_REQUEST);
	        }

	        if (cvdto.getCvName() == null || cvdto.getCvName().isEmpty()) {
	            return new ResponseEntity<>("Tên CV không được để trống", HttpStatus.BAD_REQUEST);
	        }

	        // Kiểm tra kích thước file
	        File file = new File(cvdto.getPathCV());

	        long fileSizeInBytes = Files.size(file.toPath());
	        long fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Chuyển từ bytes sang MB
	        if (fileSizeInMB > 5) {
	            return new ResponseEntity<>("File CV phải có kích thước nhỏ hơn hoặc bằng 5MB", HttpStatus.BAD_REQUEST);
	        }

	        // Extract email from JWT
	        String email = JwtProvider.getEmailFromJwtToken(jwt);
	        Optional<UserAccount> user = userAccountRepository.findByEmail(email);

	        if (user.isEmpty()) {
	            return new ResponseEntity<>("Không tìm thấy thông tin người dùng", HttpStatus.NOT_FOUND);
	        }

	        boolean isCreated = cvService.createCV(cvdto, user.get().getUserId());

	        if (isCreated) {
	            return new ResponseEntity<>("Tạo CV thành công", HttpStatus.CREATED);
	        } else {
	            return new ResponseEntity<>("Tạo CV thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
	        }
	    } catch (Exception e) {
	        return new ResponseEntity<>("Lỗi hệ thống: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
	    }
	}

	@PostMapping("/cv-main/{cvId}")
	public ResponseEntity<String> updateIsMain(@RequestHeader("Authorization") String jwt,
			@PathVariable("cvId") Integer cvId) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		boolean isUpdated = cvService.updateIsMain(cvId, user.get().getUserId());
		if (isUpdated) {
			return new ResponseEntity<>("Đặt thành CV chính thành công", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Thất bại trong việc đặt thành CV chính", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/delete-cv/{cvId}")
	public ResponseEntity<String> deleteCV(@PathVariable("cvId") Integer cvId) {
		try {
			boolean isDeleted = cvService.deleteCV(cvId);
			if (isDeleted) {
				return new ResponseEntity<>("Xóa CV thành công", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Xóa CV thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
		}
	}

}
