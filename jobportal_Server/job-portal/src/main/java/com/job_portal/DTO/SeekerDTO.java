package com.job_portal.DTO;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SeekerDTO {
	private String address;
    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String description;
    private String emailContact;
    public List<Integer> industryIds;
    private List<Integer> skillIds; // Danh sách ID của Skills

}
