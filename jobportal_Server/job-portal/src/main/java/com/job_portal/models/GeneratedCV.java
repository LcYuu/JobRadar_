package com.job_portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_cv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedCV {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "generated_cv_id")
    private Integer generatedCvId;
    
    @Column(name = "cv_name", nullable = false)
    private String cvName;
    
    @Column(name = "cv_content", columnDefinition = "TEXT")
    private String cvContent;
    
    @Column(name = "create_time", nullable = false)
    private LocalDateTime createTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private Seeker seeker;
}
