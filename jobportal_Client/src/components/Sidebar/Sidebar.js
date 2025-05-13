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
  Menu,
  X,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Separator } from "../../ui/separator";
import logo from "../../assets/images/common/logo.jpg";
import { logoutAction } from "../../redux/Auth/auth.action";
import Swal from "sweetalert2";
import NotificationDropdown from '../Notification/NotificationDropdown';
import "./Sidebhttps://github.com/LcYuu/JobRadar_/pull/134/conflict?name=jobportal_Server%252Fjob-portal%252Fsrc%252Fmain%252Fjava%252Fcom%252Fjob_portal%252Fcontroller%252FJobPostController.java&ancestor_oid=70b91328db1cf5bbb6f3affcd0b45bd8ae1a0a8b&base_oid=bf5d87b02d60ebfdd3b60f2ff3072cf348b81f8b&head_oid=39b30961b18d7f0b1391b75dbc28a099f25712fcar.css";

export default function Sidebar({ selectedSection, setSelectedSection }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const adminMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      label: "Danh sách công ty",
      icon: Building2,
      path: "/admin/company-list",
    },
    {
      label: "Danh sách người dùng",
      icon: Users,
      path: "/admin/user-list",
    },
    {
      label: "Danh sách công việc",
      icon: FileText,
      path: "/admin/job-list",
    },
    {
      label: "Danh sách đánh giá",
      icon: Star,
      path: "/admin/review-list",
    },
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
  ];

  const employerMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/employer/account-management/dashboard",
    },
    {
      label: "Profile công ty",
      icon: Building2,
      path: "/employer/account-management/company-profile",
    },
    {
      label: "Danh sách ứng tuyển",
      icon: Users,
      path: "/employer/account-management/candidate-management",
    },
    {
      label: "Danh sách công việc",
      icon: FileText,
      path: "/employer/account-management/job-management",
    },
    {
      label: "Danh sách đánh giá",
      icon: Star,
      path: "/employer/account-management/review-management",
    },
    {
      label: "Thống kê hiệu suất",
      icon: BarChart,
      path: "/employer/account-management/job-stats",
    },
  ];

  let menuItems;
  
  switch (user?.userType?.userTypeId) {
    case 1:
      menuItems = adminMenuItems;
      break;
    case 2:
      menuItems = seekerMenuItems;
      break;
    case 3:
      menuItems = employerMenuItems;
      break;
    default:
      menuItems = [];
  }

  const handleMenuClick = (item) => {
    setSelectedSection(item.label);
    navigate(item.path);
    if (isMobile) {
      setIsOpen(false); // Close sidebar on mobile after navigation
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
    });
  
    if (result.isConfirmed) {
      dispatch(logoutAction());
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };
  
  const handleJobRadarClick = (e) => {
    if (user?.userType?.userTypeId === 1 || user?.userType?.userTypeId === 3) {
      e.preventDefault(); // Prevent navigation
    }
  };

  // Mobile menu button
  const MobileMenuButton = () => (
    <button 
      className="mobile-menu-button" 
      onClick={toggleSidebar}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  return (
    <>
      {isMobile && <MobileMenuButton />}
      
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      <div className={`sidebar-container ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {/* Close button for mobile */}
          {isMobile && (
            <button 
              className="close-sidebar-button"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          )}
          
          {/* Logo Section */}
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
                  : "text-primary hover:text-indigo-700 transition duration-200"
              }`}
            >
              JobRadar
            </Link>
          </div>

          {/* User Profile */}
          <div className="mb-12 p-4 rounded-lg bg-gradient-to-r from-[#6441a5] via-[#2a0845] to-[#6441a5] hover:bg-gradient-to-l transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl font-semibold text-white">
                  {user?.userName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {user?.userType?.userTypeId === 2 && (
                <NotificationDropdown />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-white">
                {user?.userName || "Loading..."}
              </p>
              <p className="text-sm text-white break-words">
                {user?.email || "Loading..."}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
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

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-lg font-medium py-3 px-4 rounded-lg mt-4 transition-all duration-200 hover:bg-red-100 hover:text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-4 h-6 w-6" />
            Đăng xuất
          </Button>

          {/* Separator */}
          <Separator className="my-8" />

          {/* Banner */}
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

