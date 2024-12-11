package com.job_portal.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.job_portal.enums.NotificationType;
import com.job_portal.models.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

//    // Lấy tất cả thông báo của một người dùng theo loại thông báo
//    @Query("SELECT n FROM Notification n WHERE n.user.userId = :userId AND n.type = :type ORDER BY n.createdAt DESC")
//    List<Notification> findByUserIdAndType(@Param("userId") UUID userId, @Param("type") NotificationType type);

	// Lấy tất cả thông báo mới nhất của một người dùng
	@Query("SELECT n FROM Notification n WHERE n.seeker.userId = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findNotificationByUserId(@Param("userId") UUID userId);
	long countBySeeker_UserIdAndIsRead(UUID userId, boolean isRead);

}