import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInitializing } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (!isInitializing && !isAuthenticated && !location.pathname.startsWith('/auth')) {
      navigate('/auth/sign-in', { replace: true });
    }
  }, [isAuthenticated, navigate, location, isInitializing]);

  return !isInitializing && isAuthenticated ? children : null;
};

export default ProtectedRoute;
