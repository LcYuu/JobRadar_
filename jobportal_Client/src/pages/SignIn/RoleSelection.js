import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RoleSelection.css";
import { FaUserTie, FaUserGraduate } from "react-icons/fa"; // Import icon từ react-icons
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import SuccessIcon from "../../components/common/Icon/Sucess/Sucess";
import FailureIcon from "../../components/common/Icon/Failed/Failed";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); // null, 'success', 'failure'
  const token = sessionStorage.getItem("jwt"); // Lấy JWT token từ sessionStorage
  const [error, setError] = useState("");
  const handleRoleSubmit = (role) => {
    axios
      .post(`http://localhost:8080/auth/update-role/${role}`, null, {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token trong header
        },
      })
      .then((response) => {
        const { message } = response?.data;
        console.log(message);
        setLoginStatus("success");
        setIsModalOpen(true);

        setTimeout(() => {
          window.location.href = "http://localhost:3000/"; // Redirect về trang chủ
        }, 1000);
      })
      .catch(() => {
        setError(
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
        );
        setLoginStatus("failure");
        setIsModalOpen(true);
      });
  };

  const renderLoginStatus = () => {
    if (loginStatus === "success") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="flex flex-col items-center"
        >
          <SuccessIcon className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-lg font-semibold text-green-700">
            Đăng nhập thành công
          </p>
        </motion.div>
      );
    } else if (loginStatus === "failure") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="flex flex-col items-center"
        >
          <FailureIcon className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-lg font-semibold text-red-700">{error}</p>
        </motion.div>
      );
    }
    return null;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLoginStatus(null);
  };

  return (
    <div className="role-selection-container">
      <h2>Chọn vai trò của bạn</h2>
      <div className="role-buttons">
        <button
          className="role-button candidate"
          onClick={() => handleRoleSubmit(2)}
        >
          <FaUserGraduate className="icon" />
          Ứng viên
        </button>
        <button
          className="role-button employer"
          onClick={() => handleRoleSubmit(3)}
        >
          <FaUserTie className="icon" />
          Nhà tuyển dụng
        </button>
      </div>
      <Dialog isOpen={isModalOpen} onClose={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg text-center mb-2 font-semibold text-gray-900">
              {loginStatus === "success"
                ? "Đăng nhập thành công"
                : "Đăng nhập thất bại"}
            </DialogTitle>
          </DialogHeader>
          <AnimatePresence>{renderLoginStatus()}</AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleSelection;
