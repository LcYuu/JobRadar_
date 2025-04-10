package com.job_portal.service;

import java.util.List;
import java.util.UUID;

import com.job_portal.DTO.SeekerDTO;
import com.job_portal.models.Seeker;
import com.social.exceptions.AllExceptions;

public interface ISeekerService {
	public boolean deleteSeeker(UUID userId) throws AllExceptions;
	public boolean updateSeeker(SeekerDTO seekerDTO, UUID userId) throws AllExceptions;
	public Seeker findSeekerById(UUID userId) throws AllExceptions;

}
