# CV Analysis Improvements - Nice-to-Have vs Required Skills

## Vấn đề đã sửa

Trước đây, AI service đang nhầm lẫn giữa:
- **"Trách nhiệm công việc"** (responsibility) 
- **"Ưu tiên bổ sung"** (nice-to-have requirements)

## Thay đổi đã thực hiện

### 1. Backend AI Service (`AI/Re.py`)

#### Cập nhật hàm `create_analysis_prompt()`:
- Sửa nhãn từ "Trách nhiệm công việc" → "Ưu tiên bổ sung (nice-to-have)"
- Thêm hướng dẫn rõ ràng về cách phân biệt required vs nice-to-have
- Cập nhật cấu trúc JSON response bao gồm:
  - `niceToHaveSkills`: Danh sách kỹ năng nice-to-have
  - `nice_to_have_bonus`: Điểm cộng cho nice-to-have skills (max 20 điểm)
  - `required_skills_matched/missing`: Phân biệt rõ ràng required vs nice-to-have

#### Hướng dẫn tính điểm mới:
- **80% điểm cơ bản**: Dựa trên yêu cầu BẮT BUỘC
- **20% điểm cộng**: Cho nice-to-have skills
- **Không trừ điểm nặng** nếu thiếu nice-to-have skills

### 2. Frontend Updates

#### CVAnalyzer Component:
- Thêm phần hiển thị "Kỹ năng ưu tiên bổ sung (Nice-to-have)"
- Thêm thanh progress bar cho nice-to-have bonus score
- Phân biệt rõ ràng required vs nice-to-have skills

#### CandidateManagement Component:
- Cải thiện UI để hiển thị:
  - Required skills matched/missing
  - Nice-to-have skills matched/missing với màu sắc khác biệt
  - Nice-to-have bonus score
- Thêm tooltip giải thích ý nghĩa của từng loại skill

#### JobDetailEmployer & JobDetail:
- Đổi tiêu đề từ "Trách nhiệm công việc" → "Ưu tiên bổ sung (Nice-to-have)"
- Thêm mô tả rõ ràng về ý nghĩa của nice-to-have

#### PostJob Component:
- Cập nhật label và hướng dẫn cho trường niceToHaves
- Cải thiện placeholder text để hướng dẫn rõ hơn
- Cập nhật validation messages

### 3. Màu sắc và UI Improvements

- **Xanh lá**: Required skills matched ✅
- **Đỏ**: Required skills missing ❌ 
- **Tím**: Nice-to-have skills ⭐
- **Cam**: Nice-to-have missing (không ảnh hưởng tiêu cực) ⚠️

## Cách sử dụng

### Restart AI Service:
```powershell
.\restart_ai_service.ps1
```

### Hoặc manual restart:
```bash
cd AI
python Re.py
```

## Kết quả mong đợi

1. **Đánh giá chính xác hơn**: AI sẽ phân biệt rõ ràng giữa required và nice-to-have
2. **Điểm số hợp lý hơn**: Không bị trừ điểm nặng vì thiếu nice-to-have skills  
3. **UI rõ ràng hơn**: Người dùng hiểu rõ từng loại yêu cầu
4. **Trải nghiệm tốt hơn**: Cả employer và job seeker đều có thông tin chính xác

## Testing

Sau khi restart service, test với:
1. Upload CV và job description có cả required và nice-to-have skills
2. Kiểm tra phân tích có phân biệt rõ ràng 2 loại skills không
3. Verify điểm nice-to-have bonus được tính đúng
4. Kiểm tra UI hiển thị đầy đủ các section mới

## Notes

- Các thay đổi tương thích ngược (backward compatible)
- Cấu trúc cũ vẫn hoạt động, nhưng sẽ dùng logic mới
- Database không cần migration vì chỉ thay đổi cách phân tích và hiển thị
