import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById } from '../../../redux/User/user.action';
import { Card, CardContent, CardHeader } from '../../../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { Mail, Phone, Calendar, User2, Building } from 'lucide-react';

export default function UserDetail() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { selectedUser, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getUserById(userId));
  }, [dispatch, userId]);

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!selectedUser) return <div className="text-center py-8">Không tìm thấy người dùng</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage src={selectedUser.avatar} />
              <AvatarFallback>{selectedUser.userName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="pt-20">
          <h1 className="text-2xl font-bold">{selectedUser.userName}</h1>
          <p className="text-gray-500">{selectedUser.userType?.user_type_name}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{selectedUser.phoneNumber || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Ngày tham gia</p>
                <p className="font-medium">
                  {new Date(selectedUser.createDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <User2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className={`font-medium ${selectedUser.active ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedUser.active ? 'Đang hoạt động' : 'Đã khóa'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedUser.userType?.userTypeId === 3 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Thông tin công ty</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Building className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Tên công ty</p>
                  <p className="font-medium">{selectedUser.company?.companyName || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
