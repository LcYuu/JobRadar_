import os
import logging
import time
import re
import json
import traceback
import numpy as np
import pandas as pd
import torch
from datetime import datetime, timedelta
from functools import wraps, lru_cache
from threading import Thread, Lock
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import psutil
import PyPDF2
import docx2txt
from dotenv import load_dotenv
import google.generativeai as genai
import redis
import hashlib
import pickle
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from cryptography.fernet import Fernet
import base64
from typing import Tuple, Dict, Any
# Thiết lập mã hóa
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# Tải biến môi trường
load_dotenv()

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Khởi tạo Flask
app = Flask(__name__)
# Cấu hình CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Cấu hình file paths
SEARCH_HISTORY_FILEPATH = os.environ.get("SEARCH_HISTORY_FILEPATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "search.csv"))
JOBS_FILEPATH = os.environ.get("JOBS_FILEPATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "job_post.csv"))
# Cấu hình Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY không được thiết lập.")
MODEL_NAME = "gemini-2.0-flash"

# Khởi tạo mô hình SentenceTransformer
embedding_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
embedding_model.to(DEVICE)
embedding_model.eval()
logger.info(f"Mô hình SentenceTransformer được tải trên {DEVICE}")

# Khởi tạo Redis cache
REDIS_URL = os.environ.get("REDIS_URL")
redis_client = None
try:
    if REDIS_URL:
        redis_client = redis.from_url(REDIS_URL)
        redis_client.ping()
        logger.info("Kết nối Redis thành công")
    else:
        logger.warning("REDIS_URL không được thiết lập, sử dụng bộ nhớ cache trong ứng dụng")
except Exception as e:
    logger.error(f"Không thể kết nối Redis: {e}")
    redis_client = None

# Cache trong bộ nhớ nếu không có Redis
in_memory_cache = {}

# Biến cấu hình tối ưu hóa
MAX_WORKERS = 8
PRECOMPUTE_EMBEDDINGS = True
EMBEDDINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "embeddings_cache.pkl")
EMBEDDING_REFRESH_HOURS = 24
SEMANTIC_SEARCH_TIMEOUT = 30
USE_JOB_INDEXING = True
ENABLE_PREFILTERING = True
MAX_JOBS_FOR_GEMINI = 50
EMBEDDING_CACHE_SIZE = 1000
CACHE_VERSION = "1.0"  # Thêm version để quản lý cache

# Biến toàn cục
job_index = {}
job_embeddings = {}
last_embedding_update = None
JOB_VECTOR_CACHE = {}
jobs = []
search_history = []
csv_write_lock = Lock()
csv_read_lock = Lock()
model_lock = Lock()

# Danh sách stop words tiếng Việt
VIETNAMESE_STOP_WORDS = [
    "và", "của", "là", "các", "cho", "trong", "tại", "được", "với", "một",
    "những", "để", "từ", "có", "không", "người", "này", "đã", "ra", "trên",
    "bằng", "vào", "hay", "thì", "đó", "nào", "ở", "lại", "còn", "như",
    "thành", "phố", "hồ", "chí", "minh", "title", "tuyển", "dụng", "việc",
    "làm", "công", "ty", "tại", "lương", "cao", "hấp", "dẫn", "dịch", "vụ",
    "quản", "lý", "hệ", "thống"
]

# Từ khóa ngành nghề
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
    'viễn thông', 'mạng di động', 'cáp quang', '5g', 'kỹ thuật viễn thông', "mạng"
]
HEALTHCARE_KEYWORDS = [
    'bác sĩ', 'điều dưỡng', 'dược sĩ', 'chăm sóc bệnh nhân', 'y tế công cộng'
]
LOGISTICS_KEYWORDS = [
    'vận tải', 'chuỗi cung ứng', 'kho bãi', 'giao nhận hàng hóa', 'xuất nhập khẩu', 'hải quan', 'logistics'
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
RELATED_INTENTS = {
    'it_hardware': ['it_software', 'mechanical', 'embedded_iot'],
    'it_software': ['it_hardware', 'embedded_iot'],
    'mechanical': ['it_hardware', 'manufacturing'],
    'embedded_iot': ['it_hardware', 'it_software'],
}

# Hàm tiện ích
def log_resource_usage():
    process = psutil.Process()
    mem = process.memory_info().rss / 1024 / 1024
    cpu = psutil.cpu_percent(interval=1)
    logger.info(f"Sử dụng bộ nhớ: {mem:.2f} MB | CPU: {cpu:.2f}%")

def normalize_keyword(keyword):
    keyword = keyword.lower().strip()
    no_space = re.sub(r'\s+', '', keyword)
    return keyword, no_space

def get_cache_key(query, filters=None):
    if filters is None:
        filters = {}
    serialized = json.dumps({"query": query, "filters": filters}, sort_keys=True)
    return hashlib.md5(serialized.encode()).hexdigest()

def set_cache(key, value, ttl=3600):
    try:
        if redis_client:
            redis_client.setex(key, ttl, json.dumps(value))
            return True
        else:
            in_memory_cache[key] = {
                "data": value,
                "timestamp": time.time(),
                "ttl": ttl
            }
            return True
    except Exception as e:
        logger.error(f"Lỗi khi lưu cache: {e}")
        return False

def get_cache(key):
    try:
        if redis_client:
            data = redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        else:
            if key in in_memory_cache:
                cache_item = in_memory_cache[key]
                now = time.time()
                if now - cache_item["timestamp"] < cache_item["ttl"]:
                    return cache_item["data"]
                else:
                    del in_memory_cache[key]
            return None
    except Exception as e:
        logger.error(f"Lỗi khi truy xuất cache: {e}")
        return None

def clean_expired_cache():
    if not redis_client:
        now = time.time()
        keys_to_delete = []
        for key, cache_item in in_memory_cache.items():
            if now - cache_item["timestamp"] >= cache_item["ttl"]:
                keys_to_delete.append(key)
        for key in keys_to_delete:
            del in_memory_cache[key]

@lru_cache(maxsize=EMBEDDING_CACHE_SIZE)
def get_text_embedding(text):
    try:
        return embedding_model.encode(text, device=DEVICE, normalize_embeddings=True)
    except Exception as e:
        logger.error(f"Lỗi khi tạo embedding: {e}")
        return None

def get_job_embedding(job):
    try:
        job_id = job.get('id') or job.get('jobId') or job.get('postId')
        if not job_id:
            job_content = f"{job.get('title', '')}{job.get('description', '')}{job.get('requirements', '')}"
            job_id = hashlib.md5(job_content.encode()).hexdigest()
        
        if job_id in job_embeddings:
            return job_embeddings[job_id]
        
        # Cải thiện job text combination
        components = []
        if job.get('title'):
            components.append(f"Tiêu đề: {job['title']}")
        if job.get('description'):
            components.append(f"Mô tả: {job['description']}")
        if job.get('requirements') or job.get('requirement'):
            req_text = job.get('requirements') or job.get('requirement', '')
            components.append(f"Yêu cầu: {req_text}")
        if job.get('niceToHaves'):
            components.append(f"Ưu tiên: {job['niceToHaves']}")
        
        job_text = ". ".join(components)
        
        embedding = embedding_model.encode(job_text, device=DEVICE, normalize_embeddings=True)
        job_embeddings[job_id] = embedding
        return embedding
    except Exception as e:
        logger.error(f"Lỗi khi tạo job embedding: {e}")
        return None

def compute_similarity(embedding1, embedding2):
    try:
        similarity = np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
        return float(similarity)
    except Exception as e:
        logger.error(f"Lỗi khi tính similarity: {e}")
        return 0.0

def preprocess_text(text, bypass_stop_words=False, normalize_for_keywords=False):
    if not isinstance(text, str):
        logger.debug(f"Văn bản không phải chuỗi: {text}")
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s_àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]', ' ', text, flags=re.UNICODE)
    text = re.sub(r'\s+', ' ', text).strip()
    if not text:
        return ""
    words = text.split()
    if normalize_for_keywords:
        words = [word for word in words if len(word) >= 2]
    elif not bypass_stop_words:
        words = [word for word in words if word not in VIETNAMESE_STOP_WORDS and len(word) >= 2]
    else:
        words = [word for word in words if len(word) >= 2]
    if not words:
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
    return ' '.join(boosted_words)

