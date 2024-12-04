package com.job_portal.DTO;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SurveyStatisticsDTO {
    private int totalSurveys;
    private int completedSurveys;
    private int pendingSurveys;
    private double averageHiredCount;
    private Map<Integer, Integer> candidateQualityDistribution;
    private List<CompanySurveyStatsDTO> companySurveys;
    private List<SurveyFeedbackDTO> recentFeedback;
    // Getters, setters và constructor
}