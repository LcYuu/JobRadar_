package com.job_portal.controller;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.job_portal.DTO.LoginDTO;
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
import com.job_portal.repository.ForgotPasswordRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.repository.UserTypeRepository;
import com.job_portal.response.AuthResponse;
import com.job_portal.response.ChangePassword;
import com.job_portal.service.AccountDetailServiceImpl;
import com.job_portal.utils.EmailUtil;
import com.job_portal.utils.OtpUtil;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/auth")
public class AuthController {

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private UserAccountRepository userAccountRepository;

	@Autowired
	private AccountDetailServiceImpl accountDetailService;

	@Autowired
	private OtpUtil otpUtil;

	@Autowired
	private EmailUtil emailUtil;

	@Autowired
	private IndustryRepository industryRepository;
	@Autowired
	private CityRepository cityRepository;
	@Autowired
	private UserTypeRepository userTypeRepository;
	@Autowired
	private JwtProvider jwtProvider;
	@Autowired
	BlackListTokenRepository blackListTokenRepository;

	@Autowired
	private ForgotPasswordRepository forgotPasswordRepository;

	@PostMapping("/signup")
	public ResponseEntity<String> createUserAccount(@RequestBody UserAccount userAccount) {
		// Kiểm tra xem email đã tồn tại trong hệ thống hay chưa
		Optional<UserAccount> isExist = userAccountRepository.findByEmail(userAccount.getEmail());

		// Nếu tài khoản với email đã tồn tại, trả về thông báo lỗi với mã trạng thái
		// 409 (Conflict)
		if (isExist.isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Email này đã được sử dụng ở tài khoản khác");
		}

		// Nếu email chưa tồn tại, tiếp tục với quá trình tạo tài khoản
		String otp = otpUtil.generateOtp();
		try {
			emailUtil.sendOtpEmail(userAccount.getEmail(), otp);
		} catch (MessagingException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể gửi OTP, vui lòng thử lại");
		}

		Optional<UserType> userType = userTypeRepository.findById(userAccount.getUserType().getUserTypeId());

		// Tạo một tài khoản người dùng mới
		UserAccount newUser = new UserAccount();
		newUser.setUserId(UUID.randomUUID());
		newUser.setUserType(userType.orElse(null)); // Xử lý trường hợp userType không tìm thấy
		newUser.setActive(false);
		newUser.setEmail(userAccount.getEmail());
		newUser.setPassword(passwordEncoder.encode(userAccount.getPassword()));
		newUser.setUserName(userAccount.getUserName());
		newUser.setCreateDate(LocalDateTime.now());
		newUser.setOtp(otp);
		newUser.setOtpGeneratedTime(LocalDateTime.now());

		// Lưu tài khoản mới vào database
		userAccountRepository.save(newUser);

		return ResponseEntity.ok("Vui lòng check email để nhận mã đăng ký");
	}

	@PutMapping("/verify-account")
	public ResponseEntity<String> verifyAccount(@RequestParam String email, @RequestParam String otp) {
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		if (user.get().getOtp().equals(otp)
				&& Duration.between(user.get().getOtpGeneratedTime(), LocalDateTime.now()).getSeconds() < (2 * 60)) {

			user.get().setActive(true);
			user.get().setOtp(null);
			user.get().setOtpGeneratedTime(null);

			if (user.get().getUserType().getUserTypeId() == 2) {
				Integer defaultIndustryId = 0;
				Optional<Industry> defaultIndustryOpt = industryRepository.findById(defaultIndustryId);

				Industry defaultIndustry = defaultIndustryOpt.get();
				Seeker seeker = new Seeker();
				seeker.setUserAccount(user.get());
				seeker.setIndustry(defaultIndustry);
				user.get().setSeeker(seeker);
				userAccountRepository.save(user.get());
			} else if (user.get().getUserType().getUserTypeId() == 3) {
				Integer defaultIndustryId = 0;
				Optional<Industry> defaultIndustryOpt = industryRepository.findById(defaultIndustryId);

				Integer defaultCityId = 0;
				Optional<City> defaultCityOpt = cityRepository.findById(defaultCityId);

				Industry defaultIndustry = defaultIndustryOpt.get();
				City defaultCity = defaultCityOpt.get();
				Company company = new Company();
				company.setUserAccount(user.get());
				company.setIndustry(defaultIndustry);
				company.setCity(defaultCity);
				user.get().setCompany(company);
				userAccountRepository.save(user.get());
			}
			return ResponseEntity.ok("Đăng ký tài khoản thành công");
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Xác thực OPT thất bại, vui lòng nhập lại email");
		}
	}

