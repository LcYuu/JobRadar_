package com.job_portal.DTO;

import java.time.LocalDate;
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
public class ApplicantProfileDTO {
	private UUID postId;
	private UUID userId;
	private String address;
	private LocalDate dateOfBirth;
	private String description;
	private String emailContact;
	private String gender;
	private String phoneNumber;
	private LocalDateTime applyDate;
	private String pathCV;
	private String fullName;
	private UUID companyId;
	private String avatar;
	private String typeOfWork;
	private String title;
	private String industryName;
}
