package com.job_portal.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.job_portal.models.JobPost;
import com.job_portal.models.SearchHistory;
import com.job_portal.repository.SearchHistoryRepository;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.opencsv.CSVWriter;

@Service
public class SearchHistoryServiceImpl implements ISearchHistoryService {

	@Autowired
	private SearchHistoryRepository searchHistoryRepository;
	
	public void exportSearchHistoryToCSV(String filePath, String searchQuery, UUID seekerId) throws IOException {
	    try (CSVWriter writer = new CSVWriter(new FileWriter(filePath, true))) {
	        // Nếu file trống, ghi tiêu đề vào file CSV
	        File file = new File(filePath);
	        if (file.length() == 0) {
	            String[] header = {"ID", "SeekerID", "Search Query", "Search Date"};
	            writer.writeNext(header);
	        }

	        // Khởi tạo ID bắt đầu từ 1
	        int id = 1;

	        // Lưu thông tin tìm kiếm vào CSV
	        String[] data = {
	            String.valueOf(id++),                  // ID tự động tăng
	            seekerId != null ? seekerId.toString() : "N/A",  // SeekerID (Nếu có)
	            searchQuery,                            // Chuỗi tìm kiếm
	            LocalDateTime.now().toString()          // Thời gian tìm kiếm
	        };
	        writer.writeNext(data);

	    } catch (IOException e) {
	        System.err.println("Lỗi khi lưu lịch sử tìm kiếm vào CSV: " + e.getMessage());
	    }
	}

}
