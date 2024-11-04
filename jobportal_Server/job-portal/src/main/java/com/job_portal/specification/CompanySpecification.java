package com.job_portal.specification;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.job_portal.DTO.CompanyWithCountJobDTO;
import com.job_portal.models.Company;

import jakarta.persistence.criteria.Predicate;

public class CompanySpecification {
	public static Specification<Company> withFilters(String title, Integer cityId, List<Integer> selectedIndustryIds) {
	    return (root, query, criteriaBuilder) -> {
	        Predicate predicate = criteriaBuilder.conjunction();

	        // Lọc theo tiêu đề
	        if (title != null && !title.isEmpty()) {
	            predicate = criteriaBuilder.and(predicate, criteriaBuilder.or(
	                    criteriaBuilder.like(root.get("companyName"), "%" + title + "%"), // Đảm bảo bạn đang sử dụng tên trường đúng
	                    criteriaBuilder.like(root.get("description"), "%" + title + "%")
	            ));
	        }

	        // Lọc theo cityId
	        if (cityId != null) {
	            predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("city").get("id"), cityId));
	        }

	        // Lọc theo ngành
	        if (selectedIndustryIds != null && !selectedIndustryIds.isEmpty()) {
	            predicate = criteriaBuilder.and(predicate, root.get("industry").get("industryId").in(selectedIndustryIds));
	        }
	        
	        return predicate;
	    };
	}

}
