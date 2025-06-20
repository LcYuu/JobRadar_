package com.job_portal.models;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscription")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "subscription_id")
    private UUID subscriptionId;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Seeker seeker;
    
    @Column(name = "email", nullable = false) 
    private String email;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "last_send_at") 
    private LocalDateTime lastSentAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "email_frequency", nullable = false)
    private EmailFrequency emailFrequency;
    
    public enum EmailFrequency {
        THREE_DAYS,
        SEVEN_DAYS,
        TWO_WEEKS,
        ONE_MONTH,
        TWO_MONTHS
    }
}