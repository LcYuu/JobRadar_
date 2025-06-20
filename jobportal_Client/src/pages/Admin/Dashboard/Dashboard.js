import React, { useState, useEffect } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { Users, Building2, FileText, TrendingUp, Calendar, Send, Eye, Activity, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
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
  getGrowthStats,
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
    growthStats,
    loading,
    error,
  } = useSelector((state) => state.stats);
  
  // Khởi tạo với tuần hiện tại
  const [chartDateRange, setChartDateRange] = useState(() => {
    const today = new Date();
    // Tính thứ 2 của tuần hiện tại
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là CN thì lùi 6 ngày, không thì tính từ thứ 2
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      startDate: monday.toISOString().split("T")[0],
      endDate: sunday.toISOString().split("T")[0],
    };
  });

  const [activePeriod, setActivePeriod] = useState("week");
  const [dateError, setDateError] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isTriggeringSurvey, setIsTriggeringSurvey] = useState(false);
  const [summaryStats, setSummaryStats] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const handleChartDateChange = (e) => {
    const { name, value } = e.target;
    setChartDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
    setDateError("");
    // Reset activePeriod khi người dùng chọn ngày thủ công
    setActivePeriod("custom");
  };

  useEffect(() => {
    dispatch(getTotalUsers());
    dispatch(getTotalCompanies());
    dispatch(getTotalJobs());
    dispatch(getActiveJobs());
    dispatch(getGrowthStats());
  }, [dispatch]);

  useEffect(() => {
    if (chartDateRange.startDate && chartDateRange.endDate) {
      const start = new Date(chartDateRange.startDate);
      const end = new Date(chartDateRange.endDate);
      const today = new Date();

      if (start > end) {
        setDateError("Ngày bắt đầu không thể sau ngày kết thúc");
        return;
      }

      if (end > today) {
        setDateError("Ngày kết thúc không thể sau ngày hiện tại");
        return;
      }

      setDateError("");
      console.log("Fetching stats for period:", activePeriod, "Range:", chartDateRange);
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

  // Safe access to growthStats with default values
  const safeGrowthStats = {
    userGrowth: growthStats?.userGrowth || 0,
    companyGrowth: growthStats?.companyGrowth || 0,
    jobGrowth: growthStats?.jobGrowth || 0,
    activeJobGrowth: growthStats?.activeJobGrowth || 0
  };

  // Hàm tính toán khoảng thời gian dựa trên ngày hiện tại
  const calculateDateRange = (period) => {
    const today = new Date();
    let start, end;

    switch (period) {
      case "week":
        // Tính tuần hiện tại (Thứ 2 - Chủ nhật)
        const dayOfWeek = today.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        start = new Date(today);
        start.setDate(today.getDate() + daysToMonday);
        
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;

      case "month":
        // Tính tháng hiện tại (ngày 1 - ngày cuối tháng)
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối tháng
        break;

      case "year":
        // Tính năm hiện tại (1/1 - 31/12)
        start = new Date(today.getFullYear(), 0, 1); // 1/1
        end = new Date(today.getFullYear(), 11, 31); // 31/12
        break;

      default:
        return null;
    }

    // Đảm bảo không vượt quá ngày hiện tại
    if (end > today) {
      end = new Date(today);
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  // CẢI THIỆN chartData processing để hiển thị tất cả các ngày cho tháng và năm
  const chartData = React.useMemo(() => {
    if (!dailyStats || !Array.isArray(dailyStats)) return [];

    // Tính khoảng thời gian để quyết định cách hiển thị
    const start = new Date(chartDateRange.startDate);
    const end = new Date(chartDateRange.endDate);
    const diffInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    let sampleInterval = 1;
    let shouldShowAllDays = false;

    // Logic mới: hiển thị tất cả ngày cho tháng và năm
    if (activePeriod === "month" || activePeriod === "year") {
      shouldShowAllDays = true;
      sampleInterval = 1; // Hiển thị tất cả các ngày
    } else if (activePeriod === "week") {
      shouldShowAllDays = true; // Hiển thị tất cả 7 ngày trong tuần
      sampleInterval = 1;
    } else {
      // Chỉ áp dụng sampling cho custom range
      const isMidRange = windowWidth >= 800 && windowWidth <= 1020;
      const isMobile = windowWidth < 800;

      if (isMobile && diffInDays > 7) {
        sampleInterval = Math.ceil(dailyStats.length / 5); // 5 points on mobile
      } else if (isMidRange && diffInDays > 14) {
        sampleInterval = Math.ceil(dailyStats.length / 8); // 8 points on mid-range
      } else if (diffInDays <= 7) {
        sampleInterval = 1; // Show all points for week or less
      }
    }

    console.log("Chart processing:", {
      activePeriod,
      diffInDays,
      shouldShowAllDays,
      sampleInterval,
      dataLength: dailyStats.length
    });

    return dailyStats
      .filter((_, index) => shouldShowAllDays || index % sampleInterval === 0)
      .map((stat) => {
        try {
          if (!stat.date) return null;

          const date = new Date(stat.date);
          
          // Format ngày tùy thuộc vào khoảng thời gian
          let nameFormat;
          if (activePeriod === "year" || diffInDays > 365) {
            // Cho năm: hiển thị tháng/năm
            nameFormat = date.toLocaleDateString("vi-VN", {
              month: "2-digit",
              year: "2-digit",
            });
          } else if (activePeriod === "month" || diffInDays > 30) {
            // Cho tháng: hiển thị ngày/tháng
            nameFormat = date.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            });
          } else {
            // Cho tuần: hiển thị thứ + ngày/tháng
            const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            const dayName = weekdays[date.getDay()];
            const dateStr = date.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            });
            nameFormat = `${dayName}\n${dateStr}`;
          }

          return {
            name: nameFormat,
            fullDate: date.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            users: Number(stat.newUsers) || 0,
            jobs: Number(stat.newJobs) || 0,
            companies: Number(stat.newCompanies) || 0,
            originalDate: stat.date,
          };
        } catch (error) {
          console.error("Error processing stat:", stat, error);
          return null;
        }
      })
      .filter(Boolean);
  }, [dailyStats, windowWidth, chartDateRange, activePeriod]);

  const handlePeriodFilter = (period) => {
    const dateRange = calculateDateRange(period);
    if (!dateRange) return;

    console.log("Period filter:", period, "Calculated range:", dateRange);
    
    setActivePeriod(period);
    setChartDateRange(dateRange);
  };

  // Dynamic font size and margin based on screen width and data amount
  const isMobile = windowWidth < 800;
  const isMidRange = windowWidth >= 800 && windowWidth <= 1020;
  
  // Điều chỉnh fontSize dựa trên số lượng data points
  let fontSize = 12;
  if (chartData.length > 30) {
    fontSize = isMobile ? 8 : 10;
  } else if (chartData.length > 15) {
    fontSize = isMobile ? 10 : 11;
  }

  const chartMargin = isMobile
    ? { top: 20, right: 20, left: 10, bottom: 80 }
    : isMidRange
    ? { top: 20, right: 20, left: 10, bottom: 70 }
    : { top: 20, right: 30, left: 20, bottom: 60 };

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
        confirmButtonColor: '#10b981',
      });
    } catch (error) {
      await Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Có lỗi xảy ra khi kích hoạt gửi khảo sát',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsTriggeringSurvey(false);
    }
  };

  // Format growth percentage with sign
  const formatGrowthPercentage = (value) => {
    const numValue = Number(value) || 0;
    if (numValue > 0) return `+${numValue}%`;
    if (numValue < 0) return `${numValue}%`;
    return `${numValue}%`;
  };

  // Determine if we should angle the X-axis labels
  const shouldAngleLabels = chartData.length > 10 || (activePeriod !== "week" && windowWidth < 1200);

  // Tạo label cho period buttons với thông tin chi tiết
  const getPeriodLabel = (period) => {
    const today = new Date();
    switch (period) {
      case "week":
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + daysToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return {
          label: "Tuần này",
          detail: `${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}`
        };
      case "month":
        return {
          label: "Tháng này",
          detail: `Tháng ${today.getMonth() + 1}/${today.getFullYear()}`
        };
      case "year":
        return {
          label: "Năm này",
          detail: `Năm ${today.getFullYear()}`
        };
      default:
        return { label: period, detail: "" };
    }
  };

  useEffect(() => {
    setSummaryLoading(true);
    fetch("http://localhost:8080/stats/summary")
      .then((res) => res.json())
      .then((data) => {
        setSummaryStats(data);
        setSummaryLoading(false);
      })
      .catch((err) => {
        setSummaryError("Không thể tải thống kê tổng hợp");
        setSummaryLoading(false);
      });
  }, []);

  // Helper để render card tổng hợp
  const renderSummaryCard = (title, icon, color, stats) => {
    if (!stats) return null;
    const { currentMonth, previousMonth, monthGrowth, currentYear, previousYear, yearGrowth } = stats;
    const growthIcon = (growth) => {
      if (growth == null) return null;
      if (growth > 0) return <TrendingUp className="inline w-4 h-4 text-green-500 ml-1" />;
      if (growth < 0) return <TrendingDown className="inline w-4 h-4 text-red-500 ml-1" />;
      return null;
    };
    const formatGrowth = (growth) => {
      if (growth == null) return "-";
      return `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
    };
    return (
      <Card className={`shadow-lg border-0 bg-white flex-1 min-w-[260px]`}>
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className="text-sm text-gray-500">Tháng này: <span className="font-bold text-blue-600">{currentMonth}</span> <span className="ml-2 text-xs">({formatGrowth(monthGrowth)}) {growthIcon(monthGrowth)}</span></div>
            <div className="text-sm text-gray-500">Tháng trước: <span className="font-bold">{previousMonth}</span></div>
            <div className="text-sm text-gray-500 mt-2">Năm nay: <span className="font-bold text-green-600">{currentYear}</span> <span className="ml-2 text-xs">({formatGrowth(yearGrowth)}) {growthIcon(yearGrowth)}</span></div>
            <div className="text-sm text-gray-500">Năm trước: <span className="font-bold">{previousYear}</span></div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Quản Trị</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Chào mừng trở lại! Theo dõi hoạt động của hệ thống
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 text-sm text-gray-500">
              Cập nhật: {new Date().toLocaleDateString("vi-VN")}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          {summaryLoading ? (
            <div className="flex justify-center items-center py-8"><span className="text-gray-500">Đang tải thống kê tổng hợp...</span></div>
          ) : summaryError ? (
            <div className="flex justify-center items-center py-8"><span className="text-red-500">{summaryError}</span></div>
          ) : summaryStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {renderSummaryCard("Người dùng", <Users className="w-6 h-6 text-blue-600" />, "bg-blue-100", summaryStats.users)}
              {renderSummaryCard("Bài viết", <FileText className="w-6 h-6 text-green-600" />, "bg-green-100", summaryStats.jobs)}
              {renderSummaryCard("Công ty mới", <Building2 className="w-6 h-6 text-purple-600" />, "bg-purple-100", summaryStats.companies)}
            </div>
          ) : null}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-blue-100 text-sm font-medium">Tổng người dùng</p>
                  <h3 className="text-3xl font-bold mt-2">{totalUsers || 0}</h3>
                  <div className="flex items-center mt-3 text-blue-100">
                    {/* <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {formatGrowthPercentage(safeGrowthStats.userGrowth)} từ tháng trước
                    </span> */}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Total Companies Card */}
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-100 text-sm font-medium">Tổng công ty</p>
                  <h3 className="text-3xl font-bold mt-2">{totalCompanies || 0}</h3>
                  <div className="flex items-center mt-3 text-purple-100">
                    {/* <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {formatGrowthPercentage(safeGrowthStats.companyGrowth)} từ tháng trước
                    </span> */}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Total Jobs Card */}
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-green-100 text-sm font-medium">Tổng việc làm</p>
                  <h3 className="text-3xl font-bold mt-2">{totalJobs || 0}</h3>
                  <div className="flex items-center mt-3 text-green-100">
                    {/* <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {formatGrowthPercentage(safeGrowthStats.jobGrowth)} từ tháng trước
                    </span> */}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Jobs Card */}
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-orange-100 text-sm font-medium">Việc làm đang tuyển</p>
                  <h3 className="text-3xl font-bold mt-2">{activeJobs || 0}</h3>
                  <div className="flex items-center mt-3 text-orange-100">
                    {/* <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {formatGrowthPercentage(safeGrowthStats.activeJobGrowth)} từ tháng trước
                    </span> */}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="shadow-lg border-0 bg-white">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Thống kê người dùng và bài viết mới
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Theo dõi xu hướng tăng trưởng theo thời gian
                  {chartData.length > 0 && (
                    <span className="ml-2 font-medium text-blue-600">
                      ({chartData.length} điểm dữ liệu)
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Date Range Picker */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    name="startDate"
                    value={chartDateRange.startDate}
                    onChange={handleChartDateChange}
                    className="border-0 bg-transparent text-sm focus:outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    name="endDate"
                    value={chartDateRange.endDate}
                    onChange={handleChartDateChange}
                    className="border-0 bg-transparent text-sm focus:outline-none"
                  />
                </div>

                {/* Period Buttons với thông tin chi tiết */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {["week", "month", "year"].map((period) => {
                    const periodInfo = getPeriodLabel(period);
                    return (
                      <button
                        key={period}
                        onClick={() => handlePeriodFilter(period)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex flex-col items-center ${
                          activePeriod === period
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white"
                        }`}
                        title={periodInfo.detail}
                      >
                        <span>{periodInfo.label}</span>
                        {periodInfo.detail && (
                          <span className={`text-xs mt-1 ${
                            activePeriod === period ? "text-blue-100" : "text-gray-400"
                          }`}>
                            {periodInfo.detail}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {dateError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{dateError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="h-80">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-500">Đang tải dữ liệu...</p>
                  </div>
                </div>
              )}

              {error && !dateError && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Lỗi tải dữ liệu</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {typeof error === "string" ? error : error.message || "Có lỗi xảy ra khi tải thống kê"}
                    </p>
                  </div>
                </div>
              )}

              {!loading && !error && !dateError && chartData.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dữ liệu</h3>
                    <p className="mt-1 text-sm text-gray-500">Không có dữ liệu cho khoảng thời gian này</p>
                  </div>
                </div>
              )}

              {/* AreaChart với logic mới */}
              {!loading && !error && !dateError && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={chartMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: fontSize, fill: '#64748b' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      angle={shouldAngleLabels ? -45 : 0}
                      textAnchor={shouldAngleLabels ? "end" : "middle"}
                      height={shouldAngleLabels ? 80 : 60}
                      interval={chartData.length > 30 ? Math.ceil(chartData.length / 15) : 0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: fontSize, fill: '#64748b' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                      formatter={(value, name) => {
                        const labels = {
                          users: "Người dùng mới",
                          jobs: "Bài viết mới",
                          companies: "Công ty mới",
                        };
                        return [value, labels[name] || name];
                      }}
                      labelFormatter={(label, items) => {
                        if (items?.[0]?.payload?.fullDate) {
                          return items[0].payload.fullDate;
                        }
                        return label;
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: '14px',
                        paddingTop: '20px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="Người dùng mới"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="jobs"
                      name="Bài viết mới"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="companies"
                      name="Công ty mới"
                      stroke="#F59E42"
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/admin/survey-statistics")}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Xem Thống Kê Khảo Sát
          </Button>
          
          <Button
            onClick={handleTriggerSurvey}
            disabled={isTriggeringSurvey}
            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {isTriggeringSurvey ? 'Đang xử lý...' : 'Kích hoạt gửi khảo sát'}
          </Button>
        </div>
      </div>
    </div>
  );
}