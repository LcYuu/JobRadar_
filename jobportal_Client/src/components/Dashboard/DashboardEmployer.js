import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../../ui/card";
import { Users, MapPin, Briefcase } from "lucide-react"; // Thêm Briefcase
import { Link } from "react-router-dom";
import { getTop5Lastest } from "../../redux/JobPost/jobPost.thunk";
import { countReviewByCompany } from "../../redux/Review/review.thunk";

export default function Dashboard_Employer() {
  const dispatch = useDispatch();
  const { jobs = [] } = useSelector((store) => store.jobPost);
  const { countReview } = useSelector((store) => store.review);
  const [visibleJobs, setVisibleJobs] = useState([]);
  const [totalApplicationCount, setTotalApplicationCount] = useState(0);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getTop5Lastest());
        await dispatch(countReviewByCompany());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Process jobs data whenever it changes
  useEffect(() => {
    if (!Array.isArray(jobs)) {
      console.error("Jobs is not an array:", jobs);
      return;
    }
    
    try {
      const totalApplication = jobs.reduce(
        (sum, job) => sum + (job.applicationCount || 0),
        0
      );

      setTotalApplicationCount(totalApplication);
      setVisibleJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error("Error processing jobs data:", error);
    }
  }, [jobs]);

  // Safely get approved jobs count
  const getApprovedJobsCount = () => {
    if (!Array.isArray(jobs)) return 0;
    return jobs.filter(job => job.approve === true).length;
  };

  // Safely render industry names
  const renderIndustryNames = (industryNames) => {
    if (!Array.isArray(industryNames) || industryNames.length === 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-600 font-medium mr-1">Không có ngành</span>;
    }
    
    return industryNames.map((industryName, index) => (
      <span
        key={index}
        className="px-2 py-1 text-xs rounded-full bg-purple-50 text-purple-600 font-medium mr-1"
      >
        {industryName}
      </span>
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-purple-600">
          Chào mừng trở lại
        </h1>
      </div>

      {/* Stats Banner */}
      <div
        className="p-4 sm:p-6 rounded-lg mb-6 sm:mb-8 flex justify-between items-center"
        style={{
          background: "linear-gradient(to right, #2193b0, #6dd5ed)",
          color: "white",
        }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">
            {countReview?.totalReviews ?? 0}
          </h2>
          <p className="text-purple-100 text-sm sm:text-base">Tổng số Review</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card
          className="p-4 sm:p-6"
          style={{
            background: "linear-gradient(to right, #D1913C, #FFD194)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-medium mr-2">Số công việc đang tuyển</h3>
            <span className="text-2xl sm:text-3xl font-bold">
              {getApprovedJobsCount()}
            </span>
          </div>
        </Card>

        <Card
          className="p-4 sm:p-6"
          style={{
            background: "linear-gradient(to right, #c9d6ff, #e2e2e2)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-medium">Số lượng ứng tuyển</h3>
            <Users className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-2">{totalApplicationCount}</div>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-purple-600">
            Các công việc đăng gần đây
          </h2>
        </div>

        {(!Array.isArray(visibleJobs) || visibleJobs.length === 0) ? (
          <p className="text-gray-500 italic text-sm sm:text-base">
            Bạn chưa đăng công việc nào gần đây.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {visibleJobs.map((job) => (
              <Link
                key={job.postId}
                to={`/employer/jobs/${job.postId}`}
                className="block"
              >
                <Card className="p-3 sm:p-4 bg-white shadow-lg rounded-lg hover:shadow-xl active:shadow-md transition-transform transform hover:scale-105 active:scale-100">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Job Details */}
                      <div className="flex flex-col mr-3">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                          {job.title || "Không có tiêu đề"}
                        </h3>
                        <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>{job.location || "Không có địa điểm"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>{job.typeOfWork || "Không xác định"}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                          {renderIndustryNames(job.industryNames)}
                          <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-600 font-medium">
                            {job.salary
                              ? `${job.salary.toLocaleString("vi-VN")} VNĐ`
                              : "Thương lượng"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Application Count & Status */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{job.applicationCount || 0} ứng viên</span>
                      </div>
                      <span
                        className={`mt-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          job.approve
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {job.approve ? "Đã duyệt" : "Chờ duyệt"}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}