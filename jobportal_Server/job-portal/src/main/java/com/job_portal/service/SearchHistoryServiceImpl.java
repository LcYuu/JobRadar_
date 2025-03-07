package com.job_portal.service;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.job_portal.repository.SearchHistoryRepository;

import java.io.File;
import java.io.FileOutputStream;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

import com.opencsv.CSVWriter;

@Service
public class SearchHistoryServiceImpl implements ISearchHistoryService {

	@Autowired
	private SearchHistoryRepository searchHistoryRepository;

	public void exportSearchHistoryToCSV(String filePath, String searchQuery, UUID seekerId) throws IOException {
		File file = new File(filePath);

		if (!file.exists()) {
			file.createNewFile();
		}

		try (CSVWriter writer = new CSVWriter(
				new OutputStreamWriter(new FileOutputStream(filePath, true), StandardCharsets.UTF_8))) {

			if (file.length() == 0) {
				String[] header = { "ID", "SeekerID", "Search Query", "Search Date" };
				writer.writeNext(header);
			}

			int id = 1;

			String[] data = { String.valueOf(id++), seekerId != null ? seekerId.toString() : "N/A", searchQuery,
					LocalDate.now().toString() };
			writer.writeNext(data);
		} catch (IOException e) {
			e.printStackTrace();
			System.err.println("Lỗi khi lưu lịch sử tìm kiếm vào CSV: " + e.getMessage());
		}
	}

}
