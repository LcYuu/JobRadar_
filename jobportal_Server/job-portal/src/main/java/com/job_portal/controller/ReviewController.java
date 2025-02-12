package com.job_portal.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.DTO.CountReviewByCompanyDTO;
import com.job_portal.DTO.CountReviewByStar;
import com.job_portal.DTO.JobPostDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.JobPost;
import com.job_portal.models.Review;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.ReviewRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IApplyJobService;
import com.job_portal.service.IJobPostService;
import com.job_portal.service.IReviewService;
import com.job_portal.specification.ReviewSpecification;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/review")
public class ReviewController {

	@Autowired
	ReviewRepository reviewRepository;

	@Autowired
	IReviewService reviewService;

	@Autowired
	SeekerRepository seekerRepository;

	@Autowired
	IApplyJobService applyJobService;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@GetMapping("/get-all")
	public ResponseEntity<Page<Review>> getAllReviews(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size, @RequestParam(required = false) UUID companyId,
			@RequestParam(required = false) Integer star) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
		Specification<Review> spec = ReviewSpecification.filterReviews(companyId, star);
		Page<Review> reviews = reviewRepository.findAll(spec, pageable);
		return ResponseEntity.ok(reviews);
	}

	@PostMapping("/create-review/{companyId}")
	public ResponseEntity<?> createReview(@RequestBody Review req, @PathVariable UUID companyId,
			@RequestHeader("Authorization") String jwt) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);
			Optional<Seeker> seeker = seekerRepository.findById(user.get().getUserId());

			Review review = new Review();
			review.setStar(req.getStar());
			review.setMessage(req.getMessage());
			review.setAnonymous(req.isAnonymous());
			review.setCreateDate(LocalDateTime.now());

			boolean isCreated = reviewService.createReview(seeker.get(), companyId, review);
			if (isCreated) {
				return new ResponseEntity<>("Đánh giá thành công", HttpStatus.CREATED);
			} else {
				return new ResponseEntity<>("Đánh giá thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (Exception e) {
			e.printStackTrace(); // In ra stack trace để debug
			return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/findReviewByCompanyId/{companyId}")
	public ResponseEntity<Object> searchReviewByCompanyId(@PathVariable("companyId") UUID companyId) {
		try {
			List<Review> reviews = reviewService.findReviewByCompanyId(companyId);
			return ResponseEntity.ok(reviews);
		} catch (AllExceptions e) {
			// Trả về thông báo từ service
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/findReviewByCompanyId")
	public ResponseEntity<Object> findReviewByCompanyId(
			@RequestHeader("Authorization") String jwt,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size, 
			@RequestParam(required = false) Integer star) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
		try {
			Specification<Review> spec = ReviewSpecification.filterReviews(user.get().getUserId(), star);
			Page<Review> reviews = reviewRepository.findAll(spec, pageable);
			return ResponseEntity.ok(reviews);
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/review-detail")
	public ResponseEntity<Object> findReviewByCompanyIdAndUserId(@RequestParam("companyId") UUID companyId,
			@RequestParam("userId") UUID userId) {
		try {
			Review review = reviewService.findReviewByCompanyIdAndUserId(companyId, userId);
			return ResponseEntity.ok(review);
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/countReviewByCompany")
	public ResponseEntity<CountReviewByCompanyDTO> countReviewByCompany(@RequestHeader("Authorization") String jwt)
			throws AllExceptions {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		CountReviewByCompanyDTO countReview = reviewRepository
				.countReviewsByCompany(user.get().getCompany().getCompanyId());
		return new ResponseEntity<>(countReview, HttpStatus.OK);

	}

	@DeleteMapping("/delete/{reviewId}")
	public ResponseEntity<?> deleteReview(@PathVariable UUID reviewId) {
		try {
			boolean isDeleted = reviewService.deleteReview(reviewId);
			if (isDeleted) {
				return new ResponseEntity<>("Xóa đánh giá thành công", HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Xóa đánh giá thất bại", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (AllExceptions e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
		} catch (Exception e) {
			return new ResponseEntity<>("Có lỗi xảy ra khi xóa đánh giá", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/count-by-star")
	public ResponseEntity<List<CountReviewByStar>> getReviewCounts(@RequestParam(required = false) UUID companyId) {
		List<CountReviewByStar> result = reviewService.countReviewsByStar(companyId);
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/count-star-by-company-id")
	public ResponseEntity<List<CountReviewByStar>> findReviewCount(@RequestHeader("Authorization") String jwt) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		List<CountReviewByStar> result = reviewService.countReviewsByStar(user.get().getCompany().getCompanyId());
		return ResponseEntity.ok(result);
	}

}
