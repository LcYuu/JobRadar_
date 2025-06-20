import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../../../ui/button";
import logo from "../../../assets/images/common/logo.jpg";

import Swal from "sweetalert2";
import { logoutAction } from "../../../redux/Auth/auth.thunk";
import { clearMessages } from "../../../redux/ChatBot/chatbotSlice";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { jwt, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const isAuthenticated = !!jwt && !!user;
  const isSeeker = user?.userType?.userTypeId === 2;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignUpClick = () => {
    closeMenu();
    navigate("/auth/sign-up");
  };

  const handleSignInClick = () => {
    closeMenu();
    navigate("/auth/sign-in");
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(logoutAction());
        // Xóa dữ liệu storage
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        dispatch(clearMessages());
        await Swal.fire({
          icon: "success",
          title: "Đăng xuất thành công",
          text: "Bạn đã đăng xuất thành công.",
          timer: 1500,
          showConfirmButton: false,
        });
        // Chuyển hướng
        window.location.href = "/";
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Lỗi đăng xuất",
          text: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        });
      }
    }
  };

  const handleProfileClick = () => {
    closeMenu();
    if (user?.userType?.userTypeId === 1) {
      navigate("/admin/dashboard");
    } else if (user?.userType?.userTypeId === 3) {
      navigate("employer/account-management/dashboard");
    } else {
      navigate("user/account-management");
    }
  };

  const isProtectedRoute = () => {
    const protectedPaths = [
      // Quản lý tài khoản người dùng
      "/user/account-management",
      "/user/profile",
      "/user/resume",
      "/user/applied-jobs",
      "/user/saved-jobs",
      "/user/settings",

      // Quản lý tài khoản nhà tuyển dụng
      "/employer/account-management",
      "/employer/account-management/dashboard",
      "/employer/job-management",
      "/employer/candidate-management",
      "/employer/company-profile",
      "/employer/settings",

      // Quản lý admin
      "/admin/dashboard",
      "/admin/user-management",
      "/admin/employer-management",
      "/admin/job-management",
      "/admin/report-management",
      "/admin/settings",

      // Các trang yêu cầu xác thực khác
      "/post-job",
      "/apply-job",
      "/chat",
      "/notifications",
      "/payment",
      "/subscription",
    ];

    return protectedPaths.some((path) =>
      window.location.pathname.startsWith(path)
    );
  };

  useEffect(() => {
    if ((!jwt || !user) && isProtectedRoute()) {
      navigate("/auth/sign-in");
    }
  }, [jwt, user, navigate]);

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Logic lấy tên hiển thị
  const displayName =
    user?.userType?.userTypeId === 3 && user?.company?.companyName
      ? user.company.companyName
      : user?.userName || user?.email;

  return (
    <header className="bg-gradient-to-r from-gray-900 to-purple-900 px-4 py-3 flex justify-between items-center relative">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <img
            className="w-8 h-8 bg-purple-600 rounded-full"
            src={logo}
            alt="logo"
          />
          {isSeeker && (
            <Link to="/" className="text-xl font-bold text-white">
              JobRadar
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        {isSeeker && (
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li>
                <Link to="/find-jobs">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-[#e5c4f3] hover:bg-transparent"
                  >
                    Tìm việc
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/find-companies">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-[#e5c4f3] hover:bg-transparent"
                  >
                    Công ty
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/create-cv">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-[#e5c4f3] hover:bg-transparent"
                  >
                    Tạo CV
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex space-x-2">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={handleProfileClick}
            >
              <img
                src={user?.avatar }
                alt="User Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="text-white">{displayName}</span>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:text-[#e5c4f3] hover:bg-transparent"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              className="text-white hover:text-[#e5c4f3] hover:bg-transparent"
              onClick={handleSignInClick}
            >
              Đăng nhập
            </Button>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={handleSignUpClick}
            >
              Đăng ký
            </Button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white p-2 focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 shadow-lg z-50 transition-all duration-300 ease-in-out">
          <div className="flex flex-col p-4 space-y-3">
            {isSeeker && (
              <>
                <Link
                  to="/find-jobs"
                  onClick={closeMenu}
                  className="text-white py-2 hover:text-[#e5c4f3] hover:bg-transparent"
                >
                  Tìm việc
                </Link>
                <Link
                  to="/find-companies"
                  onClick={closeMenu}
                  className="text-white py-2 hover:text-[#e5c4f3] hover:bg-transparent"
                >
                  Công ty
                </Link>
                <Link
                  to="/create-cv"
                  onClick={closeMenu}
                  className="text-white py-2 hover:text-[#e5c4f3] hover:bg-transparent"
                >
                  Tạo CV
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-gray-700">
              {isAuthenticated && user ? (
                <>
                  <div
                    className="flex items-center py-2 cursor-pointer"
                    onClick={handleProfileClick}
                  >
                    <img
                      src={user?.avatar || "/default-avatar.png"}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <span className="text-white">{displayName}</span>
                  </div>
                  <button
                    className="text-white py-2 w-full text-left hover:text-[#e5c4f3] hover:bg-transparent"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignInClick}
                    className="text-white py-2 w-full text-left hover:text-[#e5c4f3] hover:bg-transparent"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={handleSignUpClick}
                    className="bg-purple-600 text-white py-2 px-4 rounded w-full hover:bg-purple-700"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
