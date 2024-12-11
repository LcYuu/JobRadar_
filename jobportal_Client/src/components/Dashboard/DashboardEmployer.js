import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import {
  BarChart,
  Calendar,
  Users,
  Eye,
  MoreVertical,
  Pin,
  MapPin,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router-dom";
import {
  findEmployerCompany,
  getTop5Lastest,
} from "../../redux/JobPost/jobPost.action";
import { countReviewByCompany } from "../../redux/Review/review.action";
import { store } from "../../redux/store";

export default function Dashboard_Employer() {
  const dispatch = useDispatch();
  const [currentDateRange, setCurrentDateRange] = useState("Jul 19 - Jul 25");

  const [visibleJobs, setVisibleJobs] = useState([]); // Lưu công việc hiển thị (mặc định 5)
  const { jobs = [] } = useSelector((store) => store.jobPost);
  const { countReview } = useSelector((store) => store.review);
  const [totalApplicationCount, setTotalApplicationCount] = useState(0);

  // Stats data (replace with actual data from Redux)
  const stats = {
    newCandidates: 76,
    totalJobs: 12,
    totalViews: 2342,
    totalApplications: 654,
    viewsChange: "+6.4%",
    applicationsChange: "-0.5%",
  };

  useEffect(() => {
    dispatch(getTop5Lastest());
    dispatch(countReviewByCompany());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllJobs = async () => {
      const totalApplication = jobs.reduce(
        (sum, job) => sum + (job.applicationCount || 0),
        0
      );

      setTotalApplicationCount(totalApplication);
      setVisibleJobs(jobs.slice(0, 5));
    };

    fetchAllJobs();
  }, [dispatch, jobs]); // Lắng nghe changes của jobs và totalElements

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-purple-600">
          Chào mừng trở lại
        </h1>
        {/* <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentDateRange}</span>
          <Button variant="primary">+ Đăng bài</Button>
        </div> */}
      </div>

      <div
        className="p-6 rounded-lg mb-8 flex justify-between items-center"
        style={{
          background: "linear-gradient(to right, #2193b0, #6dd5ed)",
          color: "white",
        }}
      >
        <div>
          <h2 className="text-4xl font-bold mb-2 text-white">
            {countReview?.totalReviews ?? 0}
          </h2>
          <p className="text-indigo-100">Tổng số Review</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="p-6"
          style={{
            background: "linear-gradient(to right, #D1913C, #FFD194)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Số công việc đang tuyển</h3>
            <span className="text-3xl font-bold">
              {jobs.filter((job) => job.approve).length}
            </span>
          </div>
        </Card>

        <Card
          className="p-6"
          style={{
            background: "linear-gradient(to right, #c9d6ff, #e2e2e2)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Số lượng ứng tuyển</h3>
            <Users className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold mb-2">{totalApplicationCount}</div>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-purple-600">
            Các công việc đăng gần đây
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {visibleJobs.map((job) => (
            <Link
              key={job.postId}
              to={`/employer/jobs/${job.postId}`}
              className="block"
            >
              <Card className="p-4 bg-white shadow-lg rounded-lg hover:shadow-xl transition-transform transform hover:scale-105 group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {/* Job Details */}
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{job.typeOfWork}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600 font-medium">
                          {job.industryName}
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-600 font-medium">
                          {job.salary
                            ? `${job.salary.toLocaleString("vi-VN")} VNĐ`
                            : "Thương lượng"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Application Count & Status */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{job.applicationCount} ứng viên</span>
                    </div>
                    <span
                      className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
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
      </div>
    </div>
  );
}
