package com.job_portal.DTO;

import com.job_portal.models.Company;
import com.job_portal.models.UserType;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserSignupDTO {
    private String userName;
    private String email;
    private String password;
    private UserType userType;
    private String provider;
    private Company company;

}