class CompanyReviewFilter:
    """Filter dành riêng cho bình luận đánh giá công ty - chỉ lọc toxic content, không lọc ý kiến phê bình"""
    
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

    def _init_patterns(self):
        """Khởi tạo patterns - chỉ tập trung vào toxic content, không lọc ý kiến phê bình"""
        return {
            # WHITELIST - Nội dung an toàn (bao gồm cả ý kiến phê bình hợp lệ)
            'safe_expressions': re.compile(
                r'\b(ha(ha)+|he(he)+|hi(hi)+|hu(hu)+|kk+|lol|lmao|rofl|xd|omg|wow|nice|good|great|awesome|cool|ok|okay|' +
                r'thanks?|thank\s+you|cảm\s*ơn|cám\s*ơn|chúc\s*mừng|tuyệt\s*vời|tốt\s*quá|hay\s*quá|đẹp\s*quá)\b',
                re.IGNORECASE
            ),
            'safe_emoticons': re.compile(
                r'[:\-=][\)d\]>]|[:\-=][\(c\[<]|<3|\^_\^|\^\^|:p|:P|xD|XD|;\)|;D',
                re.IGNORECASE
            ),
            
            # Ý kiến phê bình hợp lệ về công ty (KHÔNG coi là toxic)
            'legitimate_criticism': re.compile(
                r'\b(không\s*(tốt|tử\s*tế|chuyên\s*nghiệp|hợp\s*lý|công\s*bằng|minh\s*bạch)|' +
                r'tệ|kém|yếu|thiếu|chậm|không\s*đầy\s*đủ|không\s*rõ\s*ràng|phức\s*tạp|khó\s*khăn|' +
                r'áp\s*lực|stress|mệt\s*mỏi|quá\s*tải|overtime|tăng\s*ca|không\s*cân\s*bằng|' +
                r'lương\s*thấp|lương\s*ít|thu\s*nhập\s*thấp|không\s*tăng\s*lương|chậm\s*lương|' +
                r'môi\s*trường\s*(không\s*tốt|tệ|xấu)|văn\s*hóa\s*(không\s*tốt|tệ)|' +
                r'quản\s*lý\s*(không\s*tốt|kém|yếu|tệ)|sếp\s*(không\s*tốt|khó\s*tính|khắt\s*khe)|' +
                r'thiếu\s*(cơ\s*hội|phúc\s*lợi|đào\s*tạo|hỗ\s*trợ|trang\s*thiết\s*bị)|' +
                r'bad|terrible|awful|poor|worst|disappointing|unsatisfied|dissatisfied|' +
                r'unprofessional|unfair|unreasonable|stressful|overwork|underpaid|toxic\s*workplace|' +
                r'bad\s*management|terrible\s*boss|poor\s*leadership|lack\s*of|insufficient)\b',
                re.IGNORECASE | re.MULTILINE
            ),
            
            # BLACKLIST - Chỉ những nội dung thực sự toxic
            'vietnamese_vulgar_strict': re.compile(
                r'\b(địt|đụ|đéo|cặc|lồn|đĩ|điếm|buồi|đầu\s*buồi|đầu\s*cặc|' +
                # Các biến thể và viết tắt
                r'd[ịi1!]t|đ[ụu]|d[eo3]o|đ[éè3]o|c[ặa@]c|l[ồo0]n|đ[ĩi]|bu[ồo0]i|' +
                # Viết tắt phổ biến
                r'vcl|clgt|cmm|cmn|cmnr|đmm|đcm|vcđ|vlđ|vcd|đml|dml|' +
                # Biến thể che giấu
                r'd1t|d3o|c4c|l0n|bu01|' +
                r'd\s*ị\s*t|đ\s*ụ|c\s*ặ\s*c|l\s*ồ\s*n|' +
                r'd\.ị\.t|đ\.ụ|c\.ặ\.c|l\.ồ\.n|' +
                r'd-ị-t|đ-ụ|c-ặ-c|l-ồ-n|d_ị_t|đ_ụ|c_ặ_c|l_ồ_n)\b',
                re.IGNORECASE
            ),
            
            'vietnamese_personal_attack': re.compile(
                r'\b(đồ\s*(chó|heo|lợn|khỉ|ngu|ngốc|đần|điên)|' +
                # Xúc phạm cá nhân nghiêm trọng
                r'mẹ\s*(mày|tao)|cha\s*(mày|tao)|thằng\s*(chó|ngu|điên)|con\s*(chó|lợn|điên)|' +
                # Đe dọa
                r'giết|chết\s*đi|tao\s*giết\s*mày|mày\s*chết|đánh\s*chết|' +
                # Phân biệt đối xử nghiêm trọng  
                r'đồ\s*(đồng\s*tính|gay|les)|thằng\s*(gay|đồng\s*tính))\b',
                re.IGNORECASE
            ),
            
            'english_vulgar_strict': re.compile(
                r'\b(fuck|shit|asshole|bitch|cunt|dick|pussy|bastard|motherfucker|' +
                # Biến thể che giấu
                r'f[u*@#]ck|f\*ck|fu[c*]k|f@ck|fck|fuk|phuck|' +
                r'sh[i*]t|sh@t|sht|shyt|' +
                r'a[s*]shole|a\*\*hole|@sshole|' +
                r'b[i*]tch|b@tch|btch|biatch|' +
                r'c[u*]nt|c@nt|d[i*]ck|d@ck|dik|p[u*]ssy|pu\*\*y|' +
                # Viết tắt thô tục
                r'wtf|stfu|gtfo|' +
                # Leetspeak
                r'fuk|5hit|a55|b1tch|d1ck|pu55y)\b',
                re.IGNORECASE
            ),
            
            'english_personal_attack': re.compile(
                r'\b(kill\s*yourself|kys|go\s*die|die\s*bitch|fucking\s*(idiot|moron|retard)|' +
                # Đe dọa bạo lực
                r'i\s*will\s*kill|gonna\s*kill|kill\s*you|beat\s*you\s*up|' +
                # Phân biệt đối xử nghiêm trọng
                r'fucking\s*(gay|homo|lesbian)|gay\s*ass|homo\s*bitch)\b',
                re.IGNORECASE
            ),
            
            # Pattern phát hiện spam/troll
            'spam_troll_pattern': re.compile(
                r'(.)\1{10,}|' +  # Lặp lại ký tự quá nhiều (aaaaaaaaaaa...)
                r'([a-zA-Z]{1,3}\s*){20,}|' +  # Lặp từ ngắn quá nhiều
                r'[!@#$%^&*()]{5,}',  # Quá nhiều ký tự đặc biệt liên tiếp
                re.IGNORECASE
            )
        }

    def _is_legitimate_criticism(self, text: str) -> Tuple[bool, str]:
        """Kiểm tra xem có phải là ý kiến phê bình hợp lệ về công ty không"""
        text_lower = text.lower().strip()
        
        # Từ khóa liên quan đến đánh giá công ty (không toxic)
        company_keywords = [
            'công ty', 'company', 'cty', 'doanh nghiệp', 'firm',
            'sếp', 'boss', 'manager', 'quản lý', 'lãnh đạo', 'leadership',
            'nhân viên', 'employee', 'staff', 'colleague', 'đồng nghiệp',
            'lương', 'salary', 'tiền lương', 'thu nhập', 'income', 'wage',
            'môi trường', 'environment', 'văn hóa', 'culture', 'workplace',
            'làm việc', 'work', 'job', 'career', 'nghề nghiệp',
            'phúc lợi', 'benefit', 'bảo hiểm', 'insurance', 'chế độ',
            'tăng ca', 'overtime', 'giờ làm', 'working hours',
            'đào tạo', 'training', 'phát triển', 'development', 'học hỏi'
        ]
        
        # Kiểm tra có từ khóa công ty không
        has_company_context = any(keyword in text_lower for keyword in company_keywords)
        
        if has_company_context:
            # Kiểm tra pattern phê bình hợp lệ
            if 'legitimate_criticism' in self.patterns:
                pattern = self.patterns['legitimate_criticism']
                if pattern.search(text_lower):
                    return True, "legitimate_company_criticism"
        
        # Các cụm từ phê bình phổ biến về công ty
        criticism_phrases = [
            'không khuyến khích', 'không recommend', 'không đáng',
            'nên cân nhắc', 'should consider', 'think twice',
            'không phù hợp', 'not suitable', 'not fit',
            'trải nghiệm không tốt', 'bad experience', 'terrible experience',
            'không hài lòng', 'not satisfied', 'dissatisfied',
            'thất vọng', 'disappointed', 'let down'
        ]
        
        for phrase in criticism_phrases:
            if phrase in text_lower:
                return True, f"criticism_phrase:{phrase}"
        
        return False, ""

    def _is_toxic_content(self, text: str) -> Tuple[bool, float, str]:
        """Kiểm tra nội dung toxic thực sự (chửi thề, xúc phạm, đe dọa)"""
        text_lower = text.lower().strip()
        
        # Danh sách patterns toxic nghiêm trọng
        toxic_patterns = [
            'vietnamese_vulgar_strict',
            'vietnamese_personal_attack',
            'english_vulgar_strict', 
            'english_personal_attack',
            'spam_troll_pattern'
        ]
        
        for pattern_name in toxic_patterns:
            if pattern_name in self.patterns:
                pattern = self.patterns[pattern_name]
                if pattern.search(text_lower):
                    # Mức độ nghiêm trọng khác nhau
                    if 'vulgar' in pattern_name or 'attack' in pattern_name:
                        severity = 0.95
                    elif 'spam' in pattern_name:
                        severity = 0.8
                    else:
                        severity = 0.85
                    
                    return True, severity, pattern_name
        
        # Kiểm tra từ bị che giấu
        is_obscured, obscured_score, obscured_type = self._check_obscured_vulgar(text)
        if is_obscured:
            return True, obscured_score, obscured_type
        
        return False, 0.0, ""

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
            
            if not is_toxic_final:  # Chỉ tiếp tục nếu chưa được đánh dấu safe
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
                        # Bước 4: AI analysis (với prompt đặc biệt cho company review)
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
                score = 0.3 if is_toxic else 0.0  # Lower confidence for fallback
                
                return is_toxic, score, {"error": "JSON parse failed", "raw_response": response_text[:100]}
                
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return False, 0.0, {"error": str(e)}

    def _check_obscured_vulgar(self, text: str) -> Tuple[bool, float, str]:
        """Kiểm tra từ tục tĩu bị che giấu"""
        normalized = self._normalize_text(text)
        
        # Chỉ các từ tục tĩu nghiêm trọng
        vulgar_words = [
            'dit', 'du', 'deo', 'cac', 'lon', 'di', 'buoi', 'vcl', 'clgt',
            'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy'
        ]
        
        for word in vulgar_words:
            if word in normalized:
                if (re.search(r'[*@#$%&!0-9]', text) or 
                    re.search(r'[\s\.\-_]{2,}', text)):
                    return True, 0.9, f"obscured_vulgar:{word}"
        
        return False, 0.0, ""

    def _normalize_text(self, text: str) -> str:
        """Chuẩn hóa text để phát hiện các biến thể che giấu"""
        normalized = re.sub(r'[*@#$%&!]+', '', text)
        
        leetspeak_map = {
            '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', 
            '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i'
        }
        
        for leet, normal in leetspeak_map.items():
            normalized = normalized.replace(leet, normal)
        
        normalized = re.sub(r'[\s\.\-_]+', '', normalized)
        return normalized.lower()

    @lru_cache(maxsize=1000)
    def _is_vietnamese(self, text: str) -> bool:
        """Kiểm tra ngôn ngữ tiếng Việt"""
        vietnamese_chars = re.search(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', text.lower())
        return bool(vietnamese_chars)

    def _get_cache_key(self, text: str) -> str:
        return f"review_{hash(text.lower().strip())}"

    def _get_cached_result(self, cache_key: str) -> Dict[str, Any]:
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            if time.time() - cached_data['timestamp'] < self.cache_ttl:
                return cached_data['result']
        return None

    def _set_cache(self, cache_key: str, result: Dict[str, Any]):
        self.cache[cache_key] = {
            'result': result,
            'timestamp': time.time()
        }
        
        if len(self.cache) > 2000:
            oldest_keys = sorted(self.cache.keys(), key=lambda k: self.cache[k]['timestamp'])[:500]
            for key in oldest_keys:
                del self.cache[key]

    def _setup_gemini(self, api_key: str):
        genai.configure(api_key=api_key)
        
        generation_config = {
            "temperature": 0.1,
            "top_p": 0.8, 
            "top_k": 40,
            "max_output_tokens": 300,
        }
        
        return genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config=generation_config
        )

    def get_filter_stats(self) -> Dict[str, Any]:
        return {
            'cache_size': len(self.cache),
            'model_available': self.model is not None,
            'patterns_count': len(self.patterns),
            'filter_type': 'company_review_filter'
        }

