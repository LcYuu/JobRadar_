package com.job_portal.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.job_portal.models.ForgotPassword;
import com.job_portal.repository.ForgotPasswordRepository;

@Component
public class AuthScheduler {

	@Autowired
    private ForgotPasswordRepository forgotPasswordRepository;
	
	@Scheduled(cron = "0 * * * * *") // 60000 ms = 1 phút
    public void deleteExpiredOtpRecords() {
        LocalDateTime now = LocalDateTime.now();
        List<ForgotPassword> expiredRecords = forgotPasswordRepository.findByExpirationTimeBefore(now);
        
        if (!expiredRecords.isEmpty()) {
            // Log số bản ghi sẽ bị xóa
            System.out.println("Đang xóa " + expiredRecords.size() + " bản ghi hết hạn...");
            
            // Xóa tất cả các bản ghi hết hạn
            forgotPasswordRepository.deleteAll(expiredRecords);
        }
    }
}
