package com.job_portal.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.FollowSeekerDTO;
import com.job_portal.enums.NotificationType;
import com.job_portal.models.Company;
import com.job_portal.models.Notification;
import com.job_portal.models.Seeker;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.NotificationRepository;
import com.job_portal.repository.SeekerRepository;

@Service
public class NotificationServiceImpl implements INotificationService {

	@Autowired
	SeekerRepository seekerRepository;
	@Autowired
	NotificationRepository notificationRepository;
	@Autowired
	CompanyRepository companyRepository;

	@Override
	public boolean sendNotification(UUID userId, String title, String content, NotificationType type,
			String redirectUrl) {
		Optional<Seeker> seeker = seekerRepository.findById(userId);
		try {
			Notification notification = new Notification();
			notification.setSeeker(seeker.get());
			notification.setTitle(title);
			notification.setContent(content);
			notification.setRedirectUrl(redirectUrl);
			notification.setType(type);
			notification.setCreatedAt(LocalDateTime.now());
			notification.setRead(false);
			notificationRepository.save(notification);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false; // Gửi thông báo thất bại
		}
	}

	@Override
	public boolean notifyNewJobPost(UUID companyId) {
		try {
			Company company = companyRepository.findById(companyId)
					.orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công ty."));
			List<FollowSeekerDTO> seekerFollowed = seekerRepository.findSeekersFollowingCompany(companyId);
			if (seekerFollowed.isEmpty()) {
				System.out.println("Không có seeker nào theo dõi công ty: " + company.getCompanyName());
				return true;
			}
			for (FollowSeekerDTO follower : seekerFollowed) {
				String title = "Nhà tuyển dụng đã đăng việc làm mới";
				String content = String.format("Công ty %s vừa đăng công việc mới. Vào xem ngay!",
						company.getCompanyName());
				String redirectUrl = "http://localhost:3000/companies/" + companyId;
				sendNotification(follower.getUserId(), title, content, NotificationType.NEW_JOB_POST, redirectUrl);
			}
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	@Override
	public boolean notifyApplicationReviewed(UUID seekerId, UUID postId, UUID companyId) {
		Company company = companyRepository.findById(companyId)
				.orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công ty."));
		try {
			String title = "Nhà tuyển dụng vừa xem CV ứng tuyển của bạn";
			String content = String.format("Công ty %s vừa xem CV của bạn.", company.getCompanyName());
			String redirectUrl = "http://localhost:3000/jobs/job-detail/" + postId;
			sendNotification(seekerId, title, content, NotificationType.APPLICATION_REVIEWED, redirectUrl);
			System.out.print("Gửi thành công");
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	@Override
	public boolean updateNotificationReadStatus(UUID notificationId) {
		try {
			Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
			if (optionalNotification.isPresent()) {
				Notification notification = optionalNotification.get();
				notification.setRead(true);
				notificationRepository.save(notification);
				return true;
			}
			return false;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	@Override
	public long countUnreadNotifications(UUID seekerId) {
		 return notificationRepository.countBySeeker_UserIdAndIsRead(seekerId, false);
	}

}
