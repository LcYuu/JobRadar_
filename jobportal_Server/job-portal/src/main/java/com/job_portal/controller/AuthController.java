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
import com.job_portal.DTO.BlockCompanyDTO;
import com.job_portal.DTO.LoginDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.DTO.UserSignupDTO;
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
import com.job_portal.response.AuthResponse;
import com.job_portal.response.ChangePassword;
import com.job_portal.service.AccountDetailServiceImpl;
import com.job_portal.service.ICompanyService;
import com.job_portal.utils.EmailUtil;
import com.job_portal.utils.OtpUtil;
import com.job_portal.service.TaxCodeValidation;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/auth")
public class AuthController {

	@Autowired
	private SeekerRepository seekerRepository;

	@Autowired
	private CompanyRepository companyRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private UserAccountRepository userAccountRepository;
	@Autowired
	private ICompanyService companyService;

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

	@Autowired
	private TaxCodeValidation taxCodeValidation;

	@PostMapping("/signup")
	public ResponseEntity<String> createUserAccount(@RequestBody UserSignupDTO userSignupDTO) {

		try {
			Optional<UserAccount> isExist = userAccountRepository.findByEmail(userSignupDTO.getEmail());
			if (isExist.isPresent()) {
				return ResponseEntity.status(HttpStatus.CONFLICT).body("Email này đã được sử dụng ở tài khoản khác");
			}

			UserAccount newUser = new UserAccount();
			newUser.setUserId(UUID.randomUUID());
			newUser.setUserType(userTypeRepository.findById(userSignupDTO.getUserType().getUserTypeId()).orElse(null));
			newUser.setActive(false);
			newUser.setEmail(userSignupDTO.getEmail());
			newUser.setPassword(passwordEncoder.encode(userSignupDTO.getPassword()));
			newUser.setUserName(userSignupDTO.getUserName());
			newUser.setCreateDate(LocalDateTime.now());
			newUser.setProvider("LOCAL");

			String otp = otpUtil.generateOtp();

			emailUtil.sendOtpEmail(newUser.getEmail(), otp);
			newUser.setOtp(otp);
			System.out.println("aa " + newUser.getOtp());
			newUser.setOtpGeneratedTime(LocalDateTime.now());

			userAccountRepository.save(newUser);
			return ResponseEntity.ok("Vui lòng check email để nhận mã đăng ký");
		} catch (MessagingException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể gửi OTP, vui lòng thử lại");
		}

	}

	@PostMapping("/verify-employer")
	public ResponseEntity<String> verifyEmployerInfo(@RequestBody Company company, @RequestParam String email) {
		try {
			Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
			if (!userOptional.isPresent()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy tài khoản");
			}

			UserAccount user = userOptional.get();
			if (user.getUserType().getUserTypeId() != 3) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài khoản không phải là nhà tuyển dụng");
			}

			if (company == null || company.getTaxCode() == null || company.getTaxCode().isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body("Thông tin công ty và mã số thuế là bắt buộc");
			}

			boolean isValidTaxCode = taxCodeValidation.checkTaxCode(company.getTaxCode());
			if (!isValidTaxCode) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã số thuế không hợp lệ hoặc không tồn tại");
			}

			// Set default industry (ID = 1) into the industries list
			List<Industry> defaultIndustries = new ArrayList<>();
			Industry defaultIndustry = industryRepository.findById(0).orElse(null);
			if (defaultIndustry != null) {
				defaultIndustries.add(defaultIndustry);
			}
			company.setIndustry(defaultIndustries);

			company.setUserAccount(user);
			company.setCity(cityRepository.findById(company.getCity().getCityId()).orElse(null));
			company.setAddress(", , ");
			company.setIsBlocked(false);
			user.setCompany(company);

