package com.job_portal.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.job_portal.service.IJobPostService;

@Component
public class JobPostScheduler {

	@Autowired
	private IJobPostService jobPostService;

	// Cập nhật file CSV mỗi 5 phút
	@Scheduled(fixedRate = 300000)
	public void updateCSV() {
		try {
			jobPostService.exportJobPostToCSV("D:\\\\\\\\JobRadar_\\\\\\\\job_post.csv");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Scheduled(cron = "0 0 0 * * ?") // Chạy lúc 12:00 AM mỗi ngày
	public void updateExpiredJobPosts() {
	    try {
	        jobPostService.updateExpiredJobs();

	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}

	
}