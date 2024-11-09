import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, FileText, Building2, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Separator } from "../../ui/separator";
import logo from '../../assets/images/common/logo.jpg';
import { useSelector } from 'react-redux';
import { logoutAction } from '../../redux/Auth/auth.action';
import { useDispatch } from 'react-redux';
export default function Sidebar({ selectedSection, setSelectedSection }) {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/user/account-management/dashboard',
      icon: Home
    },
    {
      label: 'CV của tôi',
      path: '/user/account-management/cv',
      icon: FileText
    },
    {
      label: 'Công ty theo dõi',
      path: '/user/account-management/following-companies',
      icon: Building2
    },
    {
      label: 'Hồ sơ cá nhân',
      path: '/user/account-management/profile',
      icon: User
    }
  ];

  const handleMenuClick = (item) => {
    setSelectedSection(item.label);
    navigate(item.path);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <nav className="w-64 border-r bg-white p-6 relative h-screen">
      <div className="flex items-center gap-3 pb-8">
        <img src={logo} alt="logo" className="h-10 w-10 rounded-full bg-primary" />
       <Link to="/" className="text-2xl font-bold text-primary">JobRadar</Link>
      </div>

      <div className="mb-12 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
        <Avatar className="h-16 w-16 mb-4 border-2 border-primary/20">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-xl font-medium">
            {user?.userName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-800">{user?.userName || 'Loading...'}</p>
          <p className="text-sm text-gray-500">{user?.email || 'Loading...'}</p>
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={`w-full justify-start text-base font-medium transition-all duration-200 hover:scale-105 
              ${selectedSection === item.label 
                ? 'bg-primary/10 text-primary shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
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
  );
}
