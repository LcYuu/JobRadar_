package com.job_portal.DTO;

import java.time.LocalDate;

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
    private String companyName;
    private Long applicationCount;
    private Integer industryId;
    private Integer cityId;
    private String address;
    private String description;
    private String logo;
    private String contact;
    private String email;
    private LocalDate establishedDate;
    private String taxCode;
}
