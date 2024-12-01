package com.job_portal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import com.job_portal.models.JobPost;
import com.job_portal.models.SearchHistory;
import com.job_portal.repository.SearchHistoryRepository;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.opencsv.CSVWriter;

@Service
public class SearchHistoryServiceImpl implements ISearchHistoryService {

	@Autowired
	private SearchHistoryRepository searchHistoryRepository;

	public void exportSearchHistoryToCSV(String filePath, String searchQuery, UUID seekerId) throws IOException {
		File file = new File(filePath);

		// Nếu file không tồn tại, tạo mới
		if (!file.exists()) {
			file.createNewFile();
		}

		try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(new FileOutputStream(filePath, true), StandardCharsets.UTF_8))) {
			// Nếu file trống, ghi tiêu đề vào file CSV
			if (file.length() == 0) {
				String[] header = { "ID", "SeekerID", "Search Query", "Search Date" };
				writer.writeNext(header);
			}

			// Lấy ID tự động (có thể lấy từ cơ sở dữ liệu hoặc tăng dần)
			int id = 1; // Tự động lấy ID từ cơ sở dữ liệu hoặc tăng dần

			// Lưu thông tin tìm kiếm vào CSV
			String[] data = { String.valueOf(id++), // ID tự động tăng
					seekerId != null ? seekerId.toString() : "N/A", // SeekerID (Nếu có)
					searchQuery, // Chuỗi tìm kiếm
					LocalDate.now().toString() // Thời gian tìm kiếm
			};
			writer.writeNext(data);
		} catch (IOException e) {
			e.printStackTrace(); // In chi tiết lỗi
			System.err.println("Lỗi khi lưu lịch sử tìm kiếm vào CSV: " + e.getMessage());
		}
	}

}
