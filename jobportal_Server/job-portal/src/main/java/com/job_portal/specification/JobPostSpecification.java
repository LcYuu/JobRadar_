package com.job_portal.specification;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import com.job_portal.models.JobPost;
import com.opencsv.CSVWriter;

import jakarta.persistence.criteria.Predicate;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

public class JobPostSpecification {
    
    public static Specification<JobPost> withFilters(String title, List<String> selectedTypesOfWork, Long minSalary, Long maxSalary, Integer cityId, List<Integer> selectedIndustryIds) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            // Lọc theo tiêu đề
            if (title != null && !title.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.or(
                        criteriaBuilder.like(root.get("title"), "%" + title + "%"),
                        criteriaBuilder.like(root.get("description"), "%" + title + "%")
                ));
            }

            // Lọc theo cityId
            if (cityId != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("city").get("id"), cityId));
            }

            // Lọc theo mức lương tối thiểu
            if (minSalary != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThanOrEqualTo(root.get("salary"), minSalary));
            }

            // Lọc theo mức lương tối đa
            if (maxSalary != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThanOrEqualTo(root.get("salary"), maxSalary));
            }

            // Lọc theo loại công việc
            if (selectedTypesOfWork != null && !selectedTypesOfWork.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, root.get("typeOfWork").in(selectedTypesOfWork));
            }

            if (selectedIndustryIds != null && !selectedIndustryIds.isEmpty()) {
                predicate = criteriaBuilder.and(predicate, root.join("company").get("industry").get("id").in(selectedIndustryIds));
            }

            // Chỉ lấy các job đã phê duyệt
            predicate = criteriaBuilder.and(predicate, criteriaBuilder.isTrue(root.get("isApprove")));

            return predicate;
        };
    }

    // Phương thức hỗ trợ để áp dụng sắp xếp theo ngày tạo
    public static Specification<JobPost> orderByCreateDate() {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(root.get("createDate"))); // Sắp xếp giảm dần theo ngày tạo
            return criteriaBuilder.conjunction(); // Không có thêm điều kiện nào
        };
    }
    
}
