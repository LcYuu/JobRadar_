package com.job_portal.enums;

public enum UserType {
	SEEKER("Seeker"),
    EMPLOYER("Employer");

    private final String displayName;

    UserType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
