import React, { useEffect, useState, useRef } from "react";
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

import { validateTaxCode } from "../../redux/Company/company.thunk";
import "./JobManagement.css";
import {
  canPostJob,
  findEmployerCompany,
  softDeleteJob,
  updateExpireJob,
} from "../../redux/JobPost/jobPost.thunk";

const JobManagement = () => {
  const work = [
    { id: "Toàn thời gian", label: "Toàn thời gian" },
    { id: "Bán thời gian", label: "Bán thời gian" },
    { id: "Từ xa", label: "Từ xa" },
    { id: "Thực tập sinh", label: "Thực tập viên" },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    jobs = [],
    totalPages,
    totalElements,
    expireJob,
    canPostLoading,
    canPostError,
  } = useSelector((store) => store.jobPost);
  const { isValid, loading, error } = useSelector((store) => store.company);

  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [status, setStatus] = useState("");
  const [typeOfWork, setTypeOfWork] = useState("");
  const [sortBy, setSortBy] = useState("createdate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortedJobs, setSortedJobs] = useState([]);
  const [showCustomDropdown, setShowCustomDropdown] = useState(null);
  const dropdownRef = useRef(null);

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

  const handleDeleteJob = async (postId) => {
    if (postId) {
      await dispatch(softDeleteJob(postId));
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
      toast.success("Xóa công việc thành công");
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

  const handleClick = async () => {
    if (!isValid) {
      toast.error(
        "Mã số thuế không chính xác. Hãy cập nhật đúng để được đăng bài"
      );
      return;
    }

    try {
      const result = await dispatch(canPostJob()).unwrap();
      navigate("/employer/jobs/post");
    } catch (error) {
      Swal.fire({
        icon: "info",
        title: "Thông báo",
        text:
          error === "Người dùng không tồn tại."
            ? "Vui lòng đăng nhập lại."
            : error === "Công ty chỉ được đăng 1 bài trong vòng 1 giờ."
            ? "Công ty chỉ được đăng 1 bài trong vòng 1 giờ. Vui lòng thử lại sau."
            : error || "Đã có lỗi xảy ra khi kiểm tra quyền đăng bài.",
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCustomDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="p-4 sm:p-6">
      <div className="container-padding">
        {error && (
          <div className="text-center text-red-500">
            Lỗi: {error.message || "Có lỗi xảy ra!"}
          </div>
        )}

        <div className="flex flex-col sm:flex-row text-purple-600 justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold">Quản lý công việc</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors"
              onClick={handleClick}
              disabled={canPostLoading}
            >
              {canPostLoading ? "Đang kiểm tra..." : "+ Đăng bài"}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="bg-white rounded-lg shadow flex flex-col">
            <div className="flex flex-col pt-3 pr-3 sm:flex-row justify-end items-start sm:items-center mr-4 gap-4 w-full">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-end sm:justify-center w-full sm:w-auto">
                <select
                  className="border rounded px-4 py-2 w-full  flex-shrink"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Đang mở">Đang mở</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Hết hạn">Hết hạn</option>
                </select>
                <select
                  className="border rounded px-4 py-2 w-full flex-shrink"
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
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors w-full min-w-[100px] flex-shrink"
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
                              : job.status === "Chờ duyệt"
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
                        <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-600">
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
                            {job.status === "Hết hạn" && (
                              <Button
                                variant="default"
                                className="action-button-delete !bg-gray-100 !text-gray-600 !hover:bg-gray-200 !hover:text-gray-800 w-full"
                                style={{
                                  backgroundColor: "#F3F4F6",
                                  color: "#4B5563",
                                }}
                                onClick={() => handleDeleteJob(job.postId)}
                              >
                                Xóa công việc
                              </Button>
                            )}
                          </div>
                          <div className="hidden xl-custom:block relative">
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCustomDropdown(job.postId);
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </div>
                            {showCustomDropdown === job.postId && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-md p-2 z-20"
                              >
                                {job.expireDate &&
                                  new Date(job.expireDate) >= new Date() && (
                                    <div
                                      className="hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md !text-red-600 !hover:text-red-800"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenExpireConfirmation(
                                          job.postId
                                        );
                                        setShowCustomDropdown(null);
                                      }}
                                    >
                                      Dừng tuyển dụng
                                    </div>
                                  )}
                                <div
                                  className="hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md !text-blue-600 !hover:text-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(job.postId);
                                    setShowCustomDropdown(null);
                                  }}
                                >
                                  Xem chi tiết
                                </div>
                                {job.status === "Hết hạn" && (
                                  <div
                                    className="hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md !text-gray-600 !hover:text-gray-800"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteJob(job.postId);
                                      setShowCustomDropdown(null);
                                    }}
                                  >
                                    Xóa công việc
                                  </div>
                                )}
                              </div>
                            )}
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
                Trước đó
              </Button>
              <Button variant="outline" className="bg-purple-600 text-white">
                {currentPage + 1}
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Tiếp theo
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
