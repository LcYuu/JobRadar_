import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import logo1 from "../../assets/images/common/logo1.jpg";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import Swal from "sweetalert2";
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
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng nhập email và mật khẩu.',
        confirmButtonText: 'Đồng ý',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    if (!validateEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Email không hợp lệ.',
        confirmButtonText: 'Đồng ý',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await dispatch(loginAction({ email, password }));
      
      if (response.error) {
        // Xử lý lỗi từ loginAction
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: response.payload || 'Đăng nhập thất bại.',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      const { payload } = response;
      if (payload?.success) {
        const user = payload.user;
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đăng nhập thành công!',
          timer: 1500,
          showConfirmButton: false
        });

        // Navigate based on user type
        setTimeout(() => {
          if (user?.userType?.userTypeId === 3) {
            navigate("/employer/account-management/dashboard");
          } else if (user?.userType?.userTypeId === 1) {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: payload?.message || 'Đăng nhập thất bại.',
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#3085d6'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.message || 'Đã xảy ra lỗi không mong muốn.',
        confirmButtonText: 'Thử lại',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      localStorage.setItem("jwt", jwtToken);

      // Kiểm tra xem người dùng đã có profile chưa
      const checkEmailResponse = await axios.post(
        `${API_BASE_URL}/auth/check-email`,
        { token: googleToken }
      );

      if (checkEmailResponse.data) {
        // Lấy profile và role
        const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const roleResponse = await axios.get(`${API_BASE_URL}/auth/user-role`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        const user = {
          ...profileResponse.data,
          role: roleResponse.data.role,
        };

        // Cập nhật redux store
        dispatch({
          type: "auth/login/fulfilled",
          payload: { success: true, user },
        });

        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đăng nhập bằng Google thành công!',
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          if (user?.role === 'ROLE_EMPLOYER') {
            navigate("/employer/account-management/dashboard");
          } else if (user?.role === 'ROLE_ADMIN') {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        // Người dùng chưa có profile, chuyển đến trang chọn role
        const defaultAddress = {
          specificAddress: "",
          ward: "",
          district: "",
          province: ""
        };
        localStorage.setItem("defaultAddress", JSON.stringify(defaultAddress));
        
        setTimeout(() => {
          navigate("/role-selection");
        }, 1000);
      }
    } catch (err) {
      console.error("Error during login: ", err.response ? err.response.data : err.message);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.response?.data?.message || 'Đăng nhập thất bại! Vui lòng thử lại.',
        confirmButtonText: 'Thử lại',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleLogin = async (response) => {
  //   try {
  //     const googleToken = response.credential;
  //     console.log("Google Token: ", googleToken);

  //     // Gửi googleToken đến backend để xác thực
  //     const res = await axios.post("http://localhost:8080/auth/login/google", {
  //       token: googleToken,
  //     });

  //     console.log("Response from server: ", res.data.token);
  //     const jwtToken = res?.data?.token;
  //     console.log("Response from: ", jwtToken);

  //     sessionStorage.setItem("jwt", jwtToken);
  //     const emailExists = await axios.post(
  //       "http://localhost:8080/auth/check-email",
  //       { token: googleToken }
  //     );

  //     if (emailExists.data) {
  //       setTimeout(() => {
  //         window.location.href = "http://localhost:3000/";
  //       }, 1000);
  //     } else {
  //       const defaultAddress = {
  //         specificAddress: "",
  //         ward: "",
  //         district: "",
  //         province: ""
  //       };
  //       sessionStorage.setItem("defaultAddress", JSON.stringify(defaultAddress));
        
  //       setTimeout(() => {
  //         window.location.href = "http://localhost:3000/role-selection";
  //       }, 1000);
  //     }
  //   } catch (err) {
  //     console.error(
  //       "Error during login: ",
  //       err.response ? err.response.data : err.message
  //     );
  //     setError("Đăng nhập thất bại! Vui lòng thử lại.");
  //   }
  // };

  // Modal content based on status
  const modalContent = () => {
    if (loginStatus === "success") {
      return (
        <div className="text-green-600">
          <svg
            className="w-16 h-16 mx-auto mb-4"
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
          <p className="text-xl font-semibold">Đăng nhập thành công!</p>
        </div>
      );
    }
    return (
      <div className="text-red-600">
        <svg
          className="w-16 h-16 mx-auto mb-4"
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
        <p className="text-xl font-semibold">Đăng nhập thất bại</p>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
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
          onClose={() => loginStatus === "failure" && setIsModalOpen(false)}
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