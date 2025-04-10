import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Filter, MoreVertical, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
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

const JobManagement = () => {
  const work = [
    { id: "Toàn thời gian", label: "Toàn thời gian" },
    { id: "Bán thời gian", label: "Bán thời gian" },
    { id: "Từ xa", label: "Từ xa" },
    { id: "Thực tập sinh", label: "Thực tập sinh" },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [selectedDate, setSelectedDate] = useState("Jul 19 - Jul 25");
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
  
  // Thêm state cho sắp xếp
  const [sortBy, setSortBy] = useState("createdate"); // Mặc định sắp xếp theo ngày tạo
  const [sortDirection, setSortDirection] = useState("desc"); // Mặc định sắp xếp giảm dần
  
  const [filtered, setFiltered] = useState([]); // Kết quả sau lọc;
  const handleViewDetails = (postId) => {
    navigate(`/employer/jobs/${postId}`);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const handleOpenModal = (postId) => {
    setSelectedJobId(postId); // Lưu postId vào state
    setIsModalOpen(true); // Mở modal
  };

  const handleOpenExpireConfirmation = (postId) => {
    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn dừng tuyển dụng công việc này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745", // Màu nút "Có"
      cancelButtonColor: "#dc3545", // Màu nút "Không"
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmExpire(postId); // Thực hiện hành động dừng tuyển dụng
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Đóng modal
    setSelectedJobId(null); // Reset selectedJobId
  };

  const handleConfirmExpire = async (postId) => {
    if (postId) {
      await dispatch(updateExpireJob(postId)); // Gọi action để đánh dấu hết hạn
    }
    await dispatch(
      findEmployerCompany({
        status,
        typeOfWork,
        sortBy,
        sortDirection,
        currentPage,
        size
      })
    );
    toast.success("Dừng tuyển dụng công việc thành công");
  };

  useEffect(() => {
    // Gọi API để lấy công việc với các tham số lọc và sắp xếp
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
  }, [
    dispatch,
    currentPage,
    size,
    sortBy,
    sortDirection,
  ]);

  useEffect(() => {
    dispatch(validateTaxCode()); // Gọi action khi component được mount
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0); // Reset về trang đầu khi thay đổi số lượng bản ghi mỗi trang
  };

  // Xử lý sắp xếp
  const handleSort = (field) => {
    // Nếu đang sắp xếp theo field này rồi, đảo ngược hướng sắp xếp
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Nếu chuyển sang field khác, mặc định sắp xếp giảm dần
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  // Hiển thị icon sắp xếp
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
    dispatch(findEmployerCompany({status, typeOfWork, sortBy, sortDirection, currentPage: 0, size}));
  };

  const displayData = filtered.length > 0 ? filtered : jobs;
  const handleClick = () => {
    if (isValid) {
      navigate("/employer/jobs/post"); // Chuyển hướng nếu mã số thuế hợp lệ
    } else {
      toast.error(
        "Mã số thuế không chính xác. Hãy cập nhật đúng để được đăng bài"
      ); // Hiển thị toast lỗi nếu không hợp lệ
    }
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold"></h1>
          {/* <p className="text-gray-500 mt-1">Đây là danh sách việc làm từ {selectedDate}.</p> */}
        </div>

        <div className="flex items-center gap-4">
          {/* <div className="flex items-center border rounded-lg p-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <span>{selectedDate}</span>
          </div> */}
          <Button
            variant="default"
            className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors"
            onClick={handleClick} // Gọi hàm khi người dùng click
          >
            + Đăng bài
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-white">.</h2>
          <div className="flex gap-4 items-center">
            <select
              className="border rounded px-4 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)} // Lưu trạng thái được chọn
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang mở">Đang mở</option> {/* isSave = 1 */}
              <option value="Chưa duyệt">Chưa duyệt</option> {/* isSave = 0 */}
              <option value="Hết hạn">Hết hạn</option> {/* isSave = 0 */}
            </select>

            {/* Lọc theo vị trí công việc */}
            <select
              className="border rounded px-4 py-2"
              value={typeOfWork}
              onChange={(e) => setTypeOfWork(e.target.value)} // Lưu vị trí được chọn
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
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors"
              onClick={applyFilters}
            >
              <Filter className="w-4 h-4" />
              Áp dụng
            </Button>
          </div>
        </div>
        
        {/* Thêm thanh sắp xếp */}
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

        <table className="w-full">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="text-left p-4">Tên công việc</th>
              <th className="text-left p-4">Trạng thái</th>
              <th className="text-left p-4">
                Ngày bắt đầu
              </th>
              <th className="text-left p-4">
                Ngày kết thúc
              </th>
              <th className="text-left p-4">Loại công việc</th>
              <th className="text-left p-4">
                Số lượng ứng viên
              </th>
              <th className="text-left p-4 cursor-pointer">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayData?.length > 0 ? (
              displayData.map((job, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{job?.title}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        job.status === "Đang mở"
                          ? "bg-emerald-100 text-emerald-600" // Màu xanh lá cho "Đang mở"
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
                  <td className="p-4">
                    {new Date(job?.createDate).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    {new Date(job?.expireDate).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-600">
                      {job?.typeOfWork}
                    </span>
                  </td>
                  <td className="p-4 text-center">{job?.applicationCount}</td>
                  <td className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white border border-gray-300 shadow-lg rounded-md p-2"
                      >
                        <DropdownMenuItem
                          className="hover:bg-gray-100 cursor-pointer"
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

                        {isModalOpen && (
                          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg w-1/3">
                              <h3 className="text-lg font-semibold">
                                Xác nhận
                              </h3>
                              <p className="mt-2">
                                Bạn có chắc chắn muốn dừng tuyển dụng công việc
                                này?
                              </p>
                              <div className="mt-4 flex justify-end space-x-4">
                                <button
                                  onClick={handleConfirmExpire} // Xác nhận và gọi action
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                >
                                  Có
                                </button>
                                <button
                                  onClick={handleCloseModal} // Đóng modal mà không thực hiện hành động
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                >
                                  Không
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <DropdownMenuItem
                          className="hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleViewDetails(job.postId)}
                        >
                          Xem chi tiết
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Không có dữ liệu để hiển thị.
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
            <span>ứng viên mỗi trang</span>
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
      />
      {/* {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-lg font-semibold">Xác nhận</h3>
            <p className="mt-2">
              Bạn có chắc chắn muốn dừng tuyển dụng công việc này?
            </p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleConfirmExpire} // Xác nhận và gọi action
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Có
              </button>
              <button
                onClick={handleCloseModal} // Đóng modal mà không thực hiện hành động
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default JobManagement;
