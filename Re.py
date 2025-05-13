
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

import logging
import time
import re
import traceback
import numpy as np
import pandas as pd
import torch
from datetime import datetime
from functools import wraps
from threading import Thread
import concurrent.futures
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, __version__ as sentence_transformers_version
import psutil
from threading import Lock

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logging.info(f"Sentence Transformers version: {sentence_transformers_version}")
logging.info(f"Torch version: {torch.__version__}")

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "Authorization"}})

# File paths configuration
JOBS_FILEPATH = 'D:\\2024-2025_HKI\\TLCN\\JobPortal_Project\\job_post.csv'
SEARCH_HISTORY_FILEPATH = 'D:\\2024-2025_HKI\\TLCN\\JobPortal_Project\\search.csv'

# Cache cho vector công việc
JOB_VECTOR_CACHE = {}

# Danh sách stop words tiếng Việt (mở rộng)
VIETNAMESE_STOP_WORDS = [
    "và", "của", "là", "các", "cho", "trong", "tại", "được", "với", "một",
    "những", "để", "từ", "có", "không", "người", "này", "đã", "ra", "trên",
    "bằng", "vào", "hay", "thì", "đó", "nào", "ở", "lại", "còn", "như",
    "thành", "phố", "hồ", "chí", "minh", "title", "tuyển", "dụng", "việc",
    "làm", "công", "ty", "tại", "lương", "cao", "hấp", "dẫn", "dịch", "vụ",
    "quản", "lý", "hệ", "thống"
]

# Biến toàn cục
MODEL = None
TOKENIZER = None
DEVICE = None
TFIDF_VECTORIZER = None
jobs = []
search_history = []

# Từ khóa theo ngành nghề
DRIVER_KEYWORDS = [
    'tài xế', 'lái xe', 'lái xe tải', 'tài xế xe tải', 'lái xe container',
    'giao hàng', 'vận chuyển'
]
TECH_KEYWORDS = [
    'công nghệ ô tô', 'sửa chữa ô tô', 'kiểm tra ghế lái', 'kiểm tra phanh xe',
    'kỹ sư ô tô', 'thiết kế ô tô', 'bảo dưỡng ô tô', 'truyền động',
    'kỹ thuật viên ô tô', 'sửa chữa truyền động', 'xe điện', 'phụ tùng ô tô'
]
ECOMMERCE_KEYWORDS = [
    'thương mại điện tử', 'mua sắm trực tuyến', 'sàn thương mại',
    'thanh toán điện tử', 'marketplace', 'e-commerce'
]
MARKETING_KEYWORDS = [
    'quảng cáo', 'tiếp thị số', 'truyền thông xã hội', 'seo', 'sem', 'thương hiệu'
]
IT_HARDWARE_KEYWORDS = [
    'phần cứng', 'sửa chữa máy tính', 'hạ tầng mạng', 'server', 'linh kiện điện tử'
]
IT_SOFTWARE_KEYWORDS = [
    'lập trình', 'phát triển phần mềm', 'kỹ sư phần mềm', 'trí tuệ nhân tạo',
    'ứng dụng di động', 'java', 'python', 'javascript', 'devops', 'database',
    'cloud', 'web developer', 'mobile developer', 'software engineer', 'api',
    'microservices', 'blockchain', 'machine learning', 'fullstack', 'backend',
    'frontend', 'phần mềm'
]

HOSPITALITY_KEYWORDS = [
    'nhà hàng', 'khách sạn', 'đầu bếp', 'phục vụ', 'lễ tân', 'du lịch'
]
DESIGN_KEYWORDS = [
    'thiết kế đồ họa', 'ui/ux', 'minh họa', 'thiết kế bao bì', 'nhận diện thương hiệu'
]
MECHANICAL_KEYWORDS = [
    'cơ khí', 'bảo trì máy móc', 'thiết kế cơ khí', 'tự động hóa', 'cad/cam'
]
BUSINESS_KEYWORDS = [
    'bán hàng', 'phát triển thị trường', 'chiến lược kinh doanh', 'đàm phán hợp đồng'
]
EDUCATION_KEYWORDS = [
    'giảng dạy', 'giáo viên', 'đào tạo', 'giáo dục trực tuyến', 'phát triển chương trình'
]
CONSTRUCTION_KEYWORDS = [
    'kiến trúc', 'xây dựng', 'thiết kế kiến trúc', 'giám sát công trình', 'quy hoạch đô thị'
]
FINANCE_KEYWORDS = [
    'tài chính', 'ngân hàng', 'kế toán tài chính', 'phân tích tài chính', 'đầu tư'
]
TELECOM_KEYWORDS = [
    'viễn thông', 'mạng di động', 'cáp quang', '5g', 'kỹ thuật viễn thông'
]
HEALTHCARE_KEYWORDS = [
    'bác sĩ', 'điều dưỡng', 'dược sĩ', 'chăm sóc bệnh nhân', 'y tế công cộng'
]
LOGISTICS_KEYWORDS = [
    'vận tải', 'chuỗi cung ứng', 'kho bãi', 'giao nhận hàng hóa', 'xuất nhập khẩu', 'hải quan'
]
ACCOUNTING_KEYWORDS = [
    'kế toán', 'kiểm toán', 'báo cáo tài chính', 'thuế', 'quản lý ngân sách'
]
MANUFACTURING_KEYWORDS = [
    'sản xuất', 'vận hành máy móc', 'kiểm soát chất lượng', 'sản xuất'
]
LEGAL_KEYWORDS = [
    'luật sư', 'tư vấn pháp lý', 'hợp đồng', 'pháp chế', 'sở hữu trí tuệ'
]
TRANSLATION_KEYWORDS = [
    'phiên dịch', 'dịch thuật', 'thông dịch', 'đa ngôn ngữ', 'hiệu đính'
]
EMBEDDED_IOT_KEYWORDS = [
    'hệ thống nhúng', 'iot', 'cảm biến', 'thiết bị thông minh', 'firmware'
]
# Liên kết các ngành nghề liên quan
RELATED_INTENTS = {
    'it_hardware': ['it_software', 'mechanical', 'embedded_iot'],
    'it_software': ['it_hardware', 'embedded_iot'],
    'mechanical': ['it_hardware', 'manufacturing'],
    'embedded_iot': ['it_hardware', 'it_software'],
    # Thêm các liên kết khác nếu cần
}

