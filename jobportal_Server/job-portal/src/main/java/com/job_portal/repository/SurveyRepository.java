package com.job_portal.repository;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.job_portal.models.JobPost;
import com.job_portal.models.Survey;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, String> {
    List<Survey> findByJobPostAndEmailSentFalse(JobPost jobPost);
    
    int countBySurveyStatus(String status);
    
    @Query("SELECT COALESCE(AVG(s.hiredCount), 0) FROM Survey s WHERE s.surveyStatus = 'COMPLETED'")
    double calculateAverageHiredCount();
    
    List<Survey> findTop10BySurveyStatusOrderByCreatedAtDesc(String status);
    
    Page<Survey> findBySurveyStatus(String status, Pageable pageable);
    
    @Override
    Page<Survey> findAll(Pageable pageable);
    
    @Query("SELECT s FROM Survey s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    List<Survey> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT s.candidateQuality, COUNT(s) FROM Survey s " +
           "WHERE s.surveyStatus = 'COMPLETED' GROUP BY s.candidateQuality")
    List<Object[]> getCandidateQualityStats();
    
    @Query("SELECT COALESCE(SUM(s.hiredCount), 0) FROM Survey s WHERE s.surveyStatus = 'COMPLETED'")
    int getTotalHiredCandidates();
}
