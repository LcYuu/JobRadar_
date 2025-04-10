package com.job_portal.projection;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public interface ApplicantProfileProjection {
	UUID getPostId();

	UUID getUserId();

	String getAddress();

	LocalDate getDateOfBirth();

	String getDescription();

	String getEmailContact();

	String getGender();

	String getPhoneNumber();

	LocalDateTime getApplyDate();

	String getPathCV();

	String getFullName();

	UUID getCompanyId();

	String getAvatar();

	String getTypeOfWork();

	String getTitle();

	String getIndustryName(); // 🔹 Dữ liệu trả về dạng "IT, Finance, Marketing"
}
