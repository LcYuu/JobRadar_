import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState('Dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Cập nhật selectedSection dựa trên URL hiện tại
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('user/account-management/dashboard') || path === 'user/account-management') {
      setSelectedSection('Dashboard');
    } else if (path.includes('user/account-management/cv')) {
      setSelectedSection('CV của tôi');
    } else if (path.includes('user/account-management/following-companies')) {
      setSelectedSection('Công ty theo dõi');
    } else if (path.includes('user/account-management/profile')) {
      setSelectedSection('Hồ sơ cá nhân');
    }
  }, [location.pathname]);

  // Redirect to dashboard if on root account-management path
  useEffect(() => {
    if (location.pathname === 'user/account-management') {
      navigate('user/account-management/dashboard');
    }
  }, [location.pathname, navigate]);

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
