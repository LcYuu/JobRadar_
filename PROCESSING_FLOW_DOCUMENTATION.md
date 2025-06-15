# Chi tiết xử lý các chức năng chính từ Frontend đến Backend

## 1. TÌM KIẾM NGỮ NGHĨA (SEMANTIC SEARCH)

### 1.1 Frontend Processing (React)

#### Bước 1: User Interface
- **File**: `jobportal_Client/src/pages/FindJobs/FindJobs.js`
- **Component**: JobSearchPage
- **Xử lý**:
  ```javascript
  // User nhập từ khóa vào search input
  <Input
    type="text"
    placeholder="Nhập tên công việc hoặc từ khóa mong muốn"
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    }}
  />
  ```

#### Bước 2: Xác thực người dùng
```javascript
const handleSearch = async () => {
  // Kiểm tra đăng nhập
  if (!isAuthenticated) {
    setShowLoginDialog(true);
    toast.info("Vui lòng đăng nhập để sử dụng tính năng tìm kiếm");
    return;
  }
  
  // Validate input
  if (!searchInput.trim()) {
    return;
  }
}
```

#### Bước 3: Hiển thị tiến trình tìm kiếm
```javascript
// Khởi tạo progress bar
setIsSearching(true);
setSearchProgress(5);

// Mô phỏng các giai đoạn xử lý
const searchPhases = [
  { progress: 20, delay: 300 },  // Khởi tạo
  { progress: 40, delay: 800 },  // Xử lý ngữ nghĩa
  { progress: 65, delay: 1300 }, // Vector search
  { progress: 85, delay: 1800 }, // Ranking
];

searchPhases.forEach((phase) => {
  setTimeout(() => {
    if (isSearching) {
      setSearchProgress(phase.progress);
    }
  }, phase.delay);
});
```

#### Bước 4: Gọi Redux Action
```javascript
// Gọi semantic search API
const result = await dispatch(
  semanticSearchJobsWithGemini({
    query: searchInput,
    filters: {},
    currentPage: 0,
    size: 100,
  })
).unwrap();
```

### 1.2 Redux Layer Processing

#### File: `jobportal_Client/src/redux/JobPost/jobPost.thunk.js`
```javascript
export const semanticSearchJobsWithGemini = createAsyncThunk(
  "jobPost/semanticSearchJobsWithGemini",
  async ({ query, filters, currentPage, size }, thunkAPI) => {
    try {
      // Chuẩn bị tham số cho API
      const params = {
        query,
        page: currentPage,
        size: size || 100,
      };

      // Thêm các filter nếu có
      if (filters?.selectedTypesOfWork?.length > 0) {
        params.selectedTypesOfWork = filters.selectedTypesOfWork;
      }
      if (filters?.cityId) {
        params.cityId = filters.cityId;
      }
      if (filters?.selectedIndustryIds?.length > 0) {
        params.selectedIndustryIds = filters.selectedIndustryIds;
      }
      if (filters?.minSalary !== undefined) {
        params.minSalary = filters.minSalary;
      }
      if (filters?.maxSalary !== undefined) {
        params.maxSalary = filters.maxSalary;
      }

      // Gọi API Backend
      const response = await api.get('/job-post/semantic-search', { 
        headers, 
        params 
      });
      
      return {
        content: response.data.content, 
        totalPages: response.data.totalPages, 
        totalElements: response.data.totalElements
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);
```

### 1.3 Backend Processing (Python AI Service)

