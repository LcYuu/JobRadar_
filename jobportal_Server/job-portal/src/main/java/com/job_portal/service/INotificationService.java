package com.job_portal.service;

import java.util.UUID;

import com.job_portal.enums.NotificationType;


public interface INotificationService {
	public boolean sendNotification(UUID userId, String title, String content, NotificationType type, String redirectUrl);
	public boolean notifyNewJobPost(UUID companyId, UUID postId);
	public boolean notifyApplicationReviewed(UUID seekerId, UUID postId, UUID companyId);
	public boolean updateNotificationReadStatus(UUID notificationId);
	public long countUnreadNotifications(UUID seekerId);
}
