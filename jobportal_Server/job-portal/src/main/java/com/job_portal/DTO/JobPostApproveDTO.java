package com.job_portal.DTO;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class JobPostApproveDTO {
	private UUID postId;
    private String title;
    private String companyName;
    private String cityName;
    private List<Integer> industryIds;
    private List<String> industryNames; // Thêm để lưu danh sách tên ngành
    private String typeOfWork;
    private String companyLogo;
    private Double averageStar;

    public JobPostApproveDTO(UUID postId, String title, String companyName, String cityName,
                            String industryIds, String industryNames, String typeOfWork, 
                            String companyLogo, Double averageStar) {
        this.postId = postId;
        this.title = title;
        this.companyName = companyName;
        this.cityName = cityName;
        this.industryIds = industryIds != null && !industryIds.isEmpty() ?
                Arrays.stream(industryIds.split(","))
                        .map(Integer::parseInt)
                        .collect(Collectors.toList()) :
                new ArrayList<>();
        this.industryNames = industryNames != null && !industryNames.isEmpty() ?
                Arrays.stream(industryNames.split(","))
                        .collect(Collectors.toList()) :
                new ArrayList<>();
        this.typeOfWork = typeOfWork;
        this.companyLogo = companyLogo;
        this.averageStar = averageStar != null ? averageStar : 0.0;
    }
}
