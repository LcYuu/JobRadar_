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
import OTPModal from '../../components/common/Modal/OtpModal';

// Environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Hàm validate email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};



export default function SignUpForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [activeTab, setActiveTab] = useState("job-seeker");
  const [confirmationStatus, setConfirmationStatus] = useState(null); // null, 'success', 'failure'
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Thêm state isPaused

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
    address: "", // Thêm address vào formData
  });
  const [errorMessages, setErrorMessages] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [taxCodeVerified, setTaxCodeVerified] = useState(false);

  // Countdown effect
  useEffect(() => {
    if (isModalOpen && timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsTimeUp(true);
    }
  }, [timeLeft, isModalOpen, isPaused]);

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

  const addErrorMessage = (message) => {
    const id = Date.now();
    setErrorMessages((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setErrorMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 3000); // Tăng thời gian hiển thị lỗi lên 3 giây
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate email
    const emailField = activeTab === "job-seeker" ? formData.email : formData.businessEmail;
    if (!emailField || !validateEmail(emailField)) {
      addErrorMessage("Vui lòng nhập địa chỉ email hợp lệ");
      setIsLoading(false);
      return;
    }

    // Validate password
    if (!formData.password) {
      addErrorMessage("Vui lòng nhập mật khẩu");
      setIsLoading(false);
      return;
    }

    if (!isStrongPassword(formData.password)) {
      addErrorMessage(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
      );
      setIsLoading(false);
      return;
    }
    
    if (!formData.confirmPassword) {
      addErrorMessage("Vui lòng xác nhận mật khẩu");
      setIsLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      addErrorMessage("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }
    
    if (activeTab === "job-seeker" && !formData.fullName) {
      addErrorMessage("Vui lòng nhập họ và tên");
      setIsLoading(false);
      return;
    }
    
    if (activeTab === "employer" && (!formData.taxCode || !taxCodeVerified)) {
      addErrorMessage("Vui lòng xác thực mã số thuế hợp lệ");
      setIsLoading(false);
      return;
    }

    const userData = {
      userName: activeTab === "employer" ? formData.companyName : formData.fullName,
      email: emailField,
      password: formData.password,
      userType: {
        userTypeId: activeTab === "employer" ? 3 : 2,
      },
      provider: "LOCAL",
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      console.log("Đăng ký thành công:", response);
      
      if (response.data) {
        setResendEmail(emailField);
        setTimeLeft(120);
        setIsTimeUp(false);
        setConfirmationStatus(null);
        setIsModalOpen(true);
        addErrorMessage("Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const errorMessage = error.response?.data || "Đăng ký thất bại. Vui lòng thử lại.";
      addErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmployer = async (email) => {
    try {
      if (!formData.companyName || !formData.taxCode || !taxCodeVerified) {
        addErrorMessage("Vui lòng xác thực mã số thuế trước khi tiếp tục");
        return false;
      }

      const company = {
        companyName: formData.companyName,
        taxCode: formData.taxCode,
        address: companyInfo?.address || "",
        industry: [{ industryId: 0 }],
        city: { cityId: companyInfo?.cityId || 0 },
      };

      const response = await axios.post(
        `${API_BASE_URL}/auth/verify-employer`,
        company,
        {
          params: { email: email },
        }
      );

      if (response.status === 200) {
        return true;
      }
      addErrorMessage("Mã số thuế không tồn tại");
      return false;
    } catch (error) {
      console.error("Error verifying employer:", error);
      if (error.response?.status === 404) {
        addErrorMessage("Không tìm thấy tài khoản. Vui lòng thử lại sau.");
      } else {
        addErrorMessage("Lỗi xác thực thông tin công ty. Vui lòng thử lại.");
      }
      return false;
    }
  };

  const handleConfirmation = async (otp) => {
    try {
      const email = activeTab === "job-seeker" ? formData.email : formData.businessEmail;
      const response = await axios.put(
        `${API_BASE_URL}/auth/verify-account?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
      );
      return response;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  };

  const handleResendCode = async () => {
    try {
      const email = activeTab === "job-seeker" ? formData.email : formData.businessEmail;
      const response = await axios.put(`${API_BASE_URL}/auth/regenerate-otp`, null, {
        params: { email },
      });
      if (response.status === 200) {
        addErrorMessage("Mã xác nhận mới đã được gửi!");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      addErrorMessage("Không thể gửi lại mã xác nhận. Vui lòng thử lại.");
      throw error;
    }
  };

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
      address: "",
    });
    setTaxCodeVerified(false);
    setCompanyInfo(null);
    setErrorMessages([]);
  };

  const verifyTaxCode = async (taxCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/company/validate-tax-info/${taxCode}`);
      if (response.data) {
        setCompanyInfo(response.data);
        setTaxCodeVerified(true);
        setFormData((prev) => ({
          ...prev,
          companyName: response.data.companyName,
          taxCode: taxCode,
          address: response.data.address || "",
        }));
        addErrorMessage("Xác thực mã số thuế thành công!");
        return true;
      }
      addErrorMessage("Mã số thuế không hợp lệ hoặc không tồn tại");
      return false;
    } catch (error) {
      console.error("Error verifying tax code:", error);
      addErrorMessage("Mã số thuế không hợp lệ hoặc không tồn tại");
      return false;
    }
  };

  useEffect(() => {
    if (taxCodeVerified) {
      console.log("Tax code verified:", formData.taxCode);
      console.log("Company info:", companyInfo);
    }
  }, [taxCodeVerified, formData.taxCode, companyInfo]);

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
                      onClick={async () => {
                        if (!formData.taxCode || formData.taxCode.trim() === "") {
                          addErrorMessage("Vui lòng nhập mã số thuế");
                          return;
                        }
                        console.log("Đang xác thực mã số thuế:", formData.taxCode);
                        const verified = await verifyTaxCode(formData.taxCode);
                        if (!verified) {
                          addErrorMessage("Mã số thuế không hợp lệ hoặc không tồn tại");
                        }
                      }}
                      className="absolute right-0 top-0 h-full px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r"
                      disabled={isLoading}
                    >
                      Xác thực
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <AnimatePresence mode="sync">
              {errorMessages.map((error) => (
                <motion.p
                  key={error.id}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm p-3 rounded-md"
                  style={{
                    backgroundColor: error.message.includes("thành công") ? "#d1fae5" : "#fee2e2",
                    color: error.message.includes("thành công") ? "#047857" : "#b91c1c",
                    border: `1px solid ${error.message.includes("thành công") ? "#a7f3d0" : "#fecaca"}`,
                  }}
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
              Điều khoản dịch vụ
            </Link>{" "}
            và{" "}
            <Link to="/privacy-policy" className="underline text-indigo-600">
              Chính sách bảo mật
            </Link>
          </p>
        </CardContent>
      </Card>

      <OTPModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          navigate("/auth/sign-in");
        }}
        email={resendEmail}
        onResendCode={handleResendCode}
        onSubmitOtp={handleConfirmation}
      />
    </div>
  );
}