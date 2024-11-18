import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { 
  Building2, 
  Users, 
  Calendar,
  Lock,
  Unlock,
  History,
  AlertTriangle,
  FileText,
  UserCheck,
  UserX,
  MapPin,
  Briefcase,
  Users2,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { getCompanyById, updateCompanyStatus, deleteCompany, getCompanyJobCounts ,getCompanyJobStats } from '../../../redux/Company/company.action';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function CompanyDetail() {
  const navigate= useNavigate();
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const { companyProfile, jobCounts, jobStats, loading } = useSelector((state) => state.company);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const chartRef = useRef(null);

  useEffect(() => {
    dispatch(getCompanyById(companyId));
    dispatch(getCompanyJobCounts(companyId));
  }, [dispatch, companyId]);

  useEffect(() => {
    if (chartDateRange.startDate && chartDateRange.endDate) {
      dispatch(getCompanyJobStats(companyId, chartDateRange.startDate, chartDateRange.endDate));
    }
  }, [dispatch, companyId, chartDateRange]);

  const handleStatusChange = async () => {
    try {
      await dispatch(updateCompanyStatus(companyId, !companyProfile.isActive));
      dispatch(getCompanyById(companyId));
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái công ty');
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCompany(companyId));
      navigate('/admin/companies');
      toast.success('Xóa công ty thành công');
    } catch (error) {
      toast.error('Không thể xóa công ty');
    }
  };

  const handleChartDateChange = (e) => {
    const { name, value } = e.target;
    setChartDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    scrollToChart();
  };

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
    scrollToChart();
  };

  const scrollToChart = () => {
    chartRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const chartData = useMemo(() => {
    if (!jobStats || !Array.isArray(jobStats)) {
      return [];
    }
    
    return jobStats.map(stat => {
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
        totalJobs: stat.totalJobs || 0,
        activeJobs: stat.activeJobs || 0,
        closedJobs: stat.closedJobs || 0,
        pendingJobs: stat.pendingJobs || 0
      };
    });
  }, [jobStats]);

  const ChartSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-[300px] bg-gray-200 rounded"></div>
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Header với các nút hành động */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{companyProfile?.companyName}</h1>
        <div className="flex gap-3">
          <Button
            variant={companyProfile?.isActive ? "destructive" : "success"}
            onClick={handleStatusChange}
            className="flex items-center gap-2"
          >
            {companyProfile?.isActive ? (
              <>
                <Lock className="w-4 h-4" />
                Khóa tài khoản
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Mở khóa tài khoản
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            Xóa công ty
          </Button>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Tổng bài đăng</p>
              <h3 className="text-xl font-bold">
                {jobCounts?.totalJobs || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <UserCheck className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Tin đang tuyển</p>
              <h3 className="text-xl font-bold">
                {jobCounts?.activeJobs || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Clock className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Tin đã đóng</p>
              <h3 className="text-xl font-bold">
                {jobCounts?.closedJobs || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Tin chờ duyệt</p>
              <h3 className="text-xl font-bold">
                {jobCounts?.pendingJobs || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Ứng viên đã ứng tuyển</p>
              <h3 className="text-xl font-bold">{companyProfile?.totalApplications || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Ngày tạo tài khoản</p>
              <h3 className="text-sm font-medium">
                {new Date(companyProfile?.createdAt).toLocaleDateString('vi-VN')}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Thông tin chi tiết */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-medium">{companyProfile?.address || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Briefcase className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Ngành nghề</p>
                <p className="font-medium">{companyProfile?.industry?.industryName || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Users2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Quy mô công ty</p>
                <p className="font-medium">{companyProfile?.companySize || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Liên hệ</p>
                <p className="font-medium">{companyProfile?.contact || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{companyProfile?.email || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Ngày thành lập</p>
                <p className="font-medium">
                  {companyProfile?.establishedTime 
                    ? new Date(companyProfile.establishedTime).toLocaleDateString('vi-VN')
                    : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Thống kê tin tuyển dụng</h2>
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
        <div ref={chartRef} className="h-[300px]">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value, name) => {
                    const labels = {
                      'Tổng tin': 'Tổng tin',
                      'Đang tuyển': 'Đang tuyển',
                      'Đã đóng': 'Đã đóng',
                      'Chờ duyệt': 'Chờ duyệt'
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
                <Bar dataKey="totalJobs" name="Tổng tin" fill="#818cf8" />
                <Bar dataKey="activeJobs" name="Đang tuyển" fill="#34d399" />
                <Bar dataKey="closedJobs" name="Đã đóng" fill="#f87171" />
                <Bar dataKey="pendingJobs" name="Chờ duyệt" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <DeleteConfirmationModal 
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          companyName={companyProfile?.companyName}
        />
      )}
    </div>
  );
} 

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, companyName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa công ty</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa công ty "{companyName}"? 
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 