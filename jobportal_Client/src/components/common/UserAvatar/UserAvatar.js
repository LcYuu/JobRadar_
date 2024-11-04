import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfileAction } from '../../../redux/Auth/auth.action';

const UserAvatar = () => {
  const { auth } = useSelector(store => store);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = !!auth.jwt || !!localStorage.getItem('jwt');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfileAction());
    }
  }, [dispatch, isAuthenticated]);

  const handleAvatarClick = (e) => {
    e.preventDefault();
    if (isAuthenticated && auth.user) {
      navigate('/account-management');
    }
  };

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