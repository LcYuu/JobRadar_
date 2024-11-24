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

    @Autowired
    public TaxCodeValidation(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean checkTaxCode(String taxCode) {
        String apiUrl = "https://api.vietqr.io/v2/business/" + taxCode;

        try {
            // Gửi yêu cầu GET tới API VietQR
            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.GET, null, Map.class);

            // Kiểm tra mã trả về từ API, nếu "code" là "00" thì mã số thuế hợp lệ
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && "00".equals(responseBody.get("code"))) {
                return true; // Mã số thuế hợp lệ
            }
        } catch (HttpClientErrorException.NotFound e) {
            // Nếu mã số thuế không tồn tại
            return false;
        } catch (Exception e) {
            // Nếu có lỗi khác trong quá trình gọi API
            e.printStackTrace();
        }

        return false; // Mã số thuế không hợp lệ hoặc có lỗi
    }

}