def normalize_keyword(keyword):
    """Chuẩn hóa từ khóa: lowercase, giữ dấu cách, tạo thêm phiên bản không dấu cách."""
    keyword = keyword.lower().strip()
    no_space = re.sub(r'\s+', '', keyword)  # Phiên bản không dấu cách (e.g., "phần mềm" -> "phầnmềm")
    return keyword, no_space

# Timeout decorator
def timeout(seconds):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = [None]
            error = [None]

            def target():
                try:
                    result[0] = func(*args, **kwargs)
                except Exception as e:
                    error[0] = e

            thread = Thread(target=target)
            thread.daemon = True
            thread.start()
            thread.join(seconds)

            if thread.is_alive():
                raise TimeoutError(f"Function {func.__name__} timed out after {seconds} seconds")

            return result[0]
        return wrapper
    return decorator

# Hàm theo dõi tài nguyên
def log_resource_usage():
    process = psutil.Process()
    mem = process.memory_info().rss / 1024 / 1024
    cpu = psutil.cpu_percent(interval=1)
    logging.info(f"Sử dụng bộ nhớ: {mem:.2f} MB | CPU: {cpu:.2f}%")

# Hàm tải mô hình paraphrase-multilingual-mpnet-base-v2
def load_mbert():
    global MODEL, TOKENIZER, DEVICE, TFIDF_VECTORIZER
    if MODEL is not None:
        logging.info("Mô hình đã được tải trước đó.")
        return

    try:
        logging.info("Kiểm tra phiên bản thư viện...")
        logging.info(f"Sentence Transformers: {sentence_transformers_version}")
        logging.info(f"PyTorch: {torch.__version__}")
        logging.info(f"CUDA khả dụng: {torch.cuda.is_available()}")

        model_path = 'D:\\Recommendation\\model_cache'
        if os.path.exists(model_path):
            logging.info(f"Tải mô hình từ cục bộ: {model_path}")
            MODEL = SentenceTransformer(model_path)
        else:
            logging.info("Tải mô hình từ Hugging Face...")
            MODEL = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
            logging.info("Lưu mô hình vào cục bộ...")
            MODEL.save(model_path)

        logging.info("Mô hình tải thành công!")
        TOKENIZER = None
        logging.info("Tokenizer được đặt là None.")

        if torch.cuda.is_available():
            logging.info("CUDA khả dụng. Sử dụng GPU.")
            DEVICE = torch.device("cuda")
            logging.info(f"GPU: {torch.cuda.get_device_name(0)}")
        else:
            logging.info("CUDA không khả dụng. Sử dụng CPU.")
            DEVICE = torch.device("cpu")

        logging.info("Chuyển mô hình sang thiết bị...")
        MODEL.to(DEVICE)
        MODEL.eval()
        logging.info(f"Mô hình đã được chuyển sang {DEVICE}")

        logging.info("Khởi tạo TF-IDF vectorizer...")
        TFIDF_VECTORIZER = TfidfVectorizer(
            stop_words=VIETNAMESE_STOP_WORDS,
            max_df=0.8,
            min_df=2,
            max_features=5000
        )
        logging.info("TF-IDF vectorizer khởi tạo thành công!")

        logging.info("Kiểm tra mô hình...")
        try:
            test_embedding = MODEL.encode("Kiểm tra mô hình", device=DEVICE, show_progress_bar=False)
            logging.info(f"Kích thước vector kiểm tra: {test_embedding.shape}")
        except Exception as test_e:
            logging.error(f"Lỗi khi kiểm tra mô hình: {str(test_e)}", exc_info=True)
            raise

        log_resource_usage()
    except Exception as e:
        logging.error(f"Lỗi chi tiết khi tải mô hình: {str(e)}", exc_info=True)
        MODEL = None
        TOKENIZER = None
        DEVICE = None
        TFIDF_VECTORIZER = None
        raise