			userAccountRepository.save(user);
			return ResponseEntity.ok("Xác thực thông tin công ty thành công");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xác thực: " + e.getMessage());
		}
	}

	@PutMapping("/verify-account")
	public ResponseEntity<String> verifyAccount(@RequestParam String email, @RequestParam String otp) {
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
		if (userOptional.isPresent()) {
			UserAccount user = userOptional.get();
			System.out.println("aa " + user.getOtp());

			// Kiểm tra nếu OTP là null
			if (user.getOtp() != null && user.getOtp().equals(otp)
					&& Duration.between(user.getOtpGeneratedTime(), LocalDateTime.now()).getSeconds() < (2 * 60)) {

				user.setActive(true);
				user.setOtp(null);
				user.setOtpGeneratedTime(null);

				// Khởi tạo thông tin cơ bản cho người tìm việc
				if (user.getUserType().getUserTypeId() == 2) {
					Seeker seeker = new Seeker();
					seeker.setUserAccount(user);
					List<Industry> defaultIndustries = new ArrayList<>();
					Industry defaultIndustry = industryRepository.findById(0).orElse(null);
					if (defaultIndustry != null) {
						defaultIndustries.add(defaultIndustry);
					}
					seeker.setIndustry(defaultIndustries);
					seeker.setAddress(", , ");
					user.setSeeker(seeker);
				}

				userAccountRepository.save(user);
				return ResponseEntity.ok("Xác thực tài khoản thành công");
			}
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Xác thực OTP thất bại, vui lòng thử lại");
	}

	@PostMapping("/login")
	public AuthResponse signin(@RequestBody LoginDTO login) {
		if (login.getEmail() == null || login.getEmail().isEmpty()) {
			return new AuthResponse("", "Email không được để trống");
		}
		if (login.getPassword() == null || login.getPassword().isEmpty()) {
			return new AuthResponse("", "Mật khẩu không được để trống");
		}
		if (!isValidPassword(login.getPassword())) {
			return new AuthResponse("",
					"Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
		}
		Optional<UserAccount> userOpt = userAccountRepository.findByEmail(login.getEmail());
		if (userOpt.isEmpty()) {
			return new AuthResponse("", "Email hoặc mật khẩu không đúng");
		}
		UserAccount user = userOpt.get();
		if (!user.isActive()) {
			return new AuthResponse("", "Tài khoản của bạn chưa được xác thực");
		}
		if (user.getUserType().getUserTypeId() == 3) {
			if (user.getCompany().getIsBlocked() && user.getCompany().getBlockedUntil() != null
					&& user.getCompany().getBlockedUntil().isAfter(LocalDateTime.now())) {
				return new AuthResponse("",
						"Tài khoản cuả bạn đã bị khóa. Vui lòng kiểm tra email để biết thêm chi tiết");
			}
		}

		try {
			Authentication authentication = authenticate(login.getEmail(), login.getPassword());
			String token = JwtProvider.generateToken(authentication);
			user.setLastLogin(LocalDateTime.now());
			userAccountRepository.save(user);
			return new AuthResponse(token, "Đăng nhập thành công");
		} catch (Exception e) {
			return new AuthResponse("", "Email hoặc mật khẩu không đúng");
		}
	}

	private boolean isValidPassword(String password) {
		String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
		return password.matches(passwordPattern);
	}

	@PutMapping("/regenerate-otp")
	public ResponseEntity<String> regenerateOtp(@RequestParam String email) {
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
//		if (user == null) {
//			throw new RuntimeException("User not found with email: " + email);
//		}
		String otp = otpUtil.generateOtp();
		try {
			emailUtil.sendOtpEmail(email, otp);
		} catch (MessagingException e) {
			return new ResponseEntity<>("Không thể gửi mail, vui lòng thử lại", HttpStatus.BAD_REQUEST); // Đổi mã trạng
																											// thái phù
																											// hợp
		}
		user.get().setOtp(otp);
		user.get().setOtpGeneratedTime(LocalDateTime.now());
		userAccountRepository.save(user.get());
		return new ResponseEntity<>("Vui lòng check mail để nhận mã đăng ký", HttpStatus.OK); // Đổi mã trạng thái phù
																								// hợp
	}

	private Authentication authenticate(String email, String password) {
		UserDetails userDetails = accountDetailService.loadUserByUsername(email);
		if (userDetails == null) {
			throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
		}
		if (!passwordEncoder.matches(password, userDetails.getPassword())) {
			throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
		}
		return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
	}

	@PostMapping("/signout")
	public ResponseEntity<String> signOut(@RequestHeader(name = "Authorization", required = false) String token) {
		if (token != null && token.startsWith("Bearer ")) {
			String jwtToken = token.substring(7);

//	        // Kiểm tra token đã hết hạn chưa
//	        if (jwtProvider.isTokenExpired(jwtToken)) {
//	            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token đã hết hạn");
//	        }

			// Kiểm tra token có trong danh sách đen chưa
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
	}

	@PostMapping("/forgot-password/verifyMail/{email}")
	public ResponseEntity<Map<String, String>> verifyMail(@PathVariable String email) throws MessagingException {
		Optional<UserAccount> userAccount = userAccountRepository.findByEmail(email);

		if (userAccount.isEmpty()) {
			// Trả về JSON thay vì plain text
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("error", "Email không tồn tại");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
		}

		try {
			String otp = otpUtil.generateOtp();
			emailUtil.sendForgotMail(email, otp);

			LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(1);
			ForgotPassword fp = ForgotPassword.builder().otp(otp).expirationTime(expirationTime)
					.userAccount(userAccount.get()).build();

			forgotPasswordRepository.save(fp);

			Map<String, String> successResponse = new HashMap<>();
			successResponse.put("message", "Vui lòng kiểm tra email để nhận mã OTP");
			return ResponseEntity.ok(successResponse);

		} catch (Exception e) {
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("error", "Đã xảy ra lỗi khi gửi OTP. Vui lòng thử lại.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/forgot-password/verifyOtp/{email}/{otp}")
	public ResponseEntity<String> verifyOtp(@PathVariable String email, @PathVariable String otp)
			throws MessagingException {
		// Tìm kiếm tài khoản người dùng theo email
		Optional<UserAccount> userAccount = Optional.of(userAccountRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Vui lòng cung cấp đúng email")));

		// Tìm OTP từ cơ sở dữ liệu
		ForgotPassword fp = forgotPasswordRepository.findByOtpAndUserAccount(otp, userAccount.get())
				.orElseThrow(() -> new RuntimeException("Không thể xác nhận OTP cho email: " + email));

		// Kiểm tra xem mã OTP đã hết hạn chưa
		if (fp.getExpirationTime().isBefore(LocalDateTime.now())) {
			// Nếu OTP hết hạn, xóa bản ghi và trả về thông báo lỗi
			System.out.println("OTP đã hết hạn, tiến hành xóa...");
			forgotPasswordRepository.deleteById(fp.getFpId()); // Đảm bảo gọi delete đúng
			return new ResponseEntity<>("Mã OTP đã hết hạn", HttpStatus.BAD_REQUEST); // Đổi mã trạng thái phù hợp
		}

		// Trả về thông báo nếu OTP hợp lệ
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
		return ResponseEntity.ok("Mật khẩu đã thay đổi thành công");
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
			String role;
			if (user.getUserType().getUserTypeId() == 1) {
				role = "ROLE_ADMIN";
			} else if (user.getUserType().getUserTypeId() == 2) {
				role = "ROLE_USER";
			} else {
				role = "ROLE_EMPLOYER"; // Giả sử rằng nếu không phải là ADMIN hoặc USER thì sẽ là EMPLOYER
			}

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
		try {
			String googleToken = requestBody.get("token"); // Lấy googleToken từ frontend

			// Giải mã token Google (JWT) để lấy thông tin người dùng
			DecodedJWT decodedJWT = JWT.decode(googleToken);
			String email = decodedJWT.getClaim("email").asString();

			String jwtToken = jwtProvider.generateTokenFromEmail(email); // Sử dụng auth trực tiếp
			Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);

			if (userOpt.isPresent()) {
				UserAccount user = userOpt.get();

				if (user.getUserType() != null && user.getUserType().getUserTypeId() != null) {
					if (user.getUserType().getUserTypeId() == 3) {
						if (user.getCompany() != null && user.getCompany().getIsBlocked()
								&& user.getCompany().getBlockedUntil() != null
								&& user.getCompany().getBlockedUntil().isAfter(LocalDateTime.now())) {
							return new AuthResponse("",
									"Tài khoản của bạn đã bị khóa. Vui lòng kiểm tra email để biết thêm chi tiết");
						}
					}
				}

				user.setLastLogin(LocalDateTime.now());
				userAccountRepository.save(user);
			}

			return new AuthResponse(jwtToken, "Đăng nhập thành công");
		} catch (Exception e) {
			e.printStackTrace();
			return new AuthResponse("", "Lỗi đăng nhập: " + e.getMessage());
		}
	}

	@PostMapping("/update-role/{role}")
	public ResponseEntity<UserAccount> updateRole(@RequestHeader("Authorization") String jwt,
			@PathVariable Integer role) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> userOpt = userAccountRepository.findByEmail(email);
		if (!userOpt.isPresent()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}

		Optional<UserType> userTypeOpt = userTypeRepository.findById(role);
		if (!userTypeOpt.isPresent()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}

		UserAccount user = userOpt.get();
		user.setUserType(userTypeOpt.get());

		if (user.getUserType().getUserTypeId() == 2) { // Seeker
			Integer defaultIndustryId = 0;
			Optional<Industry> defaultIndustryOpt = industryRepository.findById(defaultIndustryId);
			Industry defaultIndustry = defaultIndustryOpt
					.orElseThrow(() -> new RuntimeException("Default industry not found"));

			// Set default industry as a list
			List<Industry> defaultIndustries = new ArrayList<>();
			defaultIndustries.add(defaultIndustry);

			Seeker seeker = new Seeker();
			seeker.setUserAccount(user);
			seeker.setIndustry(defaultIndustries); // Updated to setIndustries
			seeker.setAddress(", , ");
			user.setSeeker(seeker);
		} else if (user.getUserType().getUserTypeId() == 3) { // Employer
			Integer defaultIndustryId = 0;
			Optional<Industry> defaultIndustryOpt = industryRepository.findById(defaultIndustryId);
			Integer defaultCityId = 0;
			Optional<City> defaultCityOpt = cityRepository.findById(defaultCityId);

			Industry defaultIndustry = defaultIndustryOpt
					.orElseThrow(() -> new RuntimeException("Default industry not found"));
			City defaultCity = defaultCityOpt.orElseThrow(() -> new RuntimeException("Default city not found"));

			// Set default industry as a list
			List<Industry> defaultIndustries = new ArrayList<>();
			defaultIndustries.add(defaultIndustry);

			Company company = new Company();
			company.setUserAccount(user);
			company.setIndustry(defaultIndustries);
			company.setCity(defaultCity);
			company.setAddress(", , ");
			company.setIsBlocked(false);
			user.setCompany(company);
		}

		UserAccount updatedUser = userAccountRepository.save(user);
		return ResponseEntity.ok(updatedUser); // Return the full UserAccount
	}

	@PostMapping("/update-employer")
	public AuthResponse updateEmployer(@RequestHeader("Authorization") String jwt, @RequestBody Company company) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		Optional<Company> existingCompany = companyRepository.findById(user.get().getUserId());

		Company oldCompany = existingCompany.get();
		oldCompany.setTaxCode(company.getTaxCode());
		oldCompany.setCompanyName(company.getCompanyName());
		oldCompany.setEmail(company.getEmail());
		companyRepository.save(oldCompany);

		return new AuthResponse("", "Success");
	}

	@PostMapping("/check-email")
	public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> requestBody) {
		// 1. Token extraction and decoding
		String googleToken = requestBody.get("token");
		DecodedJWT decodedJWT = JWT.decode(googleToken);
		String email = decodedJWT.getClaim("email").asString();

		// 2. User lookup
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		// 3. Check for associated seeker/company
		if (user.isPresent()) {
			UserAccount userAccount = user.get();
			Optional<Seeker> seekerOptional = seekerRepository.findById(userAccount.getUserId());
			Optional<Company> companyOptional = companyRepository.findById(userAccount.getUserId());

			// 4. Main logic
			if (seekerOptional.isPresent() || companyOptional.isPresent()) {
				return ResponseEntity.ok(true);
			}
		}

		// If user doesn't exist or has no seeker/company profile
		String name = decodedJWT.getClaim("name").asString();
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);

		if (userOptional.isEmpty()) {
			// 5. New user creation
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

			String defaultAddress = ", , ";
			if (newUser.getUserType() != null) { // Note: This will never execute due to null UserType
				if (newUser.getUserType().getUserTypeId() == 2) {
					Seeker seeker = new Seeker();
					seeker.setUserAccount(newUser);
					seeker.setAddress(defaultAddress);
					newUser.setSeeker(seeker);
				} else if (newUser.getUserType().getUserTypeId() == 3) {
					Company company = new Company();
					company.setUserAccount(newUser);
					company.setAddress(defaultAddress);
					newUser.setCompany(company);
				}
			}
			userAccountRepository.save(newUser);
		}
		return ResponseEntity.ok(false);
	}

	@PutMapping("/block-company/{companyId}")
	public ResponseEntity<String> blockCompany(@PathVariable UUID companyId,
			@RequestBody BlockCompanyDTO blockCompanyDTO) throws MessagingException {
		companyService.blockCompany(companyId, blockCompanyDTO.getBlockedReason(), blockCompanyDTO.getBlockedUntil());
		return ResponseEntity.ok("Đã khóa tài khoản thành công");
	}

	@PutMapping("/unblock-company/{companyId}")
	public ResponseEntity<String> unblockCompany(@PathVariable UUID companyId) throws MessagingException {
		companyService.unblockCompany(companyId);
		return ResponseEntity.ok("Mở khóa tài khoản thành công");
	}

}