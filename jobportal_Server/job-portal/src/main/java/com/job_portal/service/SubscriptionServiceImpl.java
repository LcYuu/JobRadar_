package com.job_portal.service;

import java.time.LocalDateTime;
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
		
		Seeker see = seeker.get();
		Subscription sub = new Subscription();
		sub.setEmail(subscription.getEmail());
		sub.setCreatedAt(LocalDateTime.now());
		sub.setSeeker(seeker.get());
		see.setSubcription(true);
		try {
			Subscription saveSub = subscriptionRepository.save(sub);
			Seeker saveSeeker = seekerRepository.save(see);
			return saveSub != null && saveSeeker != null;
		} catch (Exception e) {
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
		LocalDateTime nextSendTime = subscription.getLastSentAt() != null ? subscription.getLastSentAt().plusDays(3)
				: subscription.getCreatedAt().plusDays(3);

		long delay = java.time.Duration.between(LocalDateTime.now(), nextSendTime).toMillis();

		if (delay < 0) {
			sendJobNotification(subscription);
		} else {
			taskScheduler.schedule(() -> sendJobNotification(subscription),
					new java.util.Date(System.currentTimeMillis() + delay));
		}
	}

	public void rescheduleAllSubscriptions() {
		List<Subscription> subscriptions = subscriptionRepository.findAll();
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
	        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
	        
	        logger.info("Tìm kiếm công việc mới cho các ngành {} từ {}", industryIds, threeDaysAgo);
	        List<JobPost> matchedJobs = jobPostRepository.findByCreateDateAfterAndIndustryIds(threeDaysAgo, industryIds)
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
	                sendJobNotification(sub);
	                successCount++;
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
	public boolean updateSubscription(String email, UUID subId) throws AllExceptions {
		boolean isUpdated = false;
		Optional<Subscription> sub = subscriptionRepository.findById(subId);
		
		Subscription newSub = sub.get();
		if(newSub.getEmail() != null) {
			newSub.setEmail(email);
			isUpdated = true;
		}
		return isUpdated;
	}

	@Override
	public Subscription findSubBySeekerId(UUID seekerId) {
		return subscriptionRepository.findSubscriptionBySeekerId(seekerId);
	}
}
