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

const App = () => {
  const location = useLocation();
  const { auth } = useSelector(store => store);
  const dispatch = useDispatch();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt && !auth.user) {
      dispatch(getProfileAction(jwt));
    }
  }, [dispatch, auth.user]);

  const isAuthenticated = !!auth.user;

  // Ẩn Header nếu người dùng đang ở trang đăng ký và đăng nhập
  const showHeader = location.pathname !== '/auth/sign-up' && location.pathname !== '/auth/sign-in' && location.pathname !== '/auth/forgot-password';


  return (
    <>
      {showHeader && <Header />} 
      <Routes>
        <Route path="/auth/sign-up" element={<SignUpForm />} />
        <Route path="/account-management" element={<MyAccount />} />
        <Route path="/auth/sign-in" element={<SignInForm />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/find-jobs" element={<FindJobs />} />
        <Route path="/find-companies" element={<FindCompanies />} />
      </Routes>
    </>
  );
};

export default App;