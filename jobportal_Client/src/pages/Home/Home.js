// src/pages/Home/Home.js
import React from 'react';
import Slider from '../../components/Slider/Slider';
import CategoryList from '../../components/common/CategoryList/CategoryList';
import JobList from '../../components/common/JobList/JobList';
import  TopListEmployers  from '../../components/TopListEmployer/TopListEmployer';
import Top8Job from '../../components/common/JobList/Top8Job';
const Home = () => {
  return (
    <>
      <Slider />
      <CategoryList />
      <TopListEmployers/>
      <JobList />
      <Top8Job/>
      
    </>
  );
};

export default Home;





