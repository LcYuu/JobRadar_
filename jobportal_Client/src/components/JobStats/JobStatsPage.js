import React, { useState, useEffect } from "react";
import JobPerformanceChart from "./JobPerformanceChart";
import BestPerformingJobs from "./BestPerformingJobs";
import { Card } from "../../ui/card";
import axios from "axios";
import { API_URL } from "../../configs/constants";
import { Spinner } from "../../ui/spinner";
import { useDispatch, useSelector } from "react-redux";
import { getTop5Lastest } from "../../redux/JobPost/jobPost.thunk";

const JobStatsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewStats, setViewStats] = useState({
    totalViews: 0,
    totalJobs: 0,
    bestPerformingJob: null,
    viewsByDate: [],
  });
  const [totalApplicationCount, setTotalApplicationCount] = useState(0);
  const { jobs = [] } = useSelector((store) => store.jobPost);

  useEffect(() => {
    dispatch(getTop5Lastest());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllJobs = async () => {
      if (jobs && jobs.length > 0) {
        const totalApplication = jobs.reduce(
          (sum, job) => sum + (job.applicationCount || 0),
          0
        );
        setTotalApplicationCount(totalApplication);
      }
    };

    fetchAllJobs();
  }, [jobs]);

  useEffect(() => {
    const fetchViewStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("jwt");

        if (!token) {
          throw new Error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
        }

        const authToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        // Lấy thống kê hiệu suất bài đăng
        const viewStatsResponse = await axios.get(
          `${API_URL}/job-stats/view-stats`,
          {
            headers: { Authorization: authToken },
          }
        );

        // Lấy bài đăng hiệu suất tốt nhất
        const bestJobsResponse = await axios.get(
          `${API_URL}/job-stats/best-performing-jobs`,
          {
            headers: { Authorization: authToken },
          }
        );

        setViewStats({
          totalViews: viewStatsResponse.data.totalViews || 0,
          totalJobs: viewStatsResponse.data.totalJobs || 0,
          avgViewsPerJob: viewStatsResponse.data.avgViewsPerJob || 0,
          bestPerformingJob: bestJobsResponse.data[0] || null,
          viewsByDate: viewStatsResponse.data.viewsByDate || [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy thống kê lượt xem:", err);
        setError(`Không thể tải dữ liệu thống kê. ${err.message}`);
        setLoading(false);
      }
    };

    fetchViewStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Spinner className="h-10 w-10 text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-8">
        Thống kê hiệu suất tuyển dụng
      </h1>

      {/* Card thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-md bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng lượt xem
          </h2>
          <p className="text-3xl font-bold text-purple-600">
            {viewStats.totalViews}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số lượt xem tất cả bài đăng
          </p>
        </Card>

        <Card className="p-6 shadow-md bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng bài đăng
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            {viewStats.totalJobs}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Số lượng bài đăng của bạn
          </p>
        </Card>

        <Card className="p-6 shadow-md bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng lượt ứng tuyển
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {totalApplicationCount}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số lượt ứng tuyển tất cả bài đăng
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6 mb-8">
        <div className="2xl:col-span-2">
          <JobPerformanceChart />
        </div>
        <div>
          <BestPerformingJobs />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 mb-8">
        <h2 className="font-semibold mb-2">
          Làm thế nào để cải thiện hiệu suất bài đăng?
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sử dụng tiêu đề hấp dẫn và rõ ràng</li>
          <li>Mô tả công việc chi tiết và hấp dẫn</li>
          <li>Liệt kê đầy đủ yêu cầu và quyền lợi</li>
          <li>Đăng mức lương cạnh tranh</li>
          <li>Sử dụng các từ khóa phù hợp với ngành nghề</li>
        </ul>
      </div>
    </div>
  );
};

export default JobStatsPage;