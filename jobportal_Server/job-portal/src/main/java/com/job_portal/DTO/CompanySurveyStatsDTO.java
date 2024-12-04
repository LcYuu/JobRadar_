package com.job_portal.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanySurveyStatsDTO {
    private UUID companyId;
    private String companyName;
    private int totalSurveys;
    private int completedSurveys;
    private int totalHired;
    private LocalDateTime lastSubmitted;
}
