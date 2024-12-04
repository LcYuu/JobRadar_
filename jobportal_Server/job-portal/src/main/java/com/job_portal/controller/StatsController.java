package com.job_portal.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
	public ResponseEntity<?> getDailyStats(
	        @RequestParam String startDate,
	        @RequestParam String endDate) {
	    try {
	        // Parse to LocalDate instead of LocalDateTime
	        LocalDate start = LocalDate.parse(startDate);
	        LocalDate end = LocalDate.parse(endDate);
	        
	        List<Map<String, Object>> dailyStats = new ArrayList<>();
	        
	        LocalDate current = start;
	        while (!current.isAfter(end)) {
	            LocalDate nextDay = current.plusDays(1);
	            long newUsers = userAccountRepository.countByCreatedAtBetween(current, nextDay);
	            long newJobs = jobPostRepository.countByCreatedAtBetween(current, nextDay);
	            
	            Map<String, Object> dayStat = new HashMap<>();
	            dayStat.put("date", current.toString());
	            dayStat.put("newUsers", newUsers);
	            dayStat.put("newJobs", newJobs);
	            
	            dailyStats.add(dayStat);
	            current = nextDay;
	        }
	        
	        return ResponseEntity.ok(dailyStats);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body("Error fetching daily stats: " + e.getMessage());
	    }
	}
}
