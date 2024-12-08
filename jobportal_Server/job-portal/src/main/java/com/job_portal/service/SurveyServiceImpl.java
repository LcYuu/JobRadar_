package com.job_portal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.CompanySurveyStatsDTO;
import com.job_portal.DTO.SurveyDTO;
import com.job_portal.DTO.SurveyFeedbackDTO;
import com.job_portal.DTO.SurveyStatisticsDTO;
import com.job_portal.models.Company;
import com.job_portal.models.JobPost;
import com.job_portal.models.Survey;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.SurveyRepository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.UUID;

@Service
public class SurveyServiceImpl implements ISurveyService {
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private JobPostRepository jobPostRepository;
    
    @Autowired
    private JavaMailSender mailSender;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    @Scheduled(cron = "0 0 0 * * *")
    public void checkAndSendSurveys() {
    	LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        
        List<JobPost> expiredJobs = jobPostRepository.findByExpireDateBeforeAndSurveyEmailSentFalse(oneMinuteAgo);
        
        for (JobPost job : expiredJobs) {
            try {
                sendSurveyEmail(job);
                job.setSurveyEmailSent(true);
                jobPostRepository.save(job);
            } catch (Exception e) {
                throw new RuntimeException("Error sending survey email for job: " + job.getPostId(), e);
            }
            }

    }

    @Override
    public void sendSurveyEmail(JobPost job) {
        try {
            Survey survey = new Survey();
            
            survey.setJobPost(job);
            survey.setEmailSent(false);
            survey.setSurveyStatus("PENDING");
            survey.setCreatedAt(LocalDateTime.now());
//            survey.setCompanyId(UUID.randomUUID());
            survey = surveyRepository.save(survey);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(job.getCompany().getEmail());
            message.setSubject("Khảo sát tuyển dụng - " + job.getTitle());
            message.setText(createEmailContent(job, survey.getId()));

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + job.getCompany().getEmail());
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }

    @Override
    public String createEmailContent(JobPost job, String surveyId) {
        return String.format("""
            Xin chào %s,
            
            Cảm ơn bạn đã sử dụng JobRadar cho việc tuyển dụng "%s".
            
            Để giúp chúng tôi cải thiện dịch vụ, vui lòng hoàn thành khảo sát tại:
            %s/survey/%s
            
            Trân trọng,
            JobRadar Team
            """,
            job.getCompany().getCompanyName(),
            job.getTitle(),
            frontendUrl,
            surveyId
        );
    }

    @Override
    public List<Survey> getSurveysByJobPost(JobPost jobPost) {
        return surveyRepository.findByJobPostAndEmailSentFalse(jobPost);
    }

    // Add method to handle survey submission
    public Survey submitSurvey(String surveyId, SurveyDTO surveyDTO) {
        Optional<Survey> existingSurvey = surveyRepository.findById(surveyId);
        if (existingSurvey.isPresent()) {
            Survey survey = existingSurvey.get();
            survey.setHiredCount(surveyDTO.getHiredCount());
            survey.setCandidateQuality(surveyDTO.getCandidateQuality());
            survey.setFeedback(surveyDTO.getFeedback());
            survey.setSurveyStatus("COMPLETED");
            survey.setSubmittedAt(LocalDateTime.now());
            return surveyRepository.save(survey);
        }
        throw new RuntimeException("Survey not found");
    }

    @Override
    public SurveyStatisticsDTO getSurveyStatistics() {
        SurveyStatisticsDTO stats = new SurveyStatisticsDTO();
        
        // Tính toán thống kê cơ bản
        List<Survey> allSurveys = surveyRepository.findAll();
        stats.setTotalSurveys(allSurveys.size());
        
        long completedCount = allSurveys.stream()
            .filter(s -> "COMPLETED".equals(s.getSurveyStatus()))
            .count();
        stats.setCompletedSurveys((int) completedCount);
        stats.setPendingSurveys(stats.getTotalSurveys() - stats.getCompletedSurveys());
        
        // Tính trung bình số lượng tuyển dụng
        double avgHired = allSurveys.stream()
            .filter(s -> "COMPLETED".equals(s.getSurveyStatus()))
            .mapToInt(Survey::getHiredCount)
            .average()
            .orElse(0.0);
        stats.setAverageHiredCount(avgHired);
        
        // Thống kê theo công ty
        List<CompanySurveyStatsDTO> companyStats = getCompanyStats(allSurveys);
        stats.setCompanySurveys(companyStats);
        
        // Phân bố đánh giá chất lượng
        Map<Integer, Integer> qualityDist = getQualityDistribution(allSurveys);
        stats.setCandidateQualityDistribution(qualityDist);
        
        // Feedback gần đây
        List<SurveyFeedbackDTO> recentFeedback = getRecentFeedback(allSurveys);
        stats.setRecentFeedback(recentFeedback);
        
        return stats;
    }

