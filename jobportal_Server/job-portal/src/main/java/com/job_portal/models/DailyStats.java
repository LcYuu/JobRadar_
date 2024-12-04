package com.job_portal.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {
    private LocalDateTime date;
    private long newUsers;
    private long newJobs;
} 