#### File: `AI/Re.py` - API Endpoint
```python
@app.route('/semantic-search', methods=['POST'])
def semantic_search():
    try:
        # 1. Nhận và validate dữ liệu
        data = request.json
        if not data:
            return jsonify({"error": "Không có dữ liệu được gửi"}), 400
        
        query = data.get('query', '')
        jobs_to_search = data.get('jobs', jobs)
        filters = data.get('filters', {})
        
        if not query or not jobs_to_search:
            return jsonify({"error": "Thiếu truy vấn hoặc danh sách công việc"}), 400
        
        # 2. Kiểm tra cache
        cache_key = get_cache_key(query, filters)
        cached_result = get_cache(cache_key)
        if cached_result:
            return jsonify(cached_result)
        
        # 3. Tạo embedding cho query
        query_embedding = get_text_embedding(query)
        
        # 4. Precompute embeddings nếu cần
        if PRECOMPUTE_EMBEDDINGS:
            if not last_embedding_update or (datetime.now() - last_embedding_update) > timedelta(hours=EMBEDDING_REFRESH_HOURS):
                precompute_embeddings(jobs_to_search)
            if USE_JOB_INDEXING:
                create_job_index(jobs_to_search)
        
        # 5. Pre-filtering
        filtered_jobs = jobs_to_search
        if ENABLE_PREFILTERING:
            keywords = query.lower().split()
            if USE_JOB_INDEXING and job_index:
                candidate_job_ids = set()
                for keyword in keywords:
                    if keyword in job_index:
                        candidate_job_ids.update(job_index[keyword])
                filtered_jobs = [job for job in jobs_to_search if (job.get('id') or job.get('jobId') or job.get('postId')) in candidate_job_ids]
            else:
                filtered_jobs = filter_jobs_by_keywords(jobs_to_search, keywords)
        
        # 6. Vector similarity search
        vector_results = fast_vector_search(query_embedding, filtered_jobs)
        
        # 7. Chuẩn bị kết quả
        final_results = []
        for job, score in vector_results:
            job_with_score = job.copy()
            job_with_score['similarity_score'] = score
            final_results.append(job_with_score)
        
        # 8. Lọc theo threshold
        MIN_SIMILARITY_SCORE = 0.3
        filtered_final_results = [job for job in final_results if job.get('similarity_score', 0) >= MIN_SIMILARITY_SCORE]
        
        # 9. Cache kết quả
        set_cache(cache_key, filtered_final_results, ttl=7200)
        
        return jsonify(filtered_final_results)
        
    except Exception as e:
        logger.exception(f"Lỗi trong semantic search: {str(e)}")
        return jsonify({"error": str(e)}), 500
```

#### Chi tiết các hàm xử lý:

**Tạo embedding cho text:**
```python
@lru_cache(maxsize=EMBEDDING_CACHE_SIZE)
def get_text_embedding(text):
    try:
        return embedding_model.encode(text, device=DEVICE, normalize_embeddings=True)
    except Exception as e:
        logger.error(f"Lỗi khi tạo embedding: {e}")
        return None
```

**Vector similarity search:**
```python
def fast_vector_search(query_embedding, jobs, top_k=100):
    results = []
    seen_job_ids = set()

    for job in jobs:
        job_id = job.get('id') or job.get('jobId') or job.get('postId')
        if not job_id or job_id in seen_job_ids:
            continue
        seen_job_ids.add(job_id)

        # Lấy embedding từ cache hoặc tạo mới
        job_embedding = job_embeddings.get(job_id)
        if job_embedding is None:
            job_embedding = get_job_embedding(job)
            if job_embedding is None:
                continue
        
        # Tính similarity
        similarity = compute_similarity(query_embedding, job_embedding)
        results.append((job, similarity))
    
    # Sắp xếp theo similarity score
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]
```

### 1.4 Frontend - Xử lý kết quả

```javascript
// Xử lý kết quả trả về
if (!result || !result.content || !Array.isArray(result.content)) {
  console.error("Kết quả tìm kiếm ngữ nghĩa không hợp lệ:", result);
  throw new Error("Kết quả tìm kiếm không hợp lệ");
}

// Lưu vào state và cache
setAllResults(result);
const filteredResults = filterResultsLocally(result.content, filters);
const filteredResult = {
  ...result,
  content: filteredResults,
  totalElements: filteredResults.length,
  totalPages: Math.ceil(filteredResults.length / size),
};

setSemanticResults(filteredResult);
setIsUsingSemanticSearch(true);

// Lưu vào sessionStorage
sessionStorage.setItem("semanticResults", JSON.stringify(filteredResult));
sessionStorage.setItem("allResults", JSON.stringify(result));
sessionStorage.setItem("isUsingSemanticSearch", "true");

// Hiển thị thông báo thành công
toast.success(`Đã tìm thấy ${filteredResults.length} công việc phù hợp với bạn!`);
```

