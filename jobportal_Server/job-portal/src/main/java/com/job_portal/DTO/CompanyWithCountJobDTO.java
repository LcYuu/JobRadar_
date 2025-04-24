package com.job_portal.DTO;

import java.util.List;

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
    private List<Integer> industryIds; // chỉ lấy id
    private String description;
    private Integer cityId;
    private Long countJob;
}
