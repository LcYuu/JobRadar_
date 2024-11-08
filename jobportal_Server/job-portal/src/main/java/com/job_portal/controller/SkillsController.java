package com.job_portal.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.job_portal.models.JobPost;
import com.job_portal.models.Skills;
import com.job_portal.repository.SkillRepository;

@RestController
@RequestMapping("/skills")
public class SkillsController {
	
	@Autowired
	SkillRepository skillRepository;
	
	@GetMapping("/get-all")
	public ResponseEntity<List<Skills>> getSkill() {
		List<Skills> skills = skillRepository.findAll();
		return new ResponseEntity<>(skills, HttpStatus.OK);
	}
}
