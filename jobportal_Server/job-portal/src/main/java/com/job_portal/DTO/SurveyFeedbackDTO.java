package com.job_portal.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SurveyFeedbackDTO {
    private String companyName;
    private String feedback;
    private LocalDateTime submittedAt;
    private String jobTitle;
    private int candidateQuality;
    private LocalDateTime sentAt;
}