	@PostMapping("/login")
	public AuthResponse signin(@RequestBody LoginDTO login) {
		AuthResponse res;
		Optional<UserAccount> userOpt = userAccountRepository.findByEmail(login.getEmail());
		if (userOpt.isEmpty()) {
			throw new UsernameNotFoundException("Email không tồn tại");
		}

		UserAccount user = userOpt.get();
		if (!user.isActive()) {
			return new AuthResponse("", "Tài khoản của bạn chưa được xác thực");
		}

		Authentication authentication = authenticate(login.getEmail(), login.getPassword());
		String token = JwtProvider.generateToken(authentication);
		user.setLastLogin(LocalDateTime.now());
		userAccountRepository.save(user);
		res = new AuthResponse(token, "Đăng nhập thành công");

		return res;
	}

	@PutMapping("/regenerate-otp")
	public String regenerateOtp(@RequestParam String email) {
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
//		if (user == null) {
//			throw new RuntimeException("User not found with email: " + email);
//		}
		String otp = otpUtil.generateOtp();
		try {
			emailUtil.sendOtpEmail(email, otp);
		} catch (MessagingException e) {
			throw new RuntimeException("Không thể gửi email, vui lòng thử lại");
		}
		user.get().setOtp(otp);
		user.get().setOtpGeneratedTime(LocalDateTime.now());
		userAccountRepository.save(user.get());
		return "Vui lòng check email đã nhận mã đăng ký";
	}

	private Authentication authenticate(String email, String password) {
		UserDetails userDetails = accountDetailService.loadUserByUsername(email);
		if (userDetails == null) {
			throw new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng");
		}
		if (!passwordEncoder.matches(password, userDetails.getPassword())) {
			throw new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng");
		}
		return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
	}

