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
public class BlockCompanyDTO {

	private UUID companyId;
	private boolean isBlocked;
	private String blockedReason;
	private LocalDateTime blockedUntil;
}
