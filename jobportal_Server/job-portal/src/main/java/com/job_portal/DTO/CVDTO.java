package com.job_portal.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CVDTO {
	private UUID userId;
	private Boolean isMain;
    private String cvName;
	private String pathCV;
	private LocalDateTime createTime;
}
