package com.job_portal.projection;

import java.util.UUID;

public interface CompanyProjection {
	UUID getCompanyId();

	String getCompanyName();

	Long getApplicationCount();

	String getIndustryIds(); 

	Integer getCityId();

	String getAddress();

	String getDescription();

	String getLogo();

	String getContact();

	String getEmail();

	java.sql.Date getEstablishedTime();

	String getTaxCode();
}
