import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import SuccessIcon from '../../components/common/Icon/Sucess/Sucess';
import FailureIcon from '../../components/common/Icon/Failed/Failed';
import logo1 from '../../assets/images/common/logo1.jpg';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPasswordAction, verifyOtpAction } from '../../redux/ForgotPassword/forgotPassword.action';
import { isStrongPassword } from '../../utils/passwordValidator';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isModalOpen && timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsTimeUp(true);
    }
  }, [timeLeft, isModalOpen, isPaused]);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
   
    const result = await dispatch(forgotPasswordAction(email));
    if (result && result.success) {
      setIsModalOpen(true);
      setTimeLeft(120);
      setIsTimeUp(false);
      setErrorMessage('');
    } else {
      setErrorMessage(result ? result.error : 'Yêu cầu gửi mã xác thực thất bại. Vui lòng thử lại.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsPaused(true);
    const result = await dispatch(verifyOtpAction({ email, otp: otpCode }));
    if (result.success) {
      navigate(`/change-password?email=${encodeURIComponent(email)}`); // Redirect to change password page
    } else {
      setOtpStatus('failure');
      setIsPaused(false);
      setErrorMessage(result.error || 'Xác thực OTP thất bại. Vui lòng thử lại.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.put("http://localhost:8080/auth/resend-otp", null, { params: { email } });
      setTimeLeft(120);
      setIsTimeUp(false);
      setIsPaused(false);
    } catch (error) {
      setErrorMessage('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOtpStatus(null);
  };

  const renderOtpStatus = () => (
    <AnimatePresence mode="wait">
      {otpStatus === 'success' && (
        <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-center">
          <SuccessIcon />
          <h3 className="text-2xl font-semibold text-green-600">Xác nhận thành công!</h3>
          <p className="mt-2 text-sm text-gray-600">Bạn đã xác thực thành công.</p>
          <Button onClick={handleCloseModal} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white">Đóng</Button>
        </motion.div>
      )}
      {otpStatus === 'failure' && (
        <motion.div key="failure" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-center">
          <FailureIcon />
          <h3 className="text-2xl font-semibold text-red-600">Xác nhận thất bại!</h3>
          <p className="mt-2 text-sm text-gray-600">Mã OTP không đúng. Vui lòng thử lại.</p>
          <Button onClick={() => setOtpStatus(null)} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white">Thử lại</Button>
        </motion.div>
      )}
      {otpStatus === null && !isTimeUp && (
        <motion.form key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} onSubmit={handleVerifyOtp} className="space-y-4 mt-2">
          <Input type="text" placeholder="Nhập mã xác nhận" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Xác nhận</Button>
          <p className="text-sm text-gray-500 text-center">
            Còn lại {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60} để nhập mã
          </p>
        </motion.form>
      )}
      {isTimeUp && (
        <motion.div key="timeUp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-center">
          <h3 className="text-2xl font-semibold text-red-600">Hết thời gian!</h3>
          <p className="mt-2 text-sm text-gray-600">Vui lòng nhập lại email để lấy mã xác nhận mới.</p>
          <Button onClick={handleResendOtp} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white">Gửi lại mã</Button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <CardHeader className="border-b border-indigo-300">
          <div className="flex justify-center items-center mb-4">
            <Link to="/"><img src={logo1} alt="JobRadar Logo" className="h-20 w-20" /></Link>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-700 text-center">Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <Input
              type="email"
              placeholder="Nhập địa chỉ email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Gửi mã xác nhận</Button>
            {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}
          </form>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog isOpen={isModalOpen} onClose={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg text-center font-semibold text-gray-900">Xác nhận mã OTP</DialogTitle>
            <DialogDescription className="text-sm text-center text-gray-600">Nhập mã OTP đã được gửi tới email của bạn.</DialogDescription>
          </DialogHeader>
          {renderOtpStatus()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
