import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { ArrowLeft } from "@mui/icons-material";

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState("Trang chủ");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Route-to-section mapping for user and employer
  const sectionMap = {
    user: {
      "user/account-management/dashboard": "Trang chủ",
      "user/account-management/cv": "CV của tôi",
      "user/account-management/following-companies": "Công ty theo dõi",
      "user/account-management/profile": "Hồ sơ cá nhân",
      "user/account-management/saved-jobs": "Công việc đã lưu"
    },
    employer: {
      "employer/account-management/dashboard": "Trang chủ",
      "employer/account-management/company-profile": "Thông tin công ty",
      "employer/account-management/applications": "Danh sách ứng tuyển",
      "employer/account-management/jobs": "Danh sách công việc",
      "employer/account-management/reviews": "Danh sách đánh giá",
    },
  };

  // Update selected section based on route
  useEffect(() => {
    const path = location.pathname;
    
    if (user?.userType?.userTypeId === 2) {
      // For user type 2
      for (const [route, section] of Object.entries(sectionMap.user)) {
        if (path.includes(route)) {
          setSelectedSection(section);
          return;
        }
      }
    } else if (user?.userType?.userTypeId === 3) {
      // For user type 3
      for (const [route, section] of Object.entries(sectionMap.employer)) {
        if (path.includes(route)) {
          setSelectedSection(section);
          return;
        }
      }
    }
  }, [location.pathname, user]);

  // Redirect to dashboard based on user role
  useEffect(() => {
    if (location.pathname === "/user/account-management" && user?.userType?.userTypeId) {
      const basePath = user.userType.userTypeId === 2 ? "user" : "employer";
      navigate(`/${basePath}/account-management/dashboard`);
    }
  }, [location.pathname, navigate, user]);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        className="h-full"
      />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-4">
          {user?.userType?.userTypeId === 2 ? (
            <>
              <Link to="/">
                <Button
                  variant="outline"
                  className="py-2 px-6 text-white bg-purple-500 border-purple-500 hover:bg-purple-600 hover:border-purple-600 transition-all duration-300"
                  aria-label="Trở về trang chủ"
                >
                  Trở về trang chủ
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedSection}
              </h1>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-purple-600">
              {selectedSection}
            </h1>
          )}
        </div>
        <Outlet />
      </main>
    </div>
  );
}