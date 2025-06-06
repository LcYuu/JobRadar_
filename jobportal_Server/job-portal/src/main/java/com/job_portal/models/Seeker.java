package com.job_portal.models;

import java.time.LocalDate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seeker_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seeker {
    @Id
    @Column(name = "user_id", columnDefinition = "BINARY(16)")
    private UUID userId;

    @Column(name = "address", length = 100)
    private String address;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "seeker_industries",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "industry_id")
    )
    private List<Industry> industry = new ArrayList<>();
    
    @Column(name = "gender", length = 100)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "phone_number", length = 10)
    private String phoneNumber;

    @Column(name = "description", columnDefinition = "TEXT")
	private String description;

    @Column(name = "email_contact", length = 50)
    private String emailContact;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private UserAccount userAccount;
    
    @ManyToMany(mappedBy = "follows")
    private List<Company> followedCompanies = new ArrayList<>();
    
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "seeker_profile_skills",
        joinColumns = @JoinColumn(name = "seeker_user_id"), 
        inverseJoinColumns = @JoinColumn(name = "skills_skill_id") 
    )
    private List<Skills> skills = new ArrayList<>();
    private boolean isSubcription  = false;
	@ManyToMany
	@JoinTable(
			name="saved_jobs",
			joinColumns = @JoinColumn(name="seeker_id"),
			inverseJoinColumns = @JoinColumn(name="post_id")
			)
	private Set<JobPost> savedJobs=new HashSet<>();

}