# Khởi tạo filter cho company reviews
company_review_filter = CompanyReviewFilter()


# Hàm xử lý CV
def setup_gemini(api_key):
    genai.configure(api_key=api_key)

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

def extract_text_from_docx(docx_file):
    try:
        return docx2txt.process(docx_file)
    except Exception as e:
        logger.error(f"Lỗi khi trích xuất DOCX: {e}")
        return ""

def create_analysis_prompt(cv_text, job_data):
    """Tạo prompt để gửi đến Gemini"""
    # Trích xuất thông tin từ job_data
    job_description = job_data.get('description', '')
    job_requirements = job_data.get('requirement', '')
    job_benefits = job_data.get('benefit', '')
    job_experience = job_data.get('experience', '')
    job_skills = job_data.get('skills', [])
    job_position = job_data.get('position', '')
    job_nice_to_haves = job_data.get('niceToHaves', '')
    
    # Tạo một mô tả công việc đầy đủ
    full_job_description = f"""
    # Tiêu đề: {job_data.get('title', '')}
    # Vị trí: {job_position}
    
    ## Mô tả công việc:
    {job_description}
    
    ## Yêu cầu công việc (bắt buộc):
    {job_requirements}
    
    ## Ưu tiên bổ sung (nice-to-have - những kỹ năng/kinh nghiệm tốt nếu ứng viên có):
    {job_nice_to_haves}
    
    ## Quyền lợi:
    {job_benefits}
    
    ## Yêu cầu kinh nghiệm:
    {job_experience}
      ## Kỹ năng yêu cầu (từ danh sách kỹ năng được chọn):
    {', '.join([skill.get('skillName', '') for skill in job_skills]) if isinstance(job_skills, list) else ''}
    
    ## Yêu cầu chi tiết khác (từ mô tả yêu cầu công việc):
    {job_requirements}
    """
    
    prompt = f"""
    Bạn là một chuyên gia phân tích CV và đánh giá mức độ phù hợp với vị trí công việc. 
    
    Hãy phân tích CV và mô tả công việc dưới đây để đánh giá mức độ phù hợp giữa ứng viên và vị trí.
    
    # CV của ứng viên:
    ```
    {cv_text}
    ```
    
    # Mô tả công việc đầy đủ:
    ```
    {full_job_description}
    ```    Hãy thực hiện phân tích chi tiết gồm:
    1. Trích xuất tất cả kỹ năng từ CV
    2. Trích xuất kỹ năng yêu cầu từ HAI NGUỒN:
       - Từ danh sách "Kỹ năng yêu cầu" (đã được chọn sẵn)
       - Từ phần "Yêu cầu chi tiết khác" (text mô tả yêu cầu công việc)
    3. Phân loại kỹ năng theo mức độ ưu tiên:
       - Required skills: Kỹ năng BẮT BUỘC từ yêu cầu công việc
       - Nice-to-have skills: Kỹ năng từ phần "Ưu tiên bổ sung"
    4. So sánh kỹ năng để xác định kỹ năng phù hợp và còn thiếu
    5. Phân tích học vấn trong CV và so sánh với yêu cầu
    6. Phân tích kinh nghiệm trong CV và so sánh với yêu cầu
    7. Đánh giá độ tương đồng tổng thể giữa CV và mô tả công việc
    
    **Lưu ý quan trọng về phân loại kỹ năng:**
    - "Kỹ năng yêu cầu" + "Yêu cầu chi tiết khác" = Required skills (BẮT BUỘC)
    - "Ưu tiên bổ sung (nice-to-have)" = Nice-to-have skills (ĐIỂM CỘNG)
    - Thiếu required skills: Giảm điểm đáng kể
    - Thiếu nice-to-have skills: Không giảm điểm, chỉ mất cơ hội được điểm cộng
    - Có nice-to-have skills: Được điểm cộng (tối đa +20 điểm)
    
    Hãy trả về một chuỗi JSON hợp lệ với các trường sau:
    ```json
    {{        "matching_score": {{
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
                "nice_to_have_bonus": [điểm số từ 0-20 - điểm cộng cho nice-to-have skills]
            }},
            "suitabilityLevel": ["Extremely Well Suited", "Well Suited", "Moderately Suited", "Somewhat Suited", "Not Well Suited"],
            "recommendations": ["đề xuất 1", "đề xuất 2", ...],
            "cvImprovementSuggestions": ["gợi ý cải thiện 1", "gợi ý cải thiện 2", ...]
        }},
        "detailedAnalysis": {{            "skills": {{
                "score": [điểm số từ 0-100],
                "matched_skills": ["skill1", "skill2", ...],
                "missing_skills": ["skill1", "skill2", ...],
                "required_skills_matched": ["skill1", "skill2", ...],
                "required_skills_missing": ["skill1", "skill2", ...],
                "nice_to_have_matched": ["skill1", "skill2", ...],
                "nice_to_have_missing": ["skill1", "skill2", ...],
                "skills_from_requirements_text": ["skill1", "skill2", ...],
                "skills_from_selected_list": ["skill1", "skill2", ...],
                "reason": "Lý do đánh giá chi tiết việc phân biệt giữa yêu cầu bắt buộc và ưu tiên bổ sung, bao gồm nguồn trích xuất kỹ năng"
            }},
            "education": {{
                "score": [điểm số từ 0-100],
                "cv_level": "Trình độ học vấn được phát hiện trong CV",
                "job_level": "Trình độ học vấn yêu cầu bởi công việc",
                "cv_majors": ["chuyên ngành 1", ...],
                "job_majors": ["chuyên ngành yêu cầu 1", ...],
                "reason": "Lý do đánh giá"
            }},
            "experience": {{
                "score": [điểm số từ 0-100],
                "cv_years": [số năm kinh nghiệm từ CV],
                "job_years": [số năm kinh nghiệm yêu cầu],
                "reason": "Lý do đánh giá"
            }},            "weights": {{
                "skills": [trọng số từ 0-1],
                "education": [trọng số từ 0-1],
                "experience": [trọng số từ 0-1],
                "overall_similarity": [trọng số từ 0-1],
                "context": [trọng số từ 0-1],
                "nice_to_have_bonus": [trọng số từ 0-0.2 - trọng số cho điểm cộng nice-to-have]
            }}
        }}
    }}
    ```    **Hướng dẫn tính điểm và phân loại kỹ năng:**
    1. **Trích xuất kỹ năng yêu cầu bắt buộc từ 2 nguồn:**
       - Từ "Kỹ năng yêu cầu": (VD: Python, Java, React)
       - Từ "Yêu cầu chi tiết khác": Phân tích text để tìm kỹ năng (VD: "Có kinh nghiệm với Docker" → Docker)
    
    2. **Trích xuất nice-to-have skills từ "Ưu tiên bổ sung":**
       - Phân tích text để tìm kỹ năng không bắt buộc (VD: "Kinh nghiệm với AWS là một lợi thế" → AWS)
    
    3. **Tính điểm:**
       - Điểm cơ bản (80%): Required skills + experience + education
       - Điểm cộng nice-to-have (tối đa 20%): Kỹ năng ưu tiên bổ sung
       - Không trừ điểm nặng nếu thiếu nice-to-have skills
    
    4. **Phân loại kết quả:**
       - matchedSkills: Kỹ năng required khớp
       - missingSkills: Kỹ năng required còn thiếu  
       - niceToHaveSkills: Kỹ năng nice-to-have mà ứng viên có
       - extraSkills: Kỹ năng khác không liên quan đến JD

    Chỉ trả về đối tượng JSON đúng định dạng, không bao gồm markdown hoặc bất kỳ văn bản nào khác. 
    Đảm bảo rằng tất cả trường là dữ liệu đúng kiểu: điểm số là số, danh sách là mảng, và văn bản là chuỗi.
    """
    return prompt