def load_jobs_from_csv(filepath, max_jobs=1400):
    global TFIDF_VECTORIZER, JOB_VECTOR_CACHE
    try:
        logging.info(f"Đang tải công việc từ {filepath}...")
        start_time = time.time()

        df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
        required_columns = ['postId', 'title', 'companyId']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            logging.error(f"Thiếu cột bắt buộc trong job_post.csv: {missing_columns}")
            return []

        # Loại bỏ các công việc trùng lặp dựa trên postId
        df = df.drop_duplicates(subset=['postId'], keep='first')
        logging.info(f"Số công việc sau khi loại bỏ trùng lặp: {len(df)}")

        df['createDate'] = pd.to_datetime(df['createDate'], errors='coerce')
        df['expireDate'] = pd.to_datetime(df['expireDate'], errors='coerce')

        current_date = datetime.now()
        df_active = df[df['expireDate'].notna() & (df['expireDate'] > current_date)].copy()
        df_sorted = df_active.sort_values(by='createDate', ascending=False).head(max_jobs)
        df_sorted = df_sorted.fillna({
            'title': 'Không có tiêu đề',
            'description': '',
            'location': '',
            'salary': 0,
            'experience': '',
            'typeOfWork': '',
            'companyName': '',
            'cityName': '',
            'logo': '',
            'industryNames': ''
        })
        jobs = df_sorted.to_dict(orient='records')

        if TFIDF_VECTORIZER and jobs:
            job_texts = [" ".join(str(job.get(field, '')) for field in ['title', 'description', 'typeOfWork', 'companyName']) for job in jobs]
            try:
                TFIDF_VECTORIZER.fit(job_texts)
                logging.info("TF-IDF vectorizer đã được fit với dữ liệu công việc.")
            except Exception as e:
                logging.error(f"Lỗi khi fit TF-IDF vectorizer: {str(e)}")
                TFIDF_VECTORIZER = None

        cache_path = 'D:\\Recommendation\\job_vector_cache.pkl'
        if os.path.exists(cache_path):
            logging.info(f"Tải JOB_VECTOR_CACHE từ {cache_path}...")
            try:
                JOB_VECTOR_CACHE.update(pd.read_pickle(cache_path))
                # Xóa các vector không hợp lệ trong cache
                invalid_ids = [job_id for job_id, vec in JOB_VECTOR_CACHE.items() if not np.any(vec) or np.linalg.norm(vec) < 1e-6]
                for job_id in invalid_ids:
                    logging.warning(f"Xóa vector không hợp lệ trong cache cho Job ID {job_id}")
                    del JOB_VECTOR_CACHE[job_id]
                pd.to_pickle(JOB_VECTOR_CACHE, cache_path)
            except Exception as e:
                logging.error(f"Lỗi khi tải cache: {str(e)}. Xóa và tạo lại cache.")
                JOB_VECTOR_CACHE.clear()
                os.remove(cache_path)

        if MODEL is not None:
            logging.info("Tính trước vector cho công việc...")
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
                for job in jobs:
                    job_id = job.get('postId')
                    if job_id and job_id not in JOB_VECTOR_CACHE:
                        job_text = " ".join(str(job.get(field, '')) for field in ['title', 'description', 'typeOfWork', 'companyName'])
                        if not job_text.strip() or len(job_text.strip().split()) < 3:
                            logging.warning(f"Job ID {job_id} có job_text không đủ nội dung: {job_text[:50]}...")
                            JOB_VECTOR_CACHE[job_id] = np.zeros(768)
                            continue
                        vector = executor.submit(get_bert_vector, job_text, MODEL, TOKENIZER, DEVICE, TFIDF_VECTORIZER).result()
                        if np.any(vector) and np.linalg.norm(vector) >= 1e-6:
                            JOB_VECTOR_CACHE[job_id] = vector
                        else:
                            logging.warning(f"Vector không hợp lệ khi khởi tạo cho Job ID {job_id}")
                            JOB_VECTOR_CACHE[job_id] = np.zeros(768)

            try:
                pd.to_pickle(JOB_VECTOR_CACHE, cache_path)
                logging.info(f"Đã lưu JOB_VECTOR_CACHE vào {cache_path}")
            except Exception as e:
                logging.error(f"Lỗi khi lưu cache: {str(e)}")
        else:
            logging.warning("Mô hình chưa được tải, bỏ qua tính vector công việc.")

        load_time = time.time() - start_time
        logging.info(f"Đã tải {len(jobs)} công việc trong {load_time:.2f} giây.")
        log_resource_usage()
        return jobs
    except Exception as e:
        logging.error(f"Lỗi khi tải công việc từ CSV: {str(e)}")
        traceback.print_exc()
        return []
# Hàm tải lịch sử tìm kiếm từ CSV
last_search_csv_modified = 0

def load_search_history_from_csv(filepath):
    global search_history, last_search_csv_modified
    try:
        if not os.path.exists(filepath):
            logging.warning(f"Tệp {filepath} không tồn tại.")
            search_history = []
            return search_history

        current_modified = os.path.getmtime(filepath)
        if current_modified <= last_search_csv_modified:
            logging.info(f"Tệp {filepath} chưa thay đổi, sử dụng search_history hiện tại.")
            return search_history

        logging.info(f"Đang tải lịch sử tìm kiếm từ {filepath}...")
        start_time = time.time()

        df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
        if 'SeekerID' not in df or 'Search Query' not in df:
            logging.warning("Thiếu cột bắt buộc trong lịch sử tìm kiếm.")
            search_history = []
            return search_history

        if 'Search Date' in df.columns:
            df['Search Date'] = pd.to_datetime(df['Search Date'], errors='coerce')
            df_sorted = df.sort_values(by='Search Date', ascending=False).copy()
        else:
            df_sorted = df.copy()

        df_sorted['Search Query'] = df_sorted['Search Query'].astype(str).apply(
            lambda x: re.sub(r'(CityName:|IndustryNames:|MaxSalary:|TypesOfWork:|Title:\s*\d+\s*|\s*\|\s*)', '', x).strip()
        )
        search_history = df_sorted.fillna('').to_dict(orient='records')

        last_search_csv_modified = current_modified
        load_time = time.time() - start_time
        logging.info(f"Đã tải {len(search_history)} mục lịch sử tìm kiếm trong {load_time:.2f} giây.")
        return search_history
    except Exception as e:
        logging.error(f"Lỗi khi tải lịch sử tìm kiếm từ CSV: {str(e)}")
        traceback.print_exc()
        search_history = []
        return search_history

