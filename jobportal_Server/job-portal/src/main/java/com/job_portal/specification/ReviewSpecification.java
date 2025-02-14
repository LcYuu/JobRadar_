package com.job_portal.specification;

import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import com.job_portal.models.Review;

public class ReviewSpecification {

	public static Specification<Review> filterReviews(UUID companyId, Integer star) {
		return (root, query, criteriaBuilder) -> {
			var predicate = criteriaBuilder.conjunction(); // Khởi tạo điều kiện mặc định

			if (companyId != null) {
				predicate = criteriaBuilder.and(predicate,
						criteriaBuilder.equal(root.get("company").get("companyId"), companyId));
			}

			if (star != null) {
				predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("star"), star));
			}

			return predicate;
		};
	}
}