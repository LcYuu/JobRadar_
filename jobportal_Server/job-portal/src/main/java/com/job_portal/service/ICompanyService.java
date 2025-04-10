package com.job_portal.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.job_portal.DTO.CompanyDTO;
import com.job_portal.models.Company;
import com.social.exceptions.AllExceptions;

import jakarta.mail.MessagingException;


public interface ICompanyService {
	public boolean deleteCompany(UUID companyId) throws AllExceptions;
	public boolean updateCompany(CompanyDTO companyDTO, UUID companyId) throws AllExceptions;
	public List<Company> searchCompaniesByName(String companyName) throws AllExceptions;
	public List<Company> searchCompaniesByCity(String cityName) throws AllExceptions;
	public Company findCompanyById(UUID companyId) throws AllExceptions;
	public Map<String, Object> followCompany(UUID companyId, UUID userId) throws AllExceptions;
	public List<Integer> getIndustryIdsByCompanyId(UUID companyId);
	public void blockCompany(UUID companyId, String reason, LocalDateTime until)  throws MessagingException;
	public void unblockCompany(UUID companyId) throws MessagingException;
	
}