# Hàm lọc công việc theo ngành nghề
def filter_jobs_by_category(jobs, user_queries, top_n=2000):
    if not user_queries:
        return jobs[:top_n]
    
    keywords = set()
    cities = set()
    query_intents = set()
    for query in user_queries:
        cleaned_query = query.get('Search Query', '').replace('Title:', '').strip()
        processed_query = preprocess_text(cleaned_query, normalize_for_keywords=True)
        no_space_query = re.sub(r'\s+', '', processed_query)  # Phiên bản không dấu cách
        words = processed_query.split()
        keywords.update([word for word in words if word not in VIETNAMESE_STOP_WORDS])
        logging.debug(f"Truy vấn đã xử lý: {processed_query} | Không dấu cách: {no_space_query}")
        if "CityName:" in query.get('Search Query', ''):
            city = re.search(r'CityName:([^|]+)', query.get('Search Query', ''))
            if city:
                cities.add(city.group(1).strip().lower())
        
        # Kiểm tra intent cho từng ngành
        for kw, kw_no_space in [normalize_keyword(k) for k in DRIVER_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('driver')
                logging.debug(f"Driver intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in TECH_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('tech')
                logging.debug(f"Tech intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in ECOMMERCE_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('ecommerce')
                logging.debug(f"Ecommerce intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in MARKETING_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('marketing')
                logging.debug(f"Marketing intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in IT_HARDWARE_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('it_hardware')
                query_intents.update(RELATED_INTENTS.get('it_hardware', []))
                logging.debug(f"IT hardware intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in IT_SOFTWARE_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('it_software')
                logging.debug(f"IT software intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in HOSPITALITY_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('hospitality')
                logging.debug(f"Hospitality intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in DESIGN_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('design')
                logging.debug(f"Design intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in MECHANICAL_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('mechanical')
                query_intents.update(RELATED_INTENTS.get('mechanical', []))
                logging.debug(f"Mechanical intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in BUSINESS_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('business')
                logging.debug(f"Business intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in EDUCATION_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('education')
                logging.debug(f"Education intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in CONSTRUCTION_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('construction')
                logging.debug(f"Construction intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in FINANCE_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('finance')
                logging.debug(f"Finance intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in TELECOM_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('telecom')
                logging.debug(f"Telecom intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in HEALTHCARE_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('healthcare')
                logging.debug(f"Healthcare intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in LOGISTICS_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('logistics')
                logging.debug(f"Logistics intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in ACCOUNTING_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('accounting')
                logging.debug(f"Accounting intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in MANUFACTURING_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('manufacturing')
                logging.debug(f"Manufacturing intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in LEGAL_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('legal')
                logging.debug(f"Legal intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in TRANSLATION_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('translation')
                logging.debug(f"Translation intent matched with keyword: {kw}")
        for kw, kw_no_space in [normalize_keyword(k) for k in EMBEDDED_IOT_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('embedded_iot')
                query_intents.update(RELATED_INTENTS.get('embedded_iot', []))
                logging.debug(f"Embedded IoT intent matched with keyword: {kw}")
    logging.info(f"Ý định truy vấn: {query_intents}")

    seen_job_ids = set()
    filtered_jobs = []
    for job in jobs:
        job_id = job.get('postId')
        if job_id in seen_job_ids:
            logging.debug(f"Bỏ qua công việc trùng lặp với ID: {job_id}")
            continue
        seen_job_ids.add(job_id)
        
        job_text = " ".join(str(job.get(field, '')) for field in ['title', 'description', 'typeOfWork', 'industryNames'])
        if not job_text.strip() or len(job_text.strip().split()) < 3:
            logging.warning(f"Job ID {job_id} có job_text không đủ nội dung: {job_text[:50]}...")
            continue
        job_text = preprocess_text(job_text, normalize_for_keywords=False)
        job_city = str(job.get('city', '')).lower()
        job_title = job.get('title', '').lower()
        if cities and job_city not in cities:
            continue
        if not query_intents or any(intent in query_intents for intent in ['other']):
            filtered_jobs.append(job)
            continue
        intent_match = False
        # Chuẩn hóa job_title cho matching
        no_space_job_title = re.sub(r'\s+', '', job_title)
        for intent in query_intents:
            keywords = {
                'driver': [normalize_keyword(k) for k in DRIVER_KEYWORDS],
                'tech': [normalize_keyword(k) for k in TECH_KEYWORDS],
                'ecommerce': [normalize_keyword(k) for k in ECOMMERCE_KEYWORDS],
                'marketing': [normalize_keyword(k) for k in MARKETING_KEYWORDS],
                'it_hardware': [normalize_keyword(k) for k in IT_HARDWARE_KEYWORDS],
                'it_software': [normalize_keyword(k) for k in IT_SOFTWARE_KEYWORDS],
                'hospitality': [normalize_keyword(k) for k in HOSPITALITY_KEYWORDS],
                'design': [normalize_keyword(k) for k in DESIGN_KEYWORDS],
                'mechanical': [normalize_keyword(k) for k in MECHANICAL_KEYWORDS],
                'business': [normalize_keyword(k) for k in BUSINESS_KEYWORDS],
                'education': [normalize_keyword(k) for k in EDUCATION_KEYWORDS],
                'construction': [normalize_keyword(k) for k in CONSTRUCTION_KEYWORDS],
                'finance': [normalize_keyword(k) for k in FINANCE_KEYWORDS],
                'telecom': [normalize_keyword(k) for k in TELECOM_KEYWORDS],
                'healthcare': [normalize_keyword(k) for k in HEALTHCARE_KEYWORDS],
                'logistics': [normalize_keyword(k) for k in LOGISTICS_KEYWORDS],
                'accounting': [normalize_keyword(k) for k in ACCOUNTING_KEYWORDS],
                'manufacturing': [normalize_keyword(k) for k in MANUFACTURING_KEYWORDS],
                'legal': [normalize_keyword(k) for k in LEGAL_KEYWORDS],
                'translation': [normalize_keyword(k) for k in TRANSLATION_KEYWORDS],
                'embedded_iot': [normalize_keyword(k) for k in EMBEDDED_IOT_KEYWORDS]
            }.get(intent, [])
            for kw, kw_no_space in keywords:
                if kw in job_title or kw_no_space in no_space_job_title:
                    intent_match = True
                    logging.debug(f"Job ID {job_id} matched intent {intent} with keyword: {kw}")
                    break
        if intent_match:
            filtered_jobs.append(job)
    
    logging.info(f"Đã lọc được {len(filtered_jobs)} công việc sau khi loại bỏ trùng lặp và kiểm tra nội dung")
    return filtered_jobs[:top_n]


# Hàm tiền xử lý văn bản
def preprocess_text(text, bypass_stop_words=False, normalize_for_keywords=False):
    if not isinstance(text, str):
        logging.debug(f"Văn bản không phải chuỗi: {text}")
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s_àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]', ' ', text, flags=re.UNICODE)
    text = re.sub(r'\s+', ' ', text).strip()
    if not text:
        logging.debug(f"Văn bản trống sau khi làm sạch: {text}")
        return ""
    words = text.split()
    if normalize_for_keywords:
        # Giữ tất cả từ dài >= 2 ký tự, không lọc stop words để bảo toàn cụm từ như "phần mềm"
        words = [word for word in words if len(word) >= 2]
    elif not bypass_stop_words:
        words = [word for word in words if word not in VIETNAMESE_STOP_WORDS and len(word) >= 2]
    else:
        words = [word for word in words if len(word) >= 2]
    if not words:
        logging.debug(f"Không còn từ nào sau khi lọc, trả lại văn bản gốc: {text[:50]}...")
        return text
    
    boosted_words = []
    for word in words:
        boosted_words.append(word)
        if any(kw in word for kw in (
            DRIVER_KEYWORDS + TECH_KEYWORDS + ECOMMERCE_KEYWORDS + MARKETING_KEYWORDS +
            IT_HARDWARE_KEYWORDS + IT_SOFTWARE_KEYWORDS + HOSPITALITY_KEYWORDS + DESIGN_KEYWORDS +
            MECHANICAL_KEYWORDS + BUSINESS_KEYWORDS + EDUCATION_KEYWORDS + CONSTRUCTION_KEYWORDS +
            FINANCE_KEYWORDS + TELECOM_KEYWORDS + HEALTHCARE_KEYWORDS + LOGISTICS_KEYWORDS +
            ACCOUNTING_KEYWORDS + MANUFACTURING_KEYWORDS + LEGAL_KEYWORDS + TRANSLATION_KEYWORDS +
            EMBEDDED_IOT_KEYWORDS
        )):
            boosted_words.append(word)
    result = ' '.join(boosted_words)
    logging.debug(f"Văn bản sau preprocess (normalize_for_keywords={normalize_for_keywords}): {result[:50]}...")
    return result

# Hàm tạo vector từ văn bản
@timeout(30)
def get_bert_vector(text, model, tokenizer, device, tfidf_vectorizer, bypass_tfidf=False):
    if model is None:
        logging.warning("Mô hình chưa được tải.")
        return np.zeros(768)
    if not isinstance(text, str) or not text.strip():
        logging.warning(f"Văn bản đầu vào trống hoặc không hợp lệ: {text}")
        return np.zeros(768)
    
    original_text = text
    text = preprocess_text(text, bypass_stop_words=False, normalize_for_keywords=False)
    logging.debug(f"Văn bản sau preprocess: {text[:50]}...")
    if not text:
        logging.warning(f"Preprocess trả về văn bản trống cho: {original_text[:50]}...")
        text = preprocess_text(original_text, bypass_stop_words=True, normalize_for_keywords=False)
        logging.debug(f"Văn bản sau bypass stop words: {text[:50]}...")
        if not text:
            logging.error(f"Không thể tạo văn bản hợp lệ từ: {original_text[:50]}...")
            return np.zeros(768)
    
    if len(text) > 1400:
        text = text[:1400]
    
    try:
        processed_text = text
        if tfidf_vectorizer and hasattr(tfidf_vectorizer, 'vocabulary_') and not bypass_tfidf:
            tfidf_vec = tfidf_vectorizer.transform([text]).toarray()[0]
            important_words = [word for word, idx in tfidf_vectorizer.vocabulary_.items() if tfidf_vec[idx] > 0.2]
            if important_words:
                processed_text = " ".join(important_words)
                logging.debug(f"Văn bản sau lọc TF-IDF: {processed_text[:50]}...")
            else:
                logging.debug("Không có từ quan trọng từ TF-IDF, sử dụng văn bản đã preprocess.")
                processed_text = text
        else:
            logging.debug("Bỏ qua TF-IDF filtering.")
        
        vector = model.encode(processed_text, device=device, normalize_embeddings=True, show_progress_bar=False)
        
        if np.allclose(vector, np.zeros(768), atol=1e-6):
            logging.warning(f"Vector gần bằng 0 cho văn bản: {processed_text[:50]}...")
            if not bypass_tfidf:
                logging.debug("Thử lại với bypass TF-IDF và stop words...")
                return get_bert_vector(original_text, model, tokenizer, device, tfidf_vectorizer, bypass_tfidf=True)
        
        logging.debug(f"Vector cho '{processed_text[:50]}...': {vector[:5]}")
        return vector
    except Exception as e:
        logging.error(f"Lỗi khi tạo vector cho văn bản '{processed_text[:50]}...': {str(e)}")
        return np.zeros(768)


@timeout(60)
def get_bert_recommendations(user_history, all_jobs, model, tokenizer, device, tfidf_vectorizer, top_n=8):
    start_time = time.time()
    logging.info(f"Bắt đầu gợi ý với {len(user_history)} lịch sử tìm kiếm và {len(all_jobs)} công việc...")

    if not user_history:
        logging.warning("Lịch sử tìm kiếm trống.")
        return [], []
    if not all_jobs:
        logging.warning("Danh sách công việc trống.")
        return [], []
    if model is None:
        logging.warning("Mô hình chưa được tải.")
        return [], []

    recent_search = user_history[0]
    query_text = recent_search.get('Search Query', '').replace('Title:', '').strip()
    processed_query = preprocess_text(query_text, normalize_for_keywords=True)
    no_space_query = re.sub(r'\s+', '', processed_query)
    logging.debug(f"Truy vấn đã xử lý: {processed_query} | Không dấu cách: {no_space_query}")
    
    query_intents = set()
    for kw, kw_no_space in [normalize_keyword(k) for k in DRIVER_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('driver')
            logging.debug(f"Driver intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in TECH_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('tech')
            logging.debug(f"Tech intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in ECOMMERCE_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('ecommerce')
            logging.debug(f"Ecommerce intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in MARKETING_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('marketing')
            logging.debug(f"Marketing intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in IT_HARDWARE_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('it_hardware')
            query_intents.update(RELATED_INTENTS.get('it_hardware', []))
            logging.debug(f"IT hardware intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in IT_SOFTWARE_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('it_software')
            logging.debug(f"IT software intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in HOSPITALITY_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('hospitality')
            logging.debug(f"Hospitality intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in DESIGN_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('design')
            logging.debug(f"Design intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in MECHANICAL_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('mechanical')
            query_intents.update(RELATED_INTENTS.get('mechanical', []))
            logging.debug(f"Mechanical intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in BUSINESS_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('business')
            logging.debug(f"Business intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in EDUCATION_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('education')
            logging.debug(f"Education intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in CONSTRUCTION_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('construction')
            logging.debug(f"Construction intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in FINANCE_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('finance')
            logging.debug(f"Finance intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in TELECOM_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('telecom')
            logging.debug(f"Telecom intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in HEALTHCARE_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('healthcare')
            logging.debug(f"Healthcare intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in LOGISTICS_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('logistics')
            logging.debug(f"Logistics intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in ACCOUNTING_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('accounting')
            logging.debug(f"Accounting intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in MANUFACTURING_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('manufacturing')
            logging.debug(f"Manufacturing intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in LEGAL_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('legal')
            logging.debug(f"Legal intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in TRANSLATION_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('translation')
            logging.debug(f"Translation intent matched with keyword: {kw}")
    for kw, kw_no_space in [normalize_keyword(k) for k in EMBEDDED_IOT_KEYWORDS]:
        if kw in processed_query or kw_no_space in no_space_query:
            query_intents.add('embedded_iot')
            query_intents.update(RELATED_INTENTS.get('embedded_iot', []))
            logging.debug(f"Embedded IoT intent matched with keyword: {kw}")
    logging.info(f"Ý định truy vấn: {query_intents}")

    user_query_vector = get_bert_vector(query_text, model, tokenizer, device, tfidf_vectorizer)
    if not np.any(user_query_vector) or np.linalg.norm(user_query_vector) < 1e-6:
        logging.warning(f"Không thể tạo vector từ truy vấn mới nhất: {query_text[:50]}...")
        return [], []

    user_query_vector /= np.linalg.norm(user_query_vector)
    logging.debug(f"Vector truy vấn người dùng: {user_query_vector[:5]}")
    profile_time = time.time() - start_time
    logging.info(f"Đã tạo vector truy vấn trong {profile_time:.2f} giây.")

    recent_jobs = filter_jobs_by_category(all_jobs, [recent_search], top_n=2000)
    logging.info(f"Đã lọc được {len(recent_jobs)} công việc.")

    job_similarities = []
    processed_job_ids = set()
    for job in recent_jobs:
        job_id = job.get('postId')
        if job_id in processed_job_ids:
            logging.debug(f"Bỏ qua công việc trùng lặp với ID: {job_id}")
            continue
        processed_job_ids.add(job_id)

        if not job_id:
            logging.warning("Job thiếu postId, bỏ qua.")
            continue

        job_text = " ".join(str(job.get(field, '')) for field in ['title', 'description', 'typeOfWork', 'companyName'])
        if not job_text.strip() or len(job_text.strip().split()) < 3:
            logging.warning(f"Job ID {job_id} có job_text không đủ nội dung: {job_text[:50]}...")
            continue

        if job_id not in JOB_VECTOR_CACHE:
            logging.debug(f"Job ID {job_id} không có trong cache, tạo vector mới.")
            try:
                vector = get_bert_vector(job_text, model, tokenizer, device, tfidf_vectorizer)
                if np.any(vector) and np.linalg.norm(vector) >= 1e-6:
                    JOB_VECTOR_CACHE[job_id] = vector
                    try:
                        pd.to_pickle(JOB_VECTOR_CACHE, 'D:\\Recommendation\\job_vector_cache.pkl')
                        logging.debug(f"Đã lưu vector mới cho Job ID {job_id}")
                    except Exception as e:
                        logging.error(f"Lỗi khi lưu cache cho Job ID {job_id}: {str(e)}")
                else:
                    logging.warning(f"Vector không hợp lệ khi tạo mới cho Job ID {job_id}: {job_text[:50]}...")
                    continue
            except Exception as e:
                logging.error(f"Lỗi khi tạo vector cho Job ID {job_id}: {str(e)}")
                continue
        else:
            job_vector = JOB_VECTOR_CACHE[job_id]
            if not np.any(job_vector) or np.linalg.norm(job_vector) < 1e-6:
                logging.warning(f"Vector không hợp lệ trong cache cho Job ID {job_id}, tạo lại.")
                try:
                    vector = get_bert_vector(job_text, model, tokenizer, device, tfidf_vectorizer, bypass_tfidf=True)
                    if np.any(vector) and np.linalg.norm(vector) >= 1e-6:
                        JOB_VECTOR_CACHE[job_id] = vector
                        try:
                            pd.to_pickle(JOB_VECTOR_CACHE, 'D:\\Recommendation\\job_vector_cache.pkl')
                            logging.debug(f"Đã lưu vector mới (bypass TF-IDF) cho Job ID {job_id}")
                        except Exception as e:
                            logging.error(f"Lỗi khi lưu cache cho Job ID {job_id}: {str(e)}")
                    else:
                        logging.error(f"Vector vẫn không hợp lệ sau khi tạo lại cho Job ID {job_id}: {job_text[:50]}...")
                        continue
                except Exception as e:
                    logging.error(f"Lỗi khi tạo lại vector cho Job ID {job_id}: {str(e)}")
                    continue
            else:
                job_vector = JOB_VECTOR_CACHE[job_id]

        similarity = cosine_similarity(user_query_vector.reshape(1, -1), job_vector.reshape(1, -1))[0][0]
        if similarity > 0.3:
            job_title = job.get('title', '').lower()
            no_space_job_title = re.sub(r'\s+', '', job_title)
            intent_boost = 1.2 if any(
                (intent == 'driver' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in DRIVER_KEYWORDS])) or
                (intent == 'tech' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in TECH_KEYWORDS])) or
                (intent == 'ecommerce' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in ECOMMERCE_KEYWORDS])) or
                (intent == 'marketing' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in MARKETING_KEYWORDS])) or
                (intent == 'it_hardware' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in IT_HARDWARE_KEYWORDS])) or
                (intent == 'it_software' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in IT_SOFTWARE_KEYWORDS])) or
                (intent == 'hospitality' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in HOSPITALITY_KEYWORDS])) or
                (intent == 'design' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in DESIGN_KEYWORDS])) or
                (intent == 'mechanical' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in MECHANICAL_KEYWORDS])) or
                (intent == 'business' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in BUSINESS_KEYWORDS])) or
                (intent == 'education' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in EDUCATION_KEYWORDS])) or
                (intent == 'construction' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in CONSTRUCTION_KEYWORDS])) or
                (intent == 'finance' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in FINANCE_KEYWORDS])) or
                (intent == 'telecom' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in TELECOM_KEYWORDS])) or
                (intent == 'healthcare' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in HEALTHCARE_KEYWORDS])) or
                (intent == 'logistics' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in LOGISTICS_KEYWORDS])) or
                (intent == 'accounting' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in ACCOUNTING_KEYWORDS])) or
                (intent == 'manufacturing' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in MANUFACTURING_KEYWORDS])) or
                (intent == 'legal' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in LEGAL_KEYWORDS])) or
                (intent == 'translation' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in TRANSLATION_KEYWORDS])) or
                (intent == 'embedded_iot' and any(kw in job_title or kw_no_space in no_space_job_title for kw, kw_no_space in [normalize_keyword(k) for k in EMBEDDED_IOT_KEYWORDS]))
                for intent in query_intents
            ) else 1.0
            boosted_similarity = similarity * intent_boost
            job_similarities.append({'job': job, 'similarity': boosted_similarity})
            logging.debug(f"Công việc {job.get('title', 'N/A')} (ID: {job_id}): Tương đồng {boosted_similarity}")
    
    if not job_similarities:
        logging.warning("Không tìm thấy công việc nào có độ tương đồng > 0.3.")
        return [], []

    sorted_jobs = sorted(job_similarities, key=lambda x: x['similarity'], reverse=True)
    top_results = sorted_jobs[:top_n]
    recommended_job_dicts = [item['job'] for item in top_results]
    similarity_scores = [item['similarity'] for item in top_results]

    total_time = time.time() - start_time
    logging.info(f"Đã chọn top {len(recommended_job_dicts)} gợi ý trong {total_time:.2f} giây.")
    log_resource_usage()
    return recommended_job_dicts, similarity_scores
