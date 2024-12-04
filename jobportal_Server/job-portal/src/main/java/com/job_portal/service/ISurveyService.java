package com.job_portal.service;

import com.job_portal.DTO.SurveyDTO;
import com.job_portal.DTO.SurveyStatisticsDTO;
import com.job_portal.models.JobPost;
import com.job_portal.models.Survey;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ISurveyService {
    void checkAndSendSurveys();
    void sendSurveyEmail(JobPost job);
    String createEmailContent(JobPost job, String surveyId);
    List<Survey> getSurveysByJobPost(JobPost jobPost);
    Survey submitSurvey(String surveyId, SurveyDTO surveyDTO);
    
    SurveyStatisticsDTO getSurveyStatistics();
    Page<Survey> getAllSurveys(Pageable pageable);
    Page<Survey> getSurveysByStatus(String status, Pageable pageable);
    List<Survey> getSurveysByDateRange(LocalDateTime startDate, LocalDateTime endDate);

}