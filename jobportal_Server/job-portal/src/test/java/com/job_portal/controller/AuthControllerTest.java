package com.job_portal.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.UserSignupDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.Industry;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.models.UserType;
import com.job_portal.repository.BlackListTokenRepository;
import com.job_portal.repository.CityRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.ForgotPasswordRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.SeekerRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.repository.UserTypeRepository;
import com.job_portal.service.AccountDetailServiceImpl;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.TaxCodeValidation;
import com.job_portal.utils.EmailUtil;
import com.job_portal.utils.OtpUtil;
import static org.mockito.Mockito.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockBean
	private UserAccountRepository userAccountRepository;

	@MockBean
	private SeekerRepository seekerRepository;

	@MockBean
	private CompanyRepository companyRepository;

	@MockBean
	private UserTypeRepository userTypeRepository;

	@MockBean
	private IndustryRepository industryRepository;

	@MockBean
	private CityRepository cityRepository;

	@MockBean
	private BlackListTokenRepository blackListTokenRepository;

	@MockBean
	private ForgotPasswordRepository forgotPasswordRepository;

	@MockBean
	private PasswordEncoder passwordEncoder;

	@MockBean
	private AccountDetailServiceImpl accountDetailService;

	@MockBean
	private OtpUtil otpUtil;

	@MockBean
	private EmailUtil emailUtil;

	@MockBean
	private JwtProvider jwtProvider;

	@MockBean
	private ICompanyService companyService;

	@MockBean
	private TaxCodeValidation taxCodeValidation;

	private UserAccount userAccount;
	private UserType userType;
	private Company company;
	private Seeker seeker;
	private Industry industry;
	private City city;
	private UserSignupDTO signupDTO;

	@BeforeEach
	void setUp() {
		// Khởi tạo dữ liệu giả lập
		userType = new UserType();
		userType.setUserTypeId(2); // Seeker
		userType.setUser_type_name("Seeker");

		userAccount = new UserAccount();
		userAccount.setUserId(UUID.randomUUID());
		userAccount.setEmail("danggiathuanhl@gmail.com");
		userAccount.setUserName("DangGiaThuan");
		userAccount.setPassword("Danggiathuan@2003");
		userAccount.setActive(false);
		userAccount.setUserType(userType);
		userAccount.setCreateDate(LocalDateTime.now());
		userAccount.setProvider("LOCAL");
		userAccount.setOtp("123456");
		userAccount.setOtpGeneratedTime(LocalDateTime.now());

		signupDTO = new UserSignupDTO();
		signupDTO.setEmail("danggiathuanhl@gmail.com");
		signupDTO.setPassword("Danggiathuan@2003");
		signupDTO.setUserName("DangGiaThuan");
		signupDTO.setUserType(userType);
	}

	@Test
	void testSignup_Success() throws Exception {
	        // Sắp xếp dữ liệu giả lập
	        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.empty());
	        when(userTypeRepository.findById(2)).thenReturn(Optional.of(userType));
	        when(passwordEncoder.encode("Danggiathuan@2003")).thenReturn("encoded-password");
	        when(otpUtil.generateOtp()).thenReturn("123456");
	        doNothing().when(emailUtil).sendOtpEmail(eq("danggiathuanhl@gmail.com"), eq("123456"));
	        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

	        // Gửi yêu cầu POST
	        mockMvc.perform(post("/auth/signup")
	                .contentType(MediaType.APPLICATION_JSON)
	                .content(objectMapper.writeValueAsString(signupDTO)))
	                .andExpect(status().isOk())
	                .andExpect(content().string("Vui lòng check email để nhận mã đăng ký"));

	        // Xác minh tương tác
	        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
	        verify(userTypeRepository).findById(2);
	        verify(passwordEncoder).encode("Danggiathuan@2003");
	        verify(otpUtil).generateOtp();
	        verify(emailUtil).sendOtpEmail("danggiathuanhl@gmail.com", "123456");
	        verify(userAccountRepository).save(any(UserAccount.class));
	    }

	@Test
    void testSignup_EmailExists() throws Exception {
        // Sắp xếp dữ liệu giả lập
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));

        // Gửi yêu cầu POST
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupDTO)))
                .andExpect(status().isConflict())
                .andExpect(content().string("Email này đã được sử dụng ở tài khoản khác"));

        // Xác minh tương tác
        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(userTypeRepository, never()).findById(anyInt());
        verify(passwordEncoder, never()).encode(anyString());
        verify(otpUtil, never()).generateOtp();
        verify(emailUtil, never()).sendOtpEmail(anyString(), anyString());
        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }
}
