package com.job_portal.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class TaxCodeValidation {
	private final RestTemplate restTemplate;

    public TaxCodeValidation(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean checkTaxCode(String taxCode) {
        String apiUrl = "https://api.vietqr.io/v2/business/" + taxCode;

        try {
            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.GET, null, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && "00".equals(responseBody.get("code"))) {
                return true; // Mã số thuế hợp lệ
            }
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false; 
    }

}
