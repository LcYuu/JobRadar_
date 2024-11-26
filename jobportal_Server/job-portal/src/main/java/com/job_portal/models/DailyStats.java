package com.job_portal.models;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {
    private LocalDate date;
    private long newUsers;
    private long newJobs;
} 