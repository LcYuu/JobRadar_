package com.job_portal.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.ArrayList;

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
import org.springframework.web.bind.annotation.PutMapping;

import com.job_portal.DTO.CountReviewByCompanyDTO;
import com.job_portal.DTO.ReviewReactionDTO;
import com.job_portal.DTO.ReviewReplyDTO;
import com.job_portal.DTO.CountReviewByStar;
import com.job_portal.DTO.JobPostDTO;
import com.job_portal.DTO.ReviewDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.JobPost;
import com.job_portal.models.Review;
import com.job_portal.models.ReviewReaction;
import com.job_portal.models.ReviewReply;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.ReviewReactionRepository;
import com.job_portal.repository.ReviewReplyRepository;
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
	ReviewReplyRepository reviewReplyRepository;
	
	@Autowired
	ReviewReactionRepository reviewReactionRepository;

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
	public ResponseEntity<?> deleteReview(@PathVariable UUID reviewId, @RequestHeader("Authorization") String jwt) {
	    try {
	        String email = JwtProvider.getEmailFromJwtToken(jwt);
	        Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
	        if (!userOpt.isPresent()) {
	            return new ResponseEntity<>("Người dùng không tồn tại", HttpStatus.UNAUTHORIZED);
	        }
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
	
	// ----- Endpoints cho reply (phản hồi) và reaction (cảm xúc) -----
	
	/**
	 * Tạo một phản hồi cho một đánh giá hoặc một phản hồi khác
	 */
	@PostMapping("/create-reply")
	public ResponseEntity<?> createReply(@RequestBody ReviewReplyDTO replyDTO, 
			@RequestHeader("Authorization") String jwt) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);
			
			// Kiểm tra xem đánh giá có tồn tại không
			Optional<Review> reviewOpt = reviewRepository.findById(replyDTO.getReviewId());
			if (!reviewOpt.isPresent()) {
				return new ResponseEntity<>("Đánh giá không tồn tại", HttpStatus.NOT_FOUND);
			}
			
			Review review = reviewOpt.get();
			
			// Tạo đối tượng phản hồi mới
			ReviewReply reply = new ReviewReply();
			reply.setReview(review);
			reply.setUser(user.get());
			reply.setContent(replyDTO.getContent());
			reply.setAnonymous(replyDTO.isAnonymous());
			reply.setCreateDate(LocalDateTime.now());
			
			// Xử lý phản hồi lồng nhau
			if (replyDTO.getParentReplyId() != null) {
				Optional<ReviewReply> parentReplyOpt = reviewReplyRepository.findById(replyDTO.getParentReplyId());
				if (parentReplyOpt.isPresent()) {
					reply.setParentReply(parentReplyOpt.get());
					
					// Lưu thông tin người dùng được phản hồi
					replyDTO.setParentUserId(parentReplyOpt.get().getUser().getUserId());
					replyDTO.setParentUserName(parentReplyOpt.get().isAnonymous() ? 
							"Người dùng ẩn danh" : parentReplyOpt.get().getUser().getUserName());
				} else {
					return new ResponseEntity<>("Phản hồi cha không tồn tại", HttpStatus.NOT_FOUND);
				}
			}
			
			// Lưu phản hồi vào cơ sở dữ liệu
			ReviewReply savedReply = reviewReplyRepository.save(reply);
			
			// Trả về dữ liệu đã lưu
			replyDTO.setReplyId(savedReply.getReplyId());
			replyDTO.setCreateDate(savedReply.getCreateDate());
			replyDTO.setUserName(savedReply.isAnonymous() ? "Người dùng ẩn danh" : user.get().getUserName());
			replyDTO.setUserAvatar(user.get().getAvatar());
			replyDTO.setUserId(user.get().getUserId()); // Thêm userId để frontend xác định quyền xóa/sửa
			
			return new ResponseEntity<>(replyDTO, HttpStatus.CREATED);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("Có lỗi xảy ra khi tạo phản hồi: " + e.getMessage(), 
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Lấy tất cả phản hồi cho một đánh giá theo cấu trúc phân cấp
	 */
	@GetMapping("/get-replies/{reviewId}")
	public ResponseEntity<?> getRepliesByReviewId(@PathVariable UUID reviewId) {
		try {
			// Kiểm tra xem đánh giá có tồn tại không
			if (!reviewRepository.existsById(reviewId)) {
				return new ResponseEntity<>("Đánh giá không tồn tại", HttpStatus.NOT_FOUND);
			}
			
			// Lấy tất cả phản hồi theo reviewId
			List<ReviewReply> allReplies = reviewReplyRepository.findByReviewReviewIdOrderByCreateDateAsc(reviewId);
			
			// Xây dựng cấu trúc phân cấp - đầu tiên chỉ lấy các phản hồi gốc (không có cha)
			List<ReviewReplyDTO> topLevelReplies = allReplies.stream()
					.filter(reply -> reply.getParentReply() == null)
					.map(reply -> convertToDTO(reply, allReplies, 0))
					.toList();
			
			return ResponseEntity.ok(topLevelReplies);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("Có lỗi xảy ra khi lấy phản hồi: " + e.getMessage(), 
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Helper method to convert a ReviewReply to DTO with nested structure
	 */
	private ReviewReplyDTO convertToDTO(ReviewReply reply, List<ReviewReply> allReplies, int level) {
		ReviewReplyDTO dto = new ReviewReplyDTO();
		dto.setReplyId(reply.getReplyId());
		dto.setReviewId(reply.getReview().getReviewId());
		dto.setContent(reply.getContent());
		dto.setAnonymous(reply.isAnonymous());
		dto.setCreateDate(reply.getCreateDate());
		dto.setUserId(reply.getUser().getUserId()); // Luôn trả về userId bất kể ẩn danh hay không
		dto.setLevel(level); // Set the level in the comment hierarchy
		
		// Ẩn thông tin người dùng nếu ẩn danh
		if (reply.isAnonymous()) {
			dto.setUserName("Người dùng ẩn danh");
			dto.setUserAvatar(null); // Hoặc có thể đặt avatar mặc định
		} else {
			dto.setUserName(reply.getUser().getUserName());
			dto.setUserAvatar(reply.getUser().getAvatar());
		}
		
		// Set parent info if applicable
		if (reply.getParentReply() != null) {
			dto.setParentReplyId(reply.getParentReply().getReplyId());
			
			UserAccount parentUser = reply.getParentReply().getUser();
			dto.setParentUserId(parentUser.getUserId());
			
			if (reply.getParentReply().isAnonymous()) {
				dto.setParentUserName("Người dùng ẩn danh");
			} else {
				dto.setParentUserName(parentUser.getUserName());
			}
		}
		
		// Recursively add child replies (limit to 2 levels deep to prevent excessive nesting)
		if (level < 2) {
			List<ReviewReplyDTO> childDTOs = allReplies.stream()
					.filter(childReply -> childReply.getParentReply() != null 
							&& childReply.getParentReply().getReplyId().equals(reply.getReplyId()))
					.map(childReply -> convertToDTO(childReply, allReplies, level + 1))
					.toList();
			
			dto.setChildReplies(new ArrayList<>(childDTOs));
		}
		
		return dto;
	}
	
	/**
	 * Xóa một phản hồi
	 */
	@DeleteMapping("/delete-reply/{replyId}")
	public ResponseEntity<?> deleteReply(@PathVariable UUID replyId, @RequestHeader("Authorization") String jwt) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
			if (!userOpt.isPresent()) {
				return new ResponseEntity<>("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
			}
			
			UserAccount user = userOpt.get();
			Optional<ReviewReply> replyOpt = reviewReplyRepository.findById(replyId);
			if (!replyOpt.isPresent()) {
				return new ResponseEntity<>("Không tìm thấy phản hồi", HttpStatus.NOT_FOUND);
			}
			
			ReviewReply reply = replyOpt.get();
			
			// Kiểm tra xem người dùng có quyền xóa phản hồi này không
			if (!reply.getUser().getUserId().equals(user.getUserId())) {
				return new ResponseEntity<>("Bạn không có quyền xóa phản hồi này", HttpStatus.FORBIDDEN);
			}
			
			reviewReplyRepository.delete(reply);
			return new ResponseEntity<>(true, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("Lỗi khi xóa phản hồi: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Thêm hoặc cập nhật reaction (thích/không thích) cho một đánh giá
	 */
	@PostMapping("/react")
	public ResponseEntity<?> reactToReview(@RequestBody ReviewReactionDTO reactionDTO, 
			@RequestHeader("Authorization") String jwt) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> user = userAccountRepository.findByEmail(email);
			
			// Kiểm tra xem đánh giá có tồn tại không
			Optional<Review> reviewOpt = reviewRepository.findById(reactionDTO.getReviewId());
			if (!reviewOpt.isPresent()) {
				return new ResponseEntity<>("Đánh giá không tồn tại", HttpStatus.NOT_FOUND);
			}
			
			Review review = reviewOpt.get();
			
			// Kiểm tra xem người dùng đã reaction trước đó chưa
			Optional<ReviewReaction> existingReaction = reviewReactionRepository
					.findByReviewReviewIdAndUserUserId(reactionDTO.getReviewId(), user.get().getUserId());
			
			if (reactionDTO.getReactionType() == null) {
				// Nếu reaction type là null, xóa reaction (nếu có)
				if (existingReaction.isPresent()) {
					reviewReactionRepository.delete(existingReaction.get());
				}
			} else {
				// Nếu đã có reaction, cập nhật
				if (existingReaction.isPresent()) {
					ReviewReaction reaction = existingReaction.get();
					reaction.setReactionType(reactionDTO.getReactionType());
					reviewReactionRepository.save(reaction);
				} else {
					// Nếu chưa có, tạo mới
					ReviewReaction reaction = new ReviewReaction();
					reaction.setReview(review);
					reaction.setUser(user.get());
					reaction.setReactionType(reactionDTO.getReactionType());
					reviewReactionRepository.save(reaction);
				}
			}
			
			// Đếm số lượng likes và dislikes
			long likeCount = reviewReactionRepository.countByReviewReviewIdAndReactionType(
					reactionDTO.getReviewId(), "LIKE");
			long dislikeCount = reviewReactionRepository.countByReviewReviewIdAndReactionType(
					reactionDTO.getReviewId(), "DISLIKE");
			
			// Trả về thông tin cập nhật
			ReviewReactionDTO responseDTO = new ReviewReactionDTO();
			responseDTO.setReviewId(reactionDTO.getReviewId());
			responseDTO.setLikeCount(likeCount);
			responseDTO.setDislikeCount(dislikeCount);
			responseDTO.setReactionType(reactionDTO.getReactionType());
			
			return ResponseEntity.ok(responseDTO);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("Có lỗi xảy ra khi thực hiện reaction: " + e.getMessage(), 
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Lấy thông tin về reactions (thích/không thích) cho các đánh giá
	 */
	@GetMapping("/get-reactions")
	public ResponseEntity<?> getReactions(@RequestParam String reviewIds,
			@RequestHeader(value = "Authorization", required = false) String jwt) {
		try {
			UUID userId = null;
			
			// Lấy thông tin người dùng nếu đã đăng nhập
			if (jwt != null && !jwt.isEmpty() && !jwt.equals("null")) {
				String email = JwtProvider.getEmailFromJwtToken(jwt);
				Optional<UserAccount> user = userAccountRepository.findByEmail(email);
				if (user.isPresent()) {
					userId = user.get().getUserId();
				}
			}
			
			// Chuyển đổi chuỗi reviewIds thành mảng UUID
			String[] reviewIdStrings = reviewIds.split(",");
			List<ReviewReactionDTO> reactions = new java.util.ArrayList<>();
			
			for (String reviewIdString : reviewIdStrings) {
				try {
					UUID reviewId = UUID.fromString(reviewIdString.trim());
					
					// Đếm số lượng likes và dislikes
					long likeCount = reviewReactionRepository.countByReviewReviewIdAndReactionType(
							reviewId, "LIKE");
					long dislikeCount = reviewReactionRepository.countByReviewReviewIdAndReactionType(
							reviewId, "DISLIKE");
					
					ReviewReactionDTO reactionDTO = new ReviewReactionDTO();
					reactionDTO.setReviewId(reviewId);
					reactionDTO.setLikeCount(likeCount);
					reactionDTO.setDislikeCount(dislikeCount);
					
					// Nếu người dùng đã đăng nhập, kiểm tra reaction của họ
					if (userId != null) {
						Optional<ReviewReaction> userReaction = reviewReactionRepository
								.findByReviewReviewIdAndUserUserId(reviewId, userId);
						if (userReaction.isPresent()) {
							reactionDTO.setUserReaction(userReaction.get().getReactionType());
						}
					}
					
					reactions.add(reactionDTO);
				} catch (IllegalArgumentException e) {
					// Bỏ qua ID không hợp lệ
				}
			}
			
			return ResponseEntity.ok(reactions);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("Có lỗi xảy ra khi lấy thông tin reactions: " + e.getMessage(), 
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Cập nhật một review
	 */
	@PutMapping("/update-review/{reviewId}")
	public ResponseEntity<?> updateReview(@PathVariable UUID reviewId, 
	                                      @RequestBody ReviewDTO reviewDTO,
	                                      @RequestHeader("Authorization") String jwt) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<Seeker> seekerOpt = seekerRepository.findByUserAccountEmail(email);
			if (seekerOpt.isEmpty()) {
				return new ResponseEntity<>("Seeker không tồn tại", HttpStatus.NOT_FOUND);
			}
			
			Seeker seeker = seekerOpt.get();
			Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
			if (reviewOpt.isEmpty()) {
				return new ResponseEntity<>("Đánh giá không tồn tại", HttpStatus.NOT_FOUND);
			}
			
			Review review = reviewOpt.get();
			
			// Kiểm tra xem người dùng có phải là chủ sở hữu của đánh giá này không
			if (!review.getSeeker().getUserId().equals(seeker.getUserId())) {
				return new ResponseEntity<>("Bạn không có quyền chỉnh sửa đánh giá này", HttpStatus.FORBIDDEN);
			}
			
			// Cập nhật thông tin review
			review.setStar(reviewDTO.getStar());
			review.setMessage(reviewDTO.getMessage());
			review.setAnonymous(reviewDTO.isAnonymous());
			// Lưu lại thời gian tạo ban đầu, thay vì cập nhật
			
			reviewRepository.save(review);
			
			return new ResponseEntity<>(review, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("Lỗi khi cập nhật đánh giá: " + e.getMessage(), 
			                            HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	/**
	 * Cập nhật phản hồi
	 */
	@PutMapping("/update-reply/{replyId}")
	public ResponseEntity<?> updateReply(@PathVariable UUID replyId, 
	                                   @RequestBody ReviewReplyDTO replyDTO,
	                                   @RequestHeader("Authorization") String jwt) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
			if (!userOpt.isPresent()) {
				return new ResponseEntity<>("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
			}
			
			UserAccount user = userOpt.get();
			Optional<ReviewReply> replyOpt = reviewReplyRepository.findById(replyId);
			if (!replyOpt.isPresent()) {
				return new ResponseEntity<>("Không tìm thấy phản hồi", HttpStatus.NOT_FOUND);
			}
			
			ReviewReply reply = replyOpt.get();
			
			// Kiểm tra xem người dùng có quyền cập nhật phản hồi này không
			if (!reply.getUser().getUserId().equals(user.getUserId())) {
				return new ResponseEntity<>("Bạn không có quyền cập nhật phản hồi này", HttpStatus.FORBIDDEN);
			}
			
			// Cập nhật nội dung phản hồi
			reply.setContent(replyDTO.getContent());
			reply.setAnonymous(replyDTO.isAnonymous());
			
			// Cập nhật parentReply nếu cần
			if (replyDTO.getParentReplyId() != null && 
				(reply.getParentReply() == null || 
				!reply.getParentReply().getReplyId().equals(replyDTO.getParentReplyId()))) {
				
				Optional<ReviewReply> parentReplyOpt = reviewReplyRepository.findById(replyDTO.getParentReplyId());
				if (parentReplyOpt.isPresent()) {
					ReviewReply parentReply = parentReplyOpt.get();
					
					// Kiểm tra để tránh vòng lặp phản hồi (không cho phép trở thành con của con của nó)
					UUID currentParentId = replyDTO.getParentReplyId();
					ReviewReply currentParent = parentReplyOpt.get();
					boolean hasLoop = false;
					
					while (currentParent != null) {
						if (currentParent.getReplyId().equals(replyId)) {
							hasLoop = true;
							break;
						}
						currentParent = currentParent.getParentReply();
					}
					
					if (hasLoop) {
						return new ResponseEntity<>("Không thể tạo cấu trúc phản hồi vòng lặp", HttpStatus.BAD_REQUEST);
					}
					
					reply.setParentReply(parentReply);
				} else {
					return new ResponseEntity<>("Không tìm thấy phản hồi cha", HttpStatus.NOT_FOUND);
				}
			} else if (replyDTO.getParentReplyId() == null) {
				// Nếu parentReplyId là null, xóa phản hồi cha nếu có
				reply.setParentReply(null);
			}
			
			// Lưu phản hồi đã cập nhật
			ReviewReply updatedReply = reviewReplyRepository.save(reply);
			
			// Chuyển đổi thành DTO để trả về
			ReviewReplyDTO dto = new ReviewReplyDTO();
			dto.setReplyId(updatedReply.getReplyId());
			dto.setReviewId(updatedReply.getReview().getReviewId());
			dto.setContent(updatedReply.getContent());
			dto.setAnonymous(updatedReply.isAnonymous());
			dto.setCreateDate(updatedReply.getCreateDate());
			dto.setUserId(updatedReply.getUser().getUserId());
			
			// Ẩn thông tin người dùng nếu ẩn danh
			if (updatedReply.isAnonymous()) {
				dto.setUserName("Người dùng ẩn danh");
				dto.setUserAvatar(null);
			} else {
				dto.setUserName(updatedReply.getUser().getUserName());
				dto.setUserAvatar(updatedReply.getUser().getAvatar());
			}
			
			// Thêm thông tin về phản hồi cha
			if (updatedReply.getParentReply() != null) {
				dto.setParentReplyId(updatedReply.getParentReply().getReplyId());
				
				UserAccount parentUser = updatedReply.getParentReply().getUser();
				dto.setParentUserId(parentUser.getUserId());
				
				if (updatedReply.getParentReply().isAnonymous()) {
					dto.setParentUserName("Người dùng ẩn danh");
				} else {
					dto.setParentUserName(parentUser.getUserName());
				}
			}
			
			return ResponseEntity.ok(dto);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>("Lỗi khi cập nhật phản hồi: " + e.getMessage(), 
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