# Endpoint lưu tìm kiếm
csv_write_lock = Lock()

@app.route('/save-search', methods=['POST'])
def save_search():
    global search_history
    try:
        user_id = request.headers.get('X-User-Id')
        if not user_id:
            return jsonify({'error': 'Yêu cầu header X-User-Id', 'query': None}), 400

        data = request.get_json()
        search_query = data.get('query')
        if not search_query:
            return jsonify({'error': 'Yêu cầu truy vấn tìm kiếm', 'query': None}), 400

        cleaned_query = re.sub(r'(CityName:|IndustryNames:|MaxSalary:|TypesOfWork:|Title:\s*\d+\s*|\s*\|\s*)', '', str(search_query)).strip()

        new_entry = {
            'SeekerID': user_id,
            'Search Query': cleaned_query,
            'Search Date': datetime.now().isoformat()
        }

        with csv_write_lock:
            search_history.append(new_entry)
            df = pd.DataFrame([new_entry])
            df.to_csv(SEARCH_HISTORY_FILEPATH, mode='a', header=not os.path.exists(SEARCH_HISTORY_FILEPATH), index=False)
            search_history = load_search_history_from_csv(SEARCH_HISTORY_FILEPATH)

        logging.info(f"Đã lưu tìm kiếm mới cho người dùng {user_id}: '{cleaned_query}'")
        return jsonify({'message': 'Đã lưu tìm kiếm', 'query': cleaned_query}), 200
    except Exception as e:
        logging.error(f"Lỗi khi lưu tìm kiếm: {str(e)}")
        return jsonify({'error': 'Lỗi server nội bộ', 'query': None}), 500
    
