package com.job_portal.DTO;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CandidateWithScoreDTO {

        private UUID userId;
        private UUID postId;
        private String fullName;
        private String avatar;
        private String pathCV;
        private boolean isSave;
        private LocalDateTime applyDate;
        private String title;
        private Double matchingScore;
        // Thêm getters/setters

}
