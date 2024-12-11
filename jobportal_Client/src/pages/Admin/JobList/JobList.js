import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllJobsForAdmin,
  approveJob,
} from "../../../redux/JobPost/jobPost.action";
import { Button } from "../../../ui/button";
import {
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../../ui/dropdown-menu";
import { Input } from "../../../ui/input";
import { useNavigate } from "react-router-dom";

export default function AdminJobList() {
  const dispatch = useDispatch();
  const { jobPost, totalPages, totalElements, loading, error } = useSelector(
    (state) => state.jobPost
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [approve, setApprove] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      getAllJobsForAdmin(searchTerm, status, approve, currentPage, size)
    );
  }, [dispatch, currentPage, size]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(
      getAllJobsForAdmin(searchTerm, status, approve, currentPage, size)
    );
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-8">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">Thông tin liên hệ trên form
          <h2 className="font-semibold">
            Tổng số công việc ({totalElements})
          </h2>
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
            <div className="flex items-center gap-4">
              <select
                value={approve}
                onChange={(e) => setApprove(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="true">Đã duyệt</option>
                <option value="false">Chờ duyệt</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="Đang mở">Đang mở</option>
                <option value="Hết hạn">Hết hạn</option>
              </select>
            </div>
            <Button
              onClick={applyFilters}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Áp dụng
            </Button>
          </div>
        </div>

        <table className="w-full table-fixed">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="text-left p-4 w-16">STT</th>
              <th className="text-left p-4 w-80">Tiêu đề</th>
              <th className="text-left p-4 w-64">Công ty</th>
              <th className="text-left p-4 w-50">Địa điểm</th>
              <th className="text-left p-4">Trạng thái</th>
              <th className="text-left p-4">Tình trạng</th>
              <th className="text-left p-4">Ngày đăng</th>
              <th className="text-left p-4">Hạn nộp</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {jobPost?.length > 0 ? (
              jobPost.map((job, index) => (
                <tr key={job.jobPostId} className="border-b hover:bg-gray-50">
                  <td className="p-4">{index + 1 + currentPage * size}</td>

                  <td className="p-4 truncate" title={job.title}>
                    {job.title}
                  </td>
                  <td className="p-4 truncate" title={job.company?.companyName}>
                    {job.company?.companyName}
                  </td>
                  <td className="p-4 truncate" title={job.city?.cityName}>
                    {job.city?.cityName}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        job.approve
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {job.approve ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        job.status === "Đang mở"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {job.status === "Đang mở" ? "Đang mở" : "Hết hạn"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(job.createDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4">
                    {new Date(job.expireDate).toLocaleDateString("vi-VN")}
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
                          <DropdownMenuItem
                            onClick={() => dispatch(approveJob(job.postId))}
                          >
                            Phê duyệt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/admin/jobs/${job.postId}`)
                          }
                        >
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              className="border rounded p-1"
              value={size}
              onChange={handleSizeChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>bản ghi mỗi trang </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="bg-purple-600 text-white"
              onClick={() => handlePageChange(currentPage)}
            >
              {currentPage + 1}
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