def analyze_cv_with_gemini(cv_text, job_data, api_key):
    """Sử dụng Gemini để phân tích CV và mô tả công việc"""
    # Thiết lập API
    setup_gemini(api_key)
    
    # Tạo prompt
    prompt = create_analysis_prompt(cv_text, job_data)
    
    try:
        # Gọi Gemini API
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        
        # Xử lý phản hồi
        if response:
            try:
                # Gemini có thể trả về text có thể bao gồm markdown hoặc backticks
                # Cần làm sạch để chỉ lấy phần JSON
                response_text = response.text
                
                # Loại bỏ backticks và json markers nếu có
                cleaned_text = response_text
                if "```json" in response_text:
                    cleaned_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    cleaned_text = response_text.split("```")[1].split("```")[0].strip()
                
                # Parse JSON
                result = json.loads(cleaned_text)
                return result
            except Exception as e:
                logger.error(f"Lỗi xử lý phản hồi từ Gemini: {e}")
                logger.error(f"Phản hồi gốc: {response.text}")
                raise Exception(f"Không thể phân tích phản hồi từ Gemini: {e}")
        else:
            raise Exception("Không nhận được phản hồi từ Gemini")
    except Exception as e:
        logger.error(f"Lỗi khi gọi Gemini API: {e}")
        raise e
