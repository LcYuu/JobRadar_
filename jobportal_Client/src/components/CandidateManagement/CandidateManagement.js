import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { MoreVertical, Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../redux/store";
import {
  getApplyJobByCompany,
  updateApprove,
} from "../../redux/ApplyJob/applyJob.action";
import {
  getAllJobPost,
  getJobsByCompany,
} from "../../redux/JobPost/jobPost.action";
import { toast } from "react-toastify";
const CandidateManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    applyJobByCompany = [],
    totalPages,
    totalElements,
  } = useSelector((store) => store.applyJob);

  const { positions } = useSelector((store) => store.jobPost);
  const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại
  const [size, setSize] = useState(5); // Số lượng bản ghi mỗi trang

  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [filterStatus, setFilterStatus] = useState(""); // Trạng thái duyệt
  const [filterPosition, setFilterPosition] = useState(""); // Vị trí công việc
  const [filteredCandidates, setFilteredCandidates] = useState([]); // Kết quả sau lọc

  useEffect(() => {
    dispatch(
      getApplyJobByCompany(
        currentPage,
        size,
        searchTerm,
        filterStatus,
        filterPosition
      )
    );
  }, [dispatch, currentPage, size]); // Thêm các tham số lọc vào dependency array

  useEffect(() => {
    dispatch(getAllJobPost());
  }, [dispatch]);

  const handleUpdate = async (postId, userId) => {
    try {
      // Gọi hành động cập nhật và chờ nó thực hiện
      await dispatch(updateApprove(postId, userId));

      toast.success("Đơn ứng tuyển đã được chấp thuận!");

      dispatch(getApplyJobByCompany(currentPage, size));
    } catch (error) {
      // Hiển thị thông báo lỗi nếu có lỗi xảy ra
      toast.error("Có lỗi xảy ra khi chấp thuận đơn.");
    }
  };
  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(
      getApplyJobByCompany(
        currentPage,
        size,
        searchTerm,
        filterStatus,
        filterPosition
      )
    );
  };

  const displayData =
    filteredCandidates.length > 0 ? filteredCandidates : applyJobByCompany;

  // State cho phân trang

  // const handleSelectAll = (e) => {
  //   if (e.target.checked) {
  //     setSelectedItems(candidates.map((c) => c.id));
  //   } else {
  //     setSelectedItems([]);
  //   }
  // };

  // const handleSelectItem = (id) => {
  //   setSelectedItems((prev) => {
  //     if (prev.includes(id)) {
  //       return prev.filter((item) => item !== id);
  //     } else {
  //       return [...prev, id];
  //     }
  //   });
  // };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0); // Reset về trang đầu khi thay đổi số lượng bản ghi mỗi trang
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          {/* Tổng số người ứng tuyển: {candidates.length} */}
        </h1>
        <div className="flex gap-4 items-center">
          <Input
            type="text"
            placeholder="Tìm kiếm"
            className="w-[300px]"
            icon={<Search className="w-4 h-4" />}
            onChange={(e) => setSearchTerm(e.target.value)} // Lưu giá trị tìm kiếm
          />

          {/* Lọc theo trạng thái duyệt */}
          <select
            className="border rounded px-4 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)} // Lưu trạng thái được chọn
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đã duyệt</option> {/* isSave = 1 */}
            <option value="0">Chưa duyệt</option> {/* isSave = 0 */}
          </select>

          {/* Lọc theo vị trí công việc */}
          <select
            className="border rounded px-4 py-2"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)} // Lưu vị trí được chọn
          >
            <option value="">Tất cả vị trí</option>
            {positions.map((position) => (
              <option key={position.postId} value={position.title}>
                {position.title}
              </option>
            ))}
          </select>

          {/* Nút áp dụng */}
          <Button
            variant="outline"
            onClick={applyFilters} // Gọi hàm áp dụng lọc
            className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Áp dụng
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-purple-600 text-white">
            <tr>
              {/* <th className="p-4 text-left">
                <input
                  type="checkbox"
                  // onChange={handleSelectAll}
                  // checked={selectedItems.length === candidates.length}
                  className="rounded border-gray-300"
                />
              </th> */}
              <th className="p-4 text-left">Tên ứng viên</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Ngày nộp</th>
              <th className="p-4 text-left">Vị trí công việc</th>
              <th className="p-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((candidate) => (
                <tr key={`${candidate.postId}-${candidate.userId}`} className="border-t">
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={candidate?.avatar}
                        alt={candidate?.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <span>{candidate?.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        candidate.isSave
                          ? "bg-green-100 text-green-600" // Màu xanh cho "Đã duyệt"
                          : "bg-red-100 text-red-600" // Màu đỏ cho "Chưa duyệt"
                      }`}
                    >
                      {candidate?.isSave ? "Đã duyệt" : "Chưa duyệt"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(candidate?.applyDate).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td>
                    <Link
                      to={`/employer/jobs/${candidate?.postId}`}
                      className="border-l-indigo-950 hover:underline"
                    >
                      {candidate?.title}
                    </Link>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="text-purple-600"
                        onClick={() => window.open(candidate?.pathCV, "_blank")}
                      >
                        Xem CV
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="h-8 w-8 p-0">
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
                              navigate(
                                `/employer/account-management/candidate-management/applicants/${candidate?.userId}/${candidate?.postId}`
                              )
                            }
                          >
                            Xem chi tiết
                          </DropdownMenuItem>
                          {!candidate?.isSave && (
                            <DropdownMenuItem
                              className="hover:bg-gray-100 cursor-pointer"
                              onClick={() =>
                                handleUpdate(
                                  candidate?.postId,
                                  candidate?.userId
                                )
                              }
                            >
                              Chấp thuận đơn
                            </DropdownMenuItem>
                          )}
                          {/* <DropdownMenuItem className="text-red-600 hover:bg-red-50 cursor-pointer">
                            Xóa
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Phân trang */}
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
    </div>
  );
};

export default CandidateManagement;
