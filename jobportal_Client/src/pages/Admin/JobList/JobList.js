import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllJobsForAdmin, approveJob } from '../../../redux/JobPost/jobPost.action';
import { Button } from "../../../ui/button";
import { MoreVertical, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../../ui/dropdown-menu";
import { Input } from "../../../ui/input";
import { useNavigate } from 'react-router-dom';

export default function AdminJobList() {
  const dispatch = useDispatch();
  const { jobPost, totalPages, loading, error } = useSelector((state) => state.jobPost);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'open', 'closed'
    approve: 'all', // 'all', 'approved', 'pending'
  });
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllJobsForAdmin(currentPage, size));
  }, [dispatch, currentPage, size]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredJobs = jobPost?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' ? true :
      filters.status === 'open' ? new Date(job.expireDate) > new Date() :
      new Date(job.expireDate) <= new Date();

    const matchesApprove = filters.approve === 'all' ? true :
      filters.approve === 'approved' ? job.approve :
      !job.approve;

    return matchesSearch && matchesStatus && matchesApprove;
  });

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Danh sách công việc</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filters.approve === 'all' ? 'Trạng thái duyệt' :
                   filters.approve === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, approve: 'all' }))}>
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, approve: 'approved' }))}>
                  Đã duyệt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, approve: 'pending' }))}>
                  Chờ duyệt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filters.status === 'all' ? 'Tình trạng tuyển' :
                   filters.status === 'open' ? 'Còn tuyển' : 'Hết hạn'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, status: 'all' }))}>
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, status: 'open' }))}>
                  Còn tuyển
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, status: 'closed' }))}>
                  Hết hạn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Tiêu đề</th>
              <th className="text-left p-4">Công ty</th>
              <th className="text-left p-4">Địa điểm</th>
              <th className="text-left p-4">Trạng thái</th>
              <th className="text-left p-4">Tình trạng</th>
              <th className="text-left p-4">Ngày đăng</th>
              <th className="text-left p-4">Hạn nộp</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs?.map((job) => (
              <tr key={job.jobPostId} className="border-b hover:bg-gray-50">
                <td className="p-4">{job.title}</td>
                <td className="p-4">{job.company?.companyName}</td>
                <td className="p-4">{job.city?.cityName}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    job.approve ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.approve ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    job.status === 'Open' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {job.status === 'Open' ? 'Còn tuyển' : 'Hết hạn'}
                  </span>
                </td>
                <td className="p-4">
                  {new Date(job.createDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">
                  {new Date(job.expireDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!job.approve && (
                        <DropdownMenuItem onClick={() => dispatch(approveJob(job.jobPostId))}>
                          Phê duyệt
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate(`/admin/jobs/${job.postId}`)}>
                        Chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-center mt-6 p-4 border-t">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="mx-4 text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 