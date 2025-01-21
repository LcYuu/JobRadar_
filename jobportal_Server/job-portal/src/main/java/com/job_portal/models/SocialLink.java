package com.job_portal.models;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.job_portal.enums.SocialPlatform;
import com.job_portal.enums.UserType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "social_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SocialLink {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
    @Column(name = "user_id", columnDefinition = "BINARY(16)")
    private UUID userId; 
 
    @Enumerated(EnumType.STRING)
    private SocialPlatform platform;

    private String url;

    @Enumerated(EnumType.STRING)
    private UserType type;


}