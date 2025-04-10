package com.job_portal.models;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "industry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Industry {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "industry_id")
    private int industryId;

	@Column(name = "industry_name", length = 100, nullable = false)
    private String industryName;
	
	@ManyToMany(mappedBy = "industry")
	@JsonIgnore
    private List<Company> companies = new ArrayList<>();
	
	@ManyToMany(mappedBy = "industry")
	@JsonIgnore
    private List<Seeker> seekers = new ArrayList<>();
	
	@ManyToMany(mappedBy = "industry")
	@JsonIgnore
	private List<JobPost> jobPosts = new ArrayList<>();

}

