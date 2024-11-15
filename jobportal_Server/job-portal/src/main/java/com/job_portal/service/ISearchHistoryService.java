package com.job_portal.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.data.domain.Page;

import com.job_portal.models.JobPost;

public interface ISearchHistoryService {
	public void exportSearchHistoryToCSV(String filePath, String searchQuery, UUID seekerId) throws IOException;
}
