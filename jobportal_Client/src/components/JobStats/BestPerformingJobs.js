import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Users, Eye, TrendingUp, ChevronsRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../configs/constants';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { findEmployerCompany } from '../../redux/JobPost/jobPost.thunk';

const BestPerformingJobs = () => {
  const [bestJobs, setBestJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs } = useSelector((store) => store.jobPost);

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
          console.error("BestPerformingJobs - Token không tồn tại");
          setError("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
          setLoading(false);
          return;
        }
        
        console.log("BestPerformingJobs - Sending request to:", `${API_URL}/job-stats/best-performing-jobs`);
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        console.log("BestPerformingJobs - Using auth token:", authToken);
        const response = await axios.get(`${API_URL}/job-stats/best-performing-jobs`, {
          headers: {
            Authorization: authToken,
          },
        });
        
        console.log("BestPerformingJobs - Response data:", response.data);
        
        // Đảm bảo số lượng ứng tuyển khớp với dữ liệu từ Redux
        const syncedData = response.data.map(apiJob => {
          // Tìm job tương ứng trong danh sách jobs từ Redux
          const matchingJob = jobs?.find(reduxJob => reduxJob.postId === apiJob.jobId);
          
          return {
            ...apiJob,
            // Nếu tìm thấy job từ Redux, sử dụng applicationCount từ đó, nếu không giữ nguyên
            applicationCount: matchingJob ? matchingJob.applicationCount : apiJob.applicationCount,
            // Cập nhật tỷ lệ chuyển đổi dựa trên applicationCount mới
            conversionRate: matchingJob && apiJob.viewCount > 0 ? 
              ((matchingJob.applicationCount / apiJob.viewCount) * 100).toFixed(2) : 
              apiJob.conversionRate
          };
        });
        
        setBestJobs(syncedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching best performing jobs:', err);
        console.error('Error details:', err.response?.data || err.message);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/auth/sign-in');
        }
        
        setError('Không thể tải dữ liệu về công việc có hiệu suất tốt nhất. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    if (jobs && jobs.length > 0) {
      fetchData();
    }
  }, [navigate, dispatch, jobs]);

  if (loading) {
    return (
      <Card className="p-6 shadow-lg bg-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">Bài đăng có hiệu suất tốt nhất</h2>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 shadow-lg bg-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">Bài đăng có hiệu suất tốt nhất</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (bestJobs.length === 0) {
    return (
      <Card className="p-6 shadow-lg bg-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">Bài đăng có hiệu suất tốt nhất</h2>
        <div className="flex justify-center items-center h-48 text-gray-500">
          <p>Chưa có dữ liệu về hiệu suất bài đăng.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-700">Bài đăng có hiệu suất tốt nhất</h2>
      </div>
      
      <div className="space-y-4">
        {bestJobs.map((job, index) => (
          <Link to={`/employer/jobs/${job.jobId}`} key={job.jobId}>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{job.jobTitle}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(job.createDate).toLocaleDateString('vi-VN')} - {new Date(job.expireDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'Đang mở' 
                      ? 'bg-green-100 text-green-800' 
                      : job.status === 'Hết hạn' 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="flex items-center text-blue-600">
                  <Eye className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Lượt xem</p>
                    <p className="font-medium">{job.viewCount}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-green-600">
                  <Users className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Ứng tuyển</p>
                    <p className="font-medium">{job.applicationCount}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-purple-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Tỷ lệ chuyển đổi</p>
                    <p className="font-medium">{job.conversionRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-right">
                <span className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800">
                  Xem chi tiết <ChevronsRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default BestPerformingJobs; 