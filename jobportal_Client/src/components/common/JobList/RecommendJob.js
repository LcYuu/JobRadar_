import React, { useEffect } from 'react'
import { getRecommendJob } from '../../../redux/JobPost/jobPost.action';
import { useDispatch, useSelector } from 'react-redux';
import JobCard from '../JobCard/JobCard';

const RecommendJob = () => {
    const dispatch = useDispatch();
    const { recommendJob = [], loading, error } = useSelector(store => store.jobPost);
  
    useEffect(() => {
      dispatch(getRecommendJob());
    }, [dispatch]);
  
    
    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;
  
    return (
      <section className="py-12">
        <div className="flex justify-between items-center mb-6">
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{ color: "#43bfb3" }}
        >
          Các công việc đề xuất
        </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendJob.length > 0 ? (
            recommendJob.map((job) => (
              <JobCard
                key={job.postId}
                postId={job.postId}
                jobTitle={job.title}
                company={job.companyName}
                location={job.cityName}
                category={job.industryName}
                jobType={job.typeOfWork}
                companyLogo={job.logo}
              />
            ))
          ) : (
            <p>Không có công việc nào để hiển thị.</p>
          )}
        </div>
  
      </section>
    );
}

export default RecommendJob