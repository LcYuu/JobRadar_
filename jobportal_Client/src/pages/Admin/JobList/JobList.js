import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../ui/button";
import { MoreVertical, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { Input } from "../../../ui/input";
import { useNavigate } from "react-router-dom";
import { approveJob, getAllJobsForAdmin } from "../../../redux/JobPost/jobPost.thunk";

export default function AdminJobList() {
  const dispatch = useDispatch();
  const { jobPost, totalPages, totalElements, loading, error } = useSelector(
    (store) => store.jobPost
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [approve, setApprove] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      getAllJobsForAdmin({ title: searchTerm, status, isApprove: approve, page: currentPage, size })
    );
  }, [dispatch, currentPage, size, searchTerm, status, approve]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      getAllJobsForAdmin({ title: searchTerm, status, isApprove: approve, page: 0, size })
    );
    if (window.innerWidth < 800) {
      setShowFilters(false);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const isMobile = windowWidth < 800;
  const isMidRange = windowWidth >= 800 && windowWidth <= 1485;
  const isTableLayout = windowWidth > 1485;
  const fontSize = isMobile ? "text-xs" : isMidRange ? "text-sm" : "text-sm";
  const padding = isMobile ? "p-2" : isMidRange ? "p-3" : "p-4";
  const cardPadding = isMobile ? "p-3" : "p-4";

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-8 px-4 sm:px-6 md:px-8">
      <div className="bg-white rounded-lg shadow overflow-hidden max-w-full">
        {/* Header Section with Filters */}
        <div className="flex flex-col custom-1360:flex-row justify-between items-center p-6 border-b gap-6">
          <p className={`${fontSize} font-bold text-gray-700 bg-gray-100 rounded px-3 py-2 w-full text-center custom-1360:w-auto`}>
            Tổng số <span className="font-extrabold">{totalElements}</span> công việc
          </p>
          
          <div className="flex flex-col gap-4 w-full custom-1360:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Tìm kiếm công việc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 py-2 ${fontSize} border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              
              <Button 
                onClick={toggleFilters} 
                variant="outline"
                className="w-full sm:w-auto flex items-center gap-1 shrink-0 custom-800:hidden"
              >
                <Filter className="h-4 w-4" /> 
                <span>Lọc</span>
              </Button>
            </div>
            
            {/* Filters - for large screens or when toggled */}
            <div className={`${showFilters ? 'flex' : 'hidden'} custom-800:flex flex-col custom-800:flex-row custom-800:flex-wrap items-center gap-3 w-full`}>
              <select
                value={approve}
                onChange={(e) => setApprove(e.target.value)}
                className={`w-full custom-800:w-40 border-gray-300 rounded-lg px-3 py-2 ${fontSize} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đã duyệt</option>
                <option value="false">Chờ duyệt</option>
              </select>
              
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full custom-800:w-40 border-gray-300 rounded-lg px-3 py-2 ${fontSize} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="">Tất cả tình trạng</option>
                <option value="Đang mở">Đang mở</option>
                <option value="Hết hạn">Hết hạn</option>
              </select>
              
              <Button
                onClick={applyFilters}
                className={`w-full custom-800:w-auto bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 ${fontSize}`}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>

        {/* Table/Card Section */}
        {isTableLayout ? (
          <div className="w-full max-w-full">
            <table className="w-full table-fixed transition-all duration-300">
              <thead className="bg-purple-600 text-white hidden custom-1485:table-header-group sticky top-0 z-10">
                <tr>
                  <th className={`${padding} text-left w-[5%] ${fontSize}`}>STT</th>
                  <th className={`${padding} text-left w-[20%] ${fontSize}`}>Tiêu đề</th>
                  <th className={`${padding} text-left w-[15%] ${fontSize}`}>Công ty</th>
                  <th className={`${padding} text-left w-[10%] ${fontSize}`}>Địa điểm</th>
                  <th className={`${padding} text-left w-[10%] ${fontSize}`}>Trạng thái</th>
                  <th className={`${padding} text-left w-[10%] ${fontSize}`}>Tình trạng</th>
                  <th className={`${padding} text-left w-[10%] ${fontSize}`}>Ngày đăng</th>
                  <th className={`${padding} text-left w-[10%] ${fontSize}`}>Hạn nộp</th>
                  <th className={`${padding} text-left w-[10%] ${fontSize}`}>Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {jobPost?.length > 0 ? (
                  jobPost.map((job, index) => (
                    <tr
                      key={job.jobPostId}
                      className="border-b hover:bg-gray-50 flex flex-col custom-1485:table-row"
                    >
                      <td className={`${padding} flex custom-1485:table-cell ${fontSize}`}>
                        <span className="font-bold custom-1485:hidden w-24">STT:</span>
                        {index + 1 + currentPage * size}
                      </td>
                      
                      <td
                        id="job-title"
                        className={`${padding} flex custom-1485:table-cell ${fontSize}`}
                      >
                        <span className="font-bold custom-1485:hidden w-24">Tiêu đề:</span>
                        <div className="custom-1485:truncate custom-1485:max-w-full" title={job.title}>
                          {job.title}
                        </div>
                      </td>
                      
                      <td
                        className={`${padding} flex custom-1485:table-cell ${fontSize}`}
                      >
                        <span className="font-bold custom-1485:hidden w-24">Công ty:</span>
                        <div className="custom-1485:truncate custom-1485:max-w-full" title={job.company?.companyName}>
                          {job.company?.companyName}
                        </div>
                      </td>
                      
                      <td
                        className={`${padding} flex custom-1485:table-cell ${fontSize}`}
                      >
                        <span className="font-bold custom-1485:hidden w-24">Địa điểm:</span>
                        <div className="custom-1485:truncate custom-1485:max-w-full" title={job.city?.cityName}>
                          {job.city?.cityName}
                        </div>
                      </td>
                      
                      <td className={`${padding} flex custom-1485:table-cell ${fontSize}`}>
                        <span className="font-bold custom-1485:hidden w-24">Trạng thái:</span>
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
                      
                      <td className={`${padding} flex custom-1485:table-cell ${fontSize}`}>
                        <span className="font-bold custom-1485:hidden w-24">Tình trạng:</span>
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
                      
                      <td
                        className={`${padding} flex custom-1485:table-cell ${fontSize}`}
                      >
                        <span className="font-bold custom-1485:hidden w-24">Ngày đăng:</span>
                        <div className="custom-1485:truncate custom-1485:max-w-full" title={new Date(job.createDate).toLocaleDateString("vi-VN")}>
                          {new Date(job.createDate).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      
                      <td
                        className={`${padding} flex custom-1485:table-cell ${fontSize}`}
                      >
                        <span className="font-bold custom-1485:hidden w-24">Hạn nộp:</span>
                        <div className="custom-1485:truncate custom-1485:max-w-full" title={new Date(job.expireDate).toLocaleDateString("vi-VN")}>
                          {new Date(job.expireDate).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      
                      <td className={`${padding} flex custom-1485:table-cell ${fontSize}`}>
                        <span className="font-bold custom-1485:hidden w-24">Action:</span>
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
                    <td colSpan="9" className="p-4 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Đang tải...
              </div>
            ) : jobPost?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Không có dữ liệu
              </div>
            ) : (
              jobPost.map((job, index) => (
                <div
                  key={job.jobPostId}
                  className="bg-gray-50 rounded-lg shadow-sm overflow-hidden"
                >
                  <div className={`${cardPadding} flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className={`font-medium ${fontSize}`}>
                            {job.title}
                          </span>
                          <p className={`${fontSize} text-gray-500`}>
                            #{index + 1 + currentPage * size}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                    </div>
                    <div className="space-y-2">
                      <p className={`${fontSize} text-gray-500`}>
                        <span className="font-medium">Công ty:</span>{" "}
                        {job.company?.companyName}
                      </p>
                      <p className={`${fontSize} text-gray-500`}>
                        <span className="font-medium">Địa điểm:</span>{" "}
                        {job.city?.cityName}
                      </p>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${fontSize} ${
                            job.approve
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {job.approve ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${fontSize} ${
                            job.status === "Đang mở"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {job.status === "Đang mở" ? "Đang mở" : "Hết hạn"}
                        </span>
                      </div>
                      {!isMobile && (
                        <p className={`${fontSize} text-gray-500`}>
                          <span className="font-medium">Ngày đăng:</span>{" "}
                          {new Date(job.createDate).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                      {!isMobile && (
                        <p className={`${fontSize} text-gray-500`}>
                          <span className="font-medium">Hạn nộp:</span>{" "}
                          {new Date(job.expireDate).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        <div className={`${padding} border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-2">
            <span className={fontSize}>Hiển thị</span>
            <select
              className={`border rounded p-1 ${fontSize}`}
              value={size}
              onChange={handleSizeChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className={fontSize}>bản ghi mỗi trang</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
              className={fontSize}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              className={`bg-purple-600 text-white ${fontSize}`}
            >
              {currentPage + 1}
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
              className={fontSize}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {/* Inline CSS for gradual scaling and text wrapping */}
      <style jsx>{`
        @media (max-width: 1485px) {
          table {
            width: 100%;
            table-layout: fixed;
          }
          th,
          td {
            padding: 8px;
            font-size: 0.875rem;
            transition: all 0.3s ease;
            white-space: normal;
            word-break: break-word;
          }
          th:nth-child(1),
          td:nth-child(1) {
            /* STT */
            width: 5%;
            min-width: 40px;
          }
          th:nth-child(2),
          td:nth-child(2) {
            /* Tiêu đề */
            width: 20%;
            min-width: 80px;
          }
          th:nth-child(3),
          td:nth-child(3) {
            /* Công ty */
            width: 15%;
            min-width: 60px;
          }
          th:nth-child(4),
          td:nth-child(4) {
            /* Địa điểm */
            width: 10%;
            min-width: 50px;
          }
          th:nth-child(5),
          td:nth-child(5) {
            /* Trạng thái */
            width: 10%;
            min-width: 50px;
          }
          th:nth-child(6),
          td:nth-child(6) {
            /* Tình trạng */
            width: 10%;
            min-width: 50px;
          }
          th:nth-child(7),
          td:nth-child(7) {
            /* Ngày đăng */
            width: 10%;
            min-width: 50px;
          }
          th:nth-child(8),
          td:nth-child(8) {
            /* Hạn nộp */
            width: 10%;
            min-width: 50px;
          }
          th:nth-child(9),
          td:nth-child(9) {
            /* Action */
            width: 10%;
            min-width: 40px;
          }
        }
        @media (max-width: 1024px) {
          th,
          td {
            font-size: 0.75rem;
            padding: 6px;
          }
        }
      `}</style>
    </div>
  );
}