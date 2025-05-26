package com.job_portal.controller;

import com.job_portal.DTO.CompanyDTO;
import com.job_portal.DTO.CompanyWithCountJobDTO;
import com.job_portal.config.JwtProvider;
import java.util.Date;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.Industry;
import com.job_portal.models.Seeker;
import com.job_portal.models.UserAccount;
import com.job_portal.projection.CompanyProjection;
import com.job_portal.projection.CompanyWithCountJob;
import com.job_portal.repository.CityRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.ReviewRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IApplyJobService;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.TaxCodeValidation;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.*;

import javax.crypto.SecretKey;

import static org.hamcrest.CoreMatchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CompanyController.class)
class CompanyControllerTest {

	@MockBean
	private CompanyRepository companyRepository;

	@MockBean
	private IndustryRepository industryRepository;

	@MockBean
	private ICompanyService companyService;

	@MockBean
	private RestTemplate restTemplate;

	@MockBean
	private UserAccountRepository userAccountRepository;

	@MockBean
	private CityRepository cityRepository;

	@MockBean
	private IApplyJobService applyJobService;

	@MockBean
	private TaxCodeValidation taxCodeValidation;

	@MockBean
	private ReviewRepository reviewRepository;

	private UserAccount userSeeker;
	private UserAccount userCompany;
	private Company company;
	
	private static final String SECRET_KEY = "dsadasdhasuidhuasdyuiasydiuasasdasd";
    private static final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

	@Autowired
	private MockMvc mockMvc;
	
	private String jwtToken;

	private static String jwt;
	private static String jwt_seeker;
	
	private final String USER_EMAIL_COMPANY = "danggiathuanhl@gmail.com";
	private final String USER_EMAIL_SEEKER = "giathuanhl@gmail.com";
	private final UUID COMPANY_ID = UUID.randomUUID();
	private final String TAX_CODE = "1234567890";
	private final String COMPANY_NAME = "DangGiaThuan";


	@BeforeEach
	void setUp() {

		userSeeker = new UserAccount();
		userSeeker.setEmail(USER_EMAIL_SEEKER);
		
		userCompany = new UserAccount();
		userCompany.setEmail(USER_EMAIL_COMPANY);

		company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setCompanyName(COMPANY_NAME);

		userCompany.setCompany(company);
		
		
	}

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com")
	void testValidateTaxCode_Success() throws Exception {
		// Arrange
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setTaxCode(TAX_CODE);
		when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.of(company));
		when(taxCodeValidation.checkTaxCode(TAX_CODE)).thenReturn(true);

		// Act & Assert
		mockMvc.perform(get("/company/validate").param("companyId", COMPANY_ID.toString())).andExpect(status().isOk())
				.andExpect(content().string("true"));

