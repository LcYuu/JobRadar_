import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import './App.css';
import Header from './components/common/Header/header';
import Home from './pages/Home/Home';
import SignUpForm from './pages/SignUp/signup';
import './global.css';
import SignInForm from "./pages/SignIn/SignIn";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import FindJobs from "./pages/FindJobs/FindJobs";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { getProfileAction } from "./redux/Auth/auth.action";
import ChangePassword from "./pages/ForgotPassword/ChangePassword";
import MyAccount from "./pages/MyAccount/MyAccount";
import FindCompanies from "./pages/FindComapnies/FindCompanies";
import { useNavigate } from "react-router-dom";
const ProtectedRoute = ({ children, isAuthenticated }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/sign-in');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};

const App = () => {
  const location = useLocation();
  const { user, jwt, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    if (token && !user) {
      const fetchProfile = async () => {
        const success = await dispatch(getProfileAction());
        if (!success && !location.pathname.startsWith('/auth')) {
          navigate('/auth/sign-in');
        }
      };
      fetchProfile();
    }
  }, [dispatch, user, navigate, location.pathname]);

  const showHeader = useMemo(() => {
    const noHeaderPaths = ['/auth/sign-up', '/auth/sign-in', '/auth/forgot-password'];
    return !noHeaderPaths.includes(location.pathname);
  }, [location.pathname]);
  
  return (
    <div className="app-container">
      {showHeader && <Header />} 
      <Routes>
        <Route path="/auth/sign-up" element={<SignUpForm />} />
        <Route path="/auth/sign-in" element={<SignInForm />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account-management" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyAccount />
            </ProtectedRoute>
          } 
        />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/find-jobs" element={<FindJobs />} />
        <Route path="/find-companies" element={<FindCompanies />} />
      </Routes>
    </div>
  );
};

export default App;