package com.job_portal.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.CVDTO;
import com.job_portal.DTO.GeneratedCVDTO;
import com.job_portal.models.CV;
import com.job_portal.models.GeneratedCV;
import com.job_portal.models.Seeker;
import com.job_portal.repository.CVRepository;
import com.job_portal.repository.SeekerRepository;
import com.social.exceptions.AllExceptions;

@Service
public class CVServiceImpl implements ICVService {

	@Autowired
	CVRepository cvRepository;

	@Autowired
	SeekerRepository seekerRepository;
	
	@Override
	public boolean createCV(CVDTO cvdto, UUID userId) {
		try {
			Optional<Seeker> seeker = seekerRepository.findById(userId);
			if (seeker.isEmpty()) {
				System.err.println("Không tìm thấy thông tin người dùng với ID: " + userId);
				return false;
			}
			
			// Validate data
			if (cvdto.getPathCV() == null || cvdto.getPathCV().isEmpty()) {
				System.err.println("Đường dẫn CV không hợp lệ");
				return false;
			}
			
			if (cvdto.getCvName() == null || cvdto.getCvName().isEmpty()) {
				System.err.println("Tên CV không hợp lệ");
				return false;
			}
			
			// Check for URL length
			if (cvdto.getPathCV().length() > 1000) {
				System.err.println("Đường dẫn CV quá dài (> 1000 ký tự)");
				return false;
			}
			
			// Đảm bảo encoding UTF-8 cho tên file
			String cvName = new String(cvdto.getCvName().getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
			
			CV cv = new CV();
			cv.setSeeker(seeker.get());
			cv.setPathCV(cvdto.getPathCV());
			cv.setCvName(cvName);
			cv.setCreateTime(LocalDateTime.now());
			cv.setIsMain(false);
			
			
			CV saveCV = cvRepository.save(cv);
			return saveCV != null;
		} catch (Exception e) {
			System.err.println("Lỗi khi tạo CV: " + e.getMessage());
			e.printStackTrace();
			return false;
		}
	}

	@Override
	public boolean deleteCV(Integer cvId) throws AllExceptions {
		Optional<CV> cv = cvRepository.findById(cvId);

		if (cv.isEmpty()) {
			throw new AllExceptions("Không tìm thấy CV");
		}

		cvRepository.delete(cv.get());
		return true;
	}

	@Override
	public boolean updateIsMain(Integer cvId, UUID userId) {
	    Optional<CV> optionalCV = cvRepository.findById(cvId);
	    if (optionalCV.isPresent()) {
	        CV cv = optionalCV.get();

	        // Kiểm tra nếu CV thuộc về người dùng
	        if (cv.getSeeker().getUserId().equals(userId)) {
	            // Đặt tất cả các CV khác của seeker này thành isMain = false
	            List<CV> userCVs = cvRepository.findCVBySeekerId(userId);
	            for (CV userCV : userCVs) {
	                if (!userCV.getCvId().equals(cvId) && userCV.getIsMain()) {
	                    userCV.setIsMain(false);
	                    cvRepository.save(userCV);
	                }
	            }
	            // Cập nhật CV hiện tại thành isMain = true
	            cv.setIsMain(true);
	            cvRepository.save(cv);
	            return true;
	        }
	    }
	    return false;
	}

	@Override
	public List<CV> findCVBySeekerId(UUID userId) throws AllExceptions {
		try {
			List<CV> cvs = cvRepository.findCVBySeekerId(userId);
			return cvs;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}
}