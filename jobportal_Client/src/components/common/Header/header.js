import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../../../ui/button';
import logo from '../../../assets/images/common/logo.jpg';
import UserAvatar from '../UserAvatar/UserAvatar';
import { getProfileAction } from '../../../redux/Auth/auth.action';
import { LogOut, User, Settings } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { logoutAction } from '../../../redux/Auth/auth.action';

export default function Header() {
  const dispatch = useDispatch();
  const { jwt, user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const storedJwt = localStorage.getItem('jwt');
    if (storedJwt && !user) {
      dispatch(getProfileAction());
    }
  }, [dispatch, user]);

  const isAuthenticated = !!jwt || !!localStorage.getItem('jwt');

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
    navigate('/account-management');
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="outline-none">
              <UserAvatar />
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                <DropdownMenu.Item onClick={handleProfileClick} className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Tài khoản của tôi</span>
                </DropdownMenu.Item>
                
                <DropdownMenu.Item className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenu.Item>
                
                <DropdownMenu.Separator className="h-[1px] bg-violet6 m-[5px]" />
                
                <DropdownMenu.Item onClick={handleLogout} className="group text-[13px] leading-none text-red-600 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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