class CVSecurity:
    def __init__(self):
        # Tạo key mã hóa
        self.key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.key)
    def encrypt_cv_data(self, cv_text):
        """Mã hóa nội dung CV"""
        try:
            # Mã hóa dữ liệu
            encrypted_data = self.cipher_suite.encrypt(cv_text.encode())
            return base64.b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Lỗi khi mã hóa CV: {e}")
            return None

    def decrypt_cv_data(self, encrypted_data):
        """Giải mã nội dung CV"""
        try:
            # Giải mã dữ liệu
            decrypted_data = self.cipher_suite.decrypt(base64.b64decode(encrypted_data))
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Lỗi khi giải mã CV: {e}")
            return None
class SensitiveDataProcessor:
    def __init__(self):
        # Các pattern để nhận diện thông tin nhạy cảm
        self.patterns = {
            'email': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            'phone': r'(?:\+84|0)[0-9]{9,10}',
            'id_card': r'[0-9]{9}|[0-9]{12}',
            'address': r'(?:đường|phố|quận|huyện|tỉnh|thành phố)[\s\w]+',
        }
    
    def mask_sensitive_data(self, cv_text):
        """Che giấu thông tin nhạy cảm trong CV"""
        masked_text = cv_text
        
        for data_type, pattern in self.patterns.items():
            if data_type == 'email':
                masked_text = re.sub(pattern, '[EMAIL]', masked_text)
            elif data_type == 'phone':
                masked_text = re.sub(pattern, '[PHONE]', masked_text)
            elif data_type == 'id_card':
                masked_text = re.sub(pattern, '[ID_CARD]', masked_text)
            elif data_type == 'address':
                masked_text = re.sub(pattern, '[ADDRESS]', masked_text)
                
        return masked_text

# Khởi tạo các đối tượng bảo mật
cv_security = CVSecurity()
sensitive_processor = SensitiveDataProcessor()

