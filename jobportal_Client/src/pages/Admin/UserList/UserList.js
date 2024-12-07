import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  deleteUser,
  updateUserStatus,
} from "../../../redux/User/user.action";
import { Button } from "../../../ui/button";
import { MoreVertical, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";

import Swal from "sweetalert2";
import { Input } from "../../../ui/input";

export default function UserList() {
  const dispatch = useDispatch();
  const { users, totalPages, totalElements, loading, error } = useSelector(
    (state) => state.user
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    dispatch(getAllUsers(searchTerm, role, status, currentPage, size));
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

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa người dùng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteUser(userId)).then(() => {
          dispatch(getAllUsers(currentPage, size));
          Swal.fire("Đã xóa!", "Người dùng đã được xóa thành công.", "success");
        });
      }
    });
  };

  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(getAllUsers(searchTerm, role, status, currentPage, size));
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Tổng số người dùng: {totalElements || 0}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên..."
              className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 w-80"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Tất cả loại tài khoản</option>
            <option value="1">Admin</option>
            <option value="2">Seeker</option>
            <option value="3">Employer</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Còn hoạt động</option>
            <option value="false">Đã khóa</option>
          </select>
          <Button
            onClick={applyFilters}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Áp dụng
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full table-fixed">
          <thead className="bg-purple-600 text-white text-sm">
            <tr>
              <th className="text-left p-4 w-16">STT</th>
              <th className="text-left p-4 w-24">Avatar</th>
              <th className="text-left p-4 w-80">Tên</th>
              <th className="text-left p-4 w-64">Email</th>
              <th className="text-left p-4">Loại tài khoản</th>
              <th className="text-left p-4">Trạng thái tài khoản</th>
              <th className="text-left p-4">Ngày tham gia</th>
              <th className="text-left p-4">Lần đăng nhập cuối</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.userId} className="border-b hover:bg-gray-50">
                  <td className="p-4">{index + 1 + currentPage * size}</td>
                  <td className="p-4 w-24">
                    <div className="group relative">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`Avatar của ${user.userName}`}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                          <span className="text-gray-500 text-lg uppercase">
                            {user.userName?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {user.userName}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 truncate" title={user.userName}>
                    {user.userName}
                  </td>
                  <td className="p-4 truncate" title={user.email}>
                    {user.email}
                  </td>
                  <td
                    className="p-4 truncate"
                    title={user.userType.user_type_name}
                  >
                    <span className="px-2 py-1 rounded-full">
                      {user.userType.user_type_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.active
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(user.createDate).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4">
                    {user.lastLogin ? (
                      new Date(user.lastLogin).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    ) : (
                      <span className="text-gray-400">Chưa đăng nhập</span>
                    )}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          {user.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.userId)}
                          className="text-red-600"
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
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
            <span>người dùng mỗi trang</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button variant="outline" className="bg-purple-600 text-white">
              {currentPage + 1}
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages - 1}
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
