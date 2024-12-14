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
import googleIcon from "../../assets/icons/google.png";
import logo1 from "../../assets/images/common/logo1.jpg";
import { signupAction } from "../../redux/Auth/auth.action";
import { isStrongPassword } from "../../utils/passwordValidator";

export default function SignUpForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [activeTab, setActiveTab] = useState("job-seeker");
  const [confirmationStatus, setConfirmationStatus] = useState(null); // null, 'success', 'failure'
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isTimeUp, setIsTimeUp] = useState(false); // Check if time is up
  const [resendEmail, setResendEmail] = useState(""); // Email input for resending code
  const [emailSubmitted, setEmailSubmitted] = useState(false); // Track if email was submitted
  const [isPaused, setIsPaused] = useState(false); // Track if timer is paused
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userType, setUserType] = useState(2);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    businessEmail: "",
    confirmPassword: "",
    taxCode:"",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [companyInfo, setCompanyInfo] = useState(null);
  const [taxCodeVerified, setTaxCodeVerified] = useState(false);
  // Countdown effect
  useEffect(() => {
    if (isModalOpen && timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer); // Clean up timer
    } else if (timeLeft === 0) {
      setIsTimeUp(true); // Set time up flag when countdown reaches 0
    }
  }, [timeLeft, isModalOpen, isPaused]);

  const jobSeekerFields = [
    { name: "fullName", placeholder: "Họ và tên", type: "text" },
    { name: "email", placeholder: "Địa chỉ email", type: "email" },
    { name: "password", placeholder: "Mật khẩu", type: "password" },
    { name: "confirmPassword", placeholder: "Xác nhận mật khẩu", type: "password" },
  ];

  const employerFields = [
    { name: "taxCode", placeholder: "Mã số thuế", type: "text" },
    { name: "companyName", placeholder: "Tên công ty", type: "text", disabled:true },
    { name: "businessEmail", placeholder: "Email doanh nghiệp", type: "email" },
    { name: "password", placeholder: "Mật khẩu", type: "password" },
    { name: "confirmPassword", placeholder: "Xác nhận mật khẩu", type: "password" },
  ];

  const fields = activeTab === "job-seeker" ? jobSeekerFields : employerFields;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      return;
    }
    
    // Tạo userData cơ bản cho cả 2 loại tài khoản
    const userData = {
      userName: activeTab === "employer" ? formData.companyName : formData.fullName,
      email: activeTab === "employer" ? formData.businessEmail : formData.email,
      password: formData.password,
      userType: {
        userTypeId: activeTab === "employer" ? 3 : 2
      },
      provider: "LOCAL"
    };

    try {
      // Gọi API đăng ký cơ bản
      const response = await axios.post("http://localhost:8080/auth/signup", userData);
      
      if (response.status === 200) {
        setIsModalOpen(true);
        setTimeLeft(120);
        setIsTimeUp(false);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data);
      setErrorMessage(error.response?.data || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  const handleVerifyEmployer = async (email) => {
    try {
      if (!formData.companyName || !formData.taxCode || !taxCodeVerified) {
        setErrorMessage("Vui lòng xác thực mã số thuế trước khi tiếp tục");
        return false;
      }

      const companyData = {
        companyName: formData.companyName,
        taxCode: formData.taxCode,
        address: companyInfo?.address || "",
        industry: { industryId: 1 },
        city: { cityId: companyInfo?.cityId || 1 }
      };
      
      console.log("Sending company data:", companyData); // Debug log
      
      const response = await axios.post(
        `http://localhost:8080/auth/verify-employer`,  // Bỏ query param email
        companyData,
        {
          params: { email: email }  // Thêm email vào params
        }
      );

      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying employer:", error);
      if (error.response?.status === 404) {
        setErrorMessage("Không tìm thấy tài khoản. Vui lòng thử lại sau.");
      } else {
        setErrorMessage("Lỗi xác thực thông tin công ty. Vui lòng thử lại.");
      }
      return false;
    }
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();
    setIsPaused(true);
    
    const email = activeTab === "job-seeker" ? formData.email : formData.businessEmail;
    
    try {
      const response = await axios.put(
        `http://localhost:8080/auth/verify-account?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(confirmationCode)}`
      );

      if (response.data === "Xác thực tài khoản thành công") {
        // Thêm delay nhỏ để đảm bảo tài khoản đã được xác thực hoàn toàn
        if (activeTab === "employer" && taxCodeVerified) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1s
          
          const verifyResult = await handleVerifyEmployer(email);
          if (!verifyResult) {
            setConfirmationStatus("failure");
            setIsPaused(false);
            return;
          }
        }
        
        setConfirmationStatus("success");
        setIsPaused(true);
      } else {
        setConfirmationStatus("failure");
        setIsPaused(false);
        setErrorMessage(response.data || "Xác thực thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setConfirmationStatus("failure");
      setIsPaused(false);
      setErrorMessage(error.response?.data || "Xác thực thất bại. Vui lòng thử lại.");
    }
  };

  const handleResendCode = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:8080/auth/regenerate-otp", null, {
        params: { email: resendEmail },
        // Here you would trigger the backend logic to resend the confirmation code to the new email
      });
      setEmailSubmitted(true);
      setTimeLeft(120);
      setIsTimeUp(false);
      setEmailSubmitted(false);
      setIsPaused(false);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      // Handle error (e.g., show error message to user)
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setUserType(tab === "job-seeker" ? 2 : 3);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (confirmationStatus === "success") {
      navigate("/auth/sign-in");
    } else {
      setConfirmationStatus(null);
    }
  };

  const renderConfirmationStatus = () => {
    return (
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
            <SuccessIcon />
            <h3 className="text-2xl font-semibold text-green-600">
              Đăng ký thành công!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Chúc mừng! Bạn đã đăng ký thành công.
            </p>
            <Button
              onClick={handleCloseModal}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white"
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
            <FailureIcon />
            <h3 className="text-2xl font-semibold text-red-600">
              Xác nhận thất bại!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Mã xác nhận không chính xác. Vui lòng thử lại.
            </p>
            <Button
              onClick={() => setConfirmationStatus(null)}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white"
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
            />
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Xác nhận
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Còn lại {Math.floor(timeLeft / 60)}:
              {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60} để nhập
              mã
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
            <h3 className="text-2xl font-semibold text-red-600">
              Hết thời gian!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Vui lòng nhập lại email để lấy mã xác nhận mới.
            </p>
            {!emailSubmitted ? (
              <motion.form
                key="resendForm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleResendCode}
                className="space-y-4"
              >
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Gửi lại mã
                </Button>
              </motion.form>
            ) : (
              <p className="text-sm text-gray-600">Mã đã được gửi lại!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const verifyTaxCode = async (taxCode) => {
    try {
      const response = await axios.get(`http://localhost:8080/company/validate-tax-info/${taxCode}`);
      if (response.data) {
        setCompanyInfo(response.data);
        setTaxCodeVerified(true);
        
        setFormData(prev => ({
          ...prev,
          companyName: response.data.companyName,
          taxCode: taxCode,
          address: response.data.address
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying tax code:", error);
      setErrorMessage("Mã số thuế không hợp lệ hoặc không tồn tại");
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
      {/* Card content for sign up */}
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <CardHeader className="border-b border-indigo-300">
          <div className="flex justify-between items-center mb-4">
            <Link to="/">
              <img src={logo1} alt="JobRadar Logo" className="h-20 w-20" />
            </Link>
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-auto"
            >
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
            Đăng kí ngay, việc liền tay
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4">
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.name} className="relative">
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log(`Updating ${field.name} to:`, newValue);
                      setFormData(prev => {
                        const updated = {
                          ...prev,
                          [field.name]: newValue
                        };
                        console.log("Updated formData:", updated);
                        return updated;
                      });
                    }}
                    onBlur={(e) => {
                      if (field.name === "taxCode") {
                        console.log("Tax code onBlur value:", e.target.value);
                      }
                    }}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={field.disabled}
                  />
                  {field.name === "taxCode" && activeTab === "employer" && (
                    <Button
                      type="button"
                      onClick={async () => {
                        console.log("Verifying tax code:", formData.taxCode); // Debug log
                        const verified = await verifyTaxCode(formData.taxCode);
                        if (!verified) {
                          setErrorMessage("Mã số thuế không hợp lệ hoặc không tồn tại");
                        }
                      }}
                      className="absolute right-0 top-0 h-full px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r"
                    >
                      Xác thực
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200"
                >
                  {typeof errorMessage === "string"
                    ? errorMessage
                    : "Đã xảy ra lỗi. Vui lòng thử lại."}
                </motion.p>
              )}
            </AnimatePresence>
            <Button
              onClick={handleRegister}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Đăng kí
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
          Bằng cách nhấp vào 'Đăng ký', bạn xác nhận rằng bạn đã đọc và chấp nhận
            {" "}
            <a href="#" className="underline text-indigo-600">
            Điều kho��n dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="underline text-indigo-600">
            Chính sách bảo mật
            </a>
            {" "}của chúng tôi.
          </p>
        </CardContent>
      </Card>

      {/* Modal for confirmation code */}
      <Dialog isOpen={isModalOpen} onClose={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            {confirmationStatus === null && !isTimeUp && (
              <DialogTitle className="text-lg text-center mb-2 font-semibold text-gray-900">
                Xác nhận đăng ký
              </DialogTitle>
            )}
            {!confirmationStatus && !isTimeUp && (
              <DialogDescription className="text-sm text-center text-gray-600">
                Vui lòng nhập mã xác nhận đã được gửi đến email của bạn.
              </DialogDescription>
            )}
          </DialogHeader>
          {renderConfirmationStatus()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