    private List<CompanySurveyStatsDTO> getCompanyStats(List<Survey> allSurveys) {
        return allSurveys.stream()
            .filter(survey -> survey != null 
                && survey.getJobPost() != null 
                && survey.getJobPost().getCompany() != null)
            .collect(Collectors.groupingBy(survey -> survey.getJobPost().getCompany()))
            .entrySet().stream()
            .map(entry -> {
                CompanySurveyStatsDTO dto = new CompanySurveyStatsDTO();
                Company company = entry.getKey();
                List<Survey> companySurveys = entry.getValue();
                
                dto.setCompanyId(company.getCompanyId());
                dto.setCompanyName(company.getCompanyName());
                dto.setTotalSurveys(companySurveys.size());
                
                // Xử lý an toàn cho completed surveys
                dto.setCompletedSurveys((int) companySurveys.stream()
                    .filter(s -> s != null && "COMPLETED".equals(s.getSurveyStatus()))
                    .count());
                
                // Xử lý an toàn cho total hired
                dto.setTotalHired(companySurveys.stream()
                    .filter(s -> s != null && s.getHiredCount() != null)
                    .mapToInt(Survey::getHiredCount)
                    .sum());
                
                // Xử lý an toàn cho last submitted
                companySurveys.stream()
                    .filter(s -> s != null && s.getCreatedAt() != null)
                    .max(Comparator.comparing(Survey::getCreatedAt))
                    .ifPresent(latest -> dto.setLastSubmitted(latest.getCreatedAt()));
                
                return dto;
            })
            .collect(Collectors.toList());
    }

    private Map<Integer, Integer> getQualityDistribution(List<Survey> surveys) {
        return surveys.stream()
            .filter(s -> "COMPLETED".equals(s.getSurveyStatus()))
            .collect(Collectors.groupingBy(
                Survey::getCandidateQuality,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
    }

    private List<SurveyFeedbackDTO> getRecentFeedback(List<Survey> surveys) {
        return surveys.stream()
            .filter(s -> "COMPLETED".equals(s.getSurveyStatus()) 
                && s.getFeedback() != null 
                && s.getCreatedAt() != null
                && s.getSubmittedAt() != null
                && !s.getFeedback().isEmpty())
            .sorted((s1, s2) -> {
                Duration d1 = Duration.between(s1.getCreatedAt(), s1.getSubmittedAt());
                Duration d2 = Duration.between(s2.getCreatedAt(), s2.getSubmittedAt());
                // Sắp xếp theo thời gian phản hồi nhanh nhất
                return d1.compareTo(d2);
            })
            .limit(5)
            .map(survey -> {
                SurveyFeedbackDTO dto = new SurveyFeedbackDTO();
                dto.setCompanyName(survey.getJobPost().getCompany().getCompanyName());
                dto.setJobTitle(survey.getJobPost().getTitle());
                dto.setFeedback(survey.getFeedback());
                dto.setCandidateQuality(survey.getCandidateQuality());
                dto.setSubmittedAt(survey.getSubmittedAt());
                dto.setSentAt(survey.getCreatedAt());
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Override
    public Page<Survey> getAllSurveys(Pageable pageable) {
        return surveyRepository.findAll(pageable);
    }

    @Override
    public Page<Survey> getSurveysByStatus(String status, Pageable pageable) {
        return surveyRepository.findBySurveyStatus(status, pageable);
    }

    @Override
    public List<Survey> getSurveysByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return surveyRepository.findByDateRange(startDate, endDate);
    }

    public void createNewSurvey(JobPost job) {
        // Generate a new UUID for companyId
        UUID companyId = UUID.randomUUID();

        // Assuming you have a method to create a survey
        Survey survey = new Survey();
//        survey.setCompanyId(companyId); // Set the newly generated companyId
        survey.setEmailSent(false);
        survey.setSurveyStatus("PENDING");
        survey.setCreatedAt(LocalDateTime.now());
        survey.setSubmittedAt(LocalDateTime.now());;
        survey = surveyRepository.save(survey);

        // Send email logic...
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(job.getCompany().getEmail());
        message.setSubject("Khảo sát tuyển dụng - " + job.getTitle());
        message.setText(createEmailContent(job, survey.getId()));

        mailSender.send(message);
        System.out.println("Email sent successfully to: " + job.getCompany().getEmail());
    }

}
