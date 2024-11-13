import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfileAction } from '../../../redux/Auth/auth.action';

const UserAvatar = () => {
  const { auth } = useSelector(store => store);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = !!sessionStorage.getItem('jwt');

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        await dispatch(getProfileAction());
      }
    };
    fetchProfile();
  }, [dispatch, isAuthenticated]);

  const handleAvatarClick = (e) => {
    e.preventDefault();
    if (isAuthenticated && auth.user) {
      const userType = auth.user?.userType;
      console.log('Current user type:', userType);
      
      // Make sure we're comparing with numbers
      const userTypeId = parseInt(userType?.userTypeId);
      console.log('UserTypeId:', userTypeId);

      if (userTypeId === 2) {
        navigate('/user/account-management/dashboard');
      } else if (userTypeId === 3) {
        navigate('/employer/account-management/dashboard');
      }
    }
  };

  // Don't render if not authenticated or no user data
  if (!isAuthenticated || !auth.user) {
    return null;
  }

  return (
    <div onClick={handleAvatarClick} className="flex items-center cursor-pointer">
      <img 
        src={auth.user?.avatar || '/default-avatar.png'} 
        alt="User Avatar" 
        className="w-8 h-8 rounded-full mr-2"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/default-avatar.png';
        }}
      />
      <span className="text-white">{auth.user?.userName || 'User'}</span>
    </div>
  );
};

export default UserAvatar;