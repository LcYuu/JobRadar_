package com.job_portal.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "review_replies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID replyId;
    
    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;
    
    @Column(nullable = false, length = 1000)
    private String content;
    
    @Column(nullable = false)
    private boolean anonymous;
    
    @Column(nullable = false)
    private LocalDateTime createDate;
    
    // Add parent reply reference for nested replies
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_reply_id")
    private ReviewReply parentReply;
    
    // Add children collection to support hierarchical structure
    @OneToMany(mappedBy = "parentReply", fetch = FetchType.LAZY)
    private List<ReviewReply> childReplies = new ArrayList<>();
} 