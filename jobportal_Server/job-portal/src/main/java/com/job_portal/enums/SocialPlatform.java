package com.job_portal.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SocialPlatform {
	FACEBOOK("FACEBOOK"),
    X("X"),
    LINKEDIN("LINKEDIN"),
    INSTAGRAM("INSTAGRAM"),
    YOUTUBE("YOUTUBE"),
    GITHUB("GITHUB");

    private final String displayName;

    SocialPlatform(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