def preprocess_cv(cv_text, max_length=4000):
    """
    Tiền xử lý CV để giảm kích thước và tối ưu hóa nội dung trước khi phân tích
    
    Args:
        cv_text (str): Nội dung CV gốc
        max_length (int): Độ dài tối đa cho phép của CV sau khi xử lý
        
    Returns:
        str: CV đã được tiền xử lý
    """
    try:
        # 1. Loại bỏ thông tin cá nhân nhạy cảm
        patterns = [
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # email
            r'(?:\+84|0)[0-9]{9,10}',  # phone
            r'[0-9]{9}|[0-9]{12}',  # id card
            r'(?:đường|phố|quận|huyện|tỉnh|thành phố)[\s\w]+',  # address (VN)
            r'(?:address|city|district|province|country)[\s\w]+',  # address (EN)
            r'(?:ngày sinh|date of birth|dob)[\s\w:/.]+',  # date of birth
            r'(?:họ tên|full name|name)[\s\w:]+',  # name
        ]
        for pattern in patterns:
            cv_text = re.sub(pattern, '', cv_text, flags=re.IGNORECASE)

        # 2. Chỉ giữ lại các section quan trọng
        important_sections = [
            r'(?:education|học vấn|trình độ học vấn)(.*?)(?:\n\n|\Z|experience|kinh nghiệm|skills|kỹ năng|projects|dự án|certifications|chứng chỉ|objective|mục tiêu nghề nghiệp)',
            r'(?:experience|kinh nghiệm)(.*?)(?:\n\n|\Z|education|học vấn|skills|kỹ năng|projects|dự án|certifications|chứng chỉ|objective|mục tiêu nghề nghiệp)',
            r'(?:skills|kỹ năng)(.*?)(?:\n\n|\Z|education|học vấn|experience|kinh nghiệm|projects|dự án|certifications|chứng chỉ|objective|mục tiêu nghề nghiệp)',
            r'(?:projects|dự án)(.*?)(?:\n\n|\Z|education|học vấn|experience|kinh nghiệm|skills|kỹ năng|certifications|chứng chỉ|objective|mục tiêu nghề nghiệp)',
            r'(?:certifications|chứng chỉ)(.*?)(?:\n\n|\Z|education|học vấn|experience|kinh nghiệm|skills|kỹ năng|projects|dự án|objective|mục tiêu nghề nghiệp)',
            r'(?:objective|mục tiêu nghề nghiệp)(.*?)(?:\n\n|\Z|education|học vấn|experience|kinh nghiệm|skills|kỹ năng|projects|dự án|certifications|chứng chỉ)',
        ]
        
        extracted = ""
        for section in important_sections:
            matches = re.findall(section, cv_text, flags=re.IGNORECASE | re.DOTALL)
            for match in matches:
                extracted += match.strip() + "\n\n"

        # 3. Nếu không tìm thấy section nào, sử dụng nội dung đã loại bỏ thông tin cá nhân
        if not extracted.strip():
            extracted = cv_text.strip()

        # 4. Loại bỏ khoảng trắng thừa và ký tự đặc biệt
        extracted = re.sub(r'\s+', ' ', extracted)
        extracted = re.sub(r'[^\w\s_àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]', ' ', extracted, flags=re.UNICODE)
        
        # 5. Giới hạn độ dài
        if len(extracted) > max_length:
            # Cắt theo câu hoàn chỉnh
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
        return cv_text[:max_length]  # Fallback: cắt bớt nếu có lỗi


# Hàm xử lý công việc và gợi ý
def load_jobs_from_csv(filepath=JOBS_FILEPATH, max_jobs=1400):
    global jobs
    try:
        logger.info(f"Đang tải công việc từ {filepath}...")
        df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
        required_columns = ['postId', 'title', 'companyId']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            logger.error(f"Thiếu cột bắt buộc trong job_post.csv: {missing_columns}")
            return []
        df = df.drop_duplicates(subset=['postId'], keep='first')
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
        df_sorted['createDate'] = df_sorted['createDate'].dt.strftime('%Y-%m-%dT%H:%M:%S')
        df_sorted['expireDate'] = df_sorted['expireDate'].dt.strftime('%Y-%m-%dT%H:%M:%S')
        jobs = df_sorted.to_dict(orient='records')
        logger.info(f"Đã tải {len(jobs)} công việc.")
        return jobs
    except Exception as e:
        logger.error(f"Lỗi khi tải công việc từ CSV: {e}")
        return []

last_search_csv_modified = 0

def load_search_history_from_csv(filepath):
    global search_history, last_search_csv_modified
    try:
        if not os.path.exists(filepath):
            logger.warning(f"Tệp {filepath} không tồn tại.")
            search_history = []
            return search_history
        current_modified = os.path.getmtime(filepath)
        if current_modified <= last_search_csv_modified:
            logger.info(f"Tệp {filepath} chưa thay đổi.")
            return search_history
        logger.info(f"Đang tải lịch sử tìm kiếm từ {filepath}...")
        df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
        if 'SeekerID' not in df or 'Search Query' not in df:
            logger.warning("Thiếu cột bắt buộc trong lịch sử tìm kiếm.")
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
        logger.info(f"Đã tải {len(search_history)} mục lịch sử tìm kiếm.")
        return search_history
    except Exception as e:
        logger.error(f"Lỗi khi tải lịch sử tìm kiếm từ CSV: {e}")
        search_history = []
        return search_history

def filter_jobs_by_category(jobs, user_queries, top_n=2000):
    if not user_queries:
        return jobs[:top_n]
    
    keywords = set()
    cities = set()
    query_intents = set()
    for query in user_queries:
        cleaned_query = query.get('Search Query', '').replace('Title:', '').strip()
        processed_query = preprocess_text(cleaned_query, normalize_for_keywords=True)
        no_space_query = re.sub(r'\s+', '', processed_query)
        words = processed_query.split()
        keywords.update([word for word in words if word not in VIETNAMESE_STOP_WORDS])
        if "CityName:" in query.get('Search Query', ''):
            city = re.search(r'CityName:([^|]+)', query.get('Search Query', ''))
            if city:
                cities.add(city.group(1).strip().lower())
        
        for kw, kw_no_space in [normalize_keyword(k) for k in DRIVER_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('driver')
        for kw, kw_no_space in [normalize_keyword(k) for k in IT_SOFTWARE_KEYWORDS]:
            if kw in processed_query or kw_no_space in no_space_query:
                query_intents.add('it_software')
        # Thêm các ngành khác tương tự...

    seen_job_ids = set()
    filtered_jobs = []
    for job in jobs:
        job_id = job.get('postId')
        if job_id in seen_job_ids:
            continue
        seen_job_ids.add(job_id)
        job_text = " ".join(str(job.get(field, '')) for field in ['title', 'description', 'typeOfWork', 'industryNames'])
        if not job_text.strip() or len(job_text.strip().split()) < 3:
            continue
        job_text = preprocess_text(job_text, normalize_for_keywords=False)
        job_city = str(job.get('city', '')).lower()
        job_title = job.get('title', '').lower()
        if cities and job_city not in cities:
            continue
        if not query_intents:
            filtered_jobs.append(job)
            continue
        intent_match = False
        no_space_job_title = re.sub(r'\s+', '', job_title)
        for intent in query_intents:
            keywords = {
                'driver': [normalize_keyword(k) for k in DRIVER_KEYWORDS],
                'it_software': [normalize_keyword(k) for k in IT_SOFTWARE_KEYWORDS],
                # Thêm các ngành khác...
            }.get(intent, [])
            for kw, kw_no_space in keywords:
                if kw in job_title or kw_no_space in no_space_job_title:
                    intent_match = True
                    break
        if intent_match:
            filtered_jobs.append(job)
    
    return filtered_jobs[:top_n]

# API Endpoints
@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "JobRadar API is running",
        "endpoints": {
            "/analyze": "Phân tích CV với mô tả công việc",
            "/semantic-search": "Tìm kiếm ngữ nghĩa",
            "/recommend-jobs/phobert": "Gợi ý việc làm",
            "/save-search": "Lưu tìm kiếm",
            "/health": "Kiểm tra sức khỏe hệ thống",
            "/check-comment": "Kiểm tra nội dung bình luận"
        },
        "status": "ok"
    })

