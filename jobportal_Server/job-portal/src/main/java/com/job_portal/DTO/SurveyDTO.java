package com.job_portal.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyDTO {
    private String jobPostId;
    private Integer hiredCount;
    private Integer candidateQuality;
    private String feedback;
    private String surveyStatus;
} 