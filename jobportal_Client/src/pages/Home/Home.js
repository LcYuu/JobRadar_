// src/pages/Home/Home.js
import React from "react";
import Slider from "../../components/Slider/Slider";
import CategoryList from "../../components/common/CategoryList/CategoryList";
import JobList from "../../components/common/JobList/JobList";
import TopListEmployers from "../../components/TopListEmployer/TopListEmployer";
import Top8Job from "../../components/common/JobList/Top8Job";
import RecommendJob from "../../components/common/JobList/RecommendJob";
import { useSelector } from "react-redux";

const Home = () => {
  const { user } = useSelector((store) => store.auth);
  const isSeeker = user?.userType?.userTypeId === 2;
  return (
    <div className="gap-4 md:gap-6 px-4 sm:px-6 py-2 sm:py-4">
      <Slider />
      <CategoryList />
      <TopListEmployers />
      <JobList />
      {isSeeker && <RecommendJob />}
      <Top8Job />
    </div>
  );
};

export default Home;
