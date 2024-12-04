import React, { useState, useEffect } from 'react';
import { Card } from "../../../ui/card";
import { Button } from '../../../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Building2, FileText, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTotalUsers, getTotalCompanies, getTotalJobs, getActiveJobs, getDailyStats } from '../../../redux/Stats/stats.action';
import { 
  GET_DAILY_STATS_FAILURE,
  GET_DAILY_STATS_REQUEST,
  GET_DAILY_STATS_SUCCESS 
} from '../../../redux/Stats/stats.actionType';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalUsers, totalCompanies, totalJobs, activeJobs, dailyStats, loading, error } = useSelector((state) => state.stats);
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
  const [dateError, setDateError] = useState('');
  const [isMounted, setIsMounted] = useState(true);

  const handleChartDateChange = (e) => {
    const { name, value } = e.target;
    setChartDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    setDateError('');
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
        setDateError('Ngày bắt đầu không thể sau ngày kết thúc');
        return;
      }

      if (end > today) {
        setDateError('Ngày kết thúc không thể sau ngày hiện tại');
        return;
      }

      setDateError('');
      dispatch(getDailyStats(chartDateRange.startDate, chartDateRange.endDate));
    }
  }, [dispatch, chartDateRange]);

  useEffect(() => {
    console.log('Received dailyStats:', dailyStats);
  }, [dailyStats]);

  const chartData = React.useMemo(() => {
    if (!dailyStats || !Array.isArray(dailyStats)) return [];
    
    return dailyStats.map(stat => {
        try {
            if (!stat.date) return null;

            const date = new Date(stat.date);
            return {
                name: date.toLocaleDateString('vi-VN', { 
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                }),
                fullDate: date.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                users: Number(stat.newUsers) || 0,
                jobs: Number(stat.newJobs) || 0
            };
        } catch (error) {
            console.error('Error processing stat:', stat, error);
            return null;
        }
    }).filter(Boolean);
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
    <div className="min-h-screen flex flex-col pb-20 bg-white mt-8">
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

        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Thống kê người dùng và bài viết mới</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  name="startDate"
                  value={chartDateRange.startDate}
                  onChange={handleChartDateChange}
                  className="border rounded p-1"
                />
                <span>-</span>
                <input
                  type="date"
                  name="endDate"
                  value={chartDateRange.endDate}
                  onChange={handleChartDateChange}
                  className="border rounded p-1"
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

          {dateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
              {dateError}
            </div>
          )}

          <div className="h-[300px]">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
            
            {error && !dateError && (
              <div className="flex items-center justify-center h-full text-red-500">
                {typeof error === 'string' ? error : error.message || 'Có lỗi xảy ra khi tải thống kê'}
              </div>
            )}
            
            {!loading && !error && !dateError && chartData.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Không có dữ liệu cho khoảng thời gian này
              </div>
            )}
            
            {!loading && !error && !dateError && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value, name) => {
                      const labels = {
                        'users': 'Người dùng mới',
                        'jobs': 'Bài viết mới'
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
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Người dùng mới" 
                    stroke="#818cf8" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="jobs" 
                    name="Bài viết mới" 
                    stroke="#34d399" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Button onClick={() => navigate('/admin/survey-statistics')} className="mt-4">
          Xem Thống Kê Khảo Sát
        </Button>
      </div>
    </div>
  );
} 