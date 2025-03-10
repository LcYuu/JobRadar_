import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from threading import Thread
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "Authorization"}})

# Danh sách stop words tiếng Việt (mẫu)
VIETNAMESE_STOP_WORDS = [
    "và", "của", "là", "các", "cho", "trong", "tại", "được", "với", "một", 
    "những", "để", "từ", "có", "không", "người", "này", "đã", "ra", "trên"
]

# Load job data from CSV
def load_jobs_from_csv(filepath):
    try:
        df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
        df['createDate'] = pd.to_datetime(df['createDate'], errors='coerce')
        df['expireDate'] = pd.to_datetime(df['expireDate'], errors='coerce')

        current_date = datetime.now()
        df = df[df['expireDate'].notna() & (df['expireDate'] > current_date)]
        df = df.sort_values(by='createDate', ascending=False).head(1000)

        for column in df.columns:
            df[column] = df[column].astype(str).replace('nan', '').replace('NaT', '')

        return df.to_dict(orient='records')
    except Exception as e:
        print(f"Error loading jobs from CSV: {e}")
        return []

# Load search history from CSV and clean Search Query
def load_search_history_from_csv(filepath):
    try:
        df = pd.read_csv(filepath, encoding='utf-8', low_memory=False)
        if 'SeekerID' not in df or 'Search Query' not in df:
            print("Missing required columns in search history (SeekerID or Search Query).")
            return []
        
        if 'Search Date' in df.columns:
            df['Search Date'] = pd.to_datetime(df['Search Date'], errors='coerce')
            df = df.sort_values(by='Search Date', ascending=False)
        
        df['Search Query'] = df['Search Query'].apply(
            lambda x: re.sub(r'(CityName:|IndustryNames:|MaxSalary:\s*\d+\s*|\s*\|\s*)', '', str(x)).strip()
        )

        for column in df.columns:
            df[column] = df[column].astype(str).replace('nan', '').replace('NaT', '')

        return df.to_dict(orient='records')
    except Exception as e:
        print(f"Error loading search history from CSV: {e}")
        return []

# Preload data
jobs_filepath = 'D:\\JobRadar_\\job_post.csv'
search_history_filepath = 'D:\\JobRadar_\\search.csv'
jobs = load_jobs_from_csv(jobs_filepath)
search_history = load_search_history_from_csv(search_history_filepath)

# Reload data periodically
def reload_data():
    global jobs, search_history
    jobs = load_jobs_from_csv(jobs_filepath)
    search_history = load_search_history_from_csv(search_history_filepath)
    print(f"Data updated at {datetime.now()} - Search history: {len(search_history)} entries")
    if search_history:
        print(f"Latest search history entry: {search_history[0]}")

def schedule_data_update():
    while True:
        time.sleep(60)
        reload_data()

thread = Thread(target=schedule_data_update)
thread.daemon = True
thread.start()

# Save new search query
@app.route('/save-search', methods=['POST'])
def save_search():
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({'error': 'X-User-Id header is required'}), 400

    data = request.get_json()
    search_query = data.get('query')
    if not search_query:
        return jsonify({'error': 'Search query is required'}), 400

    cleaned_query = re.sub(r'(CityName:|IndustryNames:|MaxSalary:|TypesOfWork:|Title:\s*\d+\s*|\s*\|\s*)', '', str(search_query)).strip()

    new_entry = {
        'SeekerID': user_id,
        'Search Query': cleaned_query,
        'Search Date': datetime.now().isoformat()
    }
    search_history.append(new_entry)
    
    df = pd.DataFrame([new_entry])
    df.to_csv(search_history_filepath, mode='a', header=not pd.io.common.file_exists(search_history_filepath), index=False)
    
    reload_data()
    
    return jsonify({'message': 'Search saved'}), 200

