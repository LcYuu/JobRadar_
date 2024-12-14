package com.job_portal.config;

import java.util.Arrays;
import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class AppConfig {

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		http
	        .headers()
	        .addHeaderWriter((request, response) -> {
	            response.addHeader("Cross-Origin-Opener-Policy", "same-origin"); // Cho phép tương tác với cùng nguồn gốc
	            response.addHeader("Cross-Origin-Embedder-Policy", "require-corp"); // Yêu cầu nguồn tài nguyên từ các nguồn gốc hợp lệ
	        });

		http.authorizeHttpRequests(
				Authorize -> Authorize.requestMatchers("/api/**").authenticated().anyRequest().permitAll())
				.addFilterBefore(new JwtValidator(), BasicAuthenticationFilter.class);

		http.csrf(csrf -> csrf.disable());
		http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

		http.oauth2Login(oauth -> oauth.loginPage("/auth/login") 
				.defaultSuccessUrl("/role-selection", true) 
				.failureUrl("/login?error=true") 
				.permitAll() 
		);
		return http.build();
	}

	private CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration cfg = new CorsConfiguration();

		cfg.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Địa chỉ front-end
		cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")); // Các phương thức HTTP cho
																							// phép
		cfg.setAllowCredentials(true); // Cho phép cookie
		cfg.setAllowedHeaders(Collections.singletonList("*")); // Tất cả các header
		cfg.setExposedHeaders(Arrays.asList("Authorization")); // Header được phép xuất hiện trong response
		cfg.setMaxAge(3600L); // Thời gian cache cho cấu hình CORS

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", cfg); // Áp dụng cho tất cả các endpoint
		return source;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();

	}
}