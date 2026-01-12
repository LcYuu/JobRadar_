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
import com.job_portal.repository.CompanyRepository;

import lombok.Data;

@RestController
@RequestMapping("/stats")
public class StatsController {

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private JobPostRepository jobPostRepository;

	@Autowired
	private CompanyRepository companyRepository;

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
	            long newJobs = jobPostRepository.countApprovedJobsByCreatedAtBetween(current, nextDay);
	            long newCompanies = companyRepository.countNewCompaniesByDate(current);
	            
	            Map<String, Object> dayStat = new HashMap<>();
	            dayStat.put("date", current.toString());
	            dayStat.put("newUsers", newUsers);
	            dayStat.put("newJobs", newJobs);
	            dayStat.put("newCompanies", newCompanies);
	            
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
	
	@GetMapping("/summary")
	public ResponseEntity<?> getSummaryStats() {
	    try {
	        LocalDate today = LocalDate.now();
	        // Tháng hiện tại
	        LocalDate monthStart = today.withDayOfMonth(1);
	        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
	        // Tháng trước
	        LocalDate prevMonthStart = monthStart.minusMonths(1);
	        LocalDate prevMonthEnd = monthStart.minusDays(1);
	        // Năm hiện tại
	        LocalDate yearStart = today.withDayOfYear(1);
	        LocalDate yearEnd = yearStart.plusYears(1).minusDays(1);
	        // Năm trước
	        LocalDate prevYearStart = yearStart.minusYears(1);
	        LocalDate prevYearEnd = yearStart.minusDays(1);

	        // Người dùng
	        long usersThisMonth = safeCount(userAccountRepository.countByCreatedAtBetween(monthStart, monthEnd.plusDays(1)));
	        long usersPrevMonth = safeCount(userAccountRepository.countByCreatedAtBetween(prevMonthStart, prevMonthEnd.plusDays(1)));
	        long usersThisYear = safeCount(userAccountRepository.countByCreatedAtBetween(yearStart, yearEnd.plusDays(1)));
	        long usersPrevYear = safeCount(userAccountRepository.countByCreatedAtBetween(prevYearStart, prevYearEnd.plusDays(1)));
	        // Bài viết đã duyệt
	        long jobsThisMonth = safeCount(jobPostRepository.countApprovedJobsByCreatedAtBetween(monthStart, monthEnd.plusDays(1)));
	        long jobsPrevMonth = safeCount(jobPostRepository.countApprovedJobsByCreatedAtBetween(prevMonthStart, prevMonthEnd.plusDays(1)));
	        long jobsThisYear = safeCount(jobPostRepository.countApprovedJobsByCreatedAtBetween(yearStart, yearEnd.plusDays(1)));
	        long jobsPrevYear = safeCount(jobPostRepository.countApprovedJobsByCreatedAtBetween(prevYearStart, prevYearEnd.plusDays(1)));
	        // Công ty
	        long companiesThisMonth = safeCount(companyRepository.countNewCompaniesByDateBetween(monthStart, monthEnd.plusDays(1)));
	        long companiesPrevMonth = safeCount(companyRepository.countNewCompaniesByDateBetween(prevMonthStart, prevMonthEnd.plusDays(1)));
	        long companiesThisYear = safeCount(companyRepository.countNewCompaniesByDateBetween(yearStart, yearEnd.plusDays(1)));
	        long companiesPrevYear = safeCount(companyRepository.countNewCompaniesByDateBetween(prevYearStart, prevYearEnd.plusDays(1)));

	        double usersMonthGrowth = usersPrevMonth == 0 ? 0.0 : (double)(usersThisMonth - usersPrevMonth) / usersPrevMonth * 100;
	        double usersYearGrowth = usersPrevYear == 0 ? 0.0 : (double)(usersThisYear - usersPrevYear) / usersPrevYear * 100;
	        double jobsMonthGrowth = jobsPrevMonth == 0 ? 0.0 : (double)(jobsThisMonth - jobsPrevMonth) / jobsPrevMonth * 100;
	        double jobsYearGrowth = jobsPrevYear == 0 ? 0.0 : (double)(jobsThisYear - jobsPrevYear) / jobsPrevYear * 100;
	        double companiesMonthGrowth = companiesPrevMonth == 0 ? 0.0 : (double)(companiesThisMonth - companiesPrevMonth) / companiesPrevMonth * 100;
	        double companiesYearGrowth = companiesPrevYear == 0 ? 0.0 : (double)(companiesThisYear - companiesPrevYear) / companiesPrevYear * 100;

	        Map<String, Object> result = new HashMap<>();
	        result.put("users", Map.of(
	            "currentMonth", usersThisMonth,
	            "previousMonth", usersPrevMonth,
	            "currentYear", usersThisYear,
	            "previousYear", usersPrevYear,
	            "monthGrowth", usersMonthGrowth,
	            "yearGrowth", usersYearGrowth
	        ));
	        result.put("jobs", Map.of(
	            "currentMonth", jobsThisMonth,
	            "previousMonth", jobsPrevMonth,
	            "currentYear", jobsThisYear,
	            "previousYear", jobsPrevYear,
	            "monthGrowth", jobsMonthGrowth,
	            "yearGrowth", jobsYearGrowth
	        ));
	        result.put("companies", Map.of(
	            "currentMonth", companiesThisMonth,
	            "previousMonth", companiesPrevMonth,
	            "currentYear", companiesThisYear,
	            "previousYear", companiesPrevYear,
	            "monthGrowth", companiesMonthGrowth,
	            "yearGrowth", companiesYearGrowth
	        ));
	        return ResponseEntity.ok(result);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching summary stats: " + e.getMessage());
	    }
	}

	private long safeCount(Long value) {
	    return value == null ? 0L : value;
	}
	
}
