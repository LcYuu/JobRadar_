import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  Filter,
  MoreVertical,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import {
  findEmployerCompany,
  updateExpireJob,
} from "../../redux/JobPost/jobPost.thunk";
import { validateTaxCode } from "../../redux/Company/company.thunk";
import "./JobManagement.css";

const JobManagement = () => {
  const work = [
    { id: "Toàn thời gian", label: "Toàn thời gian" },
    { id: "Bán thời gian", label: "Bán thời gian" },
    { id: "Từ xa", label: "Từ xa" },
    { id: "Thực tập sinh", label: "Thực tập sinh" },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    jobs = [],
    totalPages,
    totalElements,
    expireJob,
  } = useSelector((store) => store.jobPost);
  const { isValid, loading, error } = useSelector((store) => store.company);

  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [status, setStatus] = useState("");
  const [typeOfWork, setTypeOfWork] = useState("");
  const [sortBy, setSortBy] = useState("createdate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortedJobs, setSortedJobs] = useState([]);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const jobsCopy = [...jobs];
      const sorted = jobsCopy.sort((a, b) => {
        if (sortBy === "title") {
          return sortDirection === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortBy === "createdate") {
          return sortDirection === "asc"
            ? new Date(a.createDate) - new Date(b.createDate)
            : new Date(b.createDate) - new Date(a.createDate);
        } else if (sortBy === "expiredate") {
          return sortDirection === "asc"
            ? new Date(a.expireDate) - new Date(b.expireDate)
            : new Date(b.expireDate) - new Date(a.expireDate);
        } else if (sortBy === "applicationcount") {
          return sortDirection === "asc"
            ? a.applicationCount - b.applicationCount
            : b.applicationCount - a.applicationCount;
        }
        return 0;
      });
      setSortedJobs(sorted);
    } else {
      setSortedJobs([]);
    }
  }, [jobs, sortBy, sortDirection]);

  const handleViewDetails = (postId) => {
    navigate(`/employer/jobs/${postId}`);
  };

  const handleOpenExpireConfirmation = (postId) => {
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn dừng tuyển dụng công việc này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmExpire(postId);
      }
    });
  };

  const handleConfirmExpire = async (postId) => {
    if (postId) {
      await dispatch(updateExpireJob(postId));
      await dispatch(
        findEmployerCompany({
          status,
          typeOfWork,
          sortBy,
          sortDirection,
          currentPage,
          size,
        })
      );
      toast.success("Dừng tuyển dụng công việc thành công");
    }
  };

  useEffect(() => {
    dispatch(
      findEmployerCompany({
        status,
        typeOfWork,
        sortBy,
        sortDirection,
        currentPage,
        size,
      })
    );
  }, [dispatch, currentPage, size, status, typeOfWork]);

  useEffect(() => {
    dispatch(validateTaxCode());
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(
      findEmployerCompany({
        status,
        typeOfWork,
        sortBy,
        sortDirection,
        currentPage: 0,
        size,
      })
    );
  };

  const handleClick = () => {
    if (isValid) {
      navigate("/employer/jobs/post");
    } else {
      toast.error(
        "Mã số thuế không chính xác. Hãy cập nhật đúng để được đăng bài"
      );
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="container-padding">
        {error && (
          <div className="text-center text-red-500">
            Lỗi: {error.message || "Có lỗi xảy ra!"}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold">Quản lý công việc</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors"
              onClick={handleClick}
            >
              + Đăng bài
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="bg-white rounded-lg shadow">
            <div className="flex flex-col items-start sm:items-center p-4 border-b gap-4 filter-bar w-full">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
                <select
                  className="border rounded px-4 py-2 w-full sm:w-auto max-w-[250px] flex-shrink"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Đang mở">Đang mở</option>
                  <option value="Chưa duyệt">Chưa duyệt</option>
                  <option value="Hết hạn">Hết hạn</option>
                </select>
                <select
                  className="border rounded px-4 py-2 w-full sm:w-auto max-w-[250px] flex-shrink"
                  value={typeOfWork}
                  onChange={(e) => setTypeOfWork(e.target.value)}
                >
                  <option value="">Tất cả vị trí</option>
                  {work.map((w, index) => (
                    <option key={index} value={w.id}>
                      {w.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors w-full sm:w-auto min-w-[100px] max-w-[120px] flex-shrink"
                  onClick={applyFilters}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 border-b">
            <h3 className="font-medium text-gray-700 mb-2">Sắp xếp theo:</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={sortBy === "title" ? "default" : "outline"}
                className={sortBy === "title" ? "bg-purple-600" : ""}
                onClick={() => handleSort("title")}
              >
                Tên công việc {renderSortIcon("title")}
              </Button>
              <Button
                variant={sortBy === "createdate" ? "default" : "outline"}
                className={sortBy === "createdate" ? "bg-purple-600" : ""}
                onClick={() => handleSort("createdate")}
              >
                Ngày bắt đầu {renderSortIcon("createdate")}
              </Button>
              <Button
                variant={sortBy === "expiredate" ? "default" : "outline"}
                className={sortBy === "expiredate" ? "bg-purple-600" : ""}
                onClick={() => handleSort("expiredate")}
              >
                Ngày kết thúc {renderSortIcon("expiredate")}
              </Button>
              <Button
                variant={sortBy === "applicationcount" ? "default" : "outline"}
                className={sortBy === "applicationcount" ? "bg-purple-600" : ""}
                onClick={() => handleSort("applicationcount")}
              >
                Số lượng ứng viên {renderSortIcon("applicationcount")}
              </Button>
            </div>
          </div>

          <div className="table-container max-w-full">
            <table className="w-full responsive-table" role="grid">
              <thead className="bg-purple-600 text-white hidden xl-custom:block">
                <tr role="row">
                  <th className="text-left p-4">Tên công việc</th>
                  <th className="text-left p-4">Trạng thái</th>
                  <th className="text-left p-4">Ngày bắt đầu</th>
                  <th className="text-left p-4">Ngày kết thúc</th>
                  <th className="text-left p-4">Loại công việc</th>
                  <th className="text-left p-4">Số lượng ứng viên</th>
                  <th className="text-left p-4 cursor-pointer">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {sortedJobs?.length > 0 ? (
                  sortedJobs.map((job, index) => (
                    <tr
                      key={index}
                      role="row"
                      className="border-t xl-custom:border-t xl-custom:table-row flex flex-col xl-custom:flex-row p-4 xl-custom:p-0 bg-white xl-custom:bg-transparent mb-4 xl-custom:mb-0"
                    >
                      <td
                        className="p-4 xl-custom:table-cell"
                        data-label="Tên công việc"
                        before="Tên công việc:"
                      >
                        {job?.title}
                      </td>
                      <td
                        className="p-4 xl-custom:table-cell"
                        data-label="Trạng thái"
                        before="Trạng thái:"
                      >
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            job.status === "Đang mở"
                              ? "bg-emerald-100 text-emerald-600"
                              : job.status === "Hết hạn"
                              ? "bg-red-100 text-red-600"
                              : job.status === "Chưa duyệt"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td
                        className="p-4 xl-custom:table-cell"
                        data-label="Ngày bắt đầu"
                        before="Ngày bắt đầu:"
                      >
                        {new Date(job?.createDate).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className="p-4 xl-custom:table-cell"
                        data-label="Ngày kết thúc"
                        before="Ngày kết thúc:"
                      >
                        {new Date(job?.expireDate).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className="p-4 xl-custom:table-cell"
                        data-label="Loại công việc"
                        before="Loại công việc:"
                      >
                        <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-600">
                          {job?.typeOfWork}
                        </span>
                      </td>
                      <td
                        className="p-4 xl-custom:table-cell text-center xl-custom:text-left"
                        data-label="Số lượng ứng viên"
                        before="Số lượng ứng viên:"
                      >
                        {job?.applicationCount}
                      </td>
                      <td
                        className="p-4 xl-custom:table-cell action-cell"
                        data-label="Hành động"
                        before="Hành động:"
                      >
                        <div className="flex items-center gap-2 xl-custom:flex xl-custom:items-center xl-custom:gap-2 card-actions">
                          <div className="xl-custom:hidden flex flex-col gap-2 w-full">
                            {job.expireDate &&
                              new Date(job.expireDate) >= new Date() && (
                                <Button
                                  variant="default"
                                  className="action-button-stop !bg-red-100 !text-red-600 !hover:bg-red-200 !hover:text-red-800 w-full"
                                  style={{
                                    backgroundColor: "#FEE2E2",
                                    color: "#DC2626",
                                  }}
                                  onClick={() =>
                                    handleOpenExpireConfirmation(job.postId)
                                  }
                                >
                                  Dừng tuyển dụng
                                </Button>
                              )}
                            <Button
                              variant="default"
                              className="action-button-view !bg-blue-100 !text-blue-600 !hover:bg-blue-200 !hover:text-blue-800 w-full"
                              style={{
                                backgroundColor: "#DBEAFE",
                                color: "#2563EB",
                              }}
                              onClick={() => handleViewDetails(job.postId)}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                          <div className="hidden xl-custom:block">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="dropdown-trigger h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" style={{ stroke: 'white', color: 'white' }} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="dropdown-menu-content bg-white border border-gray-300 shadow-lg rounded-md p-2 min-w-[150px] z-10"
                              >
                                <DropdownMenuItem
                                  className="dropdown-item-stop !text-red-600 !hover:text-red-800 !hover:bg-gray-100 cursor-pointer"
                                  onClick={() =>
                                    handleOpenExpireConfirmation(job.postId)
                                  }
                                  style={{
                                    display:
                                      job.expireDate &&
                                      new Date(job.expireDate) < new Date()
                                        ? "none"
                                        : "block",
                                  }}
                                >
                                  Dừng tuyển dụng
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="dropdown-item-view !text-blue-600 !hover:text-blue-800 !hover:bg-gray-100 cursor-pointer"
                                  style={{ color: "#2563EB" }}
                                  onClick={() => handleViewDetails(job.postId)}
                                >
                                  Xem chi tiết
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center text-gray-500"
                      role="gridcell"
                    >
                      Không có dữ liệu để hiển thị.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 pagination-bar">
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
              <span>công việc mỗi trang</span>
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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
        />
      </div>
    </div>
  );
};

export default JobManagement;