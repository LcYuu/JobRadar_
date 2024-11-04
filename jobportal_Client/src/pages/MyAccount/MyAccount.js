import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Dashboard_Seeker from '../../components/Dashboard/Dashboard';
import MyCV from '../../components/MyCv/MyCv';
import { Button } from '../../ui/button';
import FavoriteCompanies from '../../components/FollowingCompanies/FollowingCompanies';
import MyProfile from '../../components/MyProfile/MyProfile';
import { Link } from 'react-router-dom';
export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState('Dashboard');

  const renderContent = () => {
    switch (selectedSection) {
      case 'Dashboard':
        return <Dashboard_Seeker />;
      case 'CV của tôi':
        return <MyCV />;
      case 'Công ty theo dõi':
        return <FavoriteCompanies />;
      case 'Hồ sơ cá nhân':
        return <MyProfile/>;
      default:
        return <Dashboard_Seeker />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <main className="flex-1 p-8">
        {/* <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{selectedSection}</h1>
          <a href="/"><Button variant="outline">Go to Home</Button></a>
        </div> */}
        <div className="flex justify-between">
        <h1 className="text-2xl font-bold">{selectedSection}</h1>
          <Link to="/"><Button variant="outline">Trở về trang chủ</Button></Link>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
