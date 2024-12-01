package com.job_portal.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.DTO.CompanyDTO;
import com.job_portal.DTO.CompanyWithCountJobDTO;
import com.job_portal.config.JwtProvider;
import com.job_portal.models.ApplyJob;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.Industry;
import com.job_portal.models.JobPost;
import com.job_portal.models.Review;
import com.job_portal.models.UserAccount;
import com.job_portal.repository.ApplyJobRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.ReviewRepository;
import com.job_portal.repository.UserAccountRepository;
import com.job_portal.service.IApplyJobService;
import com.job_portal.service.ICompanyService;
import com.job_portal.service.TaxCodeValidation;
import com.job_portal.specification.CompanySpecification;
import com.job_portal.specification.JobPostSpecification;
import com.social.exceptions.AllExceptions;

@RestController
@RequestMapping("/company")
public class CompanyController {
	@Autowired
	CompanyRepository companyRepository;
	@Autowired
	IndustryRepository industryRepository;
	@Autowired
	ICompanyService companyService;

	@Autowired
	private UserAccountRepository userAccountRepository;
	
	@Autowired
	private IApplyJobService applyJobService;
	@Autowired
	private TaxCodeValidation taxCodeValidation;
	
	@Autowired
	private ReviewRepository reviewRepository;
	
	@GetMapping("/validate")
	public ResponseEntity<Boolean> validateTaxCode(@RequestParam UUID companyId) {
	    // Tìm công ty theo ID
	    Optional<Company> companyOptional = companyRepository.findById(companyId);

	    if (companyOptional.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(false); // Không tìm thấy công ty -> false
	    }

	    Company company = companyOptional.get();
	    String taxCode = company.getTaxCode();

	    // Kiểm tra mã số thuế qua API VietQR
	    boolean isTaxCodeValid = taxCodeValidation.checkTaxCode(taxCode);

	    // Trả về true nếu hợp lệ, false nếu không hợp lệ
	    return ResponseEntity.ok(isTaxCodeValid);
	}
	
	@GetMapping("/validate-tax")
	public ResponseEntity<Boolean> validTaxCode(@RequestHeader("Authorization") String jwt) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
	    // Tìm công ty theo ID
	    Optional<Company> companyOptional = companyRepository.findById(user.get().getCompany().getCompanyId());

	    if (companyOptional.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(false); // Không tìm thấy công ty -> false
	    }

	    Company company = companyOptional.get();
	    String taxCode = company.getTaxCode();

	    // Kiểm tra mã số thuế qua API VietQR
	    boolean isTaxCodeValid = taxCodeValidation.checkTaxCode(taxCode);

