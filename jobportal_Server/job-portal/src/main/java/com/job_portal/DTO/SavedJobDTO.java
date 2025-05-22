package com.job_portal.DTO;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedJobDTO {

	private UUID postId;
	private String title;
	private String companyName;
	private String logo;
	
}
