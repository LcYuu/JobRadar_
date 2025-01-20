package com.job_portal.models;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IdApplyJob implements Serializable {

	private static final long serialVersionUID = 1L;
	private UUID postId;
    private UUID userId;
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        IdApplyJob applyId = (IdApplyJob) o;

        return Objects.equals(postId, applyId.postId) &&
               Objects.equals(userId, applyId.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, userId);
    }
}