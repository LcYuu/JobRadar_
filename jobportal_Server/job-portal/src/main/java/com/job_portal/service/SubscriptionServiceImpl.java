package com.job_portal.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ScheduledFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import com.job_portal.models.Industry;
import com.job_portal.models.JobPost;
import com.job_portal.models.Seeker;
import com.job_portal.models.Subscription;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.SubscriptionRepository;
import com.job_portal.utils.EmailUtil;
import com.social.exceptions.AllExceptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SubscriptionServiceImpl implements ISubscriptionService {
	
	private static final Logger logger = LoggerFactory.getLogger(SubscriptionServiceImpl.class);

	@Autowired
	private SubscriptionRepository subscriptionRepository;

	@Autowired
	private JobPostRepository jobPostRepository;

	@Autowired
	private EmailUtil emailUtil;

	@Autowired
	private SeekerRepository seekerRepository;

	@Autowired
	private ThreadPoolTaskScheduler taskScheduler;

	private ScheduledFuture<?> scheduledTask;

	@Override
	public boolean createSubscription(Subscription subscription, UUID userId) {
		Optional<Seeker> seeker = seekerRepository.findById(userId);
		
		if (seeker.isEmpty()) {
			logger.error("Không tìm thấy seeker với userId: {}", userId);
			return false;
		}
		
		Seeker see = seeker.get();
		Subscription sub = new Subscription();
		sub.setEmail(subscription.getEmail());
		sub.setEmailFrequency(subscription.getEmailFrequency()); // Set tần suất từ input
		sub.setCreatedAt(LocalDateTime.now());
		sub.setSeeker(seeker.get());
		see.setSubcription(true);
		try {
			Subscription saveSub = subscriptionRepository.save(sub);
			Seeker saveSeeker = seekerRepository.save(see);
			scheduleEmail(saveSub); // Lên lịch gửi email ngay sau khi tạo
			return saveSub != null && saveSeeker != null;
		} catch (Exception e) {
			logger.error("Lỗi khi tạo subscription: {}", e.getMessage());
			return false;
		}
	}

	@Override
	public boolean deleteSubscription(UUID subId) throws AllExceptions {
		Optional<Subscription> sub = subscriptionRepository.findById(subId);

		if (sub.isEmpty()) {
			throw new AllExceptions("Chưa đăng ký nhận email");
		}
		Seeker seeker = sub.get().getSeeker();
		seeker.setSubcription(false);
		subscriptionRepository.delete(sub.get());
		seekerRepository.save(seeker);
		return true;
	}

	@Override
	public List<Subscription> getAllSubscriptions() {
		return subscriptionRepository.findAll();
	}

	private void scheduleEmail(Subscription subscription) {
		if (subscription.getEmailFrequency() == null) {
			logger.warn("Tần suất email không được thiết lập cho: {}", subscription.getEmail());
			return;
		}

		// Tính thời gian gửi tiếp theo dựa trên emailFrequency
		LocalDateTime nextSendTime = calculateNextSendTime(subscription);
		long delay = java.time.Duration.between(LocalDateTime.now(), nextSendTime).toMillis();

		if (delay < 0) {
			sendJobNotification(subscription);
		} else {
			taskScheduler.schedule(() -> sendJobNotification(subscription),
					new java.util.Date(System.currentTimeMillis() + delay));
			logger.info("Đã lên lịch gửi email cho {} vào {}", subscription.getEmail(), nextSendTime);
		}
	}

	private LocalDateTime calculateNextSendTime(Subscription subscription) {
		LocalDateTime baseTime = subscription.getLastSentAt() != null ? 
				subscription.getLastSentAt() : subscription.getCreatedAt();
		
		switch (subscription.getEmailFrequency()) {
			case THREE_DAYS:
				return baseTime.plusDays(3);
			case SEVEN_DAYS:
				return baseTime.plusDays(7);
			case TWO_WEEKS:
				return baseTime.plusWeeks(2);
			case ONE_MONTH:
				return baseTime.plusMonths(1);
			case TWO_MONTHS:
				return baseTime.plusMonths(2);
			default:
				logger.warn("Tần suất không hợp lệ: {}", subscription.getEmailFrequency());
				return baseTime.plusDays(3); // Mặc định 3 ngày nếu tần suất không hợp lệ
		}
	}

	public void rescheduleAllSubscriptions() {
		List<Subscription> subscriptions = subscriptionRepository.findAll();
		logger.info("Lên lịch lại cho {} subscriptions", subscriptions.size());
		subscriptions.forEach(this::scheduleEmail);
	}

	public void sendJobNotification(Subscription subscription) {
	    try {
	        logger.info("Bắt đầu gửi thông báo cho: {}", subscription.getEmail());
	        
	        Seeker seeker = subscription.getSeeker();
	        if (seeker == null || seeker.getIndustry() == null || seeker.getIndustry().isEmpty()) {
	            logger.warn("Không thể gửi email vì seeker hoặc industries bị null hoặc rỗng cho: {}", subscription.getEmail());
	            return;
	        }

	        // Lấy danh sách industry IDs từ Seeker
	        List<Integer> industryIds = seeker.getIndustry().stream()
	                .map(Industry::getIndustryId)
	                .collect(Collectors.toList());
	        
	        // Tính khoảng thời gian dựa trên emailFrequency
	        LocalDateTime lookbackTime = calculateLookbackTime(subscription);
	        
	        logger.info("Tìm kiếm công việc mới cho các ngành {} từ {}", industryIds, lookbackTime);
	        List<JobPost> matchedJobs = jobPostRepository.findByCreateDateAfterAndIndustryIds(lookbackTime, industryIds)
	                .stream()
	                .limit(7)
	                .collect(Collectors.toList());

	        logger.info("Tìm thấy {} công việc mới cho: {}", matchedJobs.size(), subscription.getEmail());

	        if (!matchedJobs.isEmpty()) {
	            logger.info("Bắt đầu quá trình gửi email cho: {}", subscription.getEmail());
	            try {
	                emailUtil.sendJobNotifications(subscription, matchedJobs);
	                logger.info("Quá trình gửi email hoàn tất cho: {}", subscription.getEmail());
	                
	                subscription.setLastSentAt(LocalDateTime.now());
	                subscriptionRepository.save(subscription);
	                logger.info("Đã cập nhật thời gian gửi email cuối cùng cho: {}", subscription.getEmail());

	                scheduleEmail(subscription);
	                logger.info("Đã lên lịch gửi email tiếp theo cho: {}", subscription.getEmail());
	            } catch (Exception e) {
	                logger.error("Lỗi trong quá trình gửi email cho {}: {}", subscription.getEmail(), e.getMessage());
	                logger.error("Chi tiết lỗi:", e);
	            }
	        } else {
	            logger.info("Không có công việc mới để gửi email cho: {}", subscription.getEmail());
	        }
	    } catch (Exception e) {
	        logger.error("Lỗi khi gửi email cho {}: {}", subscription.getEmail(), e.getMessage());
	        logger.error("Chi tiết lỗi:", e);
	    }
	}

	private LocalDateTime calculateLookbackTime(Subscription subscription) {
		switch (subscription.getEmailFrequency()) {
			case THREE_DAYS:
				return LocalDateTime.now().minusDays(3);
			case SEVEN_DAYS:
				return LocalDateTime.now().minusDays(7);
			case TWO_WEEKS:
				return LocalDateTime.now().minusWeeks(2);
			case ONE_MONTH:
				return LocalDateTime.now().minusMonths(1);
			case TWO_MONTHS:
				return LocalDateTime.now().minusMonths(2);
			default:
				logger.warn("Tần suất không hợp lệ: {}, sử dụng mặc định 3 ngày", subscription.getEmailFrequency());
				return LocalDateTime.now().minusDays(3);
		}
	}

	public void checkAndSendEmails() {
	    logger.info("Bắt đầu quá trình kiểm tra và gửi email");
	    try {
	        List<Subscription> subscriptions = subscriptionRepository.findAll();
	        logger.info("Tìm thấy {} đăng ký nhận thông báo", subscriptions.size());

	        int successCount = 0;
	        int errorCount = 0;
	        
	        for (Subscription sub : subscriptions) {
	            try {
	                logger.info("Kiểm tra subscription của email: {}", sub.getEmail());
	                LocalDateTime nextSendTime = calculateNextSendTime(sub);
	                if (LocalDateTime.now().isAfter(nextSendTime) || LocalDateTime.now().isEqual(nextSendTime)) {
	                    sendJobNotification(sub);
	                    successCount++;
	                } else {
	                    logger.info("Chưa đến thời gian gửi email cho: {}", sub.getEmail());
	                }
	            } catch (Exception e) {
	                logger.error("Lỗi xử lý subscription cho {}: {}", sub.getEmail(), e.getMessage());
	                errorCount++;
	            }
	        }
	        
	        logger.info("Quá trình kiểm tra và gửi email hoàn tất! Thành công: {}, Lỗi: {}", successCount, errorCount);
	    } catch (Exception e) {
	        logger.error("Lỗi nghiêm trọng khi kiểm tra và gửi email: {}", e.getMessage());
	        logger.error("Chi tiết lỗi:", e);
	    }
	}

	@Override
	public boolean updateSubscription(String email, Subscription.EmailFrequency emailFrequency, UUID subId) throws AllExceptions {
	    Optional<Subscription> sub = subscriptionRepository.findById(subId);
	    if (sub.isEmpty()) {
	        throw new AllExceptions("Không tìm thấy subscription với ID: " + subId);
	    }
	    Subscription newSub = sub.get();
	    boolean isUpdated = false;
	    if (email != null && !email.equals(newSub.getEmail())) {
	        newSub.setEmail(email);
	        isUpdated = true;
	    }
	    if (emailFrequency != null && emailFrequency != newSub.getEmailFrequency()) {
	        newSub.setEmailFrequency(emailFrequency);
	        isUpdated = true;
	    }
	    if (isUpdated) {
	        subscriptionRepository.save(newSub);
	        scheduleEmail(newSub); // Lên lịch lại nếu có thay đổi
	    }
	    return isUpdated;
	}

	@Override
	public Subscription findSubBySeekerId(UUID seekerId) {
		return subscriptionRepository.findSubscriptionBySeekerId(seekerId);
	}
}