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
public class IdSocialLink implements Serializable {
    
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private UUID userId;
    private String socialName;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof IdSocialLink)) return false;
        IdSocialLink that = (IdSocialLink) o;
        return Objects.equals(userId, that.userId) && Objects.equals(socialName, that.socialName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, socialName);
    }
}