---

## 2. PHÂN TÍCH CV (CV ANALYSIS)

### 2.1 Frontend Processing

#### Bước 1: Upload CV
```javascript
// File: jobportal_Client/src/components/CVAnalyzer/CVAnalyzer.js
const handleFileUpload = (file) => {
  // Validate file type
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    toast.error("Chỉ hỗ trợ file PDF hoặc DOCX");
    return;
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error("File không được vượt quá 5MB");
    return;
  }
  
  setCvFile(file);
};
```

#### Bước 2: Chuẩn bị job data
```javascript
const prepareJobData = (jobPost) => {
  return {
    title: jobPost.title,
    description: jobPost.description,
    requirement: jobPost.requirement,
    benefit: jobPost.benefit,
    experience: jobPost.experience,
    skills: jobPost.skills || [],
    position: jobPost.position,
    niceToHaves: jobPost.niceToHaves || '',
  };
};
```

#### Bước 3: Gọi API phân tích
```javascript
const analyzeCVMatch = async (cvFile, jobData) => {
  try {
    setIsAnalyzing(true);
    
    // Chuẩn bị FormData
    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('job_data', JSON.stringify(jobData));
    
    // Gọi AI service
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Lỗi khi phân tích CV:', error);
    throw error;
  } finally {
    setIsAnalyzing(false);
  }
};
```

### 2.2 Backend Processing (Python AI Service)

#### File: `AI/Re.py` - CV Analysis Endpoint
```python
@app.route('/analyze', methods=['POST'])
def analyze_cv():
    try:
        # 1. Validate request
        if 'cv' not in request.files:
            return jsonify({"error": "Thiếu file CV"}), 400
        
        # 2. Lấy dữ liệu job
        job_data = {}
        if 'job_data' in request.form:
            job_data = json.loads(request.form['job_data'])
        elif 'job_description' in request.form:
            job_data = {'description': request.form['job_description']}
        else:
            return jsonify({"error": "Thiếu mô tả công việc"}), 400
        
        cv_file = request.files['cv']
        
        # 3. Kiểm tra API key
        if not GEMINI_API_KEY:
            return jsonify({"error": "GEMINI_API_KEY không được thiết lập"}), 500
        
        # 4. Trích xuất text từ CV
        cv_text = ""
        if cv_file.filename.endswith('.pdf'):
            cv_text = extract_text_from_pdf(cv_file)
        elif cv_file.filename.endswith('.docx'):
            cv_text = extract_text_from_docx(cv_file)
        else:
            return jsonify({"error": "Định dạng file không được hỗ trợ"}), 400
        
        if not cv_text:
            return jsonify({"error": "Không thể trích xuất văn bản từ CV"}), 400
        
        # 5. Tiền xử lý CV (bảo mật)
        cv_text = preprocess_cv(cv_text, max_length=4000)
        
        # 6. Phân tích với Gemini AI
        result = analyze_cv_with_gemini(cv_text, job_data, GEMINI_API_KEY)
        
        return jsonify(result)
        
    except Exception as e:
        logger.exception(f"Lỗi server: {str(e)}")
        return jsonify({"error": f"Lỗi server: {str(e)}"}), 500
```

#### Chi tiết các hàm xử lý:

**Trích xuất text từ PDF:**
```python
def extract_text_from_pdf(pdf_file):
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        for page in pdf_reader.pages:
            page_text = page.extract_text() or ""
            text += page_text
    except Exception as e:
        logger.error(f"Lỗi khi trích xuất PDF: {e}")
    return text
```

