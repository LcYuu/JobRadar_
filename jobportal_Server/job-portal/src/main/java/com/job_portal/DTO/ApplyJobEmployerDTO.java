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
@AllArgsConstructor
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
}
