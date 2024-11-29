package com.job_portal.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.models.DailyStats;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.UserAccountRepository;

import lombok.Data;

@RestController
@RequestMapping("/stats")
public class StatsController {

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private JobPostRepository jobPostRepository;

	@GetMapping("/daily")
	public ResponseEntity<List<DailyStats>> getDailyStats(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		List<DailyStats> stats = new ArrayList<>();
		LocalDate currentDate = startDate;

		while (!currentDate.isAfter(endDate)) {
			DailyStats dayStat = new DailyStats();
			dayStat.setDate(currentDate);

			// Đếm số người dùng mới trong ngày
			long newUsers = userAccountRepository.countByCreatedDateBetween(currentDate, currentDate);

			// Đếm số bài đăng mới trong ngày
			long newJobs = jobPostRepository.countByCreatedDateBetween(currentDate, currentDate);

			dayStat.setNewUsers(newUsers);
			dayStat.setNewJobs(newJobs);

			stats.add(dayStat);
			currentDate = currentDate.plusDays(1);
		}

		return ResponseEntity.ok(stats);
	}
}
