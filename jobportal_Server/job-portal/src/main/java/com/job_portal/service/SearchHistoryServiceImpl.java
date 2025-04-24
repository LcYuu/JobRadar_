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
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;

import com.opencsv.CSVWriter;

@Service
public class SearchHistoryServiceImpl implements ISearchHistoryService {

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    public void exportSearchHistoryToCSV(String filePath, String searchQuery, UUID seekerId) throws IOException {
        File file = new File(filePath);
        File parentDir = file.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            parentDir.mkdirs(); // Tạo thư mục nếu chưa tồn tại
        }

        boolean isNewFile = !file.exists();
        if (isNewFile) {
            file.createNewFile();
        }

        if (!file.canWrite()) {
            System.err.println("Lỗi: Không có quyền ghi vào file " + filePath);
            return;
        }

        System.out.println("searchQuery: " + searchQuery + ", seekerId: " + seekerId);
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            System.err.println("Lỗi: searchQuery rỗng hoặc null!");
            return;
        }

        try (FileOutputStream fos = new FileOutputStream(file, true);
             OutputStreamWriter osw = new OutputStreamWriter(fos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            if (isNewFile) {
            	osw.write('\uFEFF'); // Thêm BOM cho UTF-8
                String[] header = { "ID", "SeekerID", "Search Query", "Search Date" };
                writer.writeNext(header, false);
            }

            String[] data = { UUID.randomUUID().toString(), seekerId != null ? seekerId.toString() : "N/A", 
                             searchQuery, LocalDateTime.now().toString() };
            writer.writeNext(data, false);
            writer.flush();

            System.out.println("Ghi thành công: " + Arrays.toString(data));
            System.out.println("Kích thước file sau khi ghi: " + file.length());
        } catch (IOException e) {
            System.err.println("Lỗi khi lưu lịch sử tìm kiếm vào CSV: " + e.getMessage());
            e.printStackTrace();
            throw e; // Ném lại ngoại lệ để caller xử lý nếu cần
        }
    }
}
