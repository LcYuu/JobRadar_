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
public class ReviewDTO {
    private UUID reviewId;
    private UUID companyId;
    private String message;
    private int star;
    private boolean anonymous;
    private LocalDateTime createDate;
} 