package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.CountReviewByCompanyDTO;
import com.job_portal.DTO.CountReviewByStar;
import com.job_portal.DTO.ReviewDTO;
import com.job_portal.DTO.ReviewReactionDTO;
import com.job_portal.DTO.ReviewReplyDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.Company;
import com.job_portal.models.Review;
import com.job_portal.models.ReviewReaction;
import com.job_portal.models.ReviewReply;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.ReviewReactionRepository;
import com.job_portal.repository.ReviewReplyRepository;
import com.job_portal.repository.ReviewRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IApplyJobService;
import com.job_portal.service.IReviewService;
import com.social.exceptions.AllExceptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.*;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
public class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewRepository reviewRepository;

    @MockBean
    private ReviewReplyRepository reviewReplyRepository;

    @MockBean
    private ReviewReactionRepository reviewReactionRepository;

    @MockBean
    private IReviewService reviewService;

    @MockBean
    private SeekerRepository seekerRepository;

    @MockBean
    private IApplyJobService applyJobService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd"; // 64 chars
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String USER_EMAIL = "giathuanhl@gmail.com";
    private static final UUID COMPANY_ID = UUID.randomUUID();
    private static final UUID REVIEW_ID = UUID.randomUUID();
    private static final UUID REPLY_ID = UUID.randomUUID();
    private static final UUID PARENT_REPLY_ID = UUID.randomUUID();
    private static final int STAR = 5;
    private static final String MESSAGE = "Great company!";
    private static final boolean ANONYMOUS = false;
    private static final String REPLY_CONTENT = "Thank you!";
    private static final LocalDateTime CREATE_DATE = LocalDateTime.of(2025, 5, 1, 10, 0);
    private String jwtToken;

    private UserAccount user;
    private Seeker seeker;
    private Company company;
    private Review review;
    private ReviewReply reply;
    private ReviewReply parentReply;
    private ReviewDTO reviewDTO;
    private ReviewReplyDTO replyDTO;
    private ReviewReactionDTO reactionDTO;
    private CountReviewByCompanyDTO countReviewDTO;
    private CountReviewByStar countReviewByStar;

    @BeforeEach
    void setUp() {
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(USER_EMAIL);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Generate jwtToken
        long expirationTime = 24 * 60 * 60 * 1000; // 24 hours
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);

        company = new Company();
        company.setCompanyId(COMPANY_ID);

        user = new UserAccount();
        user.setUserId(USER_ID);
        user.setEmail(USER_EMAIL);
        user.setUserName("Test User");
        user.setAvatar("avatar.png");
        user.setCompany(company);

        seeker = new Seeker();
        seeker.setUserId(USER_ID);
        seeker.setUserAccount(user);

        review = new Review();
        review.setReviewId(REVIEW_ID);
        review.setSeeker(seeker);
        review.setStar(STAR);
        review.setMessage(MESSAGE);
        review.setAnonymous(ANONYMOUS);
        review.setCreateDate(CREATE_DATE);

        reply = new ReviewReply();
        reply.setReplyId(REPLY_ID);
        reply.setReview(review);
        reply.setUser(user);
        reply.setContent(REPLY_CONTENT);
        reply.setAnonymous(ANONYMOUS);
        reply.setCreateDate(CREATE_DATE);

        parentReply = new ReviewReply();
        parentReply.setReplyId(PARENT_REPLY_ID);
        parentReply.setReview(review);
        parentReply.setUser(user);
        parentReply.setContent("Parent reply");
        parentReply.setAnonymous(false);
        parentReply.setCreateDate(CREATE_DATE.minusDays(1));

        reviewDTO = new ReviewDTO();
        reviewDTO.setStar(STAR);
        reviewDTO.setMessage(MESSAGE);
        reviewDTO.setAnonymous(ANONYMOUS);

        replyDTO = new ReviewReplyDTO();
        replyDTO.setReviewId(REVIEW_ID);
        replyDTO.setContent(REPLY_CONTENT);
        replyDTO.setAnonymous(ANONYMOUS);

        reactionDTO = new ReviewReactionDTO();
        reactionDTO.setReviewId(REVIEW_ID);
        reactionDTO.setReactionType("LIKE");

        countReviewDTO = new CountReviewByCompanyDTO();
        countReviewDTO.setTotalReviews(10L);

        countReviewByStar = new CountReviewByStar();
        countReviewByStar.setStar(5);
        countReviewByStar.setCount(10L);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetAllReviews_Success() throws Exception {
        // Arrange
        Pageable pageable = PageRequest.of(0, 5, Sort.by("createDate").descending());
        List<Review> reviewList = Collections.singletonList(review);
        Page<Review> reviewPage = new PageImpl<>(reviewList, pageable, reviewList.size());
        when(reviewRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(reviewPage);

        // Act & Assert
        mockMvc.perform(get("/review/get-all")
                .param("page", "0")
                .param("size", "5")
                .param("companyId", COMPANY_ID.toString())
                .param("star", "5")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].reviewId").value(REVIEW_ID.toString()))
                .andExpect(jsonPath("$.content[0].star").value(STAR))
                .andExpect(jsonPath("$.content[0].message").value(MESSAGE));

        verify(reviewRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateReview_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(seekerRepository.findById(USER_ID)).thenReturn(Optional.of(seeker));
        when(reviewService.createReview(eq(seeker), eq(COMPANY_ID), any(Review.class))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/review/create-review/" + COMPANY_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"star\": " + STAR + ", \"message\": \"" + MESSAGE + "\", \"anonymous\": " + ANONYMOUS + "}"))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string("Đánh giá thành công"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(seekerRepository, times(1)).findById(USER_ID);
        verify(reviewService, times(1)).createReview(eq(seeker), eq(COMPANY_ID), any(Review.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL)
    void testCreateReview_UserNotFound() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/review/create-review/" + COMPANY_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"star\": " + STAR + ", \"message\": \"" + MESSAGE + "\", \"anonymous\": " + ANONYMOUS + "}"))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(seekerRepository, never()).findById(any());
        verify(reviewService, never()).createReview(any(), any(), any());
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchReviewByCompanyId_Success() throws Exception {
        // Arrange
        List<Review> reviews = Collections.singletonList(review);
        when(reviewService.findReviewByCompanyId(COMPANY_ID)).thenReturn(reviews);

        // Act & Assert
        mockMvc.perform(get("/review/findReviewByCompanyId/" + COMPANY_ID)
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reviewId").value(REVIEW_ID.toString()))
                .andExpect(jsonPath("$[0].star").value(STAR));

        verify(reviewService, times(1)).findReviewByCompanyId(COMPANY_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testSearchReviewByCompanyId_NotFound() throws Exception {
        // Arrange
        when(reviewService.findReviewByCompanyId(COMPANY_ID))
                .thenThrow(new AllExceptions("No reviews found"));

        // Act & Assert
        mockMvc.perform(get("/review/findReviewByCompanyId/" + COMPANY_ID)
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("No reviews found"));

        verify(reviewService, times(1)).findReviewByCompanyId(COMPANY_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testFindReviewByCompanyId_Success() throws Exception {
        // Arrange
        Pageable pageable = PageRequest.of(0, 5, Sort.by("createDate").descending());
        List<Review> reviewList = Collections.singletonList(review);
        Page<Review> reviewPage = new PageImpl<>(reviewList, pageable, reviewList.size());
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(reviewPage);

        // Act & Assert
        mockMvc.perform(get("/review/findReviewByCompanyId")
                .header("Authorization", jwtToken)
                .param("page", "0")
                .param("size", "5")
                .param("star", "5"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].reviewId").value(REVIEW_ID.toString()))
                .andExpect(jsonPath("$.content[0].star").value(STAR));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testFindReviewByCompanyIdAndUserId_Success() throws Exception {
        // Arrange
        when(reviewService.findReviewByCompanyIdAndUserId(COMPANY_ID, USER_ID)).thenReturn(review);

        // Act & Assert
        mockMvc.perform(get("/review/review-detail")
                .header("Authorization", jwtToken)
                .param("companyId", COMPANY_ID.toString())
                .param("userId", USER_ID.toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewId").value(REVIEW_ID.toString()))
                .andExpect(jsonPath("$.star").value(STAR));

        verify(reviewService, times(1)).findReviewByCompanyIdAndUserId(COMPANY_ID, USER_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCountReviewByCompany_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewRepository.countReviewsByCompany(COMPANY_ID)).thenReturn(countReviewDTO);

        // Act & Assert
        mockMvc.perform(get("/review/countReviewByCompany")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReviews").value(10));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewRepository, times(1)).countReviewsByCompany(COMPANY_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteReview_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewService.deleteReview(REVIEW_ID)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/review/delete/" + REVIEW_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Xóa đánh giá thành công"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewService, times(1)).deleteReview(REVIEW_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCountReviewsByStar_Success() throws Exception {
        // Arrange
        List<CountReviewByStar> counts = Collections.singletonList(countReviewByStar);
        when(reviewService.countReviewsByStar(COMPANY_ID)).thenReturn(counts);

        // Act & Assert
        mockMvc.perform(get("/review/count-by-star")
                .header("Authorization", jwtToken)
                .param("companyId", COMPANY_ID.toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].star").value(5))
                .andExpect(jsonPath("$[0].count").value(10));

        verify(reviewService, times(1)).countReviewsByStar(COMPANY_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCountStarByCompanyId_Success() throws Exception {
        // Arrange
        List<CountReviewByStar> counts = Collections.singletonList(countReviewByStar);
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewService.countReviewsByStar(COMPANY_ID)).thenReturn(counts);

        // Act & Assert
        mockMvc.perform(get("/review/count-star-by-company-id")
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].star").value(5))
                .andExpect(jsonPath("$[0].count").value(10));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewService, times(1)).countReviewsByStar(COMPANY_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testCreateReply_Success() throws Exception {
        // Arrange
        replyDTO.setParentReplyId(PARENT_REPLY_ID);
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.of(review));
        when(reviewReplyRepository.findById(PARENT_REPLY_ID)).thenReturn(Optional.of(parentReply));
        when(reviewReplyRepository.save(any(ReviewReply.class))).thenReturn(reply);

        // Act & Assert
        mockMvc.perform(post("/review/create-reply")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reviewId\": \"" + REVIEW_ID + "\", \"content\": \"" + REPLY_CONTENT + "\", \"anonymous\": " + ANONYMOUS + ", \"parentReplyId\": \"" + PARENT_REPLY_ID + "\"}"))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.replyId").value(REPLY_ID.toString()))
                .andExpect(jsonPath("$.content").value(REPLY_CONTENT));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewRepository, times(1)).findById(REVIEW_ID);
        verify(reviewReplyRepository, times(1)).findById(PARENT_REPLY_ID);
        verify(reviewReplyRepository, times(1)).save(any(ReviewReply.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetRepliesByReviewId_Success() throws Exception {
        // Arrange
        List<ReviewReply> replies = Arrays.asList(parentReply, reply);
        reply.setParentReply(parentReply);
        when(reviewRepository.existsById(REVIEW_ID)).thenReturn(true);
        when(reviewReplyRepository.findByReviewReviewIdOrderByCreateDateAsc(REVIEW_ID)).thenReturn(replies);

        // Act & Assert
        mockMvc.perform(get("/review/get-replies/" + REVIEW_ID)
                .header("Authorization", jwtToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].replyId").value(PARENT_REPLY_ID.toString()))
                .andExpect(jsonPath("$[0].childReplies[0].replyId").value(REPLY_ID.toString()));

        verify(reviewRepository, times(1)).existsById(REVIEW_ID);
        verify(reviewReplyRepository, times(1)).findByReviewReviewIdOrderByCreateDateAsc(REVIEW_ID);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testDeleteReply_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewReplyRepository.findById(REPLY_ID)).thenReturn(Optional.of(reply));

        // Act & Assert
        mockMvc.perform(delete("/review/delete-reply/" + REPLY_ID)
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewReplyRepository, times(1)).findById(REPLY_ID);
        verify(reviewReplyRepository, times(1)).delete(reply);
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testReactToReview_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.of(review));
        when(reviewReactionRepository.findByReviewReviewIdAndUserUserId(REVIEW_ID, USER_ID))
                .thenReturn(Optional.empty());
        when(reviewReactionRepository.countByReviewReviewIdAndReactionType(REVIEW_ID, "LIKE"))
                .thenReturn(10L);
        when(reviewReactionRepository.countByReviewReviewIdAndReactionType(REVIEW_ID, "DISLIKE"))
                .thenReturn(5L);
        when(reviewReactionRepository.save(any(ReviewReaction.class))).thenReturn(new ReviewReaction());

        // Act & Assert
        mockMvc.perform(post("/review/react")
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reviewId\": \"" + REVIEW_ID + "\", \"reactionType\": \"LIKE\"}"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewId").value(REVIEW_ID.toString()))
                .andExpect(jsonPath("$.likeCount").value(10))
                .andExpect(jsonPath("$.dislikeCount").value(5))
                .andExpect(jsonPath("$.reactionType").value("LIKE"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewRepository, times(1)).findById(REVIEW_ID);
        verify(reviewReactionRepository, times(1)).save(any(ReviewReaction.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testGetReactions_Success() throws Exception {
        // Arrange
        ReviewReaction reaction = new ReviewReaction();
        reaction.setReactionType("LIKE");
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewReactionRepository.countByReviewReviewIdAndReactionType(REVIEW_ID, "LIKE"))
                .thenReturn(10L);
        when(reviewReactionRepository.countByReviewReviewIdAndReactionType(REVIEW_ID, "DISLIKE"))
                .thenReturn(5L);
        when(reviewReactionRepository.findByReviewReviewIdAndUserUserId(REVIEW_ID, USER_ID))
                .thenReturn(Optional.of(reaction));

        // Act & Assert
        mockMvc.perform(get("/review/get-reactions")
                .header("Authorization", jwtToken)
                .param("reviewIds", REVIEW_ID.toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reviewId").value(REVIEW_ID.toString()))
                .andExpect(jsonPath("$[0].likeCount").value(10))
                .andExpect(jsonPath("$[0].dislikeCount").value(5))
                .andExpect(jsonPath("$[0].userReaction").value("LIKE"));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewReactionRepository, times(1)).countByReviewReviewIdAndReactionType(REVIEW_ID, "LIKE");
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateReview_Success() throws Exception {
        // Arrange
        when(seekerRepository.findByUserAccountEmail(USER_EMAIL)).thenReturn(Optional.of(seeker));
        when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        // Act & Assert
        mockMvc.perform(put("/review/update-review/" + REVIEW_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"star\": " + STAR + ", \"message\": \"" + MESSAGE + "\", \"anonymous\": " + ANONYMOUS + "}"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewId").value(REVIEW_ID.toString()))
                .andExpect(jsonPath("$.star").value(STAR))
                .andExpect(jsonPath("$.message").value(MESSAGE));

        verify(seekerRepository, times(1)).findByUserAccountEmail(USER_EMAIL);
        verify(reviewRepository, times(1)).findById(REVIEW_ID);
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    @WithMockUser(username = USER_EMAIL, roles = {"USER"})
    void testUpdateReply_Success() throws Exception {
        // Arrange
        replyDTO.setParentReplyId(PARENT_REPLY_ID);
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(reviewReplyRepository.findById(REPLY_ID)).thenReturn(Optional.of(reply));
        when(reviewReplyRepository.findById(PARENT_REPLY_ID)).thenReturn(Optional.of(parentReply));
        when(reviewReplyRepository.save(any(ReviewReply.class))).thenReturn(reply);

        // Act & Assert
        mockMvc.perform(put("/review/update-reply/" + REPLY_ID)
                .header("Authorization", jwtToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reviewId\": \"" + REVIEW_ID + "\", \"content\": \"" + REPLY_CONTENT + "\", \"anonymous\": " + ANONYMOUS + ", \"parentReplyId\": \"" + PARENT_REPLY_ID + "\"}"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.replyId").value(REPLY_ID.toString()))
                .andExpect(jsonPath("$.content").value(REPLY_CONTENT))
                .andExpect(jsonPath("$.parentReplyId").value(PARENT_REPLY_ID.toString()));

        verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL);
        verify(reviewReplyRepository, times(1)).findById(REPLY_ID);
        verify(reviewReplyRepository, times(1)).findById(PARENT_REPLY_ID);
        verify(reviewReplyRepository, times(1)).save(any(ReviewReply.class));
    }
}