import React, { useState, useEffect } from 'react';
import { Card } from "../../../ui/card";
import { useDispatch, useSelector } from 'react-redux';
import { Users, Building2, FileText, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTotalUsers, getTotalCompanies, getTotalJobs, getActiveJobs, getDailyStats } from '../../../redux/Stats/stats.action';
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { totalUsers, totalCompanies, totalJobs, activeJobs, dailyStats } = useSelector((state) => state.stats);
  const [chartDateRange, setChartDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  });

  const [activePeriod, setActivePeriod] = useState('week');

  const handleChartDateChange = (e) => {
    const { name, value } = e.target;
    setChartDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  useEffect(() => {
    dispatch(getTotalUsers());
    dispatch(getTotalCompanies());
    dispatch(getTotalJobs());
    dispatch(getActiveJobs());
  }, [dispatch]);

  useEffect(() => {
    if (chartDateRange.startDate && chartDateRange.endDate) {
      dispatch(getDailyStats(chartDateRange.startDate, chartDateRange.endDate));
    }
  }, [dispatch, chartDateRange.startDate, chartDateRange.endDate]);

  const chartData = React.useMemo(() => {
    if (!dailyStats || !Array.isArray(dailyStats)) {
      return [];
    }
    
    return dailyStats.map(stat => {
      const date = new Date(stat.date);
      return {
        name: date.toLocaleDateString('vi-VN', { 
          month: 'numeric',
          day: 'numeric'
        }),
        fullDate: date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        }),
        users: stat.newUsers || 0,
        jobs: stat.newJobs || 0
      };
    });
  }, [dailyStats]);

  const handlePeriodFilter = (period) => {
    const end = new Date();
    const start = new Date();
    
    switch(period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        break;
    }
    
    setActivePeriod(period);
    setChartDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-white -ml-8">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Chào mừng trở lại</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng người dùng</p>
                <h3 className="text-2xl font-bold mt-2 text-blue-700">{totalUsers}</h3>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Tổng công ty</p>
                <h3 className="text-2xl font-bold mt-2 text-purple-700">{totalCompanies}</h3>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Tổng việc làm</p>
                <h3 className="text-2xl font-bold mt-2 text-green-700">{totalJobs}</h3>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Việc làm đang tuyển</p>
                <h3 className="text-2xl font-bold mt-2 text-orange-700">{activeJobs}</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Thống kê hoạt động</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  name="startDate"
                  value={chartDateRange.startDate}
                  onChange={handleChartDateChange}
                  className="border-none focus:outline-none"
                />
                <span>-</span>
                <input
                  type="date"
                  name="endDate"
                  value={chartDateRange.endDate}
                  onChange={handleChartDateChange}
                  className="border-none focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePeriodFilter('week')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activePeriod === 'week' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'hover:bg-gray-100'
                  }`}>
                  Tuần
                </button>
                <button 
                  onClick={() => handlePeriodFilter('month')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activePeriod === 'month' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'hover:bg-gray-100'
                  }`}>
                  Tháng
                </button>
                <button 
                  onClick={() => handlePeriodFilter('year')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activePeriod === 'year' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'hover:bg-gray-100'
                  }`}>
                  Năm
                </button>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    const labels = {
                      'Người dùng mới': 'Người dùng mới',
                      'Bài viết mới': 'Bài viết mới'
                    };
                    return [value, labels[name]];
                  }}
                  labelFormatter={(label, items) => {
                    if (items && items[0] && items[0].payload) {
                      return items[0].payload.fullDate;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Bar dataKey="users" name="Người dùng mới" fill="#818cf8" />
                <Bar dataKey="jobs" name="Bài viết mới" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
} 