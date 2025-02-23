package com.job_portal.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.DTO.GeneratedCVDTO;
import com.job_portal.models.CV;
import com.job_portal.models.GeneratedCV;
import com.job_portal.models.Seeker;
import com.job_portal.repository.GeneratedCVRepository;
import com.job_portal.repository.SeekerRepository;
import com.social.exceptions.AllExceptions;

@Service
public class GeneratedCVServiceImpl implements IGeneratedCVService {

	@Autowired
	SeekerRepository seekerRepository;
	@Autowired
	GeneratedCVRepository generatedCVRepository;

	@Override
	public GeneratedCV createGeneratedCV(GeneratedCVDTO cvdto, UUID userId) {
		Optional<Seeker> seeker = seekerRepository.findById(userId);
		GeneratedCV genCV = new GeneratedCV();
		genCV.setSeeker(seeker.get());
		genCV.setCvName(cvdto.getCvName());
		genCV.setCreateTime(LocalDateTime.now());
		String defaultCvContent = """
				    {
				        "profileImage": "https://res.cloudinary.com/ddqygrb0g/image/upload/v1739714221/avatar_fa4cj7.jpg",
				        "themeColor": "#ff6666"
				    }
				""";
		genCV.setCvContent(defaultCvContent);
		return generatedCVRepository.save(genCV);
	}

	@Override
	public boolean deleteCV(Integer generatedCv) throws AllExceptions {
		Optional<GeneratedCV> cv = generatedCVRepository.findById(generatedCv);

		if (cv.isEmpty()) {
			throw new AllExceptions("Không tìm thấy CV");
		}

		generatedCVRepository.delete(cv.get());
		return true;
	}

	@Override
	public List<GeneratedCV> findGenCVBySeekerId(UUID userId) throws AllExceptions {
		try {
			List<GeneratedCV> cvs = generatedCVRepository.findGenCVBySeekerId(userId);
			return cvs;
		} catch (Exception e) {
			throw new AllExceptions(e.getMessage());
		}
	}

	@Override
	public boolean updateGeneratedCV(Integer genCvId, GeneratedCVDTO genCvDTO) {
		Optional<GeneratedCV> existingGenCv = generatedCVRepository.findById(genCvId);
		GeneratedCV oldGenCv = existingGenCv.get();
		boolean isUpdated = false;

		if (genCvDTO.getCvContent() != null) {
			oldGenCv.setCvContent(genCvDTO.getCvContent());
			isUpdated = true;
		}

		// Cập nhật các trường cơ bản
		if (genCvDTO.getCvName() != null) {
			oldGenCv.setCvName(genCvDTO.getCvName());
			isUpdated = true;
		}

		if (genCvDTO.getCreateTime() != null) {
			oldGenCv.setCreateTime(LocalDateTime.now());
			isUpdated = true;
		}
		if (isUpdated) {
			generatedCVRepository.save(oldGenCv);
		}

		return isUpdated;
	}
}