**Tiền xử lý CV (bảo mật):**
```python
def preprocess_cv(cv_text, max_length=4000):
    try:
        # 1. Loại bỏ thông tin cá nhân nhạy cảm
        patterns = [
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # email
            r'(?:\+84|0)[0-9]{9,10}',  # phone
            r'[0-9]{9}|[0-9]{12}',  # id card
            r'(?:đường|phố|quận|huyện|tỉnh|thành phố)[\s\w]+',  # address
        ]
        for pattern in patterns:
            cv_text = re.sub(pattern, '', cv_text, flags=re.IGNORECASE)

        # 2. Chỉ giữ lại các section quan trọng
        important_sections = [
            r'(?:education|học vấn|trình độ học vấn)(.*?)(?:\n\n|\Z|experience|kinh nghiệm)',
            r'(?:experience|kinh nghiệm)(.*?)(?:\n\n|\Z|education|học vấn)',
            r'(?:skills|kỹ năng)(.*?)(?:\n\n|\Z|education|học vấn)',
            r'(?:projects|dự án)(.*?)(?:\n\n|\Z|education|học vấn)',
            r'(?:certifications|chứng chỉ)(.*?)(?:\n\n|\Z|education|học vấn)',
        ]
        
        extracted = ""
        for section in important_sections:
            matches = re.findall(section, cv_text, flags=re.IGNORECASE | re.DOTALL)
            for match in matches:
                extracted += match.strip() + "\n\n"

        # 3. Giới hạn độ dài
        if len(extracted) > max_length:
            sentences = re.split(r'[.!?]+', extracted)
            truncated = ""
            for sentence in sentences:
                if len(truncated + sentence) <= max_length:
                    truncated += sentence + "."
                else:
                    break
            extracted = truncated.strip()

        return extracted

    except Exception as e:
        logger.error(f"Lỗi khi tiền xử lý CV: {e}")
        return cv_text[:max_length]
```

**Phân tích với Gemini AI:**
```python
def analyze_cv_with_gemini(cv_text, job_data, api_key):
    # Thiết lập API
    setup_gemini(api_key)
    
    # Tạo prompt chi tiết
    prompt = create_analysis_prompt(cv_text, job_data)
    
    try:
        # Gọi Gemini API
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        
        if response:
            # Xử lý phản hồi JSON
            response_text = response.text
            
            # Loại bỏ markdown formatting
            cleaned_text = response_text
            if "```json" in response_text:
                cleaned_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                cleaned_text = response_text.split("```")[1].split("```")[0].strip()
            
            # Parse JSON
            result = json.loads(cleaned_text)
            return result
            
        else:
            raise Exception("Không nhận được phản hồi từ Gemini")
            
    except Exception as e:
        logger.error(f"Lỗi khi gọi Gemini API: {e}")
        raise e
