import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  deleteUser,
  updateUserStatus,
} from "../../../redux/User/user.action";
import { Button } from "../../../ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import Swal from "sweetalert2";

export default function UserList() {
  const dispatch = useDispatch();
  const { users, totalPages, totalElements, loading, error } = useSelector(
    (state) => state.user
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [filters, setFilters] = useState({
    searchTerm: "",
    role: "all",
    status: "all",
  });

  useEffect(() => {
    dispatch(getAllUsers(currentPage, size, filters));
  }, [dispatch, currentPage, size, filters]);

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
    setCurrentPage(0);
  };

  const handleRoleFilter = (e) => {
    setFilters((prev) => ({ ...prev, role: e.target.value }));
    setCurrentPage(0);
  };

  const handleStatusFilter = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
    setCurrentPage(0);
  };

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
          dispatch(getAllUsers(currentPage, size, filters));
          Swal.fire("Đã xóa!", "Người dùng đã được xóa thành công.", "success");
        });
      }
    });
  };

  const handleToggleStatus = (user) => {
    dispatch(
      updateUserStatus(user.userId, {
        ...user,
        active: !user.active,
      })
    ).then(() => {
      dispatch(getAllUsers(currentPage, size, filters));
    });
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Tổng số người dùng: {totalElements || 0}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={filters.searchTerm}
              onChange={handleSearch}
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>
          <select
            value={filters.role}
            onChange={handleRoleFilter}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại tài khoản</option>
            <option value="1">Admin</option>
            <option value="2">Seeker</option>
            <option value="3">Employer</option>
          </select>
          <select
            value={filters.status}
            onChange={handleStatusFilter}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="1">Còn hoạt động</option>
            <option value="0">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-purple-600 text-white text-sm">
            <tr>
              <th className="text-left p-4">Avatar</th>
              <th className="text-left p-4">Tên</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Loại tài khoản</th>
              <th className="text-left p-4">Trạng thái tài khoản</th>
              <th className="text-left p-4">Ngày tham gia</th>
              <th className="text-left p-4">Lần đăng nhập cuối</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>

          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.userId} className="border-b hover:bg-gray-50">
                  <td className="p-4">
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
                  <td className="p-4">{user.userName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
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
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user)}
                        >
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
