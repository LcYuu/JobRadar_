
package com.job_portal.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class CompanyDTO {
    private UUID companyId;
    private String companyName;
    private Long applicationCount;
    private List<Integer> industryIds;
    private Integer cityId;
    private String address;
    private String description;
    private String logo;
    private String contact;
    private String email;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate establishedTime;
    private String taxCode;
    private Double averageStar;

    // Constructor với tất cả tham số
    public CompanyDTO(UUID companyId, String companyName, Long applicationCount, List<Integer> industryIds,
                     Integer cityId, String address, String description, String logo, String contact,
                     String email, LocalDate establishedTime, String taxCode, Double averageStar) {
        this.companyId = companyId;
        this.companyName = companyName;
        this.applicationCount = applicationCount;
        this.industryIds = industryIds;
        this.cityId = cityId;
        this.address = address;
        this.description = description;
        this.logo = logo;
        this.contact = contact;	
        this.email = email;
        this.establishedTime = establishedTime;
        this.taxCode = taxCode;
        this.averageStar = averageStar != null ? averageStar : 0.0; 
    }
}
