// src/pages/Home/Home.js
import React from 'react';
import Slider from '../../components/Slider/Slider';
import CategoryList from '../../components/common/CategoryList/CategoryList';
import JobList from '../../components/common/JobList/JobList';
import TopListEmployers from '../../components/TopListEmployer/TopListEmployer';
import Top8Job from '../../components/common/JobList/Top8Job';
import RecommendJob from '../../components/common/JobList/RecommendJob';
import CVAnalyzer from '../../components/CVAnalyzer/CVAnalyzer';

const Home = () => {
  return (
    <div className="gap-6 px-6 py-4">
      <Slider />
      <CategoryList />
      <TopListEmployers />
      <JobList />
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Công cụ phân tích CV thông minh</h2>
        <p className="text-gray-600 mb-6">
          Sử dụng AI để phân tích CV của bạn và đánh giá mức độ phù hợp với công việc mong muốn
        </p>
        <CVAnalyzer />
      </div>
      <RecommendJob />
      <Top8Job />
    </div>
  );
};

export default Home;