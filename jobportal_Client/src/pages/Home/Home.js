// src/pages/Home/Home.js
import React from 'react';
import Slider from '../../components/Slider/Slider';
import CategoryList from '../../components/common/CategoryList/CategoryList';
import JobList from '../../components/common/JobList/JobList';
import TopListEmployers from '../../components/TopListEmployer/TopListEmployer';
import Top8Job from '../../components/common/JobList/Top8Job';
import RecommendJob from '../../components/common/JobList/RecommendJob';

const Home = () => {
  return (
    <div className="gap-6 px-6 py-4">
      <Slider />
      <CategoryList />
      <TopListEmployers />
      <JobList />
      <RecommendJob />
      <Top8Job />
    </div>
  );
};

export default Home;
