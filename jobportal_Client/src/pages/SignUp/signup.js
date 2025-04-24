import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SuccessIcon from "../../components/common/Icon/Sucess/Sucess";
import FailureIcon from "../../components/common/Icon/Failed/Failed";

import logo1 from "../../assets/images/common/logo1.jpg";
import { isStrongPassword } from "../../utils/passwordValidator";

// Environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";


export default function SignUpForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [activeTab, setActiveTab] = useState("job-seeker");
  const [confirmationStatus, setConfirmationStatus] = useState(null); // null, 'success', 'failure'
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [taxCodeVerified, setTaxCodeVerified] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    businessEmail: "",
    taxCode: "",
  });

  // Form fields for job seeker and employer
  const jobSeekerFields = [
    { name: "fullName", placeholder: "Họ và tên", type: "text" },
    { name: "email", placeholder: "Địa chỉ email", type: "email" },
    { name: "password", placeholder: "Mật khẩu", type: "password" },
    { name: "confirmPassword", placeholder: "Xác nhận mật khẩu", type: "password" },
  ];

  const employerFields = [
    { name: "taxCode", placeholder: "Mã số thuế", type: "text" },
    { name: "companyName", placeholder: "Tên công ty", type: "text", disabled: true },
    { name: "businessEmail", placeholder: "Email doanh nghiệp", type: "email" },
    { name: "password", placeholder: "Mật khẩu", type: "password" },
    { name: "confirmPassword", placeholder: "Xác nhận mật khẩu", type: "password" },
  ];

  const fields = activeTab === "job-seeker" ? jobSeekerFields : employerFields;

  // Validate email format
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Add error message with auto-dismiss
  const addErrorMessage = (message) => {
    const id = Date.now();
    setErrorMessages((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setErrorMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 3000);
  };

  // Countdown timer
  useEffect(() => {
    if (isModalOpen && timeLeft > 0 && !confirmationStatus) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsTimeUp(true);
    }
  }, [isModalOpen, timeLeft, confirmationStatus]);

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessages([]);

    // Validation
    const emailField = activeTab === "job-seeker" ? formData.email : formData.businessEmail;
    if (!emailField || !validateEmail(emailField)) {
      addErrorMessage("Email không hợp lệ.");
      setIsLoading(false);

      return;
    }
    if (!formData.password || !isStrongPassword(formData.password)) {
      addErrorMessage(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      addErrorMessage("Mật khẩu xác nhận không khớp.");
      setIsLoading(false);
      return;
    }
    if (activeTab === "job-seeker" && !formData.fullName) {
      addErrorMessage("Vui lòng nhập họ và tên.");
      setIsLoading(false);
      return;
    }
    if (activeTab === "employer" && (!formData.taxCode || !taxCodeVerified)) {
      addErrorMessage("Vui lòng xác thực mã số thuế hợp lệ.");
      setIsLoading(false);
      return;
    }

    const userData = {
      userName: activeTab === "employer" ? formData.companyName : formData.fullName,
      email: emailField,
      password: formData.password,
      userType: { userTypeId: activeTab === "employer" ? 3 : 2 },
      provider: "LOCAL",

    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      if (response.status === 200) {
        setIsModalOpen(true);
        setTimeLeft(120);
        setIsTimeUp(false);
      }
    } catch (error) {
      addErrorMessage(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify tax code
  const verifyTaxCode = async (taxCode) => {
    if (!taxCode || !/^\d{10}(-\d{3})?$/.test(taxCode)) {
      addErrorMessage("Mã số thuế không hợp lệ (10 hoặc 13 chữ số).");
      return false;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/company/validate-tax-info/${taxCode}`);
      if (response.data) {
        setCompanyInfo(response.data);
        setTaxCodeVerified(true);
        setFormData((prev) => ({
          ...prev,
          companyName: response.data.companyName,
          taxCode,
          address: response.data.address,
        }));
        return true;
      }
      addErrorMessage("Mã số thuế không tồn tại.");
      return false;
    } catch (error) {
      addErrorMessage("Lỗi khi xác thực mã số thuế. Vui lòng thử lại.");
      return false;
    }
  };

  // Verify employer
  const handleVerifyEmployer = async (email) => {
    if (!formData.companyName || !formData.taxCode || !taxCodeVerified) {
      addErrorMessage("Vui lòng xác thực mã số thuế trước khi tiếp tục.");
      return false;
    }

    const company = {
      companyName: formData.companyName,
      taxCode: formData.taxCode,
      address: companyInfo?.address || "",
      industry: [{ industryId: 0 }],
      city: { cityId: companyInfo?.cityId || 0 },
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-employer`, company, {
        params: { email },
      });
      return response.status === 200;
    } catch (error) {
      addErrorMessage(
        error.response?.status === 404
          ? "Không tìm thấy tài khoản."
          : "Lỗi xác thực thông tin công ty."
      );
      return false;
    }
  };

  // Handle OTP confirmation
  const handleConfirmation = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const email = activeTab === "job-seeker" ? formData.email : formData.businessEmail;
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/verify-account?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(confirmationCode)}`
      );

      if (response.data === "Xác thực tài khoản thành công") {
        if (activeTab === "employer" && taxCodeVerified) {
          const verifyResult = await handleVerifyEmployer(email);
          if (!verifyResult) {
            setConfirmationStatus("failure");
            setIsLoading(false);
            return;
          }
        }
        setConfirmationStatus("success");
        setTimeout(() => navigate("/auth/sign-in"), 2000);
      } else {
        setConfirmationStatus("failure");
        addErrorMessage(response.data || "Mã xác nhận không đúng.");
      }
    } catch (error) {
      setConfirmationStatus("failure");
      addErrorMessage(error.response?.data?.message || "Xác thực thất bại.");
    } finally {
      setIsLoading(false);

    }
  };

  // Resend OTP
  const handleResendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!resendEmail || !validateEmail(resendEmail)) {
      addErrorMessage("Vui lòng nhập email hợp lệ.");
      setIsLoading(false);
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/auth/regenerate-otp`, null, {
        params: { email: resendEmail },
      });
      setTimeLeft(120);
      setIsTimeUp(false);
      addErrorMessage("Mã xác nhận đã được gửi lại!");
    } catch (error) {
      addErrorMessage("Không thể gửi lại mã xác nhận. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      businessEmail: "",
      taxCode: "",
    });
    setTaxCodeVerified(false);
    setCompanyInfo(null);
    setErrorMessages([]);
  };

  // Render confirmation modal content
  const renderConfirmationStatus = () => (
    <AnimatePresence mode="wait">
      {confirmationStatus === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <SuccessIcon className="mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-green-600">Đăng ký thành công!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Chúc mừng! Bạn đã đăng ký thành công.
          </p>
          <Button
            onClick={() => navigate("/auth/sign-in")}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isLoading}
          >
            Đóng
          </Button>
        </motion.div>
      )}
      {confirmationStatus === "failure" && (
        <motion.div
          key="failure"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <FailureIcon className="mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-red-600">Xác nhận thất bại!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Mã xác nhận không chính xác. Vui lòng thử lại.
          </p>
          <Button
            onClick={() => setConfirmationStatus(null)}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isLoading}
          >
            Thử lại
          </Button>
        </motion.div>
      )}
      {confirmationStatus === null && !isTimeUp && (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleConfirmation}
          className="space-y-4 mt-2"
        >
          <Input
            type="text"
            placeholder="Nhập mã xác nhận"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </Button>
          <p className="text-sm text-gray-500 text-center">
            Còn lại {Math.floor(timeLeft / 60)}:
            {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60} để nhập mã
          </p>
        </motion.form>
      )}
      {isTimeUp && (
        <motion.div
          key="timeUp"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h3 className="text-2xl font-semibold text-red-600">Hết thời gian!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng nhập lại email để lấy mã xác nhận mới.
          </p>

          <motion.form
            key="resendForm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleResendCode}
            className="space-y-4 mt-4"
          >
            <Input
              type="email"
              placeholder="Nhập email của bạn"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi lại mã"}
            </Button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <CardHeader className="border-b border-indigo-300">
          <div className="flex justify-between items-center mb-4">
            <Link to="/">
              <img src={logo1} alt="JobRadar Logo" className="h-20 w-20" />
            </Link>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
              <TabsList className="bg-indigo-50 rounded-md">
                <TabsTrigger
                  value="job-seeker"
                  className={`px-4 py-2 ${
                    activeTab === "job-seeker"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-indigo-600"
                  }`}
                >
                  Người tìm việc
                </TabsTrigger>
                <TabsTrigger
                  value="employer"
                  className={`px-4 py-2 ${
                    activeTab === "employer"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-indigo-600"
                  }`}
                >
                  Nhà tuyển dụng
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-700 text-center">
            Đăng ký ngay, việc liền tay
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.name} className="relative">
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={field.disabled || isLoading}
                  />
                  {field.name === "taxCode" && activeTab === "employer" && (
                    <Button
                      type="button"
                      onClick={() => verifyTaxCode(formData.taxCode)}
                      className="absolute right-0 top-0 h-full px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r"
                      disabled={isLoading}
                    >
                      Xác thực
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <AnimatePresence>
              {errorMessages.map((error) => (
                <motion.p
                  key={error.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200"
                >
                  {error.message}
                </motion.p>
              ))}
            </AnimatePresence>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/auth/sign-in"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Đăng nhập
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-gray-500">
            Bằng cách nhấp vào 'Đăng ký', bạn xác nhận rằng bạn đã đọc và chấp nhận{" "}
            <Link to="/terms-of-service" className="underline text-indigo-600">
              Điều khoản dịch vụ và Chính sách bảo mật
            </Link>{" "}
            của chúng tôi.
          </p>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            {confirmationStatus === null && !isTimeUp && (
              <>
                <DialogTitle className="text-lg text-center font-semibold text-gray-900">
                  Xác nhận đăng ký
                </DialogTitle>
                <DialogDescription className="text-sm text-center text-gray-600">
                  Vui lòng nhập mã xác nhận đã được gửi đến email của bạn.
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          {renderConfirmationStatus()}
        </DialogContent>
      </Dialog>
    </div>
  );
}