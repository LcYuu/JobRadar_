import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers, deleteUser, updateUserStatus } from '../../../redux/User/user.action';
import { Button } from "../../../ui/button";
import { MoreVertical } from 'lucide-react';
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

export default function UserList() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (users) {
      let filtered = users;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(user => 
          user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by role
      if (selectedRole !== 'all') {
        filtered = filtered.filter(user => 
          user.userType.userTypeId === parseInt(selectedRole)
        );
      }

      // Filter by status
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(user => 
          user.active === (selectedStatus === '1')
        );
      }

      setFilteredUsers(filtered);
    }
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const handleDeleteUser = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      dispatch(deleteUser(userId));
    }
  };

  const handleToggleStatus = (user) => {
    dispatch(updateUserStatus(user.userId, {
      ...user,
      isActive: !user.isActive
    }));
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">Tổng số người dùng: {filteredUsers.length}</div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MoreVertical className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại tài khoản</option>
            <option value="1">Admin</option>
            <option value="2">Seeker</option>
            <option value="3">Employer</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
          <thead className="bg-gray-50 text-sm text-gray-500">
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
            {filteredUsers.map((user) => (
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
                  <span className="px-2 py-1 rounded-full text-xs">
                    {user.userType.user_type_name}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.active 
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  {new Date(user.createDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="p-4">
                  {user.lastLogin ? (
                    new Date(user.lastLogin).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
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
                      <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                        {user.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 