package com.job_portal.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

public class JobRecommendationDTO {
	private UUID postId;
    private String title;
    private String description;
    private String location;
    private Long salary;
    private String experience;
    private String typeOfWork;
    private LocalDateTime createDate;
    private LocalDateTime expireDate;
    private UUID companyId;
    private String companyName;
    private String cityName;
    private List<String> industryNames;
    private String logo;
    private Double averageStar;

    public JobRecommendationDTO(UUID postId, String title, String description, String location, Long salary,
                               String experience, String typeOfWork, LocalDateTime createDate, LocalDateTime expireDate,
                               UUID companyId, String companyName, String cityName, List<String> industryNames, String logo,
                               Double averageStar) {
        this.postId = postId;
        this.title = title;
        this.description = description;
        this.location = location;
        this.salary = salary;
        this.experience = experience;
        this.typeOfWork = typeOfWork;
        this.createDate = createDate;
        this.expireDate = expireDate;
        this.companyId = companyId;
        this.companyName = companyName;
        this.cityName = cityName;
        this.industryNames = industryNames;
        this.logo = logo;
        this.averageStar = averageStar != null ? averageStar : 0.0;
    }
}
