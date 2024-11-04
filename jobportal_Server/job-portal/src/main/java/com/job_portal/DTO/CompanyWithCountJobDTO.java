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
public class CompanyWithCountJobDTO {
	private UUID companyId;
	private String companyName;
	private String logo;
	private Integer industryId;
	private String description;
	private String industryName;
	private Integer cityId;
	private Long countJob;
}
