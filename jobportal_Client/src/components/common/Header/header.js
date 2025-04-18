import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../../../ui/button";
import logo from "../../../assets/images/common/logo.jpg";

import Swal from "sweetalert2";
import { logoutAction } from "../../../redux/Auth/auth.thunk";

export default function Header() {
  const dispatch = useDispatch();
  const { jwt, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const isAuthenticated = !!jwt && !!user;
  const isSeeker = user?.userType?.userTypeId === 2;

  const handleSignUpClick = () => {
    navigate("/auth/sign-up");
  };

  const handleSignInClick = () => {
    navigate("/auth/sign-in");
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
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        // Chuyển hướng
        window.location.href = '/auth/sign-in';
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi đăng xuất',
          text: 'Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.',
        });
      }
    }
  };

  const handleProfileClick = () => {
    if (user?.userType?.userTypeId === 1) {
      navigate('/admin/dashboard');
    } else if (user?.userType?.userTypeId === 3) {
      navigate('employer/account-management/dashboard');
    } else {
      navigate('user/account-management');
    }
  };

  const isProtectedRoute = () => {
  const protectedPaths = [
    // Quản lý tài khoản người dùng
    '/user/account-management',
    '/user/profile',
    '/user/resume',
    '/user/applied-jobs',
    '/user/saved-jobs',
    '/user/settings',
    
    // Quản lý tài khoản nhà tuyển dụng
    '/employer/account-management',
    '/employer/account-management/dashboard',
    '/employer/job-management',
    '/employer/candidate-management',
    '/employer/company-profile',
    '/employer/settings',
    
    // Quản lý admin
    '/admin/dashboard',
    '/admin/user-management',
    '/admin/employer-management',
    '/admin/job-management',
    '/admin/report-management',
    '/admin/settings',
    
    // Các trang yêu cầu xác thực khác
    '/post-job',
    '/apply-job',
    '/chat',
    '/notifications',
    '/payment',
    '/subscription'
  ];
  
  return protectedPaths.some(path => window.location.pathname.startsWith(path));
};

  useEffect(() => {
    if ((!jwt || !user) && isProtectedRoute()) {
      navigate('/auth/sign-in');
    }
  }, [jwt, user, navigate]);

  return (
    <header className="bg-gradient-to-r from-gray-900 to-purple-900 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <img className="w-8 h-8 bg-purple-600 rounded-full" src={logo} alt="logo" />
          {isSeeker &&(
            <Link to="/" className="text-xl font-bold text-white">JobRadar</Link>
          )}
          
        </div>
        
        {isSeeker && (
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/find-jobs">
                  <Button variant="ghost" className="text-white hover:text-purple-200">
                    Tìm việc
                  </Button>
                </Link> 
              </li>
              <li>
                <Link to="/find-companies">
                  <Button variant="ghost" className="text-white hover:text-purple-200">
                    Công ty
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/create-cv">
                  <Button variant="ghost" className="text-white hover:text-purple-200">
                    Tạo CV
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        )}

      </div>

      <div className="flex space-x-2">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={handleProfileClick}
            >
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full mr-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
              <span className="text-white">{user?.userName || "User"}</span>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:text-red-200"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </div>
        ) : (
          <>
            <Button variant="ghost" className="text-white hover:text-purple-200" onClick={handleSignInClick}>
              Login
            </Button>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={handleSignUpClick}>

              Sign Up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
