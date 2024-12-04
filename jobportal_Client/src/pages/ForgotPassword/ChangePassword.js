import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import logo1 from '../../assets/images/common/logo1.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordAction } from '../../redux/ForgotPassword/forgotPassword.action';
import { isStrongPassword } from '../../utils/passwordValidator';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, message } = useSelector((state) => state.forgotPassword);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset trạng thái và thông báo lỗi
    setStatus(null);
    setErrorMessage('');

    // Kiểm tra độ mạnh của mật khẩu
    if (!isStrongPassword(newPassword)) {
      setStatus('failure');
      setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }

    // Kiểm tra sự khớp của mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      setStatus('failure');
      setErrorMessage('Mật khẩu không khớp. Vui lòng thử lại.');
      return;
    }

    // Gửi yêu cầu thay đổi mật khẩu
    const result = await dispatch(changePasswordAction(email, { password: newPassword, repeatPassword: confirmPassword }));
    if (result.success) {
      setStatus('success');
      setErrorMessage('');
    } else {
      setStatus('failure');
      setErrorMessage(result.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const renderMessage = () => (
    <AnimatePresence mode="wait">
      {status === 'success' && (
        <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-center text-green-600">
          {message || "Mật khẩu đã được thay đổi thành công!"}
        </motion.div>
      )}
      {status === 'failure' && (
        <motion.div key="failure" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-center text-red-600">
          {errorMessage || "Đã xảy ra lỗi. Vui lòng thử lại."}
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
          <CardTitle className="text-2xl font-bold text-indigo-700 text-center">Thay đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <Input id="newPassword" type="password" placeholder="Nhập mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
              <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" required />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              Xác nhận thay đổi
            </Button>
          </form>
          <div className="mt-4">{renderMessage()}</div>
          {status === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Button onClick={() => navigate('/auth/sign-in')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                Quay lại trang đăng nhập
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
