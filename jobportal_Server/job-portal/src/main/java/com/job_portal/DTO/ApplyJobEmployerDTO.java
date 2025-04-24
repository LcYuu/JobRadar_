package com.job_portal.DTO;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
public class ApplyJobEmployerDTO {
	private UUID postId;
    private UUID userId;
    private Boolean isSave;
    private LocalDateTime applyDate;
    private String pathCV;
    private String fullName;
    private String title;
    private String avatar;
    private Boolean isViewed;
    private Double matchingScore;
    
    public ApplyJobEmployerDTO(UUID postId, UUID userId, Boolean isSave, LocalDateTime applyDate, String pathCV,
            String fullName, String title, String avatar, Boolean isViewed) {
        this.postId = postId;
        this.userId = userId;
        this.isSave = isSave;
        this.applyDate = applyDate;
        this.pathCV = pathCV;
        this.fullName = fullName;
        this.title = title;
        this.avatar = avatar;
        this.isViewed = isViewed;
        this.matchingScore = 0.0;
    }
    
    public ApplyJobEmployerDTO(UUID postId, UUID userId, Boolean isSave, LocalDateTime applyDate, String pathCV,
            String fullName, String title, String avatar, Boolean isViewed, Double matchingScore) {
        this.postId = postId;
        this.userId = userId;
        this.isSave = isSave;
        this.applyDate = applyDate;
        this.pathCV = pathCV;
        this.fullName = fullName;
        this.title = title;
        this.avatar = avatar;
        this.isViewed = isViewed;
        this.matchingScore = matchingScore != null ? matchingScore : 0.0;
    }

}
