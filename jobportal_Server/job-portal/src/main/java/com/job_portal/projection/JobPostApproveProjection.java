package com.job_portal.projection;

import java.util.UUID;

public interface JobPostApproveProjection {
	UUID getPostId();

	String getTitle();

	String getCompanyName();

	String getCityName();

	String getIndustryIds();

	String getIndustryNames(); // Thêm để lấy danh sách tên ngành

	String getTypeOfWork();

	String getCompanyLogo();

	Double getAverageStar();
}