```

**Tạo prompt phân tích:**
```python
def create_analysis_prompt(cv_text, job_data):
    # Trích xuất thông tin job
    job_description = job_data.get('description', '')
    job_requirements = job_data.get('requirement', '')
    job_benefits = job_data.get('benefit', '')
    job_experience = job_data.get('experience', '')
    job_skills = job_data.get('skills', [])
    job_position = job_data.get('position', '')
    job_nice_to_haves = job_data.get('niceToHaves', '')
    
    # Tạo mô tả công việc đầy đủ
    full_job_description = f"""
    # Tiêu đề: {job_data.get('title', '')}
    # Vị trí: {job_position}
    
    ## Mô tả công việc:
    {job_description}
    
    ## Yêu cầu công việc (bắt buộc):
    {job_requirements}
    
    ## Ưu tiên bổ sung (nice-to-have):
    {job_nice_to_haves}
    
    ## Quyền lợi:
    {job_benefits}
    
    ## Yêu cầu kinh nghiệm:
    {job_experience}
    
    ## Kỹ năng yêu cầu:
    {', '.join([skill.get('skillName', '') for skill in job_skills]) if isinstance(job_skills, list) else ''}
    """
    
    prompt = f"""
    Bạn là một chuyên gia phân tích CV và đánh giá mức độ phù hợp với vị trí công việc.
    
    # CV của ứng viên:
    ```
    {cv_text}
    ```
    
    # Mô tả công việc đầy đủ:
    ```
    {full_job_description}
    ```
    
    Hãy thực hiện phân tích chi tiết và trả về JSON với cấu trúc:
    {{
        "matching_score": {{
            "totalScore": [điểm số từ 0-100],
            "matchedSkills": ["skill1", "skill2", ...],
            "missingSkills": ["skill1", "skill2", ...],
            "extraSkills": ["skill1", "skill2", ...],
            "niceToHaveSkills": ["skill1", "skill2", ...],
            "detailedScores": {{
                "skills_match": [điểm số từ 0-100],
                "education_match": [điểm số từ 0-100], 
                "experience_match": [điểm số từ 0-100],
                "overall_similarity": [điểm số từ 0-100],
                "context_score": [điểm số từ 0-100],
                "nice_to_have_bonus": [điểm số từ 0-20]
            }},
            "suitabilityLevel": ["Extremely Well Suited", "Well Suited", "Moderately Suited", "Somewhat Suited", "Not Well Suited"],
            "recommendations": ["đề xuất 1", "đề xuất 2", ...],
            "cvImprovementSuggestions": ["gợi ý 1", "gợi ý 2", ...]
        }},
        "detailedAnalysis": {{
            "skills": {{
                "score": [điểm số từ 0-100],
                "matched_skills": ["skill1", "skill2", ...],
                "missing_skills": ["skill1", "skill2", ...],
                "required_skills_matched": ["skill1", "skill2", ...],
                "required_skills_missing": ["skill1", "skill2", ...],
                "nice_to_have_matched": ["skill1", "skill2", ...],
                "nice_to_have_missing": ["skill1", "skill2", ...],
                "reason": "Lý do đánh giá chi tiết"
            }},
            "education": {{
                "score": [điểm số từ 0-100],
                "cv_level": "Trình độ học vấn trong CV",
                "job_level": "Trình độ học vấn yêu cầu",
                "cv_majors": ["chuyên ngành 1", ...],
                "job_majors": ["chuyên ngành yêu cầu 1", ...],
                "reason": "Lý do đánh giá"
            }},
            "experience": {{
                "score": [điểm số từ 0-100],
                "cv_years": [số năm kinh nghiệm từ CV],
                "job_years": [số năm kinh nghiệm yêu cầu],
                "reason": "Lý do đánh giá"
            }}
        }}
    }}
    
    Chỉ trả về JSON, không bao gồm markdown hoặc văn bản khác.
    """
    return prompt
