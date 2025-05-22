import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { deleteUser, getAllUsers } from "../../../redux/User/user.thunk";

export default function UserList() {
  const dispatch = useDispatch();
  const { users, totalPages, totalElements, loading, error } = useSelector(
    (store) => store.user
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    dispatch(
      getAllUsers({
        userName: searchTerm,
        userTypeId: role,
        active: status,
        page: currentPage,
        size,
      })
    );
  }, [dispatch, currentPage, size, searchTerm, role, status]);

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
          dispatch(
            getAllUsers({
              userName: searchTerm,
              userTypeId: role,
              active: status,
              page: currentPage,
              size,
            })
          );
          Swal.fire("Đã xóa!", "Người dùng đã được xóa thành công.", "success");
        });
      }
    });
  };

  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(
      getAllUsers({
        userName: searchTerm,
        userTypeId: role,
        active: status,
        page: currentPage,
        size,
      })
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa đăng nhập";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getRoleName = (userTypeId) => {
    const roles = { 1: "Admin", 2: "Seeker", 3: "Employer" };
    return roles[userTypeId] || "N/A";
  };

  const isMobile = windowWidth < 800;
  const isMidRange = windowWidth >= 800 && windowWidth <= 1005;
  const isUpperMidRange = windowWidth > 1005 && windowWidth <= 1485;
  const isTableLayout = windowWidth > 1485;
  const fontSize = isMobile ? "text-xs" : isMidRange ? "text-xs" : "text-sm";
  const padding = isMobile ? "p-2" : isMidRange ? "p-2" : "p-3";
  const avatarSize = isMobile
    ? "h-6 w-6"
    : isMidRange
    ? "h-8 w-8"
    : "h-10 w-10";
  const inputWidth = isMobile ? "w-full" : isMidRange ? "w-48" : "w-64";
  const cardPadding = isMobile ? "p-2" : isMidRange ? "p-2" : "p-3";
  const cardGap = isMobile ? "gap-2" : isMidRange ? "gap-2" : "gap-3";
  const fieldSpacing = isMobile
    ? "space-y-1"
    : isMidRange
    ? "space-y-1"
    : "space-y-2";
  const buttonPadding = isMobile || isMidRange ? "px-3 py-1" : "px-4 py-2";

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-8 px-4 sm:px-6 md:px-8 overflow-x-hidden max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 max-w-full">
        <div className={`${fontSize} text-gray-600`}>
          Tổng số người dùng: {totalElements || 0}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên..."
              className={`${inputWidth} pl-8 ${fontSize} max-w-full`}
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`border rounded-lg px-2 py-1 ${fontSize} focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-auto max-w-full`}
          >
            <option value="">Tất cả loại tài khoản</option>
            <option value="1">Admin</option>
            <option value="2">Seeker</option>
            <option value="3">Employer</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`border rounded-lg px-2 py-1 ${fontSize} focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-auto max-w-full`}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Còn hoạt động</option>
            <option value="false">Đã khóa</option>
          </select>
          <Button
            onClick={applyFilters}
            className={`bg-purple-500 text-white ${buttonPadding} rounded-lg hover:bg-purple-600 w-full sm:w-auto ${fontSize}`}
          >
            Áp dụng
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden max-w-full">
        {isTableLayout ? (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full table-auto">
              <thead className="bg-purple-600 text-white sticky top-0 z-10">
                <tr>
                  <th className={`${padding} text-left w-16 ${fontSize}`}>
                    STT
                  </th>
                  <th className={`${padding} text-left w-24 ${fontSize}`}>
                    Avatar
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>Tên</th>
                  <th className={`${padding} text-left ${fontSize}`}>Email</th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Loại tài khoản
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Trạng thái
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Ngày tham gia
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Lần đăng nhập cuối
                  </th>
                  <th className={`${padding} w-20 ${fontSize}`}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className={`${padding} ${fontSize}`}>
                        {index + 1 + currentPage * size}
                      </td>
                      <td className={`${padding}`}>
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`Avatar của ${user.userName}`}
                            className={`${avatarSize} rounded-full object-cover`}
                          />
                        ) : (
                          <div
                            className={`${avatarSize} rounded-full bg-gray-200 flex items-center justify-center`}
                          >
                            <span className="text-gray-500 text-lg uppercase">
                              {user.userName?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td
                        className={`${padding} ${fontSize} max-w-[200px] truncate whitespace-nowrap overflow-hidden`}
                      >
                        {user.userName}
                      </td>

                      <td
                        className={`${padding} ${fontSize} truncate max-w-[85%]`}
                      >
                        {user.email}
                      </td>
                      <td className={`${padding} ${fontSize}`}>
                        <span className="px-1.5 py-0.5 rounded-full">
                          {user?.userType?.user_type_name ||
                            getRoleName(user.userTypeId)}
                        </span>
                      </td>
                      <td className={`${padding}`}>
                        <span
                          className={`px-2 py-0.5 rounded-full ${fontSize} ${
                            user.active
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className={`${padding} ${fontSize}`}>
                        {formatDate(user.createDate)}
                      </td>
                      <td className={`${padding} ${fontSize}`}>
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className={`${padding}`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={`${
                              isMobile || isMidRange ? "text-xs" : "text-sm"
                            }`}
                          >
                            <DropdownMenuItem>
                              {user.active
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"}
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
                    <td colSpan="9" className="text-center p-4 text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4 p-3 max-w-full">
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <div
                  key={user.userId}
                  className="bg-gray-50 rounded-lg shadow-sm overflow-hidden max-w-full"
                >
                  <div
                    className={`${cardPadding} flex flex-col ${cardGap} max-w-full`}
                  >
                    <div className="flex items-center justify-between max-w-full">
                      <div className="flex items-center gap-2 max-w-[85%]">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`Avatar của ${user.userName}`}
                            className={`${avatarSize} rounded-full object-cover`}
                          />
                        ) : (
                          <div
                            className={`${avatarSize} rounded-full bg-gray-200 flex items-center justify-center`}
                          >
                            <span className="text-gray-500 text-lg uppercase">
                              {user.userName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="max-w-full">
                          <span
                            className={`font-medium ${fontSize} truncate block max-w-full`}
                          >
                            {user.userName}
                          </span>
                          <p className={`${fontSize} text-gray-500`}>
                            #{index + 1 + currentPage * size}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-200"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={`${
                            isMobile || isMidRange ? "text-xs" : "text-sm"
                          }`}
                        >
                          <DropdownMenuItem>
                            {user.active
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.userId)}
                            className="text-red-600"
                          >
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className={`${fieldSpacing} max-w-full`}>
                      <p
                        className={`${fontSize} text-gray-500 truncate max-w-[85%]`}
                      >
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                      <p className={`${fontSize} text-gray-500`}>
                        <span className="font-medium">Loại tài khoản:</span>{" "}
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full ${
                            isMobile || isMidRange ? "text-[10px]" : fontSize
                          }`}
                        >
                          {user?.userType?.user_type_name ||
                            getRoleName(user.userTypeId)}
                        </span>
                      </p>
                      <p className={`${fontSize} text-gray-500`}>
                        <span className="font-medium">Trạng thái:</span>{" "}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                            isMobile || isMidRange ? "text-[10px]" : fontSize
                          } ${
                            user.active
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </p>
                      {!isMobile && (
                        <p className={`${fontSize} text-gray-500`}>
                          <span className="font-medium">Ngày tham gia:</span>{" "}
                          {formatDate(user.createDate)}
                        </p>
                      )}
                      {!isMobile && (
                        <p className={`${fontSize} text-gray-500`}>
                          <span className="font-medium">
                            Lần đăng nhập cuối:
                          </span>{" "}
                          {formatDate(user.lastLogin)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>
        )}

        <div
          className={`${padding} border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-full`}
        >
          <div className="flex items-center gap-2">
            <span className={fontSize}>Hiển thị</span>
            <select
              className={`border rounded p-1 ${fontSize} max-w-[60px]`}
              value={size}
              onChange={handleSizeChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className={fontSize}>người dùng mỗi trang</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`${fontSize} ${buttonPadding}`}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className={`bg-purple-600 text-white ${fontSize} ${buttonPadding}`}
            >
              {currentPage + 1}
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`${fontSize} ${buttonPadding}`}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