		verify(companyRepository, times(1)).findById(COMPANY_ID);
		verify(taxCodeValidation, times(1)).checkTaxCode(TAX_CODE);
	}

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com")
    void testValidateTaxCode_CompanyNotFound() throws Exception {
        // Arrange
        when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/company/validate")
                .param("companyId", COMPANY_ID.toString()))
                .andExpect(status().isNotFound())
                .andExpect(content().string("false"));

        verify(companyRepository, times(1)).findById(COMPANY_ID);
        verify(taxCodeValidation, never()).checkTaxCode(anyString());
    }

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com")
	void testValidTaxCode_Success() throws Exception {
		// Arrange
		UserAccount user = new UserAccount();
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setTaxCode(TAX_CODE);
		user.setCompany(company);
		
		Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("danggiathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        long expirationTime = 24 * 60 * 60 * 1000; 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userCompany));

		when(userAccountRepository.findByEmail(USER_EMAIL_COMPANY)).thenReturn(Optional.of(user));
		when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.of(company));
		when(taxCodeValidation.checkTaxCode(TAX_CODE)).thenReturn(true);

		// Act & Assert
		mockMvc.perform(get("/company/validate-tax").header("Authorization", jwtToken)).andDo(print())
				.andExpect(status().isOk()).andExpect(content().string("true"));

		verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL_COMPANY);
		verify(companyRepository, times(1)).findById(COMPANY_ID);
		verify(taxCodeValidation, times(1)).checkTaxCode(TAX_CODE);
	}

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com", roles = { "USER" })
	void testValidTaxCode_InvalidTaxCode() throws Exception {
		UserAccount user = new UserAccount();
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setTaxCode(TAX_CODE);
		user.setCompany(company);
		
		Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("danggiathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        long expirationTime = 24 * 60 * 60 * 1000; 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userCompany));

		when(userAccountRepository.findByEmail(USER_EMAIL_COMPANY)).thenReturn(Optional.of(user));
		when(companyRepository.findById(COMPANY_ID)).thenReturn(Optional.of(company));
		when(taxCodeValidation.checkTaxCode(TAX_CODE)).thenReturn(false);

		mockMvc.perform(get("/company/validate-tax").header("Authorization", jwtToken)).andDo(print())
				.andExpect(status().isOk()).andExpect(content().string("false"));

		verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL_COMPANY);
		verify(companyRepository, times(1)).findById(COMPANY_ID);
		verify(taxCodeValidation, times(1)).checkTaxCode(TAX_CODE);
	}

	@Test
	@WithMockUser(username = "21110665@student.hcmute.edu.vn")
	void testGetCompaniesWithSavedApplications_Success() throws Exception {
	    // Arrange
	    CompanyProjection projection = mock(CompanyProjection.class);
	    when(projection.getCompanyId()).thenReturn(COMPANY_ID);
	    when(projection.getCompanyName()).thenReturn(COMPANY_NAME);
	    when(projection.getApplicationCount()).thenReturn(10L);
	    when(projection.getIndustryIds()).thenReturn("1,2");
	    when(projection.getCityId()).thenReturn(1);
	    when(projection.getAddress()).thenReturn("123 Street");
	    when(projection.getDescription()).thenReturn("Description");
	    when(projection.getLogo()).thenReturn("logo.png");
	    when(projection.getContact()).thenReturn("contact");
	    when(projection.getEmail()).thenReturn(USER_EMAIL_COMPANY);
	    when(projection.getEstablishedTime()).thenReturn(java.sql.Date.valueOf("2023-01-01"));
	    when(projection.getTaxCode()).thenReturn(TAX_CODE);

	    // Debug mock
	    System.out.println("Mocked industryIds: " + projection.getIndustryIds());
	    System.out.println("Mocked establishedTime: " + projection.getEstablishedTime());

	    when(companyRepository.findCompaniesWithSavedApplications()).thenReturn(List.of(projection));

	    // Act
	    ResultActions result = mockMvc.perform(get("/company/get-all"))
	            .andDo(print());

	    // Assert
	    result.andExpect(status().isOk())
	            .andExpect(jsonPath("$[0].companyId").value(COMPANY_ID.toString()))
	            .andExpect(jsonPath("$[0].companyName").value(COMPANY_NAME))
	            .andExpect(jsonPath("$[0].applicationCount").value(10))
	            .andExpect(jsonPath("$[0].cityId").value(1))
	            .andExpect(jsonPath("$[0].address").value("123 Street"))
	            .andExpect(jsonPath("$[0].description").value("Description"))
	            .andExpect(jsonPath("$[0].logo").value("logo.png"))
	            .andExpect(jsonPath("$[0].contact").value("contact"))
	            .andExpect(jsonPath("$[0].email").value(USER_EMAIL_COMPANY))
	            .andExpect(jsonPath("$[0].establishedTime").value("2023-01-01"))
	            .andExpect(jsonPath("$[0].taxCode").value(TAX_CODE));

	    // Log response body
	    String responseBody = result.andReturn().getResponse().getContentAsString();
	    System.out.println("Response Body: " + responseBody);

	    verify(companyRepository, times(1)).findCompaniesWithSavedApplications();
	}

	@Test
	@WithMockUser(username = "giathuanhl@gmail.com")
	void testSearchCompaniesByFeature_Success() throws Exception {
	    // Arrange
	    CompanyWithCountJob projection = mock(CompanyWithCountJob.class);
	    when(projection.getCompanyId()).thenReturn(COMPANY_ID);
	    when(projection.getCompanyName()).thenReturn(COMPANY_NAME);
	    when(projection.getLogo()).thenReturn("logo.png");
	    when(projection.getIndustryIds()).thenReturn("1,2");
	    when(projection.getDescription()).thenReturn("Description");
	    when(projection.getCityId()).thenReturn(1);
	    when(projection.getCountJob()).thenReturn(5L);

	    // Debug mock
	    System.out.println("Mocked industryIds: " + projection.getIndustryIds());

	    Page<CompanyWithCountJob> page = new PageImpl<>(List.of(projection));
	    when(companyRepository.findCompaniesByFilters(anyString(), any(), any(), any())).thenReturn(page);

	    // Act
	    ResultActions result = mockMvc.perform(get("/company/search-company-by-feature")
	            .param("title", "Test")
	            .param("cityId", "1")
	            .param("industryId", "1")
	            .param("page", "0")
	            .param("size", "12"))
	            .andDo(print());

	    // Assert
	    result.andExpect(status().isOk());

	    // Log response body
	    String responseBody = result.andReturn().getResponse().getContentAsString();
	    System.out.println("Response Body: " + responseBody);

	    verify(companyRepository, times(1)).findCompaniesByFilters(anyString(), any(), any(), any());
	}

	@Test
	@WithMockUser(username = "21110665@student.hcmute.edu.vn")
	void testFindAllCompanies_Success() throws Exception {
		// Arrange
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setCompanyName(COMPANY_NAME);
		when(companyRepository.findAll()).thenReturn(List.of(company));

		// Act & Assert
		mockMvc.perform(get("/company/find-all")).andExpect(status().isOk())
				.andExpect(jsonPath("$[0].companyId").value(COMPANY_ID.toString()))
				.andExpect(jsonPath("$[0].companyName").value(COMPANY_NAME));

		verify(companyRepository, times(1)).findAll();
	}

	@Test
	@WithMockUser(username = "giathuanhl@gmail.com")
	void testFindTop6CompanyFitUserId_Success() throws Exception {
		// Arrange
		UserAccount user = new UserAccount();
		Seeker seeker = new Seeker();
		Industry industry = new Industry();
		industry.setIndustryId(14);
		seeker.setIndustry(List.of(industry));
		user.setSeeker(seeker);

		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setCompanyName(COMPANY_NAME);
		
		Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("giathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        long expirationTime = 24 * 60 * 60 * 1000; 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(userCompany));

		when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(user));
		when(companyRepository.findTop6CompaniesByIndustryIds(List.of(14))).thenReturn(List.of(company));

		// Act & Assert
		mockMvc.perform(get("/company/find-companies-fit-userId").header("Authorization", jwtToken))
				.andExpect(status().isOk());

		verify(companyRepository, times(1)).findTop6CompaniesByIndustryIds(List.of(14));
	}

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com")
	void testUpdateCompany_Success() throws Exception {
		// Arrange
		UserAccount user = new UserAccount();
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		user.setCompany(company);
		CompanyDTO companyDTO = new CompanyDTO();
		companyDTO.setCompanyId(COMPANY_ID);
		companyDTO.setCompanyName(COMPANY_NAME);
		
		Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("danggiathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        long expirationTime = 24 * 60 * 60 * 1000; 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userCompany));

		when(userAccountRepository.findByEmail(USER_EMAIL_COMPANY)).thenReturn(Optional.of(user));
		when(companyService.updateCompany(any(), eq(COMPANY_ID))).thenReturn(true);

		// Act & Assert
		mockMvc.perform(put("/company/update-company").header("Authorization", jwtToken).with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"companyId\": \"" + COMPANY_ID + "\", \"companyName\": \"" + COMPANY_NAME + "\"}"))
				.andDo(print()).andExpect(status().isCreated())
				.andExpect(content().string("Cập nhật thông tin thành công"));

		verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL_COMPANY);
		verify(companyService, times(1)).updateCompany(any(), eq(COMPANY_ID));
	}

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com")
	void testUpdateCompany_Failure() throws Exception {
		// Arrange
		UserAccount user = new UserAccount();
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		user.setCompany(company);
		CompanyDTO companyDTO = new CompanyDTO();
		companyDTO.setCompanyId(COMPANY_ID);
		companyDTO.setCompanyName(COMPANY_NAME);
		
		Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("danggiathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        long expirationTime = 24 * 60 * 60 * 1000; 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userCompany));

		when(userAccountRepository.findByEmail(USER_EMAIL_COMPANY)).thenReturn(Optional.of(user));
		when(companyService.updateCompany(any(), eq(COMPANY_ID))).thenReturn(false);

		// Act & Assert
		mockMvc.perform(put("/company/update-company").header("Authorization", jwtToken).with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"companyId\": \"" + COMPANY_ID + "\", \"companyName\": \"" + COMPANY_NAME + "\"}"))
				.andDo(print()).andExpect(status().isBadRequest())
				.andExpect(content().string("Cập nhật thông tin thất bại"));

		verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL_COMPANY);
		verify(companyService, times(1)).updateCompany(any(), eq(COMPANY_ID));
	}

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com")
	void testGetCompanyById_Success() throws Exception {
		// Arrange
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setCompanyName(COMPANY_NAME);
		when(companyService.findCompanyById(COMPANY_ID)).thenReturn(company);

		// Act & Assert
		mockMvc.perform(get("/company/profile-company/" + COMPANY_ID)).andExpect(status().isOk())
				.andExpect(jsonPath("$.companyId").value(COMPANY_ID.toString()));

		verify(companyService, times(1)).findCompanyById(COMPANY_ID);
	}

	@Test
	@WithMockUser(username = "danggiathuanhl@gmail.com")
	void testGetProfileCompany_Success() throws Exception {
		// Arrange
		UserAccount user = new UserAccount();
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setCompanyName(COMPANY_NAME);
		user.setCompany(company);
		
		Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("danggiathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        long expirationTime = 24 * 60 * 60 * 1000; 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail("danggiathuanhl@gmail.com")).thenReturn(Optional.of(userCompany));

		when(userAccountRepository.findByEmail(USER_EMAIL_COMPANY)).thenReturn(Optional.of(user));
		when(companyService.findCompanyById(COMPANY_ID)).thenReturn(company);

		// Act
		ResultActions result = mockMvc.perform(get("/company/profile").header("Authorization", jwtToken))
				.andDo(print());

		// Assert
		result.andExpect(status().isOk()).andExpect(jsonPath("$.companyId").value(COMPANY_ID.toString()))
				.andExpect(jsonPath("$.companyName").value(COMPANY_NAME))
				.andExpect(content().string(containsString(COMPANY_NAME)));

		// Log response body
		String responseBody = result.andReturn().getResponse().getContentAsString();
		System.out.println("Response Body: " + responseBody);

		verify(userAccountRepository, times(1)).findByEmail(USER_EMAIL_COMPANY);
		verify(companyService, times(1)).findCompanyById(COMPANY_ID);
	}

	@Test
	@WithMockUser(username = "giathuanhl@gmail.com")
	void testCheckIfSaved_Success() throws Exception {
		// Arrange
		UserAccount user = new UserAccount();
		UUID userId = UUID.randomUUID();
		user.setUserId(userId);
		user.setEmail("giathuanhl@gmail.com");
		
		Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("danggiathuanhl@gmail.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        long expirationTime = 24 * 60 * 60 * 1000; 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        jwtToken = "Bearer " + Jwts.builder()
                .setIssuer("GiaThuanSenpai")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();

        when(JwtProvider.generateToken(authentication)).thenReturn(jwtToken);
        when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(userCompany));

		try (MockedStatic<JwtProvider> mockedStatic = mockStatic(JwtProvider.class)) {
			// Sử dụng anyString() để khớp với bất kỳ token nào
			mockedStatic.when(() -> JwtProvider.getEmailFromJwtToken(anyString())).thenReturn("giathuanhl@gmail.com");

			when(userAccountRepository.findByEmail("giathuanhl@gmail.com")).thenReturn(Optional.of(user));
			when(applyJobService.isEligibleForRating(userId, COMPANY_ID)).thenReturn(true);

			// Act & Assert
			mockMvc.perform(get("/company/can-rating/" + COMPANY_ID).header("Authorization", jwtToken)).andDo(print())
					.andExpect(status().isOk()).andExpect(content().string("true"));

			verify(applyJobService, times(1)).isEligibleForRating(userId, COMPANY_ID);
		}
	}

	@Test
	@WithMockUser(username = "giathuanhl@gmail.com")
	void testGetIndustryNameById_Success() throws Exception {
		// Arrange
		Industry industry = new Industry();
		industry.setIndustryId(1);
		industry.setIndustryName("Tech");
		when(industryRepository.findById(1)).thenReturn(Optional.of(industry));

		// Act & Assert
		mockMvc.perform(get("/company/get-industry-name/1")).andExpect(status().isOk())
				.andExpect(content().string("Tech"));

		verify(industryRepository, times(1)).findById(1);
	}

	@Test
	@WithMockUser(username = "giathuanhl@gmail.com")
	void testSearchCompanies_Success() throws Exception {
		// Arrange
		Company company = new Company();
		company.setCompanyId(COMPANY_ID);
		company.setCompanyName(COMPANY_NAME);
		Page<Company> page = new PageImpl<>(List.of(company));
		when(companyRepository.findCompaniesWithFilters(anyString(), anyString(), any())).thenReturn(page);

		// Act & Assert
		mockMvc.perform(get("/company/get-all-companies").param("companyName", COMPANY_NAME)
				.param("industryName", "IT").param("page", "0").param("size", "5")).andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].companyId").value(COMPANY_ID.toString()));

		verify(companyRepository, times(1)).findCompaniesWithFilters(anyString(), anyString(), any());
	}
}
