import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../../../ui/button';
import logo from '../../../assets/images/common/logo.jpg';
import UserAvatar from '../UserAvatar/UserAvatar';
export default function Header() {
  const isAuthenticated = useSelector(store => store.auth.jwt != null);
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate('/auth/sign-up');
  };
  const handleSignInClick = () => {
    navigate('/auth/sign-in');
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-purple-900 px-4 py-3 flex justify-between items-center">
    
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <img className="w-8 h-8 bg-purple-600 rounded-full" src={logo} alt="logo" />
          <a href="/" className="text-xl font-bold text-white">JobRadar</a>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
             <a href="/find-jobs"><Button variant="ghost" className="text-white hover:text-purple-200">Tìm việc</Button></a> 
            </li>
            <li>
              <a href="/find-companies"><Button variant="ghost" className="text-white hover:text-purple-200">Công ty</Button></a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex space-x-2">
      {isAuthenticated ? (
          <UserAvatar />
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