# TF-IDF Model for Job Matching
def get_tfidf_recommendations(search_history, jobs, top_n=10):
    vectorizer = TfidfVectorizer(stop_words=VIETNAMESE_STOP_WORDS)

    try:
        if not isinstance(search_history, list):
            raise ValueError(f"⚠️ search_history phải là danh sách, nhưng nhận {type(search_history)}")
        if not search_history:
            raise ValueError("⚠️ search_history không được rỗng!")

        if isinstance(search_history[0], str):
            recent_searches = search_history[:5]
        else:
            sorted_history = sorted(
                search_history,
                key=lambda x: x.get('Search Date', '1970-01-01'),
                reverse=True
            )
            recent_searches = [entry.get('Search Query', '') for entry in sorted_history[:5]]

        recent_searches = list(dict.fromkeys([query for query in recent_searches if query.strip()]))
        print(f"5 truy vấn gần nhất được sử dụng: {recent_searches}")
        if not recent_searches:
            raise ValueError("⚠️ Không có truy vấn hợp lệ sau khi loại bỏ trùng lặp và rỗng!")

        weighted_searches = []
        for i, query in enumerate(recent_searches):
            cleaned_query = re.sub(r'[^\w\s]', '', str(query)).strip().lower()
            weight = 5 - i
            weighted_searches.extend([cleaned_query] * max(1, weight))
        
        print(f"Recent searches: {recent_searches}")
        print(f"Weighted searches: {weighted_searches}")
        search_query = " ".join(weighted_searches)
        print(f"Combined search query: {search_query}")

        if not search_query:
            raise ValueError("⚠️ search_history không chứa dữ liệu hợp lệ sau khi xử lý!")

        if not jobs or not isinstance(jobs, list):
            print("⚠️ Dữ liệu jobs rỗng hoặc không phải danh sách!")
            return []

        job_posts_cleaned = []
        valid_jobs = []

        for job in jobs:
            if not isinstance(job, dict):
                print(f"⚠️ Job không phải dictionary: {job}")
                continue

            job_text = " ".join(str(job.get(field, "")).lower() for field in ["title", "description", "typeOfWork"])
            if job.get("industryName"):
                if isinstance(job["industryName"], list):
                    job_text += " " + " ".join(str(item).lower() for item in job["industryName"])
                else:
                    job_text += " " + " ".join([str(job["industryName"]).lower()] * 3)
            if job.get("title"):
                job_text += " " + " ".join([str(job["title"]).lower()] * 3)
            job_text = re.sub(r'[^\w\s]', '', job_text).strip()
            
            if job_text:
                job_posts_cleaned.append(job_text)
                valid_jobs.append(job)

        if not job_posts_cleaned:
            print("⚠️ Không có dữ liệu job để vector hóa!")
            return []

        job_tfidf_matrix = vectorizer.fit_transform(job_posts_cleaned)
        search_vector = vectorizer.transform([search_query])
        cosine_similarities = cosine_similarity(search_vector, job_tfidf_matrix)[0]
        print("Cosine similarities:", cosine_similarities)

        top_indices = np.argpartition(cosine_similarities, -top_n)[-top_n:]
        top_indices = top_indices[np.argsort(cosine_similarities[top_indices])][::-1]

        recommended_jobs = [valid_jobs[i] for i in top_indices]
        return recommended_jobs
    except Exception as e:
        print(f"❌ Lỗi trong get_tfidf_recommendations: {e}")
        return []

# Collaborative Filtering Model for Job Recommendation
def get_collaborative_recommendations(user_id, search_history):
    try:
        user_df = pd.DataFrame(search_history)
        if user_df.empty or 'SeekerID' not in user_df or 'Search Query' not in user_df:
            print("⚠️ Dữ liệu search_history không hợp lệ hoặc rỗng!")
            return np.array([])

        user_df = user_df[user_df['Search Query'].str.strip() != '']
        if user_df.empty:
            print("⚠️ Không có truy vấn hợp lệ sau khi loại bỏ truy vấn rỗng!")
            return np.array([])

        user_df = user_df.groupby(['SeekerID', 'Search Query']).size().reset_index(name='Search Count')
        user_job_matrix = user_df.pivot(index='SeekerID', columns='Search Query', values='Search Count').fillna(0)
        
        if user_id not in user_job_matrix.index:
            print(f"⚠️ User ID {user_id} không tồn tại trong user_job_matrix!")
            return np.array([])
        
        user_similarities = cosine_similarity(user_job_matrix)
        user_sim_df = pd.DataFrame(user_similarities, index=user_job_matrix.index, columns=user_job_matrix.index)

        similar_users = user_sim_df[user_id].sort_values(ascending=False).iloc[1:6].index.tolist()
        similar_users_searches = user_df[user_df['SeekerID'].isin(similar_users)]['Search Query'].unique()

        similar_users_searches = [query for query in similar_users_searches if query.strip()]
        print(f"Similar users searches: {similar_users_searches}")
        return np.array(similar_users_searches)
    except Exception as e:
        print(f"Error in collaborative filtering: {e}")
        return np.array([])

