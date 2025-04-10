package com.job_portal.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    public void sendUpdate(String destination, String action) {
    	System.out.println("Sending to " + destination + ": " + action);
        messagingTemplate.convertAndSend(destination, action); // Gửi trực tiếp chuỗi action
    }
}
