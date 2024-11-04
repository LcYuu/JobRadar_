package com.job_portal.DTO;

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
public class ApplyJobInProfile {
	private UUID userId;
	private UUID postId;
	private Boolean isSave;
	private LocalDateTime applyDate;
	private String pathCV;
	private Long salary;
	private String location;
	private String title;
	private String companyName;
	private String typeOfWork;
	private String logo;
}