# Endpoint kiểm tra sức khỏe
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "jobs_count": len(jobs),
        "search_history_count": len(search_history),
        "model_loaded": MODEL is not None,
        "tfidf_loaded": TFIDF_VECTORIZER is not None and hasattr(TFIDF_VECTORIZER, 'vocabulary_')
    }), 200

# Endpoint gợi ý việc làm
csv_read_lock = Lock()

@app.route('/recommend-jobs/phobert', methods=['POST'])
def recommend_jobs_mbert():
    global search_history
    start_time = time.time()
    logging.info(f"\n--- Bắt đầu gợi ý lúc {datetime.now()} ---")
    try:
        user_id = request.headers.get('X-User-Id')
        if not user_id:
            return jsonify({'error': 'Yêu cầu header X-User-Id', 'recent_queries': [], 'recommended_jobs': []}), 400
        if MODEL is None:
            logging.error("Mô hình chưa được tải. Kiểm tra log trong load_mbert để biết chi tiết.")
            return jsonify({'error': 'Mô hình chưa khả dụng. Vui lòng kiểm tra log hệ thống.', 'recent_queries': [], 'recommended_jobs': []}), 503

        with csv_read_lock:
            search_history = load_search_history_from_csv(SEARCH_HISTORY_FILEPATH)
            logging.info(f"Đã tải lại lịch sử tìm kiếm: {len(search_history)} mục")

        user_search_history = [h for h in search_history if str(h.get('SeekerID', '')) == str(user_id)]
        checkpoint_time = time.time() - start_time
        logging.info(f"Đã tìm thấy {len(user_search_history)} mục tìm kiếm cho người dùng {user_id} trong {checkpoint_time:.2f} giây")
        
        if not user_search_history:
            logging.info(f"Không tìm thấy lịch sử tìm kiếm cho người dùng {user_id}")
            return jsonify({
                'recent_queries': [],
                'recommended_jobs': []
            }), 200

        user_search_history.sort(key=lambda x: pd.Timestamp(x.get('Search Date', '1970-01-01')), reverse=True)
        last_five_searches = user_search_history[:5]
        
        recent_queries = []
        if last_five_searches:
            logging.info(f"5 truy vấn tìm kiếm gần nhất của người dùng {user_id}:")
            for i, search in enumerate(last_five_searches, 1):
                query = search.get('Search Query', 'N/A')
                date = search.get('Search Date', 'N/A')
                logging.info(f"{i}. {query} (Ngày: {date})")
                recent_queries.append({
                    'query': query,
                    'date': date
                })

        try:
            recommended_jobs, similarity_scores = get_bert_recommendations(
                last_five_searches, jobs, MODEL, TOKENIZER, DEVICE, TFIDF_VECTORIZER, top_n=8
            )
            logging.debug(f"Similarity scores: {similarity_scores}")
        except TimeoutError:
            logging.warning("Quá trình gợi ý hết thời gian chờ.")
            return jsonify({
                'recent_queries': recent_queries,
                'recommended_jobs': [],
                'error': 'Quá trình gợi ý hết thời gian chờ'
            }), 504
        except Exception as e:
            logging.error(f"Lỗi trong quá trình gợi ý: {str(e)}")
            traceback.print_exc()
            return jsonify({
                'recent_queries': recent_queries,
                'recommended_jobs': [],
                'error': 'Lỗi trong quá trình xử lý gợi ý'
            }), 500

        recommended_jobs_dict = {}
        if recommended_jobs and similarity_scores:
            combined_query = ", ".join([s.get('Search Query', 'N/A').strip() for s in last_five_searches])
            for job_dict, sim_score in zip(recommended_jobs, similarity_scores):
                if not isinstance(job_dict, dict):
                    logging.warning(f"Dữ liệu công việc không hợp lệ: {job_dict}")
                    continue
                job_id = job_dict.get('postId')
                if job_id and job_id not in recommended_jobs_dict:
                    reason = f"Tương đồng: {sim_score:.4f} | Dựa trên tìm kiếm: '{combined_query}'"
                    job_with_reason = job_dict.copy()
                    job_with_reason['recommendation_reason'] = reason
                    job_with_reason['similarity_score'] = float(sim_score)
                    recommended_jobs_dict[job_id] = job_with_reason
                    logging.debug(f"Thêm công việc ID {job_id} với similarity_score: {sim_score}")

        top_recommended_jobs_list = list(recommended_jobs_dict.values())
        if top_recommended_jobs_list:
            top_recommended_jobs_list.sort(key=lambda x: x['similarity_score'], reverse=True)
            logging.info("Các công việc được gợi ý:")
            for job in top_recommended_jobs_list:
                logging.info(f"- {job.get('title', 'Không có tiêu đề')} (ID: {job.get('postId', 'N/A')}, Tương đồng: {job.get('similarity_score', 'N/A')})")
        else:
            logging.info("Không có công việc nào được gợi ý.")

        total_time = time.time() - start_time
        logging.info(f"Quá trình gợi ý hoàn tất trong {total_time:.2f} giây.")
        return jsonify(top_recommended_jobs_list), 200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
    
    except Exception as e:
        total_time = time.time() - start_time
        logging.error(f"Lỗi trong recommend_jobs_mbert sau {total_time:.2f} giây: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'recent_queries': recent_queries if 'recent_queries' in locals() else [],
            'recommended_jobs': [],
            'error': 'Lỗi server nội bộ'
        }), 500

