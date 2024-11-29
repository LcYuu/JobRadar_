package com.job_portal.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.CompanyDTO;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.Industry;
import com.job_portal.models.Seeker;
import com.job_portal.repository.CityRepository;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.repository.JobPostRepository;
import com.job_portal.repository.SeekerRepository;
import com.social.exceptions.AllExceptions;

import jakarta.persistence.EntityNotFoundException;

@Service
public class CompanyServiceImpl implements ICompanyService {

	@Autowired
	CompanyRepository companyRepository;
	@Autowired
	IIndustryService industryService;
	@Autowired
	CityRepository cityRepository;
	@Autowired
	IndustryRepository industryRepository;
	@Autowired
	ISeekerService seekerService;
	
	@Autowired
	SeekerRepository seekerRepository;
	@Autowired
	JobPostRepository jobPostRepository;

	@Override
	public boolean deleteCompany(UUID companyId) throws AllExceptions {
		Optional<Company> company = companyRepository.findById(companyId);

		if (company.isEmpty()) {
			throw new AllExceptions("Company not exist with id: " + companyId);
		}

		companyRepository.delete(company.get());
		return true;
	}

	@Override
	public boolean updateCompany(CompanyDTO companyDTO, UUID companyId)
			throws AllExceptions {
		// Tìm kiếm Company theo id
		Optional<Company> existingCompany = companyRepository.findById(companyId);

		// Lấy đối tượng Company cũ
		Company oldCompany = existingCompany.get();
		boolean isUpdated = false;

		// Cập nhật các trường cơ bản
		if (companyDTO.getCompanyName() != null) {
			oldCompany.setCompanyName(companyDTO.getCompanyName());
			isUpdated = true;
		}

		if (companyDTO.getAddress() != null) {
			oldCompany.setAddress(companyDTO.getAddress());
			isUpdated = true;
		}

		if (companyDTO.getDescription() != null) {
			oldCompany.setDescription(companyDTO.getDescription());
			isUpdated = true;
		}
		
		if (companyDTO.getTaxCode() != null) {
			oldCompany.setTaxCode(companyDTO.getTaxCode());
			isUpdated = true;
		}

		if (companyDTO.getLogo() != null) {
			oldCompany.setLogo(companyDTO.getLogo());
			isUpdated = true;
		}

		if (companyDTO.getContact() != null) {
			oldCompany.setContact(companyDTO.getContact());
			isUpdated = true;
		}

		if (companyDTO.getEmail() != null) {
			oldCompany.setEmail(companyDTO.getEmail());
			isUpdated = true;
		}
		
		if (companyDTO.getEstablishedTime() != null) {
			oldCompany.setEstablishedTime(companyDTO.getEstablishedTime());
			isUpdated = true;
		}

		// Tìm Industry mới dựa trên industryId
		if (companyDTO.getIndustryId() != null) {
			Optional<Industry> newIndustry = industryRepository.findById(companyDTO.getIndustryId());
	
			// Cập nhật Industry nếu khác
			if (!newIndustry.get().equals(oldCompany.getIndustry())) {
				oldCompany.setIndustry(newIndustry.get());
				isUpdated = true;
			}
		}

		// Tìm City mới dựa trên cityId
		if (companyDTO.getCityId() != null) {
			Optional<City> newCity = cityRepository.findById(companyDTO.getCityId());
	
			// Cập nhật City nếu khác
			if (!newCity.get().equals(oldCompany.getCity())) {
				oldCompany.setCity(newCity.get());
				isUpdated = true;
			}
		}

		// Nếu có thay đổi, lưu lại đối tượng
		if (isUpdated) {
			companyRepository.save(oldCompany);
		}

		return isUpdated; // Trả về true nếu có cập nhật, false nếu không
	}

	@Override
	public List<Company> searchCompaniesByName(String companyName) throws AllExceptions {
		try {

			List<Company> companies = companyRepository.findCompanyByCompanyName(companyName);
			if (companies.isEmpty()) {
				throw new AllExceptions("Không tìm thấy công ty nào");
			}

			return companies;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

	@Override
	public List<Company> searchCompaniesByCity(String cityName) throws AllExceptions {
		try {

			List<Company> companies = companyRepository.findCompaniesByCityName(cityName);
			if (companies.isEmpty()) {
				throw new AllExceptions("Không tìm thấy công ty nào với tên thành phố: " + cityName);
			}
			return companies;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

	@Override
	public Company findCompanyById(UUID companyId) throws AllExceptions {
		try {
			// Tìm kiếm công ty dựa trên companyId
			Optional<Company> companyOptional = companyRepository.findCompanyByCompanyId(companyId);

			// Trả về công ty nếu tìm thấy
			return companyOptional.get();
		} catch (Exception e) {
			// Ném ra ngoại lệ nếu có lỗi xảy ra
			throw new AllExceptions(e.getMessage());
		}
	}

	@Override
	public List<Company> searchCompaniesByIndustry(String industryName) throws AllExceptions {
		try {

			List<Company> companies = companyRepository.findCompaniesByIndustryName(industryName);
			if (companies.isEmpty()) {
				throw new AllExceptions("Không tìm thấy công ty nào với tên ngành: " + industryName);
			}
			return companies;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

	@Override
	public Map<String, Object> followCompany(UUID companyId, UUID userId) throws AllExceptions {
	    
	    Company company = findCompanyById(companyId);
	    Seeker seeker = seekerService.findSeekerById(userId);

	    Map<String, Object> result = new HashMap<>();
	    
	    if(seeker.getFollowedCompanies().contains(company)) {
	    	seeker.getFollowedCompanies().remove(company);
	    	company.getFollows().remove(seeker);
	        result.put("action", "unfollow");
	        result.put("message", "Bỏ theo dõi công ty thành công");
	    } else {
	    	seeker.getFollowedCompanies().add(company);
	    	company.getFollows().add(seeker);
	        result.put("action", "follow");
	        result.put("message", "Theo dõi công ty thành công");
	    }
	    companyRepository.save(company);
	    seekerRepository.save(seeker);
	    return result;
	}
	   public Integer getIndustryIdByCompanyId(UUID companyId) {
	       Company company = companyRepository.findById(companyId)
	           .orElseThrow(() -> new EntityNotFoundException("Company not found"));
	       return company.getIndustry().getIndustryId(); // Assuming you have a method to get the industry
	   }
}
