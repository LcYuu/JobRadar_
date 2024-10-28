// OtpModal.js
import { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import SuccessIcon from '../Icon/Sucess/Sucess';
import FailureIcon from '../Icon/Failed/Failed';

const OtpModal = ({ isOpen, onClose, email, onResendCode, onSubmitOtp }) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [status, setStatus] = useState(null); // null, 'success', 'failure'
  const [isPaused, setIsPaused] = useState(false);

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
    setIsPaused(true);
    const result = await onSubmitOtp(otp);
    if (result.success) {
      setStatus('success');
    } else {
      setStatus('failure');
      setIsPaused(false);
    }
  };

  const handleResend = async () => {
    await onResendCode(email);
    setTimeLeft(120);
    setStatus(null);
    setIsPaused(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg text-center font-semibold">
            {status === 'success' ? 'Xác nhận thành công!' : 'Nhập mã xác nhận'}
          </DialogTitle>
          {status === null && (
            <DialogDescription className="text-center text-gray-500">
              Vui lòng nhập mã xác nhận đã được gửi đến email của bạn.
            </DialogDescription>
          )}
        </DialogHeader>
        <AnimatePresence>
          {status === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SuccessIcon />
              <p className="text-green-600 text-center">Xác nhận thành công!</p>
              <Button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Đóng
              </Button>
            </motion.div>
          )}
          {status === 'failure' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FailureIcon />
              <p className="text-red-600 text-center">Mã xác nhận không chính xác. Vui lòng thử lại.</p>
              <Button onClick={() => setStatus(null)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
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
              />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
                Xác nhận
              </Button>
              <p className="text-center text-gray-500 mt-2">
                Còn lại {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60} để nhập mã
              </p>
              <Button variant="outline" onClick={handleResend} className="w-full mt-4">
                Gửi lại mã
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default OtpModal;
