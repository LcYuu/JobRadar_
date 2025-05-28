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
			newUser.setOtpGeneratedTime(LocalDateTime.now());

			userAccountRepository.save(newUser);
			return ResponseEntity.ok("Mã xác nhận đã được gửi đến email của bạn");
		} catch (MessagingException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể gửi mã xác nhận, vui lòng kiểm tra email và thử lại");
		}

	}

	@PostMapping("/verify-employer")
	public ResponseEntity<String> verifyEmployerInfo(@RequestBody Company company, @RequestParam String email) {
		try {
			Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
			if (!userOptional.isPresent()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy tài khoản với email này");
			}

			UserAccount user = userOptional.get();
			if (user.getUserType().getUserTypeId() != 3) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài khoản không phải là nhà tuyển dụng");
			}

			if (company == null || company.getTaxCode() == null || company.getTaxCode().isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body("Thông tin công ty và mã số thuế không được để trống");
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
			company.setEmail(user.getEmail());
			user.setCompany(company);

			userAccountRepository.save(user);
			return ResponseEntity.ok("Xác thực thông tin công ty thành công");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xác thực công ty: " + e.getMessage());
		}
	}
	@PutMapping("/verify-account")
	public ResponseEntity<String> verifyAccount(@RequestParam String email, @RequestParam String otp) {
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
		if (userOptional.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email không tồn tại trong hệ thống");
		}
		
		UserAccount user = userOptional.get();
		System.out.println("aa " + user.getOtp());

		// Kiểm tra nếu OTP là null
		if (user.getOtp() == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã OTP không tồn tại, vui lòng gửi lại mã xác nhận");
		}
		
		// Kiểm tra OTP và thời gian
		if (!user.getOtp().equals(otp)) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã xác nhận không chính xác");
		}
		
		// Kiểm tra thời gian hiệu lực của OTP
		if (Duration.between(user.getOtpGeneratedTime(), LocalDateTime.now()).getSeconds() >= (2 * 60)) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã xác nhận đã hết hạn, vui lòng yêu cầu mã mới");
		}

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

	@PostMapping("/login")
	public AuthResponse signin(@RequestBody LoginDTO login) {
	    if (login.getEmail() == null || login.getEmail().isEmpty()) {
	        System.out.println("Email is empty");
	        return new AuthResponse("", "Email không được để trống");
	    }
	    if (login.getPassword() == null || login.getPassword().isEmpty()) {
	        System.out.println("Password is empty");
	        return new AuthResponse("", "Mật khẩu không được để trống");
	    }
	    if (!isValidPassword(login.getPassword())) {
	        System.out.println("Invalid password format");
	        return new AuthResponse("",
	                "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
	    }
	    System.out.println("Checking user account for email: " + login.getEmail());
	    Optional<UserAccount> userOpt = userAccountRepository.findByEmail(login.getEmail());
	    if (userOpt.isEmpty()) {
	        System.out.println("User not found");
	        return new AuthResponse("", "Email hoặc mật khẩu không đúng");
	    }
	    UserAccount user = userOpt.get();
	    if (!user.isActive()) {
	        System.out.println("Account not active");
	        return new AuthResponse("", "Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản");
	    }
	    if (user.getUserType().getUserTypeId() == 3) {
	        System.out.println("Checking employer account");
	        if (user.getCompany().getIsBlocked() && user.getCompany().getBlockedUntil() != null
	                && user.getCompany().getBlockedUntil().isAfter(LocalDateTime.now())) {
	            System.out.println("Employer account is blocked");
	            return new AuthResponse("",
	                    "Tài khoản của bạn đã bị khóa tạm thời. Vui lòng kiểm tra email để biết thêm chi tiết");
	        }
	    }
	    try {
	        System.out.println("Attempting authentication");
	        Authentication authentication = authenticate(login.getEmail(), login.getPassword());
	        System.out.println("Authentication successful: " + authentication.getName());
	        String token = JwtProvider.generateToken(authentication);
	        user.setLastLogin(LocalDateTime.now());
	        userAccountRepository.save(user);
	        return new AuthResponse(token, "Đăng nhập thành công");
	    } catch (Exception e) {
	        System.out.println("Authentication failed: " + e.getMessage());
	        e.printStackTrace();
	        return new AuthResponse("", "Email hoặc mật khẩu không đúng");
	    }
	}


	boolean isValidPassword(String password) {
		String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
		return password.matches(passwordPattern);
	}
	@PutMapping("/regenerate-otp")
	public ResponseEntity<String> regenerateOtp(@RequestParam String email) {
		Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
		if (userOptional.isEmpty()) {
			return new ResponseEntity<>("Email không tồn tại trong hệ thống", HttpStatus.NOT_FOUND);
		}
		
		String otp = otpUtil.generateOtp();
		try {
			emailUtil.sendOtpEmail(email, otp);
		} catch (MessagingException e) {
			return new ResponseEntity<>("Không thể gửi email xác nhận, vui lòng kiểm tra địa chỉ email và thử lại", HttpStatus.BAD_REQUEST);
		}
		
		UserAccount user = userOptional.get();
		user.setOtp(otp);
		user.setOtpGeneratedTime(LocalDateTime.now());
		userAccountRepository.save(user);

		return new ResponseEntity<>("Mã xác nhận mới đã được gửi đến email của bạn", HttpStatus.OK);
	}

	public Authentication authenticate(String email, String password) {
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
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("error", "Email không tồn tại trong hệ thống");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
		}
		try {
			// XÓA OTP CŨ TRƯỚC KHI TẠO MỚI
			forgotPasswordRepository.deleteByUserAccountEmail(email);

			String otp = otpUtil.generateOtp();
			emailUtil.sendForgotMail(email, otp);

			LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(1);
			ForgotPassword fp = ForgotPassword.builder().otp(otp).expirationTime(expirationTime)
					.userAccount(userAccount.get()).build();

			forgotPasswordRepository.save(fp);

			Map<String, String> successResponse = new HashMap<>();
			successResponse.put("message", "Mã xác nhận đã được gửi đến email của bạn");
			return ResponseEntity.ok(successResponse);

		} catch (Exception e) {
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("error", "Không thể gửi mã xác nhận. Vui lòng kiểm tra email và thử lại sau.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/forgot-password/verifyOtp/{email}/{otp}")
	public ResponseEntity<String> verifyOtp(@PathVariable String email, @PathVariable String otp)
			throws MessagingException {
		// Tìm kiếm tài khoản người dùng theo email
		Optional<UserAccount> userAccountOpt = userAccountRepository.findByEmail(email);
		
		if (userAccountOpt.isEmpty()) {
			return new ResponseEntity<>("Email không tồn tại trong hệ thống", HttpStatus.NOT_FOUND);
		}
		
		UserAccount userAccount = userAccountOpt.get();

		// Tìm OTP từ cơ sở dữ liệu
		Optional<ForgotPassword> fpOpt = forgotPasswordRepository.findByOtpAndUserAccount(otp, userAccount);
		
		if (fpOpt.isEmpty()) {
			return new ResponseEntity<>("Mã xác nhận không chính xác", HttpStatus.BAD_REQUEST);
		}
		
		ForgotPassword fp = fpOpt.get();

		// Kiểm tra xem mã OTP đã hết hạn chưa
		if (fp.getExpirationTime().isBefore(LocalDateTime.now())) {
			// Nếu OTP hết hạn, xóa bản ghi và trả về thông báo lỗi
			System.out.println("OTP đã hết hạn, tiến hành xóa...");
			forgotPasswordRepository.deleteById(fp.getFpId());
			return new ResponseEntity<>("Mã xác nhận đã hết hạn, vui lòng yêu cầu mã mới", HttpStatus.BAD_REQUEST);
		}

		// Trả về thông báo nếu OTP hợp lệ
		return ResponseEntity.ok("Xác thực mã thành công");
	}

	@PostMapping("/forgot-password/changePassword/{email}")
	public ResponseEntity<String> changePassword(@RequestBody ChangePassword changePassword, @PathVariable String email)
			throws MessagingException {
		if (!Objects.equals(changePassword.password(), changePassword.repeatPassword())) {
			return new ResponseEntity<>("Mật khẩu xác nhận không khớp với mật khẩu mới", HttpStatus.BAD_REQUEST);
		}
		
		// Validate mật khẩu mới
        if (!isValidPassword(changePassword.password())) {
            return new ResponseEntity<>("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt", HttpStatus.BAD_REQUEST);
        }
        
		String encodedPassword = passwordEncoder.encode(changePassword.password());

		userAccountRepository.updatePassword(email, encodedPassword);
		forgotPasswordRepository.deleteByUserAccountEmail(email);
		return ResponseEntity.ok("Đổi mật khẩu thành công");
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
			String googleToken = requestBody.get("token"); 

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

		// Validate email doanh nghiệp
		if (company.getEmail() == null || !company.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
			return new AuthResponse("", "Email doanh nghiệp không hợp lệ");
		}
		// Validate mã số thuế
		if (company.getTaxCode() == null || !company.getTaxCode().matches("^[0-9\\-]{10,15}$")) {
			return new AuthResponse("", "Mã số thuế không hợp lệ");
		}

		Company oldCompany = existingCompany.get();
		oldCompany.setTaxCode(company.getTaxCode());
		oldCompany.setCompanyName(company.getCompanyName());
		oldCompany.setEmail(company.getEmail());
		companyRepository.save(oldCompany);

		return new AuthResponse("", "Success");
	}

	@PostMapping("/check-email")
	public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> requestBody) {
		String googleToken = requestBody.get("token");
		DecodedJWT decodedJWT = JWT.decode(googleToken);
		String email = decodedJWT.getClaim("email").asString();

		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		if (user.isPresent()) {
			UserAccount userAccount = user.get();
			Optional<Seeker> seekerOptional = seekerRepository.findById(userAccount.getUserId());
			Optional<Company> companyOptional = companyRepository.findById(userAccount.getUserId());

			// 4. Main logic
			if (seekerOptional.isPresent() || companyOptional.isPresent()) {
				return ResponseEntity.ok(true);
			}
		}

		String name = decodedJWT.getClaim("name").asString();
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

			String defaultAddress = ", , ";
			if (newUser.getUserType() != null) {
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
		try {
			companyService.blockCompany(companyId, blockCompanyDTO.getBlockedReason(), blockCompanyDTO.getBlockedUntil());
			return ResponseEntity.ok("Đã khóa tài khoản thành công");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	@PutMapping("/unblock-company/{companyId}")
	public ResponseEntity<String> unblockCompany(@PathVariable UUID companyId) throws MessagingException {
		try {
			companyService.unblockCompany(companyId);
			return ResponseEntity.ok("Mở khóa tài khoản thành công");
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}
}