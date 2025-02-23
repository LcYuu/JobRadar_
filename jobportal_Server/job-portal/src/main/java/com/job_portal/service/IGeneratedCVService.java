package com.job_portal.service;

import java.util.List;
import java.util.UUID;

import com.job_portal.DTO.GeneratedCVDTO;
import com.job_portal.models.CV;
import com.job_portal.models.GeneratedCV;
import com.social.exceptions.AllExceptions;

public interface IGeneratedCVService {
	public GeneratedCV createGeneratedCV(GeneratedCVDTO cvdto, UUID userId);
	public boolean deleteCV(Integer generatedCv) throws AllExceptions;
	public List<GeneratedCV> findGenCVBySeekerId(UUID userId) throws AllExceptions;
	public boolean updateGeneratedCV(Integer genCvId, GeneratedCVDTO genCvDTO);
}
