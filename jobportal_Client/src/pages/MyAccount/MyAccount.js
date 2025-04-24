import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState("Dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Route-to-section mapping for user and employer
  const sectionMap = {
    user: {
      "user/account-management/dashboard": "Dashboard",
      "user/account-management/cv": "CV của tôi",
      "user/account-management/following-companies": "Công ty theo dõi",
      "user/account-management/profile": "Hồ sơ cá nhân",
    },
    employer: {
      "employer/account-management/dashboard": "Dashboard",
      "employer/account-management/company-profile": "Profile công ty",
      "employer/account-management/applications": "Danh sách ứng tuyển",
      "employer/account-management/jobs": "Danh sách công việc",
      "employer/account-management/reviews": "Danh sách đánh giá",
    },
  };

  // Update selected section based on route
  useEffect(() => {
    const path = location.pathname;
    let section = "Dashboard"; // Default section

    if (user?.userType?.userTypeId === 2) {
      section = sectionMap.user[path] || "Dashboard";
    } else if (user?.userType?.userTypeId === 3) {
      section = sectionMap.employer[path] || "Dashboard";
    }

    setSelectedSection(section);
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
                  className="py-2 px-6 text-white bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 transition-all duration-300"
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