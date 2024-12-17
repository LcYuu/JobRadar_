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
import com.job_portal.repository.ForgotPasswordRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.repository.UserTypeRepository;
import com.job_portal.response.AuthResponse;
import com.job_portal.response.ChangePassword;
import com.job_portal.service.AccountDetailServiceImpl;
import com.job_portal.utils.EmailUtil;
import com.job_portal.utils.OtpUtil;
import com.job_portal.service.TaxCodeValidation;
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

	@Autowired
	private TaxCodeValidation taxCodeValidation;

	@PostMapping("/signup")
	public ResponseEntity<String> createUserAccount(@RequestBody UserSignupDTO userSignupDTO) {
	    try {
	        Optional<UserAccount> isExist = userAccountRepository.findByEmail(userSignupDTO.getEmail());
	        if (isExist.isPresent()) {
	            return ResponseEntity.status(HttpStatus.CONFLICT)
	                    .body("Email này đã được sử dụng ở tài khoản khác");
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
	        return ResponseEntity.ok("Vui lòng check email để nhận mã đăng ký");
	    } catch (MessagingException e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Không thể gửi OTP, vui lòng thử lại");
	    }
	}
	
	@PostMapping("/verify-employer")
	public ResponseEntity<String> verifyEmployerInfo(@RequestBody Company company, @RequestParam String email) {
	    try {
	        Optional<UserAccount> userOptional = userAccountRepository.findByEmail(email);
	        if (!userOptional.isPresent()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body("Không tìm thấy tài khoản");
	        }
	        
	        UserAccount user = userOptional.get();
	        if (user.getUserType().getUserTypeId() != 3) {
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("Tài khoản không phải là nhà tuyển dụng");
	        }

	        if (company == null || company.getTaxCode() == null || company.getTaxCode().isEmpty()) {
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("Thông tin công ty và mã số thuế là bắt buộc");
	        }

	        boolean isValidTaxCode = taxCodeValidation.checkTaxCode(company.getTaxCode());
	        if (!isValidTaxCode) {
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("Mã số thuế không hợp lệ hoặc không tồn tại");
	        }

	        company.setUserAccount(user);
	        company.setIndustry(industryRepository.findById(1).orElse(null));
	        company.setCity(cityRepository.findById(company.getCity().getCityId()).orElse(null));
	        company.setAddress(", , ");
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
	        if (user.getOtp().equals(otp) && 
	            Duration.between(user.getOtpGeneratedTime(), LocalDateTime.now()).getSeconds() < (2 * 60)) {
	            
	            user.setActive(true);
	            user.setOtp(null);
	            user.setOtpGeneratedTime(null);
	            
	            // Khởi tạo thông tin cơ bản cho người tìm việc
	            if (user.getUserType().getUserTypeId() == 2) {
	                Seeker seeker = new Seeker();
	                seeker.setUserAccount(user);
	                seeker.setIndustry(industryRepository.findById(0).orElse(null));
	                seeker.setAddress(", , ");
	                user.setSeeker(seeker);
	            }
	            
	            userAccountRepository.save(user);
	            return ResponseEntity.ok("Xác thực tài khoản thành công");
	        }
	    }
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	           .body("Xác thực OTP thất bại, vui lòng thử lại");
	}
	
	@PostMapping("/login")
	public AuthResponse signin(@RequestBody LoginDTO login) {
		if (login.getEmail() == null || login.getEmail().isEmpty()) {
			throw new IllegalArgumentException("Email không được để trống");
		}
		if (login.getPassword() == null || login.getPassword().isEmpty()) {
			throw new IllegalArgumentException("Mật khẩu không được để trống");
		}
		if (!isValidPassword(login.getPassword())) {
			throw new IllegalArgumentException(
					"Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
		}
		Optional<UserAccount> userOpt = userAccountRepository.findByEmail(login.getEmail());
		if (userOpt.isEmpty()) {
			return new AuthResponse("", "Tài khoản hoặc mật khẩu không đúng");
		}
		UserAccount user = userOpt.get();
		if (!user.isActive()) {
			return new AuthResponse("", "Tài khoản của bạn chưa được xác thực");
		}
		try {
			Authentication authentication = authenticate(login.getEmail(), login.getPassword());
			String token = JwtProvider.generateToken(authentication);
			user.setLastLogin(LocalDateTime.now());
			userAccountRepository.save(user);
			return new AuthResponse(token, "Đăng nhập thành công");
		} catch (Exception e) {
			return new AuthResponse("", "Tài khoản hoặc mật khẩu không đúng");
		}
	}
	private boolean isValidPassword(String password) {
		String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
		return password.matches(passwordPattern);
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

	    // Lưu expirationTime là LocalDateTime thay vì Date
	    LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(1);  // Thêm 1 phút
	    ForgotPassword fp = ForgotPassword.builder()
	            .otp(otp)
	            .expirationTime(expirationTime)
	            .userAccount(userAccount.get())
	            .build();
	    forgotPasswordRepository.save(fp);

	    return ResponseEntity.ok("Vui lòng kiểm tra email để nhận mã OTP");
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

	    // Log thông tin để kiểm tra
	    System.out.println("Expiration time: " + fp.getExpirationTime());
	    System.out.println("Current time: " + LocalDateTime.now());

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
		String googleToken = requestBody.get("token"); // Lấy googleToken từ frontend

		// Giải mã token Google (JWT) để lấy thông tin người dùng
		DecodedJWT decodedJWT = JWT.decode(googleToken);
		String email = decodedJWT.getClaim("email").asString();

		String jwtToken = jwtProvider.generateTokenFromEmail(email); // Sử dụng auth trực tiếp
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

//		user.get().setLastLogin(LocalDateTime.now());
//		userAccountRepository.save(user.get());
		// Trả về JWT token cho người dùng
		System.out.println("a" + jwtToken);
		AuthResponse res;
		res = new AuthResponse(jwtToken, "Đăng nhập thành công");
		return res;
	}

	@PostMapping("/update-role/{role}")
	public ResponseEntity<AuthResponse> updateRole(@RequestHeader("Authorization") String jwt,
			@PathVariable Integer role) {
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
			seeker.setAddress(", , ");
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
			company.setAddress(", , ");
			user.get().setCompany(company);
			userAccountRepository.save(newUser);
		}
		AuthResponse response = new AuthResponse(String.valueOf(role), "Cập nhật vai trò thành công");
		return ResponseEntity.ok(response);
	}

	@PostMapping("/check-email")
	public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> requestBody) {
		String googleToken = requestBody.get("token");

		DecodedJWT decodedJWT = JWT.decode(googleToken);
		String email = decodedJWT.getClaim("email").asString();
	    Optional<UserAccount> user = userAccountRepository.findByEmail(email);
	    System.out.println("d" + user.toString());
	    if (user.isPresent()) {
	        return ResponseEntity.ok(true); 
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
			// Tạo JWT Token cho người dùng và truyền Authentication object
			return ResponseEntity.ok(false); // Người dùng chưa tồn tại
		}
	}
}