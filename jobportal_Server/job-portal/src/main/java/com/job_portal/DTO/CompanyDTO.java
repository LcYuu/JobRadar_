package com.job_portal.DTO;

import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CompanyDTO {
	private UUID companyId;
    private String companyName;
    private Long applicationCount;
    private Integer industryId;
    private Integer cityId;
    private String address;
    private String description;
    private String logo;
    private String contact;
    private String email;
    @JsonFormat(pattern = "yyyy-MM-dd") // Định dạng giống với Postman
    private LocalDate establishedTime;
    private String taxCode;
}
