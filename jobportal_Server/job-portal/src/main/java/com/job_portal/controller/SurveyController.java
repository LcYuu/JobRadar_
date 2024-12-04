package com.job_portal.controller;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.DTO.SurveyDTO;
import com.job_portal.DTO.SurveyStatisticsDTO;
import com.job_portal.models.Survey;
import com.job_portal.service.ISurveyService;

@RestController
@RequestMapping("/surveys")
public class SurveyController {
    @Autowired
    private ISurveyService surveyService;

    @PostMapping("/{surveyId}")
    public ResponseEntity<?> submitSurvey(@PathVariable String surveyId, @RequestBody SurveyDTO surveyDTO) {
        try {
            Survey survey = surveyService.submitSurvey(surveyId, surveyDTO);
            return ResponseEntity.ok(survey);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/trigger-survey-check")
    public ResponseEntity<String> triggerSurveyCheck() {
        surveyService.checkAndSendSurveys(); // Gọi hàm ngay lập tức
        return ResponseEntity.ok("Survey check triggered successfully.");
    }
    @GetMapping("/statistics")
    public ResponseEntity<SurveyStatisticsDTO> getSurveyStatistics() {
        SurveyStatisticsDTO statistics = surveyService.getSurveyStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping
    public ResponseEntity<Page<Survey>> getAllSurveys(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = (Pageable) PageRequest.of(page, size);
        return ResponseEntity.ok(surveyService.getAllSurveys(pageable));
    }
    
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<Survey>> getSurveysByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = (Pageable) PageRequest.of(page, size);
        return ResponseEntity.ok(surveyService.getSurveysByStatus(status, pageable));
    }
    
    @GetMapping("/by-date-range")
    public ResponseEntity<List<Survey>> getSurveysByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(surveyService.getSurveysByDateRange(startDate, endDate));
    }
}
