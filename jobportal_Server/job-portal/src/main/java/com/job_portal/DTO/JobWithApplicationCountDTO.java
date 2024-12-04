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
public class JobWithApplicationCountDTO {
	private UUID postId;
	private String title;
	private String description;
	private String location;
	private Long salary;
	private String experience;
	private String typeOfWork;
	private LocalDateTime createDate;
	private LocalDateTime expireDate;
	private Long applicationCount;
	private String status;
	private String industryName; 
	private boolean isApprove;
}
