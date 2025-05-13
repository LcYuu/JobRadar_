package com.job_portal.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.config.JwtProvider;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.ApplyJobRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IJobPostService;

@RestController
@RequestMapping("/job-stats")
public class JobStatsController {

    @Autowired
    private JobPostRepository jobPostRepository;
    
    @Autowired
    private ApplyJobRepository applyJobRepository;
    
    @Autowired
    private UserAccountRepository userAccountRepository;
    
    @Autowired
    private IJobPostService jobPostService;
    
    @GetMapping("/view-stats")
    public ResponseEntity<?> getViewStats(@RequestHeader("Authorization") String jwt) {
        try {
            // Xác thực người dùng là employer
            String email = JwtProvider.getEmailFromJwtToken(jwt);
            Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không tồn tại");
            }
            
            UserAccount user = userOpt.get();
            
            // Kiểm tra user có phải là employer
            if (!user.getUserType().getUser_type_name().equals("Employer")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền truy cập tính năng này");
            }
            
            Company company = user.getCompany();
            UUID companyId = company.getCompanyId();
            
            // Lấy danh sách bài đăng của công ty
            List<JobPost> jobPosts = jobPostService.findAllJobsByCompany(companyId);
            
            // Tạo đối tượng kết quả
            Map<String, Object> viewStats = new HashMap<>();
            
            // Thêm danh sách bài đăng với thông tin lượt xem mới
            List<Map<String, Object>> jobViewDetails = new ArrayList<>();
            int totalNewViews = 0;
            
            for (JobPost job : jobPosts) {
                Map<String, Object> jobDetail = new HashMap<>();
                jobDetail.put("jobId", job.getPostId());
                jobDetail.put("title", job.getTitle());
                jobDetail.put("createDate", job.getCreateDate());
                
                // Sử dụng viewCount thay vì đếm từ bảng job_post_views
                int viewCount = job.getViewCount();
                totalNewViews += viewCount;
                
                jobDetail.put("viewCount", viewCount);
                
                // Lấy số lượt apply
                long applicationCount = applyJobRepository.countByPostId(job.getPostId());
                jobDetail.put("applicationCount", applicationCount);
                
                // Tính tỉ lệ chuyển đổi dựa trên lượt xem
                double conversionRate = viewCount > 0 ? 
                        (double) applicationCount / viewCount * 100 : 0;
                jobDetail.put("conversionRate", Math.round(conversionRate * 100.0) / 100.0);
                
                jobViewDetails.add(jobDetail);
            }
            
            int totalJobs = jobPosts.size();
            double avgViewsPerJob = totalJobs > 0 ? (double) totalNewViews / totalJobs : 0;
            
            viewStats.put("totalViews", totalNewViews);
            viewStats.put("totalJobs", totalJobs);
            viewStats.put("avgViewsPerJob", avgViewsPerJob);
            viewStats.put("jobViewDetails", jobViewDetails);
            
            return ResponseEntity.ok(viewStats);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/job-performance")
    public ResponseEntity<?> getJobPerformance(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            // Xác thực người dùng là employer
            String email = JwtProvider.getEmailFromJwtToken(jwt);
            Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không tồn tại");
            }
            
            UserAccount user = userOpt.get();
            
            // Kiểm tra user có phải là employer
            if (!user.getUserType().getUser_type_name().equals("Employer")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền truy cập tính năng này");
            }
            
            Company company = user.getCompany();
            UUID companyId = company.getCompanyId();
            
            // Lấy danh sách bài đăng tuyển dụng của công ty
            List<JobPost> jobPosts = jobPostService.findAllJobsByCompany(companyId);
            
            List<Map<String, Object>> jobPerformanceList = new ArrayList<>();
            
            for (JobPost jobPost : jobPosts) {
                Map<String, Object> jobPerformance = new HashMap<>();
                
                // Lấy thông tin cơ bản về bài đăng
                jobPerformance.put("jobId", jobPost.getPostId());
                jobPerformance.put("jobTitle", jobPost.getTitle());
                jobPerformance.put("createDate", jobPost.getCreateDate());
                jobPerformance.put("expireDate", jobPost.getExpireDate());
                
                // Sử dụng viewCount thay vì đếm từ bảng job_post_views
                int viewCount = jobPost.getViewCount();
                jobPerformance.put("viewCount", viewCount);
                
                // Lấy số lượt apply
                long applicationCount = applyJobRepository.countByPostId(jobPost.getPostId());
                jobPerformance.put("applicationCount", applicationCount);
                
                // Tính tỉ lệ chuyển đổi dựa trên lượt xem
                double conversionRate = 0;
                if (viewCount > 0) {
                    conversionRate = (double) applicationCount / viewCount * 100;
                }
                jobPerformance.put("conversionRate", Math.round(conversionRate * 100.0) / 100.0);
                
                jobPerformanceList.add(jobPerformance);
            }
            
            return ResponseEntity.ok(jobPerformanceList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/best-performing-jobs")
    public ResponseEntity<?> getBestPerformingJobs(@RequestHeader("Authorization") String jwt) {
        try {
            // Xác thực người dùng là employer
            String email = JwtProvider.getEmailFromJwtToken(jwt);
            Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
            
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không tồn tại");
            }
            
            UserAccount user = userOpt.get();
            
            // Kiểm tra user có phải là employer
            if (!user.getUserType().getUser_type_name().equals("Employer")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền truy cập tính năng này");
            }
            
            Company company = user.getCompany();
            UUID companyId = company.getCompanyId();
            
            // Lấy thông tin về bài đăng việc làm có hiệu suất tốt nhất
            List<Map<String, Object>> bestPerformingJobs = jobPostService.getBestPerformingJobs(companyId);
            
            return ResponseEntity.ok(bestPerformingJobs);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi: " + e.getMessage());
        }
    }
    
//    @GetMapping("/job-performance-trend")
//    public ResponseEntity<?> getJobPerformanceTrend(
//            @RequestHeader("Authorization") String jwt,
//            @RequestParam(required = false) String period) {
//            
//        try {
//            // Xác thực người dùng là employer
//            String email = JwtProvider.getEmailFromJwtToken(jwt);
//            Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
//            
//            if (!userOpt.isPresent()) {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không tồn tại");
//            }
//            
//            UserAccount user = userOpt.get();
//            
//            // Kiểm tra user có phải là employer
//            if (!user.getUserType().getUser_type_name().equals("Employer")) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền truy cập tính năng này");
//            }
//            
//            Company company = user.getCompany();
//            UUID companyId = company.getCompanyId();
//            
//            // Lấy dữ liệu xu hướng theo thời gian
//            List<Map<String, Object>> performanceTrend = jobPostService.getJobPerformanceTrend(companyId, period);
//            
//            return ResponseEntity.ok(performanceTrend);
//            
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Đã xảy ra lỗi: " + e.getMessage());
//        }
//    }
} 