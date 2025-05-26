package com.job_portal.controller;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.auth0.jwt.JWT;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.BlockCompanyDTO;
import com.job_portal.DTO.LoginDTO;
import com.job_portal.DTO.UserSignupDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.BlackListToken;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.ForgotPassword;
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
import com.job_portal.response.ChangePassword;
import com.job_portal.service.AccountDetailServiceImpl;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.TaxCodeValidation;
import com.job_portal.utils.EmailUtil;
import com.job_portal.utils.OtpUtil;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;


import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.mockito.Mockito.*;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@SpyBean
	private AuthController authController;

	@Autowired
	private ObjectMapper objectMapper;

	@MockBean
	private UserAccountRepository userAccountRepository;

	@MockBean
	private SeekerRepository seekerRepository;

	@MockBean
	private CompanyRepository companyRepository;

	@MockBean
	private AuthenticationManager authenticationManager;

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
	private LoginDTO loginDTO;
	private static final String USER_EMAIL = "danggiathuanhl@gmail.com";

	private String jwtToken;
	private UUID userId;
	private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
	private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

	@BeforeEach
	void setUp() {
		// Initialize mock data
		userType = new UserType();
		userType.setUserTypeId(2);
		userType.setUser_type_name("Seeker");

		UserType employerType = new UserType();
		employerType.setUserTypeId(3);
		employerType.setUser_type_name("Employer");

		industry = new Industry();
		industry.setIndustryId(0);
		industry.setIndustryName("Default Industry");

		city = new City();
		city.setCityId(1);
		city.setCityName("Ha Noi");

		company = new Company();
		company.setTaxCode("1234567890");
		company.setCity(city);
		company.setIndustry(new ArrayList<>());
		// Avoid cyclic reference by not setting userAccount in company
		company.setAddress(", , ");
		company.setIsBlocked(false);

		userAccount = new UserAccount();
		userAccount.setUserId(UUID.randomUUID());
		userAccount.setEmail("danggiathuanhl@gmail.com");
		userAccount.setUserName("DangGiaThuan");
		userAccount.setPassword("Danggiathuan@2003");
		userAccount.setActive(false);
		userAccount.setUserType(employerType);
		userAccount.setCreateDate(LocalDateTime.now());
		userAccount.setProvider("LOCAL");
		userAccount.setOtp("123456");
		userAccount.setOtpGeneratedTime(LocalDateTime.now());
		userAccount.setCompany(company);

		signupDTO = new UserSignupDTO();
		signupDTO.setEmail("danggiathuanhl@gmail.com");
		signupDTO.setPassword("Danggiathuan@2003");
		signupDTO.setUserName("DangGiaThuan");
		signupDTO.setUserType(employerType);

		loginDTO = new LoginDTO();
		loginDTO.setEmail(USER_EMAIL);
		loginDTO.setPassword("Danggiathuan@2003");

		Authentication authentication = Mockito.mock(Authentication.class);
		when(authentication.getName()).thenReturn("danggiathuanhl@gmail.com");
		SecurityContext securityContext = Mockito.mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		long expirationTime = 24 * 60 * 60 * 1000; // 24 tiếng
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expirationTime);
		jwtToken = "Bearer " + Jwts.builder().setIssuer("GiaThuanSenpai").setIssuedAt(now).setExpiration(expiryDate)
				.claim("email", authentication.getName()).signWith(key).compact();

		when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
		when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testSignup_Success() throws Exception {
	    // Sắp xếp dữ liệu giả lập
	    when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.empty());
	    when(userTypeRepository.findById(2)).thenReturn(Optional.of(userType));
	    when(passwordEncoder.encode("Danggiathuan@2003")).thenReturn("encoded-password");
	    when(otpUtil.generateOtp()).thenReturn("123456");
	    doNothing().when(emailUtil).sendOtpEmail(eq("danggiathuanhl@gmail.com"), eq("123456"));
	    when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

	    // Gửi yêu cầu POST với CSRF token
	    mockMvc.perform(post("/auth/signup")
	            .contentType(MediaType.APPLICATION_JSON)
	            .content(objectMapper.writeValueAsString(signupDTO))
	            .with(csrf())) // Add CSRF token
	            .andExpect(status().isOk())
	            .andExpect(content().string("Mã xác nhận đã được gửi đến email của bạn"));

	    // Xác minh tương tác
	    verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
	    verify(passwordEncoder).encode("Danggiathuan@2003");
	    verify(otpUtil).generateOtp();
	    verify(emailUtil).sendOtpEmail("danggiathuanhl@gmail.com", "123456");
	    verify(userAccountRepository).save(any(UserAccount.class));
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testSignup_EmailExists() throws Exception {
	    // Sắp xếp dữ liệu giả lập
	    when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));

	    // Gửi yêu cầu POST với CSRF token
	    mockMvc.perform(post("/auth/signup")
	            .contentType(MediaType.APPLICATION_JSON)
	            .content(objectMapper.writeValueAsString(signupDTO))
	            .with(csrf())) // Add CSRF token
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

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testVerifyEmployer_Success() throws Exception {
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
        when(taxCodeValidation.checkTaxCode("1234567890")).thenReturn(true);
        when(industryRepository.findById(0)).thenReturn(Optional.of(industry));
        when(cityRepository.findById(1)).thenReturn(Optional.of(city));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

        mockMvc.perform(post("/auth/verify-employer") // Adjusted URL
                .param("email", "danggiathuanhl@gmail.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(company))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Xác thực thông tin công ty thành công"));

        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(taxCodeValidation).checkTaxCode("1234567890");
        verify(industryRepository).findById(0);
        verify(cityRepository).findById(1);
        verify(userAccountRepository).save(any(UserAccount.class));
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testVerifyEmployer_InvalidTaxCode() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
        when(taxCodeValidation.checkTaxCode("1234567890")).thenReturn(false);

        // Act
        mockMvc.perform(post("/auth/verify-employer")
                .param("email", "danggiathuanhl@gmail.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(company))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Mã số thuế không hợp lệ hoặc không tồn tại"));

        // Assert
        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(taxCodeValidation).checkTaxCode("1234567890");
        verify(industryRepository, never()).findById(anyInt());
        verify(cityRepository, never()).findById(anyInt());
        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testVerifyAccount_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));
        when(industryRepository.findById(0)).thenReturn(Optional.of(industry));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

        // Act
        mockMvc.perform(put("/auth/verify-account")
                .param("email", "danggiathuanhl@gmail.com")
                .param("otp", "123456")
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Xác thực tài khoản thành công"));

        // Assert
        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(userAccountRepository).save(any(UserAccount.class));
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testVerifyAccount_InvalidOtp() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));

        // Act
        mockMvc.perform(put("/auth/verify-account")
                .param("email", "danggiathuanhl@gmail.com")
                .param("otp", "wrong-otp")
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Mã xác nhận không chính xác"));

        // Assert
        verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
        verify(industryRepository, never()).findById(anyInt());
        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testLogin_Employer_Success() throws Exception {
		// Arrange
		userAccount.setActive(true);
		userAccount.setUserType(new UserType(3, "Employer"));
		userAccount.setCompany(company);
		userAccount.setPassword("encoded-password");
		when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));

		// Giả lập UserDetails cho accountDetailService
		User userDetails = new org.springframework.security.core.userdetails.User(USER_EMAIL, "encoded-password", true,
				true, true, true, Arrays.asList(new SimpleGrantedAuthority("ROLE_EMPLOYER")));
		when(accountDetailService.loadUserByUsername(USER_EMAIL)).thenReturn(userDetails);

		// Giả lập passwordEncoder
		when(passwordEncoder.matches("Danggiathuan@2003", "encoded-password")).thenReturn(true);

		// Giả lập Authentication và SecurityContext
		Authentication authentication = Mockito.mock(Authentication.class);
		when(authentication.getName()).thenReturn(USER_EMAIL);
		SecurityContext securityContext = Mockito.mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		long expirationTime = 24 * 60 * 60 * 1000; // 24 tiếng
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expirationTime);
		jwtToken = Jwts.builder().setIssuer("GiaThuanSenpai").setIssuedAt(now).setExpiration(expiryDate)
				.claim("email", authentication.getName()).signWith(key).compact();

		when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
		when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

		// Act
		mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(loginDTO)).with(csrf())).andDo(print())
				.andExpect(status().isOk())
				.andExpect(content().json("{\"token\":\"" + jwtToken + "\",\"message\":\"Đăng nhập thành công\"}"));

		// Assert
		verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
		verify(accountDetailService).loadUserByUsername("danggiathuanhl@gmail.com");
		verify(passwordEncoder).matches("Danggiathuan@2003", "encoded-password");
		verify(userAccountRepository).save(any(UserAccount.class));
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testLogin_InactiveAccount() throws Exception {
		// Arrange
		userAccount.setActive(false); // Inactive account
		when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userAccount));

		// Act
		mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(loginDTO)).with(csrf())).andDo(print())
				.andExpect(status().isOk()).andExpect(content().json(
						"{\"token\":\"\",\"message\":\"Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản\"}"));

		// Assert
		verify(userAccountRepository).findByEmail("danggiathuanhl@gmail.com");
		verify(userAccountRepository, never()).save(any(UserAccount.class));
	}

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testRegenerateOtp_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(otpUtil.generateOtp()).thenReturn("123456");
        doNothing().when(emailUtil).sendOtpEmail(eq(USER_EMAIL), eq("123456"));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

        // Act
        mockMvc.perform(put("/auth/regenerate-otp")
                .param("email", USER_EMAIL)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Mã xác nhận mới đã được gửi đến email của bạn"));

        // Assert
        verify(userAccountRepository).findByEmail(USER_EMAIL);
        verify(otpUtil).generateOtp();
        verify(emailUtil).sendOtpEmail(USER_EMAIL, "123456");
        verify(userAccountRepository).save(any(UserAccount.class));
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testRegenerateOtp_EmailNotFound() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act
        mockMvc.perform(put("/auth/regenerate-otp")
                .param("email", USER_EMAIL)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().string("Email không tồn tại trong hệ thống"));

        // Assert
        verify(userAccountRepository).findByEmail(USER_EMAIL);
        verify(otpUtil, never()).generateOtp();
        verify(emailUtil, never()).sendOtpEmail(anyString(), anyString());
        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testSignOut_Success() throws Exception {
		// Arrange
		String token = "Bearer valid-token";
		when(jwtProvider.isTokenBlacklisted("valid-token")).thenReturn(false);
		when(blackListTokenRepository.save(any(BlackListToken.class))).thenReturn(new BlackListToken());

		// Act
		mockMvc.perform(post("/auth/signout").header("Authorization", token).with(csrf())).andDo(print())
				.andExpect(status().isOk()).andExpect(content().string("Đăng xuất thành công"));

		// Assert
		verify(jwtProvider).isTokenBlacklisted("valid-token");
		verify(blackListTokenRepository).save(any(BlackListToken.class));
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testSignOut_InvalidToken() throws Exception {
		// Arrange
		String token = "Invalid-token";

		// Act
		mockMvc.perform(post("/auth/signout").header("Authorization", token).with(csrf())).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Token không hợp lệ hoặc không được cung cấp."));

		// Assert
		verify(jwtProvider, never()).isTokenBlacklisted(anyString());
		verify(blackListTokenRepository, never()).save(any(BlackListToken.class));
	}

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testVerifyMail_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(otpUtil.generateOtp()).thenReturn("123456");
        doNothing().when(emailUtil).sendForgotMail(eq(USER_EMAIL), eq("123456"));
        when(forgotPasswordRepository.save(any(ForgotPassword.class))).thenReturn(new ForgotPassword());

        // Act
        mockMvc.perform(post("/auth/forgot-password/verifyMail/" + USER_EMAIL)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().json("{\"message\":\"Mã xác nhận đã được gửi đến email của bạn\"}"));

        // Assert
        verify(userAccountRepository).findByEmail(USER_EMAIL);
        verify(forgotPasswordRepository).deleteByUserAccountEmail(USER_EMAIL);
        verify(otpUtil).generateOtp();
        verify(emailUtil).sendForgotMail(USER_EMAIL, "123456");
        verify(forgotPasswordRepository).save(any(ForgotPassword.class));
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testVerifyMail_EmailNotFound() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act
        mockMvc.perform(post("/auth/forgot-password/verifyMail/" + USER_EMAIL)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().json("{\"error\":\"Email không tồn tại trong hệ thống\"}"));

        // Assert
        verify(userAccountRepository).findByEmail(USER_EMAIL);
        verify(forgotPasswordRepository, never()).deleteByUserAccountEmail(anyString());
        verify(otpUtil, never()).generateOtp();
        verify(emailUtil, never()).sendForgotMail(anyString(), anyString());
        verify(forgotPasswordRepository, never()).save(any(ForgotPassword.class));
    }

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testVerifyOtp_Success() throws Exception {
		// Arrange
		ForgotPassword fp = ForgotPassword.builder().otp("123456").expirationTime(LocalDateTime.now().plusMinutes(5))
				.userAccount(userAccount).build();
		when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
		when(forgotPasswordRepository.findByOtpAndUserAccount("123456", userAccount)).thenReturn(Optional.of(fp));

		// Act
		mockMvc.perform(post("/auth/forgot-password/verifyOtp/" + USER_EMAIL + "/123456").with(csrf())).andDo(print())
				.andExpect(status().isOk()).andExpect(content().string("Xác thực mã thành công"));

		// Assert
		verify(userAccountRepository).findByEmail(USER_EMAIL);
		verify(forgotPasswordRepository).findByOtpAndUserAccount("123456", userAccount);
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testVerifyOtp_ExpiredOtp() throws Exception {
		// Arrange
		ForgotPassword fp = ForgotPassword.builder().otp("123456").expirationTime(LocalDateTime.now().minusMinutes(5))
				.userAccount(userAccount).fpId(1).build();
		when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
		when(forgotPasswordRepository.findByOtpAndUserAccount("123456", userAccount)).thenReturn(Optional.of(fp));

		// Act
		mockMvc.perform(post("/auth/forgot-password/verifyOtp/" + USER_EMAIL + "/123456").with(csrf())).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Mã xác nhận đã hết hạn, vui lòng yêu cầu mã mới"));

		// Assert
		verify(userAccountRepository).findByEmail(USER_EMAIL);
		verify(forgotPasswordRepository).findByOtpAndUserAccount("123456", userAccount);
		verify(forgotPasswordRepository).deleteById(fp.getFpId());
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testChangePassword_Success() throws Exception {
		// Arrange
		ChangePassword changePassword = new ChangePassword("NewPassword@123", "NewPassword@123");
		when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
		when(passwordEncoder.encode("NewPassword@123")).thenReturn("encoded-new-password");
		doNothing().when(userAccountRepository).updatePassword(eq(USER_EMAIL), eq("encoded-new-password"));
		doNothing().when(forgotPasswordRepository).deleteByUserAccountEmail(USER_EMAIL);

		// Giả lập isValidPassword bằng cách sử dụng reflection trong Mockito
		Method isValidPassword = AuthController.class.getDeclaredMethod("isValidPassword", String.class);
		isValidPassword.setAccessible(true);
		doReturn(true).when(authController).isValidPassword("NewPassword@123");

		// Act
		mockMvc.perform(
				post("/auth/forgot-password/changePassword/" + USER_EMAIL).contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(changePassword)).with(csrf()))
				.andDo(print()).andExpect(status().isOk()).andExpect(content().string("Đổi mật khẩu thành công"));

		// Assert
		verify(userAccountRepository).updatePassword(USER_EMAIL, "encoded-new-password");
		verify(forgotPasswordRepository).deleteByUserAccountEmail(USER_EMAIL);
		verify(authController).isValidPassword("NewPassword@123");
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testChangePassword_PasswordMismatch() throws Exception {
		// Arrange
		ChangePassword changePassword = new ChangePassword("NewPassword@123", "DifferentPassword@123");

		// Act
		mockMvc.perform(
				post("/auth/forgot-password/changePassword/" + USER_EMAIL).contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(changePassword)).with(csrf()))
				.andDo(print()).andExpect(status().isBadRequest())
				.andExpect(content().string("Mật khẩu xác nhận không khớp với mật khẩu mới"));

		// Assert
		verify(userAccountRepository, never()).updatePassword(anyString(), anyString());
		verify(forgotPasswordRepository, never()).deleteByUserAccountEmail(anyString());
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testGetUserRole_Success() throws Exception {
		// Arrange
		userAccount.setUserType(new UserType(2, "Seeker"));
		when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));

		// Act
		mockMvc.perform(get("/auth/user-role").header("Authorization", jwtToken).with(csrf()))
				.andDo(print()).andExpect(status().isOk()).andExpect(content().json("{\"role\":\"ROLE_USER\"}"));

		verify(userAccountRepository).findByEmail(USER_EMAIL);
	}

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testGetUserRole_UserNotFound() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        // Act
        mockMvc.perform(get("/auth/user-role")
                .header("Authorization", jwtToken)
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(content().json("{\"error\":\"User not found\"}"));

        verify(userAccountRepository).findByEmail(USER_EMAIL);
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testLoginWithGoogle_Success() throws Exception {
        // Arrange
        Map<String, String> requestBody = new HashMap<>();
        String validJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                              "eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJkYW5nZ2lhdGh1YW5obEBnbWFpbC5jb20ifQ." +
                              "dummysignature"; // Token hợp lệ với 3 phần
        requestBody.put("token", validJwtToken);

        DecodedJWT decodedJWT = mock(DecodedJWT.class);
        Claim emailClaim = mock(Claim.class);
        when(emailClaim.asString()).thenReturn(USER_EMAIL);
        when(decodedJWT.getClaim("email")).thenReturn(emailClaim);

        try (MockedStatic<JWT> mockedJWT = mockStatic(JWT.class)) {
            mockedJWT.when(() -> JWT.decode(validJwtToken)).thenReturn(decodedJWT);
            when(jwtProvider.generateTokenFromEmail(USER_EMAIL)).thenReturn("jwt-token");
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
            when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

            // Act
            mockMvc.perform(post("/auth/login/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestBody))
                    .with(csrf()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().json("{\"token\":\"jwt-token\",\"message\":\"Đăng nhập thành công\"}"));

            // Assert
            mockedJWT.verify(() -> JWT.decode(validJwtToken));
            verify(jwtProvider).generateTokenFromEmail(USER_EMAIL);
            verify(userAccountRepository).findByEmail(USER_EMAIL);
            verify(userAccountRepository).save(any(UserAccount.class));
        }
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateRole_Success_Seeker() throws Exception {

            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
            when(userTypeRepository.findById(2)).thenReturn(Optional.of(userType));
            when(industryRepository.findById(0)).thenReturn(Optional.of(industry));
            when(userAccountRepository.save(any(UserAccount.class))).thenReturn(userAccount);

            // Act
            mockMvc.perform(post("/auth/update-role/2")
            		 .with(jwt().jwt(jwt -> jwt.claim("email", "danggiathuanhl@gmail.com")))
                     .contentType(MediaType.APPLICATION_JSON)
                     .header("Authorization", jwtToken)
                    .with(csrf()))
                    .andDo(print())
                    .andExpect(status().isOk());

            // Assert
            verify(userAccountRepository).findByEmail(USER_EMAIL);
            verify(userTypeRepository).findById(2);
            verify(industryRepository).findById(0);
            verify(userAccountRepository).save(any(UserAccount.class));
        }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testUpdateEmployer_Success() throws Exception {
        // Arrange
        when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(userAccount));
        when(companyRepository.findById(userAccount.getUserId())).thenReturn(Optional.of(company));
        when(companyRepository.save(any(Company.class))).thenReturn(company);

        // Act
        mockMvc.perform(post("/auth/update-employer")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(company))
                .with(csrf()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().json("{\"token\":\"\",\"message\":\"Success\"}"));

        verify(userAccountRepository).findByEmail(USER_EMAIL);
        verify(companyRepository).findById(userAccount.getUserId());
        verify(companyRepository).save(any(Company.class));
    }

	@Test
    @WithMockUser(username = USER_EMAIL)
    void testCheckEmailExists_NewUser() throws Exception {
        // Arrange
        Map<String, String> requestBody = new HashMap<>();
        String validJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                              "eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IkRhbmdHaWFUaHVhbiJ9." +
                              "dummysignature";
        requestBody.put("token", validJwtToken);

        // Mock DecodedJWT and its claims
        DecodedJWT decodedJWT = mock(DecodedJWT.class);
        Claim emailClaim = mock(Claim.class);
        Claim nameClaim = mock(Claim.class);

        when(emailClaim.asString()).thenReturn(USER_EMAIL);
        when(nameClaim.asString()).thenReturn("DangGiaThuan");

        when(decodedJWT.getClaim("email")).thenReturn(emailClaim);
        when(decodedJWT.getClaim("name")).thenReturn(nameClaim);

        // Mock static JWT.decode method
        try (MockedStatic<JWT> jwtMockedStatic = mockStatic(JWT.class)) {
            jwtMockedStatic.when(() -> JWT.decode(validJwtToken)).thenReturn(decodedJWT);

            // Mock repository calls - user doesn't exist initially
            when(userAccountRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());
            when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
                UserAccount savedUser = invocation.getArgument(0);
                // Simulate setting an ID after save
                savedUser.setUserId(UUID.randomUUID());
                return savedUser;
            });

            // Act
            mockMvc.perform(post("/auth/check-email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestBody))
                    .with(csrf()))
                    .andDo(print())
                    .andExpect(status().isOk());

            // Assert
            verify(userAccountRepository, times(2)).findByEmail(USER_EMAIL); // Called twice in the method
            verify(userAccountRepository).save(argThat(user ->
                user.getEmail().equals(USER_EMAIL) &&
                user.getUserName().equals("DangGiaThuan") &&
                user.getProvider().equals("Google") &&
                user.isActive() &&
                user.getUserType() == null
            ));
        }
    }

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testBlockCompany_Success() throws Exception {
		// Arrange
		UUID companyId = UUID.randomUUID();
		BlockCompanyDTO blockCompanyDTO = new BlockCompanyDTO(companyId, true, "Violation",
				LocalDateTime.now().plusDays(7));
		doNothing().when(companyService).blockCompany(eq(companyId), eq("Violation"), any(LocalDateTime.class));

		// Act
		mockMvc.perform(put("/auth/block-company/" + companyId).contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(blockCompanyDTO)).with(csrf())).andDo(print())
				.andExpect(status().isOk()).andExpect(content().string("Đã khóa tài khoản thành công"));

		// Assert
		verify(companyService).blockCompany(eq(companyId), eq("Violation"), any(LocalDateTime.class));
	}

	@Test
	@WithMockUser(username = USER_EMAIL)
	void testUnblockCompany_Success() throws Exception {
		// Arrange
		UUID companyId = UUID.randomUUID();
		doNothing().when(companyService).unblockCompany(companyId);

		// Act
		mockMvc.perform(put("/auth/unblock-company/" + companyId).with(csrf())).andDo(print())
				.andExpect(status().isOk()).andExpect(content().string("Mở khóa tài khoản thành công"));

		// Assert
		verify(companyService).unblockCompany(companyId);
	}
}