```

### 2.3 Frontend - Hiển thị kết quả

```javascript
// Xử lý kết quả phân tích
const displayAnalysisResult = (analysisResult) => {
  const { matching_score, detailedAnalysis } = analysisResult;
  
  // Hiển thị điểm tổng thể
  setTotalScore(matching_score.totalScore);
  
  // Hiển thị kỹ năng phù hợp/thiếu
  setMatchedSkills(matching_score.matchedSkills);
  setMissingSkills(matching_score.missingSkills);
  
  // Hiển thị mức độ phù hợp
  setSuitabilityLevel(matching_score.suitabilityLevel);
  
  // Hiển thị gợi ý cải thiện
  setRecommendations(matching_score.recommendations);
  setCvImprovementSuggestions(matching_score.cvImprovementSuggestions);
  
  // Hiển thị phân tích chi tiết
  setDetailedAnalysis(detailedAnalysis);
  
  // Lưu vào cache
  setCachedAnalysis(analysisResult);
};
```

---

## 3. CHECK COMMENT (KIỂM TRA BÌNH LUẬN)

### 3.1 Frontend Processing

#### File: Review/ReviewManagement.js hoặc component tương tự
```javascript
const checkCommentToxicity = async (commentText) => {
  try {
    setIsCheckingComment(true);
    
    // Gọi API kiểm tra comment
    const response = await fetch('http://localhost:5000/check-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: commentText,
        threshold: 0.7, // Ngưỡng toxic
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Lỗi khi kiểm tra comment:', error);
    throw error;
  } finally {
    setIsCheckingComment(false);
  }
};

// Xử lý khi user submit comment
const handleSubmitComment = async (commentData) => {
  try {
    // Kiểm tra tính độc hại của comment
    const toxicityCheck = await checkCommentToxicity(commentData.text);
    
    if (toxicityCheck.is_toxic) {
      // Hiển thị cảnh báo
      toast.error("Bình luận chứa nội dung không phù hợp. Vui lòng chỉnh sửa.");
      setShowToxicWarning(true);
      return;
    }
    
    // Nếu comment OK, tiếp tục submit
    await submitReview(commentData);
    toast.success("Đánh giá đã được gửi thành công!");
    
  } catch (error) {
    toast.error("Có lỗi khi gửi đánh giá. Vui lòng thử lại.");
  }
};
```

### 3.2 Backend Processing (Python AI Service)

#### File: `AI/Re.py` - Comment Check Endpoint
```python
@app.route('/check-comment', methods=['POST'])
def check_company_review():
    """API endpoint để kiểm tra bình luận đánh giá công ty"""
    try:
        # 1. Validate request
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing text field in request body'
            }), 400

        text = data['text']
        threshold = float(data.get('threshold', 0.7))

        # 2. Kiểm tra với company review filter
        is_toxic, score = company_review_filter.filter_comment(text, threshold)

        # 3. Trả về kết quả
        return jsonify({
            'is_toxic': is_toxic,
            'score': score,
            'text': text
        })

    except Exception as e:
        logger.error(f"Error checking company review: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500
```

#### Chi tiết CompanyReviewFilter Class:

```python
class CompanyReviewFilter:
    """Filter dành riêng cho bình luận đánh giá công ty"""
    
    def __init__(self):
        self.patterns = self._init_patterns()
        self.model = None
        self.cache = {}
        self.cache_ttl = 300
        
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key:
                self.model = self._setup_gemini(api_key)
                logger.info("Gemini model initialized successfully")
            else:
                logger.warning("GEMINI_API_KEY not found, using pattern-only filtering")
        except Exception as e:
            logger.error(f"Lỗi khi khởi tạo Gemini model: {str(e)}")

    def filter_comment(self, text: str, threshold: float = 0.7) -> Tuple[bool, float]:
        """
        Lọc bình luận đánh giá công ty:
        - CHỈ lọc nội dung toxic (chửi thề, xúc phạm, đe dọa)
        - KHÔNG lọc ý kiến phê bình hợp lệ về công ty
        """
        if not text or not text.strip():
            return False, 0.0

        text = text.strip()
        cache_key = self._get_cache_key(text)
        
        # Check cache
        cached_result = self._get_cached_result(cache_key)
        if cached_result:
            return cached_result['is_toxic'], cached_result['score']

        is_toxic_final = False
        score_final = 0.0
        method_final = 'default'
        pattern_type_final = ''
        details_final = {}

        try:
            # Bước 1: Kiểm tra nội dung an toàn
            safe_patterns = ['safe_expressions', 'safe_emoticons']
            for pattern_name in safe_patterns:
                if pattern_name in self.patterns:
                    pattern = self.patterns[pattern_name]
                    if pattern.search(text.lower()):
                        is_toxic_final = False
                        score_final = 0.0
                        method_final = 'whitelist'
                        pattern_type_final = pattern_name
                        break
            
            if not is_toxic_final:
                # Bước 2: Kiểm tra ý kiến phê bình hợp lệ
                is_criticism, criticism_type = self._is_legitimate_criticism(text)
                if is_criticism:
                    is_toxic_final = False
                    score_final = 0.0
                    method_final = 'legitimate_criticism'
                    pattern_type_final = criticism_type
                else:
                    # Bước 3: Kiểm tra nội dung toxic thực sự
                    is_toxic_pattern, toxic_score, toxic_type = self._is_toxic_content(text)
                    
                    if is_toxic_pattern:
                        is_toxic_final = True
                        score_final = toxic_score
                        method_final = 'toxic_pattern'
                        pattern_type_final = toxic_type
                    else:
                        # Bước 4: AI analysis
                        if self.model and len(text) > 3:
                            is_vietnamese = self._is_vietnamese(text)
                            is_toxic_ai, ai_score, ai_details = self._analyze_with_gemini_for_reviews(text, is_vietnamese)
                            
                            is_toxic_final = is_toxic_ai and ai_score >= threshold
                            score_final = ai_score
                            method_final = 'ai'
                            details_final = ai_details

            # Cache result
            result_to_cache = {
                'is_toxic': is_toxic_final,
                'score': score_final,
                'method': method_final,
                'pattern_type': pattern_type_final,
                'details': details_final
            }
            self._set_cache(cache_key, result_to_cache)
            
            return is_toxic_final, score_final
            
        except Exception as e:
            logger.error(f"Error filtering comment: {str(e)}")
            return False, 0.0
```

**Kiểm tra ý kiến phê bình hợp lệ:**
```python
def _is_legitimate_criticism(self, text: str) -> Tuple[bool, str]:
    """Kiểm tra xem có phải là ý kiến phê bình hợp lệ về công ty không"""
    text_lower = text.lower().strip()
    
    # Từ khóa liên quan đến đánh giá công ty (không toxic)
    company_keywords = [
        'công ty', 'company', 'cty', 'doanh nghiệp',
        'sếp', 'boss', 'manager', 'quản lý', 'lãnh đạo',
        'nhân viên', 'employee', 'staff', 'đồng nghiệp',
        'lương', 'salary', 'tiền lương', 'thu nhập',
        'môi trường', 'environment', 'văn hóa', 'culture',
        'làm việc', 'work', 'job', 'nghề nghiệp',
        'phúc lợi', 'benefit', 'bảo hiểm', 'chế độ',
        'tăng ca', 'overtime', 'giờ làm',
        'đào tạo', 'training', 'phát triển', 'development'
    ]
    
    # Kiểm tra có từ khóa công ty không
    has_company_context = any(keyword in text_lower for keyword in company_keywords)
    
    if has_company_context:
        # Kiểm tra pattern phê bình hợp lệ
        if 'legitimate_criticism' in self.patterns:
            pattern = self.patterns['legitimate_criticism']
            if pattern.search(text_lower):
                return True, "legitimate_company_criticism"
    
    return False, ""
```

**Phân tích với AI:**
```python
def _analyze_with_gemini_for_reviews(self, text: str, is_vietnamese: bool = False) -> Tuple[bool, float, Dict[str, Any]]:
    """AI analysis đặc biệt cho company reviews"""
    if not self.model:
        return False, 0.0, {"error": "Model not available"}

    try:
        language = "Vietnamese" if is_vietnamese else "English"
        
        prompt = f"""You are analyzing a COMPANY REVIEW comment. Your job is to detect only TOXIC content, not legitimate criticism.

IMPORTANT RULES:
- Negative opinions about company are NOT toxic (e.g., "company is bad", "terrible workplace", "low salary", "bad management")
- Only flag as toxic: profanity, personal attacks, threats, hate speech, harassment
- Simple expressions like "haha", "hihi", "lol" are NOT toxic
- Constructive criticism is NOT toxic

Examples of NON-TOXIC (legitimate criticism):
- "Công ty không tốt, lương thấp" 
- "Bad company, terrible management"
- "Môi trường làm việc tệ, không khuyến khích"
- "Don't recommend this company"

Examples of TOXIC:
- Personal insults, profanity, threats
- "Thằng sếp ngu như chó"
- "F*** this company and everyone there"

Analyze this {language} company review comment:

Text: "{text}"

Return JSON:
{{
    "is_toxic": boolean,
    "score": float_0_to_1,
    "reason": "brief explanation",
    "categories": ["profanity", "personal_attack", "threat", etc]
}}

JSON:"""

        response = self.model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean JSON response
        if response_text.startswith('```json'):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith('```'):
            response_text = response_text[3:-3].strip()
        
        try:
            result = json.loads(response_text)
            is_toxic = result.get('is_toxic', False)
            score = float(result.get('score', 0.0))
            
            return is_toxic, score, result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            # Fallback parsing
            is_toxic = 'true' in response_text.lower() and 'is_toxic' in response_text.lower()
            score = 0.3 if is_toxic else 0.0
            
            return is_toxic, score, {"error": "JSON parse failed", "raw_response": response_text[:100]}
            
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return False, 0.0, {"error": str(e)}
```

### 3.3 Frontend - Xử lý kết quả kiểm tra

```javascript
// Hiển thị kết quả kiểm tra comment
const handleCommentCheckResult = (checkResult) => {
  const { is_toxic, score, text } = checkResult;
  
  if (is_toxic) {
    // Hiển thị cảnh báo chi tiết
    setToxicWarning({
      show: true,
      score: score,
      message: score > 0.8 
        ? "Bình luận chứa nội dung độc hại nghiêm trọng. Vui lòng chỉnh sửa."
        : "Bình luận có thể chứa nội dung không phù hợp. Bạn có muốn xem xét lại?",
      severity: score > 0.8 ? 'high' : 'medium'
    });
    
    // Highlight các phần có vấn đề
    highlightProblematicContent(text);
    
    // Suggest alternatives
    if (score > 0.5) {
      showAlternativeSuggestions();
    }
    
  } else {
    // Comment OK, cho phép submit
    setToxicWarning({ show: false });
    enableCommentSubmission();
  }
};

// Gợi ý cách viết comment tốt hơn
const showAlternativeSuggestions = () => {
  const suggestions = [
    "Hãy thử diễn đạt ý kiến một cách tích cực hơn",
    "Tập trung vào việc đưa ra phản hồi xây dựng",
    "Chia sẻ kinh nghiệm cụ thể thay vì chỉ trích chung chung",
    "Sử dụng ngôn từ lịch sự và chuyên nghiệp"
  ];
  
  setSuggestions(suggestions);
  setShowSuggestions(true);
};
```

---

## 4. TỔNG KẾT QUY TRÌNH XỬ LÝ

### 4.1 Kiến trúc tổng thể:
```
Frontend (React) → Redux → API Gateway → Backend Services
     ↓                ↓         ↓            ↓
UI Components → Actions → HTTP Requests → Python AI Service
     ↓                ↓         ↓            ↓
State Management → Reducers → Response → Processing Results
```

### 4.2 Các công nghệ sử dụng:

**Frontend:**
- React.js với Hooks
- Redux Toolkit cho state management
- Axios cho HTTP requests
- React Router cho navigation
- TailwindCSS cho styling
- Toast notifications cho UX

**Backend AI Service:**
- Python Flask framework
- SentenceTransformers cho embedding
- Google Gemini AI cho NLP
- PyPDF2 và docx2txt cho document processing
- Redis cho caching
- NumPy, Pandas cho data processing

**Security & Performance:**
- JWT authentication
- File type và size validation
- Text preprocessing để loại bỏ thông tin cá nhân
- Caching strategies (Redis + in-memory)
- Error handling và logging
- Rate limiting và timeout protection

### 4.3 Flow data chính:
1. **User Input** → **Validation** → **Authentication** → **Processing** → **AI Analysis** → **Cache** → **Response** → **UI Update**

Mỗi chức năng đều tuân theo pattern này với các bước xử lý đặc thù riêng biệt.
