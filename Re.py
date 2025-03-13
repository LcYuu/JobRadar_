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


VIETNAMESE_STOP_WORDS = [
    "và", "của", "là", "các", "cho", "trong", "tại", "được", "với", "một", 
    "những", "để", "từ", "có", "không", "người", "này", "đã", "ra", "trên"
]


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


jobs_filepath = 'D:\\JobRadar_\\job_post.csv'
search_history_filepath = 'D:\\JobRadar_\\search.csv'
jobs = load_jobs_from_csv(jobs_filepath)
search_history = load_search_history_from_csv(search_history_filepath)


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
        # Convert search history to DataFrame
        user_df = pd.DataFrame(search_history)
        if user_df.empty or 'SeekerID' not in user_df or 'Search Query' not in user_df:
            print("⚠️ Dữ liệu search_history không hợp lệ hoặc rỗng!")
            return np.array([])

        # Filter valid searches
        user_df = user_df[user_df['Search Query'].str.strip() != '']
        if user_df.empty:
            print("⚠️ Không có truy vấn hợp lệ sau khi loại bỏ truy vấn rỗng!")
            return np.array([])
        
        # Add recency weight if 'Search Date' exists
        if 'Search Date' in user_df.columns:
            user_df['Search Date'] = pd.to_datetime(user_df['Search Date'], errors='coerce')
            # Calculate recency weight (more recent = higher weight)
            max_date = user_df['Search Date'].max()
            min_date = user_df['Search Date'].min()
            if max_date != min_date:
                user_df['Recency Weight'] = (user_df['Search Date'] - min_date) / (max_date - min_date)
            else:
                user_df['Recency Weight'] = 1.0
            user_df['Recency Weight'] = user_df['Recency Weight'].fillna(0.5) + 0.5  # Scale between 0.5 and 1.5
        else:
            user_df['Recency Weight'] = 1.0
            
        # Count searches with recency weights
        user_df = user_df.groupby(['SeekerID', 'Search Query']).agg({
            'Recency Weight': 'mean'  # Using average recency weight for this query
        }).reset_index()
        
        # Create user-query matrix with weighted counts
        user_job_matrix = user_df.pivot(index='SeekerID', columns='Search Query', values='Recency Weight').fillna(0)
        
        # Check if user exists in the matrix (after string conversion for safety)
        user_id_str = str(user_id)
        user_indices = [i for i, idx in enumerate(user_job_matrix.index) if str(idx) == user_id_str]
        
        if not user_indices:
            print(f"⚠️ User ID {user_id} không tồn tại trong user_job_matrix!")
            return np.array([])
        
        # Use the first matching index
        user_idx = user_indices[0]
        
        # Compute similarity matrix between users
        user_similarities = cosine_similarity(user_job_matrix)
        user_sim_df = pd.DataFrame(user_similarities, 
                                  index=user_job_matrix.index, 
                                  columns=user_job_matrix.index)
        
        # Get similar users sorted by similarity (skip the first as it's the user themselves)
        similar_users_indices = np.argsort(user_similarities[user_idx])[::-1][1:11]  # Get top 10 similar users
        similar_users = [user_job_matrix.index[i] for i in similar_users_indices]
        
        print(f"Similar users for {user_id}: {similar_users}")
        
        # Get searches from similar users and weight by similarity
        similar_users_queries = []
        user_searches = set([h.get('Search Query', '') for h in search_history 
                           if str(h.get('SeekerID', '')) == str(user_id)])
        
        for i, sim_user in enumerate(similar_users):
            similarity_score = user_similarities[user_idx][similar_users_indices[i]]
            if similarity_score < 0.1:  # Filter out users with low similarity
                continue
                
            # Get this similar user's searches
            sim_user_searches = user_df[user_df['SeekerID'] == sim_user]['Search Query'].unique()
            
            # Filter out searches the user has already done
            unique_searches = [q for q in sim_user_searches if q not in user_searches]
            
            # Weight by similarity
            for query in unique_searches:
                if query.strip():  # Ensure non-empty
                    similar_users_queries.append((query, similarity_score))
        
        # Aggregate scores for duplicate queries
        query_weights = {}
        for query, weight in similar_users_queries:
            if query in query_weights:
                query_weights[query] += weight
            else:
                query_weights[query] = weight
        
        # Sort queries by weight
        sorted_queries = sorted(query_weights.items(), key=lambda x: x[1], reverse=True)
        top_queries = [query for query, _ in sorted_queries[:20]]  
        
        # Return unique valid queries
        return np.array([q for q in top_queries if str(q).strip()])
        
    except Exception as e:
        print(f"❌ Error in collaborative filtering: {e}")
        import traceback
        traceback.print_exc()
        return np.array([])

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

    # Get recommended queries using collaborative filtering (maintaining original function signature)
    collaborative_results = get_collaborative_recommendations(user_id, search_history)
    
    recommended_jobs = {}
    if len(collaborative_results) > 0:
        user_queries = [h.get('Search Query', '') for h in user_search_history]
        
        # Process each recommended query
        for query in collaborative_results:
            query_str = str(query).lower()
            if not query_str:
                continue
                
            # Track match quality for each job
            matching_jobs = []
            
            for job in jobs:
                # Extract text fields for matching
                job_title = str(job.get('title', '')).lower()
                job_desc = str(job.get('description', '')).lower()
                job_industry = str(job.get('industryName', '')).lower()
                
                # Check for matches with weighted scoring
                match_score = 0
                if query_str in job_title:
                    match_score += 3  # Title matches are more important
                if query_str in job_desc:
                    match_score += 1
                if query_str in job_industry:
                    match_score += 2
                
                # Add job if it has any match
                if match_score > 0:
                    matching_jobs.append({
                        'job': job,
                        'score': match_score,
                        'query': query
                    })
            
            # Sort matching jobs by score
            matching_jobs.sort(key=lambda x: x['score'], reverse=True)
            
            # Add top matching jobs to recommendations
            for match in matching_jobs[:3]:  # Take top 3 matches per query
                job = match['job']
                job_id = job.get('postId')
                
                if job_id and job_id not in recommended_jobs:
                    # Create personalized reason
                    reason = f"Matched based on similar users' search for '{match['query']}'"
                    
                    # Add job to recommendations
                    job_with_reason = job.copy()
                    job_with_reason['recommendation_reason'] = reason
                    job_with_reason['match_score'] = match['score']
                    recommended_jobs[job_id] = job_with_reason
                    
                    # Stop if we have enough recommendations
                    if len(recommended_jobs) >= 8:
                        break
            
            # Stop if we have enough recommendations
            if len(recommended_jobs) >= 8:
                break
    
    # Sort by match score
    sorted_jobs = sorted(
        list(recommended_jobs.values()),
        key=lambda x: x.get('match_score', 0),
        reverse=True
    )
    
    # Get top 8 jobs
    top_recommended_jobs = sorted_jobs[:8]
    
    # Remove temporary fields
    for job in top_recommended_jobs:
        if 'match_score' in job:
            del job['match_score']
    
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