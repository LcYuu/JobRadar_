import React, { useEffect, useState } from 'react';
import JobCard from "../JobCard/JobCard";
import { useDispatch, useSelector } from 'react-redux';
import logo1 from '../../../assets/images/common/logo1.jpg';
import { getTop8LastestJob } from '../../../redux/JobPost/jobPost.action';

export default function Top8Job() {
  const dispatch = useDispatch();
  const { top8Job = [], loading, error } = useSelector(store => store.jobPost);

  useEffect(() => {
    dispatch(getTop8LastestJob());
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
          Các công việc mới nhất
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {top8Job.length > 0 ? (
          top8Job.map((job) => (
            <JobCard
              key={job.postId}
              postId={job.postId}
              jobTitle={job.title}
              company={job.company.companyName}
              location={job.city.cityName}
              category={job.company.industry.industryName}
              jobType={job.typeOfWork}
              companyLogo={job.company.logo || logo1}
            />
          ))
        ) : (
          <p>Không có công việc nào để hiển thị.</p>
        )}
      </div>

    </section>
  );
}
