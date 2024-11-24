import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProfileAction } from '../../redux/Auth/auth.action';
import { useDispatch } from 'react-redux';

const RoleSelection = () => {
  const [role, setRole] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = sessionStorage.getItem('jwt'); // Lấy JWT token từ sessionStorage

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleRoleSubmit = () => {
    axios
      .post(`http://localhost:8080/auth/update-role/${role}`, null, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Gửi token trong header
        }
      })
      .then((response) => {
        const { role, message } = response?.data;
        console.log(message); 

        alert("Cập nhật vai trò thành công!");
        // dispatch(getProfileAction());
        setTimeout(() => {
          // setIsModalOpen(false);
          window.location.href = "http://localhost:3000/"; // Redirects to home after a few seconds
        }, 1000); // Adjust the time (in milliseconds) as needed
      })
      .catch((error) => {
        console.error("Cập nhật vai trò thất bại", error);
      });
  };

  return (
    <div>
      <h2>Chọn vai trò của bạn</h2>
      <select onChange={handleRoleChange} value={role}>
        <option value="">Chọn vai trò</option>
        <option value="2">Ứng viên</option>
        <option value="3">Nhà tuyển dụng</option>
      </select>
      <button onClick={handleRoleSubmit}>Xác nhận</button>
    </div>
  );
};

export default RoleSelection;
