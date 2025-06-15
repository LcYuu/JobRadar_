package com.job_portal.service;

import java.util.List;
import java.util.UUID;

import com.job_portal.models.Subscription;
import com.social.exceptions.AllExceptions;

public interface ISubscriptionService {
	public boolean createSubscription(Subscription subscription, UUID userId);
	public boolean deleteSubscription(UUID subId) throws AllExceptions;
	public List<Subscription> getAllSubscriptions();
	public boolean updateSubscription(String email, Subscription.EmailFrequency emailFrequency, UUID subId) throws AllExceptions;
	public Subscription findSubBySeekerId(UUID seekerId);
}
