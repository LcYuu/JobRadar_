package com.job_portal.projection;

import java.time.LocalDateTime;
import java.util.UUID;

public interface JobWithApplicationCountProjection {
	UUID getPostId();
    String getTitle();
    String getDescription();
    String getLocation();
    Long getSalary();
    String getExperience();
    String getTypeOfWork();
    LocalDateTime getCreateDate();
    LocalDateTime getExpireDate();
    Long getApplicationCount();
    String getStatus();
    boolean getIsApprove();
    String getIndustryNames();
}
