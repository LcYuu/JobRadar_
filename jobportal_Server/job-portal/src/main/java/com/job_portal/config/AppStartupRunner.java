package com.job_portal.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import com.job_portal.service.SubscriptionServiceImpl;

@Component
public class AppStartupRunner implements ApplicationListener<ContextRefreshedEvent> {

    @Autowired
    private SubscriptionServiceImpl subscriptionService;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        subscriptionService.rescheduleAllSubscriptions();
    }

}
