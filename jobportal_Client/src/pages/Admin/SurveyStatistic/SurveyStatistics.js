import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSurveyStatistics } from "../../../redux/Survey/survey.action";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F"];

const SurveyStatistics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { statistics, loading } = useSelector((state) => state.survey);

  useEffect(() => {
    dispatch(getSurveyStatistics());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  const surveyCompletionData = [
    { name: "Đã hoàn thành", value: statistics?.completedSurveys },
    { name: "Chưa hoàn thành", value: statistics?.pendingSurveys },
  ];

  const qualityDistributionData = Object.entries(
    statistics?.candidateQualityDistribution || {}
  ).map(([rating, count]) => ({
    rating: `⭐ ${rating}`,
    count,
  }));

  const calculateResponseTime = (sentAt, submittedAt) => {
    const sent = new Date(sentAt);
    const submitted = new Date(submittedAt);
    const diffMinutes = Math.abs(submitted - sent) / 60000;

    // Format time display
    const formatTime = (mins) => {
      const hours = Math.floor(mins / 60);
      const minutes = Math.round(mins % 60);
      if (hours === 0) return `${minutes} phút`;
      if (minutes === 0) return `${hours} giờ`;
      return `${hours} giờ ${minutes} phút`;
    };

    // Determine response category and color
    let result = {
      duration: formatTime(diffMinutes),
    };

    if (diffMinutes < 30) {
      result = {
        ...result,
        text: "Phản hồi rất nhanh",
        color: "text-green-600",
      };
    } else if (diffMinutes < 120) {
      // 2 giờ
      result = {
        ...result,
        text: "Phản hồi nhanh",
        color: "text-blue-600",
      };
    } else if (diffMinutes < 360) {
      // 6 giờ
      result = {
        ...result,
        text: "Phản hồi trung bình",
        color: "text-yellow-600",
      };
    } else {
      result = {
        ...result,
        text: "Phản hồi chậm",
        color: "text-red-600",
      };
    }

    return result;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-6 hover:bg-gray-100"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Trở lại danh sách</span>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Thống kê khảo sát</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-gray-50 shadow-lg rounded-lg">
          <h3 className="text-gray-600">Tổng số khảo sát</h3>
          <p className="text-2xl font-bold">{statistics?.totalSurveys}</p>
        </Card>
        <Card className="p-4 bg-gray-50 shadow-lg rounded-lg">
          <h3 className="text-gray-600">Đã hoàn thành</h3>
          <p className="text-2xl font-bold">{statistics?.completedSurveys}</p>
        </Card>
        <Card className="p-4 bg-gray-50 shadow-lg rounded-lg">
          <h3 className="text-gray-600">Chưa hoàn thành</h3>
          <p className="text-2xl font-bold">{statistics?.pendingSurveys}</p>
        </Card>
        <Card className="p-4 bg-gray-50 shadow-lg rounded-lg">
          <h3 className="text-gray-600">Trung bình ứng viên được tuyển</h3>
          <p className="text-2xl font-bold">
            {statistics?.averageHiredCount?.toFixed(1)}
          </p>
        </Card>
      </div>

      <Card className="p-6 mb-8 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4">Thống kê theo công ty</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full shadow-md rounded-lg">
            <thead>
              <tr className="bg-purple-600">
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Tên công ty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Số khảo sát
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Đã hoàn thành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Tổng số tuyển dụng
                </th>
              </tr>
            </thead>
            <tbody>
              {statistics?.companySurveys?.map((company, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {company.totalSurveys}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {company.completedSurveys}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {company.totalHired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 mb-8 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4">Tỷ lệ khảo sát đã hoàn thành</h2>
        <PieChart width={400} height={300} className="shadow-md rounded-lg">
          <Pie
            data={surveyCompletionData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {surveyCompletionData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Card>

      <Card className="p-6 mb-8 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4">Phân bố chất lượng ứng viên</h2>
        <BarChart width={500} height={300} data={qualityDistributionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rating" />
          <YAxis />
          <Tooltip />
          <Legend formatter={() => "Số lượng"} />{" "}
          {/* Thay đổi tên hiển thị của Legend */}
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </Card>

      <Card className="p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4">Feedback gần đây</h2>
        <div className="space-y-4">
          {statistics?.recentFeedback?.length === 0 ? (
            <div className="text-center text-gray-500">
              Chưa có feedback nào
            </div>
          ) : (
            statistics?.recentFeedback?.map((feedback, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="font-semibold">{feedback.companyName}</div>
                <div className="text-gray-600">{feedback.jobTitle}</div>
                <div className="text-yellow-500 mt-1">
                  {Array(feedback.candidateQuality).fill("⭐").join("")}
                </div>
                <div className="text-gray-600 mt-1">{feedback.feedback}</div>
                <div className="text-sm text-gray-500 mt-2">
                  <div>
                    Gửi lúc:{" "}
                    {new Date(feedback.sentAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div>
                    Phản hồi lúc:{" "}
                    {new Date(feedback.submittedAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  {feedback.sentAt && feedback.submittedAt && (
                    <div className="flex items-center mt-2">
                      <div
                        className={`${
                          calculateResponseTime(
                            feedback.sentAt,
                            feedback.submittedAt
                          ).color
                        } font-medium`}
                      >
                        {
                          calculateResponseTime(
                            feedback.sentAt,
                            feedback.submittedAt
                          ).text
                        }
                      </div>
                      <div className="ml-2 text-gray-500">
                        (
                        {
                          calculateResponseTime(
                            feedback.sentAt,
                            feedback.submittedAt
                          ).duration
                        }
                        )
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default SurveyStatistics;
