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
  const [totalJobs, setTotalJobs] = useState(0);
  const [filters, setFilters] = useState({
    status: "all",
    approve: "all",
  });
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllJobsForAdmin(currentPage, size));
  }, [dispatch, currentPage, size]);

  useEffect(() => {
    if (
      jobPost &&
      !searchTerm &&
      filters.status === "all" &&
      filters.approve === "all"
    ) {
      setTotalJobs(totalElements);
    }
  }, [jobPost, totalElements]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const filteredJobs = jobPost?.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all"
        ? true
        : filters.status === "Đang mở"
        ? new Date(job.expireDate) > new Date()
        : new Date(job.expireDate) <= new Date();

    const matchesApprove =
      filters.approve === "all"
        ? true
        : filters.approve === "approved"
        ? job.approve
        : !job.approve;

    return matchesSearch && matchesStatus && matchesApprove;
  });

  useEffect(() => {
    if (searchTerm || filters.status !== "all" || filters.approve !== "all") {
      setTotalJobs(filteredJobs?.length || 0);
    } else {
      setTotalJobs(totalElements);
    }
  }, [searchTerm, filters, filteredJobs, totalElements]);

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Danh sách công việc ({totalJobs})</h2>
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
                  {filters.approve === "all"
                    ? "Trạng thái duyệt"
                    : filters.approve === "approved"
                    ? "Đã duyệt"
                    : "Chờ duyệt"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setFilters((f) => ({ ...f, approve: "all" }))}
                >
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setFilters((f) => ({ ...f, approve: "approved" }))
                  }
                >
                  Đã duyệt
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setFilters((f) => ({ ...f, approve: "pending" }))
                  }
                >
                  Chờ duyệt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filters.status === "all"
                    ? "Tình trạng tuyển"
                    : filters.status === "Đang mở"
                    ? "Còn tuyển"
                    : "Đã đóng"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setFilters((f) => ({ ...f, status: "all" }))}
                >
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setFilters((f) => ({ ...f, status: "Đang mở" }))
                  }
                >
                  Còn tuyển
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setFilters((f) => ({ ...f, status: "Đã đóng" }))
                  }
                >
                  Hết hạn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-purple-600 text-white">
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
                    {job.status === "Đang mở" ? "Còn tuyển" : "Hết hạn"}
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
                          onClick={() => dispatch(approveJob(job.jobPostId))}
                        >
                          Phê duyệt
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => navigate(`/admin/jobs/${job.postId}`)}
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
            ))}
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
