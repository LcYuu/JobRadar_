import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import SuccessIcon from "../../components/common/Icon/Sucess/Sucess";
import FailureIcon from "../../components/common/Icon/Failed/Failed";
import googleIcon from "../../assets/icons/google.png";
import logo1 from "../../assets/images/common/logo1.jpg";
import { getProfileAction, loginAction } from "../../redux/Auth/auth.action";
import { isStrongPassword } from "../../utils/passwordValidator";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); // null, 'success', 'failure'
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    if (!isStrongPassword(password)) {
      setLoginStatus("failure");
      setIsModalOpen(true);
      setError(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return;
    }

    try {
      const response = await dispatch(loginAction({ email, password }));
      if (response.success) {
        setLoginStatus("success");
        setIsModalOpen(true);
        setTimeout(() => {
          setIsModalOpen(false);
          window.location.href = "http://localhost:3000/"; // Redirects to home after a few seconds
        }, 3000); // Adjust the time (in milliseconds) as needed
      } else {
        setLoginStatus("failure");
        setIsModalOpen(true);
        setError(response.error || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      setLoginStatus("failure");
      setIsModalOpen(true);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLoginStatus(null);
  };

  const renderLoginStatus = () => {
    if (loginStatus === "success") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="flex flex-col items-center"
        >
          <SuccessIcon className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-lg font-semibold text-green-700">
            Đăng nhập thành công
          </p>
        </motion.div>
      );
    } else if (loginStatus === "failure") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="flex flex-col items-center"
        >
          <FailureIcon className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-lg font-semibold text-red-700">{error}</p>
        </motion.div>
      );
    }
    return null;
  };

  const handleGoogleLogin = async (response) => {
    try {
      const googleToken = response.credential; // Lấy googleToken từ response.credential
      console.log("Google Token: ", googleToken);

      // Gửi googleToken đến backend để xác thực
      const res = await axios.post(
        "http://localhost:8080/auth/login/google",
        { token: googleToken } 
      );

      console.log("Response from server: ", res.data.token); 
      const jwtToken = res?.data?.token;
      console.log("Response from: ", jwtToken); 

      sessionStorage.setItem("jwt", jwtToken);
      const emailExists = await axios.post("http://localhost:8080/auth/check-email", { token: googleToken });
      if (emailExists.data) {
        alert("Đăng nhập thành công!");
        // dispatch(getProfileAction());
        setTimeout(() => {
          // setIsModalOpen(false);
          window.location.href = "http://localhost:3000/"; // Redirects to home after a few seconds
        }, 1000); // Adjust the time (in milliseconds) as needed
      } else {

        alert("Đăng nhập thành công!");
        navigate("/role-selection"); 
      }
    } catch (err) {
      // In lỗi và hiển thị thông báo
      console.error("Error during login: ", err.response ? err.response.data : err.message);
      setError("Đăng nhập thất bại! Vui lòng thử lại.");
    }
  };
  

  return (
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
          <form className="space-y-4">
            <GoogleOAuthProvider clientId="223710905248-cdn2agb2sgrv66dtgvo8osfcn3gin9er.apps.googleusercontent.com">
              <div>
                <GoogleLogin
                  onSuccess={(response) => {
                    console.log(response);
                    handleGoogleLogin(response);
                  }}
                  onError={(error) => {
                    console.log(error);
                    // Xử lý lỗi
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
                  Or sign in with email
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
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
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Đăng nhập
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/auth/sign-up"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Đăng kí
            </Link>
          </p>
        </CardContent>
      </Card>

      <Dialog isOpen={isModalOpen} onClose={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg text-center mb-2 font-semibold text-gray-900">
              {loginStatus === "success"
                ? "Đăng nhập thành công"
                : "Đăng nhập thất bại"}
            </DialogTitle>
          </DialogHeader>
          <AnimatePresence>{renderLoginStatus()}</AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
