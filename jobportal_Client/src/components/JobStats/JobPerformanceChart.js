import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../ui/card';
import axios from 'axios';
import { API_URL } from '../../configs/constants';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { findEmployerCompany } from '../../redux/JobPost/jobPost.thunk';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-md shadow-md border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
        <div className="mt-2">
          <p className="text-blue-600">
            <span className="inline-block w-3 h-3 mr-2 bg-blue-600 rounded-sm"></span>
            Lượt xem: {payload[0].value}
          </p>
          <p className="text-green-600">
            <span className="inline-block w-3 h-3 mr-2 bg-green-600 rounded-sm"></span>
            Lượt ứng tuyển: {payload[1].value}
          </p>
          <p className="text-purple-600 font-medium">
            <span className="inline-block w-3 h-3 mr-2 bg-purple-600 rounded-sm"></span>
            Tỷ lệ chuyển đổi: {payload[2].value.toFixed(2)}%
          </p>
        </div>
      </div>
    );
  }

  return null;
};

const JobPerformanceChart = () => {
  const [jobPerformanceData, setJobPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs = [] } = useSelector((store) => store.jobPost);

  useEffect(() => {
    // Lấy dữ liệu từ Redux thông qua thunk
    dispatch(findEmployerCompany({
      status: '',
      typeOfWork: '',
      sortBy: 'createdate',
      sortDirection: 'desc',
      currentPage: 0,
      size: 100 // Lấy nhiều bài đăng để có dữ liệu đầy đủ
    }));
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        
        if (!token) {
          console.error("Token không tồn tại");
          setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
          setLoading(false);
          return;
        }
        
        console.log("Gửi request tới:", `${API_URL}/job-stats/job-performance`);
        
        // Đảm bảo token đúng định dạng
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        console.log("Using auth token:", authToken);
        
        const response = await axios.get(`${API_URL}/job-stats/job-performance`, {
          headers: {
            Authorization: authToken,
          },
        });
        
        console.log("Response data:", response.data);
        
        // Dữ liệu từ API lấy về
        const apiData = response.data;
        
        // Đảm bảo số lượng ứng tuyển khớp với dữ liệu từ Redux
        const syncedData = apiData.map(apiJob => {
          // Tìm job tương ứng trong danh sách jobs từ Redux
          const matchingJob = jobs.find(reduxJob => reduxJob.postId === apiJob.jobId);
          
          return {
            ...apiJob,
            // Nếu tìm thấy job từ Redux, sử dụng applicationCount từ đó, nếu không giữ nguyên
            applicationCount: matchingJob ? matchingJob.applicationCount : apiJob.applicationCount
          };
        });
        
        // Transform data for the chart
        const formattedData = syncedData.map((job, index) => ({
          name: job.jobTitle.length > 20 ? job.jobTitle.substring(0, 20) + '...' : job.jobTitle,
          "Lượt xem": job.viewCount,
          "Lượt ứng tuyển": job.applicationCount,
          "Tỷ lệ chuyển đổi": job.viewCount > 0 ? 
            ((job.applicationCount / job.viewCount) * 100) : 0,
          fullTitle: job.jobTitle,
          jobId: job.jobId,
          id: `job-${job.jobId}-${index}`,
        }));
        
        console.log("Formatted data:", formattedData);
        setJobPerformanceData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job performance data:', err);
        console.error('Error details:', err.response?.data || err.message);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/auth/sign-in');
        }
        
        setError(err.response?.data?.message || 'Không thể tải dữ liệu hiệu suất công việc');
        setLoading(false);
      }
    };

    if (jobs.length > 0) {
      fetchData();
    }
  }, [navigate, jobs]);

  if (loading) {
    return (
      <Card className="p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-purple-700 mb-6">Hiệu suất các bài đăng</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-purple-700 mb-6">Hiệu suất các bài đăng</h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (jobPerformanceData.length === 0) {
    return (
      <Card className="p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-purple-700 mb-6">Hiệu suất các bài đăng</h2>
        <div className="text-center text-gray-500 p-10">
          <p>Chưa có dữ liệu hiệu suất cho các bài đăng của bạn.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-purple-700 mb-6">Hiệu suất các bài đăng</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={jobPerformanceData}
            margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fontSize: 12 }} 
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Lượt xem" fill="#3b82f6" barSize={30} />
            <Bar dataKey="Lượt ứng tuyển" fill="#22c55e" barSize={30} />
            <Bar dataKey="Tỷ lệ chuyển đổi" fill="#a855f7" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-gray-600 text-sm">
        <p>* Tỷ lệ chuyển đổi = (Lượt ứng tuyển / Lượt xem) x 100%</p>
      </div>
    </Card>
  );
};

export default JobPerformanceChart; 