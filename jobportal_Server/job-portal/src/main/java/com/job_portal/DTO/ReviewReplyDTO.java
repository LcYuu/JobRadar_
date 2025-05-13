package com.job_portal.DTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReplyDTO {
    private UUID replyId;
    private UUID reviewId;
    private String content;
    private boolean anonymous;
    private LocalDateTime createDate;
    private String userName;
    private String userAvatar;
    private UUID userId;
    private UUID parentReplyId;
    private List<ReviewReplyDTO> childReplies = new ArrayList<>();
    private String parentUserName;
    private UUID parentUserId;
    private int level = 0;
} 