# Điểm vào chính
if __name__ == '__main__':
    logging.info("\n=== Bắt đầu Dịch vụ Gợi ý Việc làm JobRadar ===")
    logging.info(f"Thời gian hiện tại: {datetime.now()}")
    logging.info(f"Tệp công việc: {JOBS_FILEPATH}")
    logging.info(f"Tệp lịch sử tìm kiếm: {SEARCH_HISTORY_FILEPATH}")

    try:
        logging.info("Tải mô hình paraphrase-multilingual-mpnet-base-v2...")
        load_mbert()
        logging.info("Tải mô hình hoàn tất.")
        if MODEL is None:
            logging.error("Không thể tải mô hình. Thoát ứng dụng.")
            exit(1)
        else:
            logging.info(f"Mô hình paraphrase-multilingual-mpnet-base-v2 tải thành công trên {DEVICE}")
    except Exception as e:
        logging.error(f"Lỗi khi tải mô hình: {str(e)}", exc_info=True)
        exit(1)

    try:
        logging.info("Tải dữ liệu ban đầu...")
        jobs = load_jobs_from_csv(JOBS_FILEPATH, max_jobs=1400)
        search_history = load_search_history_from_csv(SEARCH_HISTORY_FILEPATH)
        logging.info(f"Khởi tạo dữ liệu hoàn tất - Công việc: {len(jobs)}, Lịch sử tìm kiếm: {len(search_history)}")
    except Exception as e:
        logging.error(f"Lỗi khi tải dữ liệu ban đầu: {str(e)}")
        exit(1)

    logging.info("Khởi động Flask app...")
    logging.info("=" * 50)
    app.run(debug=False, use_reloader=False, threaded=True, host='0.0.0.0', port=5000)
