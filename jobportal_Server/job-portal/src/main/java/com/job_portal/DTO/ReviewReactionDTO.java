package com.job_portal.DTO;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReactionDTO {
    private UUID reviewId;
    private String reactionType; 
    private long likeCount;
    private long dislikeCount;
    private String userReaction; 

}