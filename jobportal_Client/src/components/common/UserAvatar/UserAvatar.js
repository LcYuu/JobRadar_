import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, getProfileAction } from '../../../redux/Auth/auth.action'; // Import hàm getProfile

const UserAvatar = () => {
  const { auth } = useSelector(store => store);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Gọi hàm getProfile khi component được mount
    dispatch(getProfileAction());
  }, [dispatch]);

  const handleAvatarClick = () => {
    navigate('/account-management');
  };

  console.log(auth.user); // Kiểm tra thông tin người dùng

  return (
    <div onClick={handleAvatarClick} className="flex items-center cursor-pointer">
      <img 
        src={auth.user?.avatar} // Thêm dấu hỏi để tránh lỗi nếu auth.user là null
        alt="User Avatar" 
        className="w-8 h-8 rounded-full mr-2"
      />
      <span className="text-white">{auth.user?.userName}</span> {/* Thêm dấu hỏi để tránh lỗi */}

    </div>
  );
};

export default UserAvatar;