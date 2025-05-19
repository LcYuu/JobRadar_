import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
import ChangePassword from "./pages/ForgotPassword/ChangePassword";
import MyAccount from "./pages/MyAccount/MyAccount";
import FindCompanies from "./pages/FindCompanies/FindCompanies";
import CompanyProfile from "./pages/CompanyProfile/CompanyProfile";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import PublicRoute from "./components/PublicRoute/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Dashboard_Seeker from "./components/Dashboard/Dashboard";
import MyCV from "./components/MyCv/MyCv";
import FavoriteCompanies from "./components/FollowingCompanies/FollowingCompanies";
import MyProfile from "./components/MyProfile/MyProfile";
import JobDetail from "./pages/JobDetail/JobDetail";
import Settings from "./components/Settings/settings";

import Dashboard_Employer from "./components/Dashboard/DashboardEmployer";
import CompanyProfile_Management from "./components/CompanyProfile_Management/CompanyProfile_Management";
import JobManagement from "./components/JobManagement/JobManagement";
import CandidateManagement from "./components/CandidateManagement/CandidateManagement";
import ApplicantDetail from "./pages/ApplicantDetail/ApplicantDetail";
import AdminDashboard from "./pages/Admin/Dashboard/Dashboard";
import CompanyList from "./pages/Admin/CompanyList/CompanyList";
import UserList from "./pages/Admin/UserList/UserList";
import AdminJobList from "./pages/Admin/JobList/JobList";

import JobDetailEmployer from "./pages/JobDetailEmployer/JobDetailEmployer";
import PostJob from "./pages/PostJob/PostJob";

import RoleSelection from "./pages/SignIn/RoleSelection";
import CompanyDetail from "./pages/Admin/CompanyDetail/CompanyDetail";
import JobDetailAdmin from "./pages/Admin/JobDetail/JobDetailAdmin";

import Survey from "./pages/Survey/Survey";
import SurveyStatistics from "./pages/Admin/SurveyStatistic/SurveyStatistics";
import { getProfileAction, logoutAction } from "./redux/Auth/auth.thunk";
import { setUserFromStorage } from "./redux/Auth/authSlice";
import { startInactivityTimer } from "./utils/session";
import CompanyReview from "./pages/ReviewManagement/CompanyReview";
import AdminReview from "./pages/ReviewManagement/AdminReview";
import SeekerProfile from "./components/SeekerProfile/SeekerProfile";

import TermsOfService from './pages/Legal/TermsOfService';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import CVEditor from "./pages/CreateCV/CVEditor";
import CVSelection from "./pages/CreateCV/CVSelection";
import ViewCV from "./pages/CreateCV/ViewCV";
import { isTokenExpired } from './utils/tokenUtils';
import VerifiedCompany from "./pages/SignIn/VerifiedCompany";
import JobStatsPage from "./components/JobStats/JobStatsPage";
import SavedJobs from "./components/SavedJobs/SavedJob";

const ProtectedHome = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.userType?.userTypeId === 1) {
      // Admin
      navigate("/admin/dashboard");
    } else if (user?.userType?.userTypeId === 3) {
      // Employer
      navigate("/employer/account-management/dashboard");
    }
  }, [user, navigate]);

  return <Home />;
};
const App = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("jwt");
      if (!token || isTokenExpired(token)) {
        if (isAuthenticated) {
          dispatch(logoutAction());
        }
      }
    };
  
    // Kiểm tra mỗi 1 giây
    const interval = setInterval(checkAuth, 1000);
  
    // Cleanup
    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);
  
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const savedUser = localStorage.getItem("user");
    if (token) {
      if (!user && savedUser) {
        dispatch(setUserFromStorage(JSON.parse(savedUser)));
      } else if (!user) {
        const fetchProfile = async () => {
          const success = await dispatch(getProfileAction());
          if (success.payload) {
            localStorage.setItem('user', JSON.stringify(success.payload));
          } else if (!location.pathname.startsWith("/auth")) {
            navigate("/auth/sign-in");
          }
        };
        fetchProfile();
      }
    }

    if (token && user) {
      const stopInactivityTimer = startInactivityTimer(dispatch);
      return () => stopInactivityTimer();
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
      "/role-selection",
    ];
    return (
      !noFooterPaths.includes(location.pathname) &&
      !location.pathname.includes("/user/account-management") &&
      !location.pathname.includes("/employer/account-management") &&
      !location.pathname.includes("/admin")
    );
  }, [location.pathname]);




  return (
    <div className="app-container">
      {/* <Background /> */}
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
        <Route path="/role-selection" element={<RoleSelection />} />

        <Route path="/update-employer" element={<VerifiedCompany/>}/>
        
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
              <ProtectedHome />
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
          path="/create-cv"
          element={
            <PublicRoute>
              <CVSelection />
            </PublicRoute>
          }
        />

        <Route
          path="/create-cv/detail-cv/:genCvId"
          element={
            <PublicRoute>
              <CVEditor />
            </PublicRoute>
          }
        />

        <Route
          path="/create-cv/view/:genCvId"
          element={
            <PublicRoute>
              <ViewCV />
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
        <Route path="/survey/:surveyId" element={<Survey />} />

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
          <Route path="saved-jobs" element={<SavedJobs/>}/>
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
        <Route
          path="/admin/companies/:companyId"
          element={
            user?.userType?.userTypeId === 1 ? (
              <CompanyDetail />
            ) : (
              <CompanyProfile />
            )
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
          <Route
            path="candidate-management"
            element={<CandidateManagement />}
          />
          <Route path="review-management" element={<CompanyReview />} />
          <Route path="job-stats" element={<JobStatsPage />} />
          <Route
            path="candidate-management/applicants/:userId/:postId"
            element={<ApplicantDetail />}
          />
          <Route
            path="review-detail/:companyId/:userId"
            element={<SeekerProfile />}
          />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/employer/jobs/:postId" element={<JobDetailEmployer />} />
        <Route path="/employer/jobs/post" element={<PostJob />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MyAccount />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="company-list" element={<CompanyList />} />
          <Route path="user-list" element={<UserList />} />
          <Route path="job-list" element={<AdminJobList />} />
          <Route path="review-list" element={<AdminReview />} />
          <Route
            path="review-detail/:companyId/:userId"
            element={<SeekerProfile />}
          />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/admin/jobs/:postId" element={<JobDetailAdmin />} />
        <Route path="/admin/survey-statistics" element={<SurveyStatistics />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              isAuthenticated={
                isAuthenticated && user?.userType?.userTypeId === 1
              }
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <PublicRoute>
              <TermsOfService />
            </PublicRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <PublicRoute>
              <PrivacyPolicy />
            </PublicRoute>
          }
        />
      </Routes>
      {showFooter && <Footer />}
      <ScrollToTop />
    </div>
  );
};

export default App;