@app.route('/analyze', methods=['POST'])
def analyze_cv():
    try:
        if 'cv' not in request.files:
            return jsonify({"error": "Thiếu file CV"}), 400
        job_data = {}
        if 'job_data' in request.form:
            job_data = json.loads(request.form['job_data'])
        elif 'job_description' in request.form:
            job_data = {'description': request.form['job_description']}
        else:
            return jsonify({"error": "Thiếu mô tả công việc"}), 400
        
        cv_file = request.files['cv']
        if not GEMINI_API_KEY:
            return jsonify({"error": "GEMINI_API_KEY không được thiết lập"}), 500
        
        cv_text = ""
        if cv_file.filename.endswith('.pdf'):
            cv_text = extract_text_from_pdf(cv_file)
        elif cv_file.filename.endswith('.docx'):
            cv_text = extract_text_from_docx(cv_file)
        else:
            return jsonify({"error": "Định dạng file không được hỗ trợ"}), 400
        
        if not cv_text:
            return jsonify({"error": "Không thể trích xuất văn bản từ CV"}), 400
        
        result = analyze_cv_with_gemini(cv_text, job_data, GEMINI_API_KEY)
        return jsonify(result)
    except Exception as e:
        logger.exception(f"Lỗi server: {str(e)}")
        return jsonify({"error": f"Lỗi server: {str(e)}"}), 500

@app.route('/semantic-search', methods=['POST'])
def semantic_search():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Không có dữ liệu được gửi"}), 400
        query = data.get('query', '')
        jobs_to_search = data.get('jobs', jobs)
        filters = data.get('filters', {})
        if not query or not jobs_to_search:
            return jsonify({"error": "Thiếu truy vấn hoặc danh sách công việc"}), 400
        
        cache_key = get_cache_key(query, filters)
        cached_result = get_cache(cache_key)
        if cached_result:
            return jsonify(cached_result)
        
        query_embedding = get_text_embedding(query)
        if PRECOMPUTE_EMBEDDINGS:
            if not last_embedding_update or (datetime.now() - last_embedding_update) > timedelta(hours=EMBEDDING_REFRESH_HOURS):
                precompute_embeddings(jobs_to_search)
            if USE_JOB_INDEXING:
                create_job_index(jobs_to_search)
        
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
        
        vector_results = fast_vector_search(query_embedding, filtered_jobs)
        final_results = []
        for job, score in vector_results:
            job_with_score = job.copy()
            job_with_score['similarity_score'] = score
            final_results.append(job_with_score)
        
        MIN_SIMILARITY_SCORE = 0.3
        filtered_final_results = [job for job in final_results if job.get('similarity_score', 0) >= MIN_SIMILARITY_SCORE]
        set_cache(cache_key, filtered_final_results, ttl=7200)
        return jsonify(filtered_final_results)
    except Exception as e:
        logger.exception(f"Lỗi trong semantic search: {str(e)}")
        return jsonify({"error": str(e)}), 500

def filter_jobs_by_keywords(jobs, keywords, threshold=1):
    if not keywords:
        return jobs
    filtered_jobs = []
    keywords_lower = [k.lower() for k in keywords]
    for job in jobs:
        job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('requirements', '')}".lower()
        matches = sum(1 for keyword in keywords_lower if keyword in job_text)
        if matches >= threshold:
            filtered_jobs.append(job)
    return filtered_jobs

def create_job_index(jobs):
    global job_index
    job_index = {}
    for job in jobs:
        job_id = job.get('id') or job.get('jobId') or job.get('postId')
        if not job_id:
            job_content = f"{job.get('title', '')}{job.get('description', '')}{job.get('requirements', '')}"
            job_id = hashlib.md5(job_content.encode()).hexdigest()
        job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('requirements', '')}".lower()
        words = set(re.findall(r'\b\w+\b', job_text))
        vietnamese_stopwords = {'và', 'là', 'của', 'có', 'trong', 'cho', 'với', 'để', 'các'}
        keywords = [w for w in words if len(w) > 2 and w not in vietnamese_stopwords]
        for keyword in keywords:
            if keyword not in job_index:
                job_index[keyword] = []
            job_index[keyword].append(job_id)

def load_embeddings_from_file():
    global job_embeddings, last_embedding_update
    if os.path.exists(EMBEDDINGS_FILE):
        try:
            with open(EMBEDDINGS_FILE, 'rb') as f:
                data = pickle.load(f)
                # Kiểm tra version cache
                if data.get('version') == CACHE_VERSION:
                    job_embeddings = data.get('embeddings', {})
                    last_embedding_update = data.get('timestamp', None)
                    logger.info(f"Đã tải {len(job_embeddings)} embeddings từ cache")
                    return True
                else:
                    logger.info("Cache không hợp lệ do version không khớp")
                    return False
        except Exception as e:
            logger.error(f"Lỗi khi tải embeddings từ file: {e}")
            return False
    return False

def save_embeddings_to_file():
    try:
        with open(EMBEDDINGS_FILE, 'wb') as f:
            pickle.dump({
                'embeddings': job_embeddings,
                'timestamp': datetime.now(),
                'version': CACHE_VERSION
            }, f)
        logger.info(f"Đã lưu {len(job_embeddings)} embeddings vào cache")
        return True
    except Exception as e:
        logger.error(f"Lỗi khi lưu embeddings: {e}")
        return False

