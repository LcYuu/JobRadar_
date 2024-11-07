import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../../../ui/button';
import logo from '../../../assets/images/common/logo.jpg';
import { getProfileAction, logoutAction } from '../../../redux/Auth/auth.action';

export default function Header() {
  const dispatch = useDispatch();
  const { jwt, user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  const isAuthenticated = !!jwt && !!user;

  const handleSignUpClick = () => {
    navigate('/auth/sign-up');
  };
  
  const handleSignInClick = () => {
    navigate('/auth/sign-in');
  };

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  const handleProfileClick = () => {
    navigate('user/account-management');
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-purple-900 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <img className="w-8 h-8 bg-purple-600 rounded-full" src={logo} alt="logo" />
          <Link to="/" className="text-xl font-bold text-white">JobRadar</Link>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link  to="/find-jobs"><Button variant="ghost" className="text-white hover:text-purple-200">Tìm việc</Button></Link> 
            </li>
            <li>
              <Link to="/find-companies"><Button variant="ghost" className="text-white hover:text-purple-200">Công ty</Button></Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex space-x-2">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center cursor-pointer" onClick={handleProfileClick}>
              <img 
                src={user?.avatar || '/default-avatar.png'} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full mr-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <span className="text-white">{user?.userName || 'User'}</span>
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
            <Button variant="ghost" className="text-white hover:text-purple-200" onClick={handleSignInClick}>Login</Button>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={handleSignUpClick}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}