# [Giữ nguyên phần import và các hàm phụ trợ như cũ]

# Endpoint cho TF-IDF recommendations
@app.route('/recommend-jobs/tfidf', methods=['POST'])
def recommend_jobs_tfidf():
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({'error': 'X-User-Id header is required'}), 400

    reload_data()

    user_search_history = [h for h in search_history if str(h.get('SeekerID', '')) == str(user_id)]
    if not user_search_history:
        return jsonify([]), 200

    tfidf_results = get_tfidf_recommendations(user_search_history, jobs)
    
    recommended_jobs = {}
    if tfidf_results:
        for job in tfidf_results[:8]:  # Giới hạn 8 kết quả
            job_id = job.get('postId')
            if job_id and job_id not in recommended_jobs:
                recent_searches = list(dict.fromkeys([h.get('Search Query', '') for h in user_search_history[:5]]))
                reason = f"Matched based on TF-IDF similarity to your recent searches: {', '.join(recent_searches)}"
                job_with_reason = job.copy()
                job_with_reason['recommendation_reason'] = reason
                recommended_jobs[job_id] = job_with_reason

    top_recommended_jobs = list(recommended_jobs.values())
    
    print(f"TF-IDF Recommendations for User ID: {user_id}")
    print(f"Total recommended jobs: {len(top_recommended_jobs)}")
    for job in top_recommended_jobs:
        print(f"- Job ID: {job.get('postId')} | Title: {job.get('title')} | Reason: {job.get('recommendation_reason')}")

    return jsonify(top_recommended_jobs), 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }

# Endpoint cho Collaborative Filtering recommendations
@app.route('/recommend-jobs/collaborative', methods=['POST'])
def recommend_jobs_collaborative():
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({'error': 'X-User-Id header is required'}), 400

    reload_data()

    user_search_history = [h for h in search_history if str(h.get('SeekerID', '')) == str(user_id)]
    if not user_search_history:
        return jsonify([]), 200

    collaborative_results = get_collaborative_recommendations(user_id, search_history)
    
    recommended_jobs = {}
    if len(collaborative_results) > 0:
        user_queries = [h.get('Search Query', '') for h in user_search_history]
        for query in collaborative_results:
            for job in jobs:
                if (any(
                    str(q).lower() in str({k: v for k, v in job.items() if k not in ['createDate', 'expireDate']}).lower() 
                    for q in [query] + user_queries
                ) or str(query).lower() in str(job.get('title', '')).lower() 
                   or str(query).lower() in str(job.get('description', '')).lower()):
                    job_id = job.get('postId')
                    if job_id and job_id not in recommended_jobs:
                        reason = f"Matched based on similar users' search query: '{query}'"
                        job_with_reason = job.copy()
                        job_with_reason['recommendation_reason'] = reason
                        recommended_jobs[job_id] = job_with_reason
                        if len(recommended_jobs) >= 8:  # Giới hạn 8 kết quả
                            break

    top_recommended_jobs = list(recommended_jobs.values())[:8]
    
    print(f"Collaborative Recommendations for User ID: {user_id}")
    print(f"Total recommended jobs: {len(top_recommended_jobs)}")
    for job in top_recommended_jobs:
        print(f"- Job ID: {job.get('postId')} | Title: {job.get('title')} | Reason: {job.get('recommendation_reason')}")

    return jsonify(top_recommended_jobs), 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }


if __name__ == '__main__':
    app.run(debug=True)