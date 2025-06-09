// OtpModal.js
import { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import SuccessIcon from '../Icon/Sucess/Sucess';
import FailureIcon from '../Icon/Failed/Failed';

const OtpModal = ({ isOpen, onClose, email, onResendCode, onSubmitOtp }) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [status, setStatus] = useState(null); // null, 'success', 'failure'
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setStatus('failure');
    }
  }, [timeLeft, isOpen, isPaused]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsPaused(true);
    try {
      const response = await onSubmitOtp(otp);
      if (response.data === "Xác thực tài khoản thành công") {
        setStatus('success');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setStatus('failure');
        setIsPaused(false);
      }
    } catch (error) {
      setStatus('failure');
      setIsPaused(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await onResendCode();
      setTimeLeft(120);
      setStatus(null);
      setIsPaused(false);
      setOtp('');
    } catch (error) {
      console.error('Error resending code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="bg-white rounded-lg p-6 w-[425px] relative z-10">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {status === 'success' ? 'Xác nhận thành công!' : 'Nhập mã xác nhận'}
          </h2>
          {status === null && (
            <p className="text-sm text-gray-600">
              Vui lòng nhập mã xác nhận đã được gửi đến email của bạn.
            </p>
          )}
        </div>
        <AnimatePresence>
          {status === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col items-center">
              <SuccessIcon className="w-12 h-12" />
              <p className="text-green-600">Xác nhận thành công!</p>
              <Button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Đóng
              </Button>
            </motion.div>
          )}
          {status === 'failure' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col items-center">
              <FailureIcon className="w-12 h-12" />
              <p className="text-red-600">
                {timeLeft === 0 ? 'Mã xác nhận đã hết hạn' : 'Mã xác nhận không chính xác'}. Vui lòng thử lại.
              </p>
              <Button 
                onClick={handleResend} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi lại mã'}
              </Button>
              <Button 
                onClick={() => {
                  setOtp(''); // Reset OTP input
                  setStatus(null); // Reset status to allow new input
                }} 
                className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-black"
              >
                Thử lại
              </Button>
            </motion.div>
          )}
          {status === null && (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Nhập mã xác nhận"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
              <p className="text-center text-gray-500 mt-2">
                Còn lại {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60} để nhập mã
              </p>
              <Button 
                type="button"
                variant="outline" 
                onClick={handleResend} 
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi lại mã'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OtpModal;
