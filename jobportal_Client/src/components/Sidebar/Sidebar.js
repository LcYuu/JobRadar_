import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Star,
  LogOut,
  BarChart,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Separator } from "../../ui/separator";
import logo from "../../assets/images/common/logo.jpg";
import Swal from "sweetalert2";
import NotificationDropdown from "../Notification/NotificationDropdown";
import "./Sidebar.css";
import { logoutAction } from "../../redux/Auth/auth.thunk";


export default function Sidebar({ selectedSection, setSelectedSection }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isOpen, setIsOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1000;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const adminMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Danh sách công ty", icon: Building2, path: "/admin/company-list" },
    { label: "Danh sách người dùng", icon: Users, path: "/admin/user-list" },
    { label: "Danh sách công việc", icon: FileText, path: "/admin/job-list" },
    { label: "Danh sách đánh giá", icon: Star, path: "/admin/review-list" },
  ];

  const seekerMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/user/account-management/dashboard",
    },
    {
      label: "CV của tôi",
      icon: FileText,
      path: "/user/account-management/cv",
    },
    {
      label: "Công ty theo dõi",
      icon: Building2,
      path: "/user/account-management/following-companies",
    },
    {
      label: "Hồ sơ cá nhân",
      icon: Users,
      path: "/user/account-management/profile",
    },
    {
      label: "Công việc đã lưu",
      icon: Bookmark,
      path: "/user/account-management/saved-jobs",
    },
  ];

  const employerMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/employer/account-management/dashboard" },
    { label: "Profile công ty", icon: Building2, path: "/employer/account-management/company-profile" },
    { label: "Danh sách ứng tuyển", icon: Users, path: "/employer/account-management/candidate-management" },
    { label: "Danh sách công việc", icon: FileText, path: "/employer/account-management/job-management" },
    { label: "Danh sách đánh giá", icon: Star, path: "/employer/account-management/review-management" },
    { label: "Thống kê hiệu suất", icon: BarChart, path: "/employer/account-management/job-stats" },
  ];

  // Determine menu items based on user type
  const menuItems = React.useMemo(() => {
    const userTypeId = user?.userType?.userTypeId;
    
    switch (userTypeId) {
      case 1:
        return adminMenuItems;
      case 2:
        return seekerMenuItems;
      case 3:
        return employerMenuItems;
      default:
        return [];
    }
  }, [user?.userType?.userTypeId]);

  const handleMenuClick = (item) => {
    setSelectedSection(item.label);
    navigate(item.path);
    if (isMobile) {
      setIsOpen(false);
    }
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

  const handleJobRadarClick = (e) => {
    if (user?.userType?.userTypeId === 1 || user?.userType?.userTypeId === 3) {
      e.preventDefault();
    }
  };

  // Ensure user data is loaded before rendering content that depends on it
  if (!user) {
    return <div className="sidebar-loading">Loading...</div>;
  }
  const displayName = user?.userType?.userTypeId === 3 && user?.company?.companyName
                     ? user.company.companyName
                     : user?.userName || user?.email; 
  return (
    <>
      {isMobile && (
        <button
          className="mobile-menu-button"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <div
        className={`sidebar-container ${isMobile ? "mobile" : ""} ${
          isMobile && isOpen ? "open" : ""
        }`}
      >
        {/* Separate mobile overlay */}
        {isMobile && isOpen && (
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
        )}

        <nav className="sidebar-nav">
          {isMobile && (
            <button
              className="close-sidebar-button"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          )}

          <div className="flex items-center gap-3 pb-8">
            <img
              src={logo}
              alt="logo"
              className="h-12 w-12 rounded-full bg-primary shadow-md"
            />
            <Link
              to="/"
              onClick={handleJobRadarClick}
              className={`text-3xl font-bold ${
                user?.userType?.userTypeId === 1 || user?.userType?.userTypeId === 3
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primary hover:text-purple-700 transition duration-200"
              }`}
            >
              JobRadar
            </Link>
          </div>

          <div className="mb-12 p-4 rounded-lg bg-gradient-to-r from-[#6441a5] via-[#2a0845] to-[#6441a5] hover:bg-gradient-to-l transition-all duration-300 relative">
            <div className="flex justify-between items-start mb-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={user?.avatar} alt={displayName|| "User"} />
                <AvatarFallback className="text-2xl font-semibold text-white">
                  {user?.userName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {user?.userType?.userTypeId === 2 && (
                <div className="notification-dropdown">
                  <NotificationDropdown />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-white">
                {user?.userName || "User"}
              </p>
              <p className="text-sm text-white break-words">
                {user?.email || "Email"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start text-lg font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 
                  ${
                    selectedSection === item.label
                      ? "bg-primary/10 text-primary shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-primary"
                  } 
                  focus:outline-none focus:ring-2 focus:ring-primary/20`}
                onClick={() => handleMenuClick(item)}
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.label}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-lg font-medium py-3 px-4 rounded-lg mt-4 transition-all duration-200 hover:bg-red-100 hover:text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-4 h-6 w-6" />
            Đăng xuất
          </Button>

          <Separator className="my-8" />

          <div className="mt-6">
            <img
              src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/img/Banner%202%20(1).png"
              alt="Banner"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        </nav>
      </div>
    </>
  );
}