	    // Trả về true nếu hợp lệ, false nếu không hợp lệ
	    return ResponseEntity.ok(isTaxCodeValid);
	}


	@GetMapping("/get-all")
	public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
	    List<CompanyDTO> res = companyRepository.findCompaniesWithSavedApplications().stream().limit(6).collect(Collectors.toList());
	    return new ResponseEntity<>(res, HttpStatus.OK);
	}
	
	@GetMapping("/find-all")
	public ResponseEntity<List<Company>> findAllCompanies() {
	    List<Company> res = companyRepository.findAll();
	    return new ResponseEntity<>(res, HttpStatus.OK);
	}
	
	@GetMapping("/find-companies-fit-userId")
	public ResponseEntity<List<Company>> findTop8CompanyFitUserId(@RequestHeader("Authorization") String jwt) throws AllExceptions {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);

		
		List<Company> companies = companyRepository.findTop6CompaniesByIndustryId(user.get().getSeeker().getIndustry().getIndustryId()).stream()
		        .limit(6)
		        .collect(Collectors.toList());
		return new ResponseEntity<>(companies, HttpStatus.OK);
	}

	@PutMapping("/update-company")
	public ResponseEntity<String> updateCompany(@RequestHeader("Authorization") String jwt,
			@RequestBody CompanyDTO company) throws AllExceptions {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		boolean isUpdated = companyService.updateCompany(company, user.get().getCompany().getCompanyId());
		if (isUpdated) {
			return new ResponseEntity<>("Cập nhật thông tin thành công", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>("Cập nhật thông tin thất bại", HttpStatus.BAD_REQUEST);
		}
	}


	@GetMapping("/searchByName")
	public ResponseEntity<Object> searchCompaniesByName(@RequestParam("companyName") String companyName) {
		try {
			List<Company> companies = companyService.searchCompaniesByName(companyName);
			return ResponseEntity.ok(companies);
		} catch (AllExceptions e) {
			// Trả về thông báo từ service
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/searchByCity")
	public ResponseEntity<Object> searchCompaniesByCity(@RequestParam("cityName") String cityName) {
		try {
			List<Company> companies = companyService.searchCompaniesByCity(cityName);
			return ResponseEntity.ok(companies);
		} catch (AllExceptions e) {
			// Trả về thông báo từ service khi không tìm thấy công ty
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/searchByIndustry")
	public ResponseEntity<Object> searchCompaniesByIndustry(@RequestParam("industryName") String industryName) {
		try {
			List<Company> companies = companyService.searchCompaniesByIndustry(industryName);
			return ResponseEntity.ok(companies);
		} catch (AllExceptions e) {
			// Trả về thông báo từ service khi không tìm thấy công ty
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		} catch (Exception e) {
			// Trả về thông báo lỗi chung
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.");
		}
	}

	@GetMapping("/profile-company/{companyId}")
	public ResponseEntity<Company> getCompanyById(@PathVariable("companyId") UUID companyId) throws AllExceptions {
		try {
			Company company = companyService.findCompanyById(companyId);
			return new ResponseEntity<>(company, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping("/profile")
	public ResponseEntity<Company> getProfileCompany(@RequestHeader("Authorization") String jwt) throws AllExceptions {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
		try {
			Company company = companyService.findCompanyById(user.get().getCompany().getCompanyId());
			return new ResponseEntity<>(company, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping("/can-rating/{companyId}")
    public ResponseEntity<Boolean> checkIfSaved(@RequestHeader("Authorization") String jwt, 
    		@PathVariable("companyId") UUID companyId) {
		String email = JwtProvider.getEmailFromJwtToken(jwt);
		Optional<UserAccount> user = userAccountRepository.findByEmail(email);
        boolean isSaved = applyJobService.isEligibleForRating(user.get().getUserId(), companyId);
        return ResponseEntity.ok(isSaved);
    }
	
	@GetMapping("/search-company-by-feature")
	public Page<CompanyWithCountJobDTO> searchCompanies(
	        @RequestParam(required = false) String title,
	        @RequestParam(required = false) Integer cityId,
	        @RequestParam(required = false) Integer industryId,
	        @RequestParam(defaultValue = "0") int page, 
	        @RequestParam(defaultValue = "6") int size) { 

	    
	    Pageable pageable = PageRequest.of(page, size); 
	    return companyRepository.findCompaniesByFilters(title, cityId, industryId, pageable);
	}
	
	@GetMapping("/get-industry-name/{industryId}")
	public ResponseEntity<String> getIndustryNameById(@PathVariable Integer industryId) {
	    try {
	        Optional<Industry> industry = industryRepository.findById(industryId);
	        if (industry.isPresent()) {
	            return ResponseEntity.ok(industry.get().getIndustryName());
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Error fetching industry name");
	    }
	}
	
	@GetMapping("/get-all-companies")
	public ResponseEntity<Map<String, Object>> getAllCompanies(
	    @RequestParam(defaultValue = "0") int page,
	    @RequestParam(defaultValue = "10") int size
	) {
	    try {
	        Pageable paging = PageRequest.of(page, size);
	        Page<Company> pageCompanies = companyRepository.findAll(paging);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("companies", pageCompanies.getContent());
	        response.put("currentPage", pageCompanies.getNumber());
	        response.put("totalItems", pageCompanies.getTotalElements());
	        response.put("totalPages", pageCompanies.getTotalPages());
	        
	        return new ResponseEntity<>(response, HttpStatus.OK);
	    } catch (Exception e) {
	        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
	    }
	}
	

}
