import React, { useState, useEffect } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { Users, Building2, FileText, TrendingUp, Calendar, Send } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getActiveJobs,
  getDailyStats,
  getTotalCompanies,
  getTotalJobs,
  getTotalUsers,
} from "../../../redux/Stats/stats.thunk";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    totalUsers,
    totalCompanies,
    totalJobs,
    activeJobs,
    dailyStats,
    loading,
    error,
  } = useSelector((state) => state.stats);
  const [chartDateRange, setChartDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });

  const [activePeriod, setActivePeriod] = useState("week");
  const [dateError, setDateError] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isTriggeringSurvey, setIsTriggeringSurvey] = useState(false);

  const handleChartDateChange = (e) => {
    const { name, value } = e.target;
    setChartDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
    setDateError("");
  };

  useEffect(() => {
    dispatch(getTotalUsers());
    dispatch(getTotalCompanies());
    dispatch(getTotalJobs());
    dispatch(getActiveJobs());
  }, [dispatch]);

  useEffect(() => {
    if (chartDateRange.startDate && chartDateRange.endDate) {
      const start = new Date(chartDateRange.startDate);
      const end = new Date(chartDateRange.endDate);
      const today = new Date();

      // Validate dates
      if (start > end) {
        setDateError("Ngày bắt đầu không thể sau ngày kết thúc");
        return;
      }

      if (end > today) {
        setDateError("Ngày kết thúc không thể sau ngày hiện tại");
        return;
      }

      setDateError("");
      dispatch(
        getDailyStats({
          startDate: chartDateRange.startDate,
          endDate: chartDateRange.endDate,
        })
      );
    }
  }, [dispatch, chartDateRange]);

  useEffect(() => {
    console.log("Received dailyStats:", dailyStats);
  }, [dailyStats]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = React.useMemo(() => {
    if (!dailyStats || !Array.isArray(dailyStats)) return [];

    // Determine sampling interval based on screen width
    const isMidRange = windowWidth >= 800 && windowWidth <= 1020;
    const isMobile = windowWidth < 800;
    let sampleInterval;

    if (isMobile) {
      sampleInterval = Math.ceil(dailyStats.length / 3); // ~3 points on mobile
    } else if (isMidRange) {
      // Linearly interpolate number of points between 1020px (~all points) and 800px (~4 points)
      const maxWidth = 1020;
      const minWidth = 800;
      const maxPoints = dailyStats.length;
      const minPoints = 4;
      const widthRatio = (windowWidth - minWidth) / (maxWidth - minWidth);
      const numPoints = Math.round(minPoints + (maxPoints - minPoints) * widthRatio);
      sampleInterval = Math.max(1, Math.ceil(dailyStats.length / numPoints));
    } else {
      sampleInterval = 1; // Show all points on larger screens
    }

    return dailyStats
      .filter((_, index) => index % sampleInterval === 0) // Sample data points
      .map((stat) => {
        try {
          if (!stat.date) return null;

          const date = new Date(stat.date);
          return {
            name: date.toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            }),
            fullDate: date.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            users: Number(stat.newUsers) || 0,
            jobs: Number(stat.newJobs) || 0,
          };
        } catch (error) {
          console.error("Error processing stat:", stat, error);
          return null;
        }
      })
      .filter(Boolean);
  }, [dailyStats, windowWidth]);

  const handlePeriodFilter = (period) => {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        break;
    }

    setActivePeriod(period);
    setChartDateRange({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  };

  // Dynamic font size and margin based on screen width
  const isMobile = windowWidth < 800;
  const isMidRange = windowWidth >= 800 && windowWidth <= 1020;
  const fontSize = isMobile ? 12 : isMidRange ? 12 : 14;
  const chartMargin = isMobile
    ? { top: 5, right: 15, left: 0, bottom: 5 }
    : isMidRange
    ? { top: 5, right: 10, left: -10, bottom: 5 }
    : { top: 5, right: 20, left: 0, bottom: 5 };
  const cardPadding = isMobile ? 'p-3 sm:p-4 md:p-6' : isMidRange ? 'p-2 sm:p-3' : 'p-3 sm:p-4 md:p-6';
  const titleFontSize = isMobile ? 'text-sm sm:text-base md:text-lg' : isMidRange ? 'text-sm' : 'text-base sm:text-lg md:text-xl';
  const chartHeight = isMobile ? 'h-56 sm:h-64 md:h-72 lg:h-80' : isMidRange ? 'h-52 sm:h-60' : 'h-56 sm:h-64 md:h-72 lg:h-80';

  const handleTriggerSurvey = async () => {
    try {
      setIsTriggeringSurvey(true);
      const response = await fetch('http://localhost:8080/surveys/trigger-survey-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Không thể kích hoạt gửi khảo sát');
      }
      
      await Swal.fire({
        title: 'Thành công!',
        text: 'Đã kích hoạt gửi khảo sát thành công',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        customClass: {
          popup: 'swal2-responsive',
          title: 'swal2-title-responsive',
          content: 'swal2-content-responsive',
          confirmButton: 'swal2-confirm-button-responsive'
        }
      });
    } catch (error) {
      await Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Có lỗi xảy ra khi kích hoạt gửi khảo sát',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'swal2-responsive',
          title: 'swal2-title-responsive',
          content: 'swal2-content-responsive',
          confirmButton: 'swal2-confirm-button-responsive'
        }
      });
    } finally {
      setIsTriggeringSurvey(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-white mt-8 px-2 sm:px-4 md:px-6">
      <div className="flex-1 space-y-4 md:space-y-6">
        <div className="flex justify-between items-center mt-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">Chào mừng trở lại</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Card className="p-3 sm:p-4 md:p-6 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng người dùng</p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-blue-700">
                  {totalUsers}
                </h3>
              </div>
              <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Tổng công ty</p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-purple-700">
                  {totalCompanies}
                </h3>
              </div>
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Tổng việc làm</p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-green-700">
                  {totalJobs}
                </h3>
              </div>
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Việc làm đang tuyển</p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-orange-700">
                  {activeJobs}
                </h3>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        <Card className={`${cardPadding} mt-4 md:mt-6 max-w-full overflow-hidden`}>
          <div className="space-y-4 md:space-y-6 mb-3 sm:mb-4 md:mb-6">
            <h2 className={`${titleFontSize} font-semibold`}>
              Thống kê người dùng và bài viết mới
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between md:gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={chartDateRange.startDate}
                  onChange={handleChartDateChange}
                  className="border rounded p-1 text-sm"
                />
                <span>-</span>
                <input
                  type="date"
                  name="endDate"
                  value={chartDateRange.endDate}
                  onChange={handleChartDateChange}
                  className="border rounded p-1 text-sm"
                />
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handlePeriodFilter("week")}
                  className={`px-3 py-1 rounded transition-colors text-sm ${
                    activePeriod === "week"
                      ? "bg-purple-100 text-purple-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => handlePeriodFilter("month")}
                  className={`px-3 py-1 rounded transition-colors text-sm ${
                    activePeriod === "month"
                      ? "bg-purple-100 text-purple-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => handlePeriodFilter("year")}
                  className={`px-3 py-1 rounded transition-colors text-sm ${
                    activePeriod === "year"
                      ? "bg-purple-100 text-purple-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Năm
                </button>
              </div>
            </div>
          </div>

          {dateError && (
            <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {dateError}
            </div>
          )}

          <div className={`${chartHeight} overflow-hidden`}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
              </div>
            )}

            {error && !dateError && (
              <div className="flex items-center justify-center h-full text-red-500 text-sm">
                {typeof error === "string"
                  ? error
                  : error.message || "Có lỗi xảy ra khi tải thống kê"}
              </div>
            )}

            {!loading && !error && !dateError && chartData.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Không có dữ liệu cho khoảng thời gian này
              </div>
            )}

            {!loading && !error && !dateError && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize, angle: isMidRange ? -45 : 0, textAnchor: isMidRange ? 'end' : 'middle' }}
                    tickFormatter={(value) => {
                      if (windowWidth <= 1020) {
                        const parts = value.split('/');
                        return parts.length === 3 ? `${parts[0]}/${parts[1]}` : value;
                      }
                      return value;
                    }}
                    height={isMidRange ? 50 : 30}
                    interval={isMidRange ? 0 : 'preserveStartEnd'}
                    tickCount={isMidRange ? 4 : 5}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize }}
                    width={isMobile ? 35 : isMidRange ? 30 : 40}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const labels = {
                        users: "Người dùng mới",
                        jobs: "Bài viết mới",
                      };
                      return [value, labels[name] || name];
                    }}
                    labelFormatter={(label, items) => {
                      if (items?.[0]?.payload?.fullDate) {
                        return items[0].payload.fullDate;
                      }
                      return label;
                    }}
                    contentStyle={{ fontSize }}
                  />
                  <Legend
                    iconSize={isMobile ? 10 : isMidRange ? 10 : 12}
                    wrapperStyle={{
                      fontSize,
                      paddingTop: '5px',
                      marginBottom: isMobile ? '-5px' : isMidRange ? '-5px' : '0px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name="Người dùng mới"
                    stroke="#818cf8"
                    strokeWidth={isMobile ? 2 : isMidRange ? 1.5 : 2}
                    dot={false}
                    activeDot={{ r: isMobile ? 4 : isMidRange ? 3 : 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    name="Bài viết mới"
                    stroke="#34d399"
                    strokeWidth={isMobile ? 2 : isMidRange ? 1.5 : 2}
                    dot={false}
                    activeDot={{ r: isMobile ? 4 : isMidRange ? 3 : 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={() => navigate("/admin/survey-statistics")}
            className="w-full sm:w-auto text-sm"
          >
            Xem Thống Kê Khảo Sát
          </Button>
          
          <Button
            onClick={handleTriggerSurvey}
            disabled={isTriggeringSurvey}
            className="w-full sm:w-auto text-sm bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isTriggeringSurvey ? 'Đang xử lý...' : 'Kích hoạt gửi khảo sát'}
          </Button>
        </div>
      </div>
    </div>
  );
}