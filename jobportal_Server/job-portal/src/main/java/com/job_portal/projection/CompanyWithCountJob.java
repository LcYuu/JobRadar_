package com.job_portal.projection;

import java.util.UUID;

public interface CompanyWithCountJob {

	UUID getCompanyId();

	String getCompanyName();

	String getLogo();

	String getIndustryIds(); 

	String getDescription();

	Integer getCityId();

	Long getCountJob();
}
