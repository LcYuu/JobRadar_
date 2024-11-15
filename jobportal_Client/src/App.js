import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Header from "./components/common/Header/header";
import Footer from "./components/common/Footer/Footer";
import Home from "./pages/Home/Home";
import SignUpForm from "./pages/SignUp/signup";
import "./global.css";
import SignInForm from "./pages/SignIn/SignIn";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import FindJobs from "./pages/FindJobs/FindJobs";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { getProfileAction } from "./redux/Auth/auth.action";
import ChangePassword from "./pages/ForgotPassword/ChangePassword";
import MyAccount from "./pages/MyAccount/MyAccount";
import FindCompanies from "./pages/FindComapnies/FindCompanies";
import CompanyProfile from "./pages/CompanyProfile/CompanyProfile";
import { useNavigate } from "react-router-dom";

import PublicRoute from './components/PublicRoute/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Dashboard_Seeker from './components/Dashboard/Dashboard';
import MyCV from './components/MyCv/MyCv';
import FavoriteCompanies from './components/FollowingCompanies/FollowingCompanies';
import MyProfile from './components/MyProfile/MyProfile';
import JobDetail from './pages/JobDetail/JobDetail';
import Settings from './components/Settings/settings';
import Banner from './components/common/Banner/banner';
import Background from './components/common/Background/background';
import Dashboard_Employer from './components/Dashboard/DashboardEmployer';
import CompanyProfile_Management from './components/CompanyProfile_Management/CompanyProfile_Management';
import JobManagement from './components/JobManagement/JobManagement';
import CandidateManagement from './components/CandidateManagement/CandidateManagement';
import ApplicantDetail from './pages/ApplicantDetail/ApplicantDetail';
import AdminDashboard from './pages/Admin/Dashboard/Dashboard';
import CompanyList from './pages/Admin/CompanyList/CompanyList';
import UserList from './pages/Admin/UserList/UserList';
import AdminJobList from './pages/Admin/JobList/JobList';


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
        if (!success && !location.pathname.startsWith("/auth")) {
          navigate("/auth/sign-in");
        }
      };
      fetchProfile();
    }
  }, [dispatch, user, navigate, location.pathname]);

  const showHeader = useMemo(() => {
    const noHeaderPaths = [
      "/auth/sign-up",
      "/auth/sign-in",
      "/auth/forgot-password",
      "user/account-management",
      "employer/account-management",
      "/change-password",
    ];
    return !noHeaderPaths.includes(location.pathname);
  }, [location.pathname]);

  const showFooter = useMemo(() => {
    const noFooterPaths = [
      "/auth/sign-up",
      "/auth/sign-in",
      "/auth/forgot-password",
      "/change-password",
    ];
    return (
      !noFooterPaths.includes(location.pathname) &&
      !location.pathname.includes("/user/account-management") &&
      !location.pathname.includes("/employer/account-management")
    );
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* <Background /> */}
      {showHeader && <Header />}
      {/* {showHeader && <Banner />}  */}
      <Routes>
        {/* Public Routes - Không cần đăng nhập và có redirect khi đã đăng nhập */}
        <Route
          path="/auth/sign-up"
          element={
            <PublicRoute restricted={true}>
              <SignUpForm />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/sign-in"
          element={
            <PublicRoute restricted={true}>
              <SignInForm />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <PublicRoute restricted={true}>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Public Routes - Không cần đăng nhập và không redirect */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        <Route
          path="/find-jobs"
          element={
            <PublicRoute>
              <FindJobs />
            </PublicRoute>
          }
        />
        <Route
          path="/find-companies"
          element={
            <PublicRoute>
              <FindCompanies />
            </PublicRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PublicRoute>
              <ChangePassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Cần đăng nhập */}
        <Route
          path="/user/account-management"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyAccount />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard_Seeker />} />
          <Route path="dashboard" element={<Dashboard_Seeker />} />
          <Route path="cv" element={<MyCV />} />
          <Route path="following-companies" element={<FavoriteCompanies />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="/jobs/job-detail/:postId"
          element={
            <PublicRoute>
              <JobDetail />
            </PublicRoute>
          }
        />

        <Route
          path="/companies/:companyId"
          element={
            <PublicRoute>
              <CompanyProfile />
            </PublicRoute>
          }
        />

        {/* <Route path="/company-profile/:id" element={<CompanyProfile />} /> */}

        {/* Employer Protected Routes */}
        <Route
          path="/employer/account-management"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyAccount />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard_Employer />} />
          <Route path="dashboard" element={<Dashboard_Employer />} />
          <Route
            path="company-profile"
            element={<CompanyProfile_Management />}
          />
          <Route path="job-management" element={<JobManagement />} />
          <Route path="candidate-management" element={<CandidateManagement />} />
          <Route path="candidate-management/applicants/:id" element={<ApplicantDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute isAuthenticated={isAuthenticated && user?.userType?.userTypeId === 1}>
            <MyAccount />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="company-list" element={<CompanyList />} />
          <Route path="user-list" element={<UserList />} />
          <Route path="job-list" element={<AdminJobList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
};

export default App;
