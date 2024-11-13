import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState('Dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const path = location.pathname;
    if (user?.userType?.userTypeId === 2) {
      if (path.includes('user/account-management/dashboard')) {
        setSelectedSection('Dashboard');
      } else if (path.includes('user/account-management/cv')) {
        setSelectedSection('CV của tôi');
      } else if (path.includes('user/account-management/following-companies')) {
        setSelectedSection('Công ty theo dõi');
      } else if (path.includes('user/account-management/profile')) {
        setSelectedSection('Hồ sơ cá nhân');
      }
    } else if (user?.userType?.userTypeId === 3) {
      if (path.includes('employer/account-management/dashboard')) {
        setSelectedSection('Dashboard');
      } else if (path.includes('employer/account-management/company-profile')) {
        setSelectedSection('Profile công ty');
      } else if (path.includes('employer/account-management/applications')) {
        setSelectedSection('Danh sách ứng tuyển');
      } else if (path.includes('employer/account-management/jobs')) {
        setSelectedSection('Danh sách công việc');
      }
    }
  }, [location.pathname, user]);

  // Redirect to dashboard based on user role
  useEffect(() => {
    if (location.pathname === 'user/account-management') {
      if (user?.userType?.userTypeId === 2) {
        navigate('user/account-management/dashboard');
      } else if (user?.userType?.userTypeId === 3) {
        navigate('employer/account-management/dashboard');
      }
    }
  }, [location.pathname, navigate, user]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <main className="flex-1 p-8">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">{selectedSection}</h1>
          <Link to="/"><Button variant="outline">Trở về trang chủ</Button></Link>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
