package com.job_portal.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyAccountCount {
    private LocalDateTime registrationDate;
    private Long count;

    // Constructor, Getters, and Setters
    public DailyAccountCount(LocalDateTime registrationDate, Long count) {
        this.registrationDate = registrationDate;
        this.count = count;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
