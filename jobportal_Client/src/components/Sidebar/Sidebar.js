import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Separator } from "../../ui/separator";
import logo from "../../assets/images/common/logo.jpg";
import { logoutAction } from "../../redux/Auth/auth.action";

export default function Sidebar({ selectedSection, setSelectedSection }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  };

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <div>
    <nav className="w-80 border-r bg-white p-6 relative h-screen">
      <div className="flex items-center gap-3 pb-8">
        <img
          src={logo}
          alt="logo"
          className="h-10 w-10 rounded-full bg-primary"
        />
        <Link to="/" className="text-2xl font-bold text-primary">
          JobRadar
        </Link>
      </div>

      <div className="mb-12 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
        <Avatar className="h-16 w-16 mb-4 border-2 border-primary/20">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-xl font-medium">
            {user?.userName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-800">
            {user?.userName || "Loading..."}
          </p>
          <p className="text-sm text-gray-500 break-words whitespace-normal">
            {user?.email || "Loading..."}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`w-full justify-start text-base font-medium transition-all duration-200 hover:scale-105 
              ${
                selectedSection === item.label
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-primary"
              } 
              focus:outline-none focus:ring-2 focus:ring-primary/20`}
            onClick={() => handleMenuClick(item)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </div>

      <Separator className="my-8" />

      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-base font-medium hover:bg-gray-100 hover:text-primary hover:scale-105 transition-all duration-200"
          onClick={() =>
            handleMenuClick({
              path:
                user?.userType?.userTypeId === 1
                  ? "/admin/settings"
                  : "/user/account-management/settings",
              icon: Settings,
            })
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          Cài đặt
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-base font-medium hover:bg-gray-100 hover:text-primary hover:scale-105 transition-all duration-200"
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          Trợ giúp
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-6 right-6 hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" />
      </Button>

      
    </nav>
    <div className="mt-6">
        <img
          src="https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/img/Banner%202%20(1).png" // Thay đổi đường dẫn ảnh ở đây
          alt="Banner"
          className="w-80 h-auto  p-6 "
        />
      </div>
    </div>
    
  );
}
