package com.job_portal.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.FollowSeekerDTO;
import com.job_portal.enums.NotificationType;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.Notification;
import com.job_portal.models.Seeker;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.JobPostRepository;
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
	@Autowired
	JobPostRepository jobPostRepository;
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
			return false; 
		}
}
	@Override
	public boolean notifyNewJobPost(UUID companyId, UUID postId) {
	    try {
	        Company company = companyRepository.findById(companyId)
	                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công ty."));
	        
	        JobPost jobPost = jobPostRepository.findById(postId)
	                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài đăng."));
	        
	        List<FollowSeekerDTO> seekerFollowed = seekerRepository.findSeekersFollowingCompany(companyId);
	        
	        if (seekerFollowed.isEmpty()) {
	            return true;
	        }
	        for (FollowSeekerDTO follower : seekerFollowed) {
	            String title = String.format("%s đang tuyển %s", 
	                company.getCompanyName(), 
	                jobPost.getTitle());

	            StringBuilder contentBuilder = new StringBuilder();
	            contentBuilder.append("Mức lương: ")
	                .append(jobPost.getSalary() != null ? jobPost.getSalary() : "Thỏa thuận")
	                .append("\n\n") 
	                .append("Địa điểm: ")
	                .append(jobPost.getCity() != null ? jobPost.getCity().getCityName() : "Không xác định")
	                .append("\n\n")
	                .append("Kinh nghiệm: ")
	                .append(jobPost.getExperience() != null ? jobPost.getExperience() : "Không yêu cầu")
	                .append("\n\n")
	                .append("Hình thức: ")
	                .append(jobPost.getTypeOfWork() != null ? jobPost.getTypeOfWork() : "Không xác định");
	            String redirectUrl = "/jobs/job-detail/" + postId;
	            sendNotification(
	                follower.getUserId(), 
	                title, 
	                contentBuilder.toString(), 
	                NotificationType.NEW_JOB_POST, 
	                redirectUrl
	            );
	        }
	        return true;
	    } catch (Exception e) {
	        System.err.println("Error in notifyNewJobPost: " + e.getMessage());
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
