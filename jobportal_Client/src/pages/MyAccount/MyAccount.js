import React from 'react';
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Home, FileText, Building2, User, Settings, HelpCircle, MoreVertical, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/common/logo.jpg';
export default function MyAccount() {
  const applications = [
    { id: 1, company: 'ABCDEFG', logo: '🟩', position: 'Social Media Assistant', location: 'Q2, Ho Chi Minh', type: 'Full-Time', date: '24 July 2021' },
    { id: 2, company: 'ABCDEFG', logo: '🔵', position: 'Social Media Assistant', location: 'Q5, Ho Chi Minh', type: 'Full-Time', date: '23 July 2021' },
    { id: 3, company: 'ABCDEFG', logo: '🟧', position: 'Social Media Assistant', location: 'Thanh Xuan, Ha Noi', type: 'Full-Time', date: '22 July 2021' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary flex items-center">
            <a  href="/" className="text-primary mr-2"><img src={logo} alt="logo" /></a> JobRadar
          </h1>
        </div>
        <nav className="mt-8">
          <Link to="#" className="flex items-center px-4 py-2 text-primary bg-primary/10">
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link to="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
            <FileText className="mr-3 h-5 w-5" />
            My CV
          </Link>
          <Link to="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Building2 className="mr-3 h-5 w-5" />
            Công ty yêu thích
          </Link>
          <Link to="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
            <User className="mr-3 h-5 w-5" />
            Profile của tôi
          </Link>
        </nav>
        <div className="mt-auto p-4">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">Cài đặt</h2>
          <Link to="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
            <Settings className="mr-3 h-5 w-5" />
            Cài đặt
          </Link>
          <Link to="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100">
            <HelpCircle className="mr-3 h-5 w-5" />
            Trợ giúp
          </Link>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center">
            <img src={logo} alt="User avatar" className="w-10 h-10 rounded-full mr-3" />
            <div>
              <h3 className="font-medium">Someone</h3>
              <p className="text-sm text-gray-500">someone@email.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
         <a href="/"> <Button variant="outline">Trở về trang chủ</Button></a>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-2">Tổng đơn đã ứng tuyển</h2>
            <div className="flex items-center">
              <span className="text-5xl font-bold mr-4">45</span>
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Lịch sử ứng tuyển</h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl mr-4">
                      {app.logo}
                    </div>
                    <div>
                      <h3 className="font-medium">{app.position}</h3>
                      <p className="text-sm text-gray-500">{app.company} • {app.location} • {app.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-4">Ngày nộp<br />{app.date}</span>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="#" className="text-primary font-medium inline-flex items-center">
                Xem toàn bộ lịch sử
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
