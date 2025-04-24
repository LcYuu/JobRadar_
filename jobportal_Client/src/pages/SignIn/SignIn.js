import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import Swal from "sweetalert2";

import logo1 from "../../assets/images/common/logo1.jpg";
import { loginAction } from "../../redux/Auth/auth.thunk";

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;


  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 shadow-xl min-w-[300px] relative">
        {children}
      </div>
    </div>
  );
};

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); // null, 'success', 'failure'
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Environment variables or configuration for URLs
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const CLIENT_URL = process.env.REACT_APP_CLIENT_URL || "http://localhost:3000";

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await dispatch(loginAction({ email, password }));
      const { payload } = response;

      if (payload?.success) {
        const user = payload.user;
        setIsModalOpen(true);
        setLoginStatus("success");

        // Navigate based on user type
        setTimeout(() => {
          if (user?.userType?.userTypeId === 3) {
            navigate("/employer/account-management/dashboard");
          } else if (user?.userType?.userTypeId === 1) {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
          setIsModalOpen(false);
        }, 1500);
      } else {
        setError(payload?.message || "Đăng nhập thất bại.");
        setIsModalOpen(true);
        setLoginStatus("failure");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi không mong muốn.");
      setIsModalOpen(true);
      setLoginStatus("failure");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async (response) => {
    setIsLoading(true);
    setError("");

    try {
      const googleToken = response.credential;
      const res = await axios.post(`${API_BASE_URL}/auth/login/google`, {
        token: googleToken,
      });

      const jwtToken = res?.data?.token;
      if (!jwtToken) {
        throw new Error(res?.data?.message || "Không nhận được JWT token.");
      }

      // Store JWT in sessionStorage
      sessionStorage.setItem("jwt", jwtToken);

      // Check if email exists
      const emailExists = await axios.post(
        `${API_BASE_URL}/auth/check-email`,
        { token: googleToken }
      );

      setIsModalOpen(true);
      setLoginStatus("success");

      setTimeout(() => {
        setIsModalOpen(false);
        if (emailExists.data) {
          navigate("/");
        } else {
          const defaultAddress = {
            specificAddress: "",
            ward: "",
            district: "",
            province: "",
          };
          sessionStorage.setItem("defaultAddress", JSON.stringify(defaultAddress));
          navigate("/role-selection");
        }
      }, 1500);
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.response?.data?.message || "Đăng nhập Google thất bại.");
      setIsModalOpen(true);
      setLoginStatus("failure");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
          <CardHeader className="border-b border-indigo-300">
            <div className="flex justify-between items-center mb-4">
              <Link to="/">
                <img src={logo1} alt="JobRadar Logo" className="h-20 w-20" />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-indigo-700 text-center">
              Đăng nhập
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <GoogleOAuthProvider clientId="223710905248-cdn2agb2sgrv66dtgvo8osfcn3gin9er.apps.googleusercontent.com">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={(error) => {
                      console.error("Google login error:", error);
                      setError("Đăng nhập Google thất bại.");
                      setIsModalOpen(true);
                      setLoginStatus("failure");
                    }}
                  />
                </div>
              </GoogleOAuthProvider>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Hoặc đăng nhập bằng email
                  </span>
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-between items-center">
                <Link
                  to="/auth/forgot-password"
                  className="text-indigo-600 hover:underline text-sm"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/auth/sign-up"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Đăng ký
              </Link>
            </p>
          </CardContent>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {loginStatus === "success" ? (
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-xl font-semibold text-green-600">
                Đăng nhập thành công!
              </p>
            </div>
          ) : (
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-xl font-semibold text-red-600">
                Đăng nhập thất bại
              </p>
              <p className="mt-2 text-sm text-red-500">{error}</p>
            </div>
          )}
        </Modal>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </>
  );
}