def precompute_embeddings(jobs):
    global job_embeddings, last_embedding_update
    
    # Kiểm tra cache trước
    if load_embeddings_from_file():
        # Kiểm tra xem cache có còn hợp lệ không
        if last_embedding_update and (datetime.now() - last_embedding_update) < timedelta(hours=EMBEDDING_REFRESH_HOURS):
            logger.info("Sử dụng embeddings từ cache")
            return
    
    logger.info("Tạo mới embeddings cho công việc")
    job_ids = []
    for job in jobs:
        job_id = job.get('id') or job.get('jobId') or job.get('postId')
        if not job_id:
            job_content = f"{job.get('title', '')}{job.get('description', '')}{job.get('requirements', '')}"
            job_id = hashlib.md5(job_content.encode()).hexdigest()
        job_ids.append(job_id)
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        job_texts = [f"{job.get('title', '')} {job.get('description', '')} {job.get('requirements', '')}" for job in jobs]
        BATCH_SIZE = 100
        all_embeddings = []
        for i in range(0, len(job_texts), BATCH_SIZE):
            batch_texts = job_texts[i:i+BATCH_SIZE]
            batch_embeddings = list(executor.map(lambda text: embedding_model.encode(text, device=DEVICE, normalize_embeddings=True), batch_texts))
            all_embeddings.extend(batch_embeddings)
    
    for i, job_id in enumerate(job_ids):
        if i < len(all_embeddings):
            job_embeddings[job_id] = all_embeddings[i]
    
    # Lưu embeddings vào file
    save_embeddings_to_file()
    last_embedding_update = datetime.now()

def fast_vector_search(query_embedding, jobs, top_k=100):
    results = []
    seen_job_ids = set()

    # Sử dụng job_embeddings để tính độ tương đồng
    for job in jobs:
        job_id = job.get('id') or job.get('jobId') or job.get('postId')
        if not job_id or job_id in seen_job_ids:
            continue
        seen_job_ids.add(job_id)

        # Lấy embedding từ job_embeddings nếu có
        job_embedding = job_embeddings.get(job_id)
        if job_embedding is None:
            job_embedding = get_job_embedding(job)  # Tạo mới nếu chưa có
            if job_embedding is None:
                continue
        
        similarity = compute_similarity(query_embedding, job_embedding)
        results.append((job, similarity))
    
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]

@app.route('/recommend-jobs/phobert', methods=['POST'])
def recommend_jobs_mbert():
    try:
        user_id = request.headers.get('X-User-Id')
        if not user_id:
            return jsonify({'error': 'Yêu cầu header X-User-Id'}), 400
        
        with csv_read_lock:
            load_search_history_from_csv(SEARCH_HISTORY_FILEPATH)
        
        user_search_history = [h for h in search_history if str(h.get('SeekerID', '')) == str(user_id)]
        user_search_history.sort(key=lambda x: pd.Timestamp(x.get('Search Date', '1970-01-01')), reverse=True)
        last_five_searches = user_search_history[:5]
        
        if not last_five_searches:
            return jsonify([]), 200
        
        recent_search = last_five_searches[0]
        query_text = recent_search.get('Search Query', '').replace('Title:', '').strip()
        
        # Kiểm tra cache
        cache_key = get_cache_key(query_text, {'user_id': user_id})
        cached_result = get_cache(cache_key)
        if cached_result:
            logger.info(f"Sử dụng kết quả từ cache cho truy vấn: {query_text}")
            return jsonify(cached_result)
        
        query_embedding = get_text_embedding(query_text)
        if query_embedding is None:
            return jsonify({'error': 'Không thể tạo embedding cho truy vấn'}), 500
        
        recent_jobs = filter_jobs_by_category(jobs, [recent_search])
        vector_results = fast_vector_search(query_embedding, recent_jobs, top_k=8)
        
        recommended_jobs_dict = {}
        for job, sim_score in vector_results:
            job_id = job.get('postId')
            if job_id and job_id not in recommended_jobs_dict:
                reason = f"Tương đồng: {sim_score:.4f} | Dựa trên tìm kiếm: '{query_text}'"
                job_with_reason = job.copy()
                job_with_reason['recommendation_reason'] = reason
                job_with_reason['similarity_score'] = float(sim_score)
                recommended_jobs_dict[job_id] = job_with_reason
        
        top_recommended_jobs_list = list(recommended_jobs_dict.values())
        top_recommended_jobs_list.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Lưu vào cache
        set_cache(cache_key, top_recommended_jobs_list, ttl=7200)
        
        return jsonify(top_recommended_jobs_list), 200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
    except Exception as e:
        logger.exception(f"Lỗi trong recommend_jobs_mbert: {str(e)}")
        return jsonify({'error': 'Lỗi server nội bộ'}), 500

@app.route('/save-search', methods=['POST'])
def save_search():
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
            load_search_history_from_csv(SEARCH_HISTORY_FILEPATH)
        logger.info(f"Đã lưu tìm kiếm mới cho người dùng {user_id}: '{cleaned_query}'")
        return jsonify({'message': 'Đã lưu tìm kiếm', 'query': cleaned_query}), 200
    except Exception as e:
        logger.error(f"Lỗi khi lưu tìm kiếm: {str(e)}")
        return jsonify({'error': 'Lỗi server nội bộ', 'query': None}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "jobs_count": len(jobs),
        "search_history_count": len(search_history),
        "model_loaded": True
    }), 200

@app.route('/check-comment', methods=['POST'])
def check_company_review():
    """API endpoint để kiểm tra bình luận đánh giá công ty"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing text field in request body'
            }), 400

        text = data['text']
        threshold = float(data.get('threshold', 0.7))

        is_toxic, score = company_review_filter.filter_comment(text, threshold)

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


if __name__ == '__main__':
    logger.info("Starting JobRadar service on port 5000")
    jobs = load_jobs_from_csv(JOBS_FILEPATH)
    search_history = load_search_history_from_csv(SEARCH_HISTORY_FILEPATH)
    
    if PRECOMPUTE_EMBEDDINGS:
        # Chỉ tính toán lại embeddings nếu cache không hợp lệ
        if not load_embeddings_from_file() or \
           not job_embeddings or \
           len(job_embeddings) != len(jobs) or \
           (last_embedding_update and (datetime.now() - last_embedding_update) > timedelta(hours=EMBEDDING_REFRESH_HOURS)):
            logger.info("Tạo mới embeddings vì cache không hợp lệ hoặc đã hết hạn")
            precompute_embeddings(jobs)
    
    if USE_JOB_INDEXING:
        create_job_index(jobs)
    
    app.run(host='0.0.0.0', port=5000, debug=True)