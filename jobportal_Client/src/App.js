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
const App = () => {
  const location = useLocation();
  const { auth } = useSelector(store => store);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (jwt) {
      dispatch(getProfileAction(jwt));
    }
  }, [jwt, dispatch]);

  const isAuthenticated = !!auth.user;

  // Move this logic into a memoized value to prevent unnecessary re-renders
  const showHeader = useMemo(() => {
    const noHeaderPaths = ['/auth/sign-up', '/auth/sign-in', '/auth/forgot-password'];
    return !noHeaderPaths.includes(location.pathname);
  }, [location.pathname]);
  
  return (
    <div className="app-container">
      {showHeader && <Header />}
      <main>
        <Routes>
          <Route path="/auth/sign-up" element={<SignUpForm />} />
          <Route path="/account-management" element={<MyAccount />} />
          <Route path="/auth/sign-in" element={<SignInForm />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={isAuthenticated ? <Home /> : <SignInForm />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/find-jobs" element={<FindJobs />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;