package com.job_portal.projection;

import java.time.LocalDateTime;
import java.util.UUID;

public interface JobRecommendationProjection {
	UUID getPostId();

	String getTitle();

	String getDescription();

	String getLocation();

	Long getSalary();

	String getExperience();

	String getTypeOfWork();

	LocalDateTime getCreateDate();

	LocalDateTime getExpireDate();

	UUID getCompanyId();

	String getCompanyName();

	String getCityName();

	String getIndustryNames(); // GROUP_CONCAT trả về String

	String getLogo();
}
