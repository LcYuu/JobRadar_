package com.job_portal.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.ImageDTO;
import com.job_portal.models.City;
import com.job_portal.models.Company;
import com.job_portal.models.ImageCompany;
import com.job_portal.models.JobPost;
import com.job_portal.models.Skills;
import com.job_portal.repository.CompanyRepository;
import com.job_portal.repository.ImageRepository;
import com.social.exceptions.AllExceptions;

@Service
public class ImageCompanyServiceImpl implements IImageCompanyService {

	@Autowired
	CompanyRepository companyRepository;
	@Autowired
	ImageRepository imageRepository;

	@Override
	public boolean createImg(ImageDTO imageDTO, UUID companyId) {
		Company company = companyRepository.findById(companyId)
				.orElseThrow(() -> new IllegalArgumentException("Invalid Company ID"));

		// Build the JobPost entity
		ImageCompany imageCompany = new ImageCompany();

		imageCompany.setCompany(company);
		imageCompany.setPathImg(imageDTO.getPathImg());

		try {
			ImageCompany saveImg = imageRepository.save(imageCompany);
			return saveImg != null;
		} catch (Exception e) {
			return false;
		}
	}

	public boolean deleteImg(Integer imgId) {
	    Optional<ImageCompany> imageOptional = imageRepository.findById(imgId);
	    if (imageOptional.isPresent()) {
	        ImageCompany image = imageOptional.get();

	        // Nếu bạn sử dụng orphanRemoval = true, khi xóa ảnh khỏi company sẽ tự động bị xóa khỏi DB
	        Company company = image.getCompany();
	        company.getImages().remove(image); // Loại bỏ hình ảnh khỏi công ty

	        // Lưu lại công ty để thực thi orphan removal (xóa ảnh)
	        companyRepository.save(company);
	        
	        return true;
	    }
	    return false; // Trường hợp không tìm thấy ảnh với id đó
	}


	@Override
	public boolean updateImg(ImageDTO imageDTO, Integer imgId) throws AllExceptions {
		Optional<ImageCompany> existingImg = imageRepository.findById(imgId);

		if (existingImg.isEmpty()) {
			throw new AllExceptions("Imgage not exist with id " + imgId);
		}


		ImageCompany oldImg = existingImg.get();
		boolean isUpdated = false;

		if (imageDTO.getPathImg() != null) {
			oldImg.setPathImg(imageDTO.getPathImg());
			isUpdated = true;
		}

		if (isUpdated) {
			imageRepository.save(oldImg);
		}

		return isUpdated;
	}

	@Override
	public List<ImageCompany> findImgByCompanyId(UUID companyId) throws AllExceptions {
		try {

			List<ImageCompany> imgs = imageRepository.findImgByCompanyId(companyId);

			return imgs;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

}