	@PostMapping("/signout")
	public ResponseEntity<String> signOut(@RequestHeader(name = "Authorization", required = false) String token) {
		if (token != null && token.startsWith("Bearer ")) {
			String jwtToken = token.substring(7);
			// Kiểm tra xem token đã bị blacklisted chưa
			if (jwtProvider.isTokenBlacklisted(jwtToken)) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token đã bị vô hiệu hóa");
			}
			// Thêm token vào danh sách đen
			BlackListToken blacklistedToken = new BlackListToken(jwtToken, LocalDateTime.now());
			blackListTokenRepository.save(blacklistedToken);
			return ResponseEntity.ok("Đăng xuất thành công");
		} else {
			return ResponseEntity.badRequest().body("Token không hợp lệ hoặc không được cung cấp.");
		}
	};

	@PostMapping("/forgot-password/verifyMail/{email}")
	public ResponseEntity<String> verifyMail(@PathVariable String email) throws MessagingException {
		Optional<UserAccount> userAccount = Optional.of(userAccountRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Vui lòng cung cấp đúng email")));

		String otp = otpUtil.generateOtp();
		emailUtil.sendForgotMail(email, otp);

		ForgotPassword fp = ForgotPassword.builder().otp(otp)
				.expirationTime(new Date(System.currentTimeMillis() + 5 * 60 * 1000)).userAccount(userAccount.get())
				.build();
		forgotPasswordRepository.save(fp);
		return ResponseEntity.ok("Vui lòng kiểm tra email để nhận mã OTP");

	}

	@PostMapping("/forgot-password/verifyOtp/{email}/{otp}")
	public ResponseEntity<String> verifyOtp(@PathVariable String email, @PathVariable String otp)
			throws MessagingException {
		Optional<UserAccount> userAccount = Optional.of(userAccountRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Vui lòng cung cấp đúng email")));

		ForgotPassword fp = forgotPasswordRepository.findByOtpAndUserAccount(otp, userAccount.get())
				.orElseThrow(() -> new RuntimeException("Không thể xác nhận OTP cho email: " + email));
		if (fp.getExpirationTime().before(Date.from(Instant.now()))) {
			forgotPasswordRepository.deleteById(fp.getFpId());
			return new ResponseEntity<>("OTP đã hết hạn", HttpStatus.EXPECTATION_FAILED);
		}
		return ResponseEntity.ok("Xác thực OTP thành công");
	}

	@PostMapping("/forgot-password/changePassword/{email}")
	public ResponseEntity<String> changePassword(@RequestBody ChangePassword changePassword, @PathVariable String email)
			throws MessagingException {
		if (!Objects.equals(changePassword.password(), changePassword.repeatPassword())) {
			return new ResponseEntity<>("Vui lòng nhập lại mật khẩu một lần nữa!", HttpStatus.EXPECTATION_FAILED);
		}
		String encodedPassword = passwordEncoder.encode(changePassword.password());

		userAccountRepository.updatePassword(email, encodedPassword);
		forgotPasswordRepository.deleteByUserAccountEmail(email);
		return ResponseEntity.ok("Password đã thay đổi thành công");
	}

	@GetMapping("/user-role")
	public ResponseEntity<Map<String, String>> getUserRole(@RequestHeader("Authorization") String jwt) {
		try {
			String email = JwtProvider.getEmailFromJwtToken(jwt);
			Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);

			if (userOpt.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Collections.singletonMap("error", "User not found"));
			}

			UserAccount user = userOpt.get();
			String role = user.getUserType().getUserTypeId() == 2 ? "ROLE_USER" : "ROLE_EMPLOYER";

			Map<String, String> response = new HashMap<>();
			response.put("role", role);

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Collections.singletonMap("error", "Error fetching user role"));
		}
	}


	@PostMapping("/login/google")
	public AuthResponse loginWithGoogle(@RequestBody Map<String, String> requestBody) {
		String googleToken = requestBody.get("token"); // Lấy googleToken từ frontend

		// Giải mã token Google (JWT) để lấy thông tin người dùng
		DecodedJWT decodedJWT = JWT.decode(googleToken);
		String email = decodedJWT.getClaim("email").asString();
		
		String jwtToken = jwtProvider.generateTokenFromEmail(email); // Sử dụng auth trực tiếp
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		user.get().setLastLogin(LocalDateTime.now());

		// Trả về JWT token cho người dùng
		System.out.println("a" + jwtToken);
		AuthResponse res;
		res = new AuthResponse(jwtToken, "Đăng nhập thành công");
		return res;
	}

	@PostMapping("/update-role/{role}")
	public ResponseEntity<AuthResponse> updateRole(@RequestHeader("Authorization") String jwt, @PathVariable Integer role) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		Optional<UserType> userType = userTypeRepository.findById(role);
		
		UserAccount newUser = user.get();
		newUser.setUserType(userType.orElse(null));
		if (newUser.getUserType().getUserTypeId() == 2) {
			Integer defaultIndustryId = 0;
			Optional<Industry> defaultIndustryOpt = industryRepository.findById(defaultIndustryId);

			Industry defaultIndustry = defaultIndustryOpt.get();
			Seeker seeker = new Seeker();
			seeker.setUserAccount(newUser);
			seeker.setIndustry(defaultIndustry);
			user.get().setSeeker(seeker);
			userAccountRepository.save(newUser);
		} else if (newUser.getUserType().getUserTypeId() == 3) {
			Integer defaultIndustryId = 0;
			Optional<Industry> defaultIndustryOpt = industryRepository.findById(defaultIndustryId);

			Integer defaultCityId = 0;
			Optional<City> defaultCityOpt = cityRepository.findById(defaultCityId);

			Industry defaultIndustry = defaultIndustryOpt.get();
			City defaultCity = defaultCityOpt.get();
			Company company = new Company();
			company.setUserAccount(newUser);
			company.setIndustry(defaultIndustry);
			company.setCity(defaultCity);
			user.get().setCompany(company);
			userAccountRepository.save(newUser);
		}
		AuthResponse response = new AuthResponse(String.valueOf(role), "Cập nhật vai trò thành công");
		return ResponseEntity.ok(response);
	}
	
	// Backend (Spring Boot)
	@PostMapping("/check-email")
	public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> requestBody) {
		String googleToken = requestBody.get("token"); 

		DecodedJWT decodedJWT = JWT.decode(googleToken);
		String email = decodedJWT.getClaim("email").asString();
	    Optional<UserAccount> user = userAccountRepository.findByEmail(email);
	    System.out.println("d" + user.toString());
	    if (user.isPresent()) {
	        return ResponseEntity.ok(true); // Người dùng đã tồn tại
	    } else {
	    	String name = decodedJWT.getClaim("name").asString();

			// Tìm người dùng trong cơ sở dữ liệu, nếu không có thì tạo mới
			Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);

			if (userOptional.isEmpty()) {
				UserAccount newUser = new UserAccount();
				newUser.setEmail(email);
				newUser.setUserName(name);
				newUser.setUserId(UUID.randomUUID());
				newUser.setUserType(null);
				newUser.setActive(true);
				newUser.setPassword("");
				newUser.setCreateDate(LocalDateTime.now());
				newUser.setOtp(null);
				newUser.setOtpGeneratedTime(null);
				newUser.setProvider("Google");
				newUser.setLastLogin(LocalDateTime.now());
				userAccountRepository.save(newUser);

			}
			// Tạo JWT Token cho người dùng và truyền Authentication object
	        return ResponseEntity.ok(false); // Người dùng chưa tồn tại
	    }
	}

}