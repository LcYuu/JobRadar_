import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import SuccessIcon from '../../components/common/Icon/Sucess/Sucess';
import FailureIcon from '../../components/common/Icon/Failed/Failed';
import { FaGoogle } from 'react-icons/fa';
import googleIcon from '../../assets/icons/google.png';
import logo1 from '../../assets/images/common/logo1.jpg';
import { loginAction } from '../../redux/Auth/auth.action';
import { isStrongPassword } from '../../utils/passwordValidator';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); // null, 'success', 'failure'
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError(''); // Xóa lỗi cũ
    if (!isStrongPassword(password)) {
      setLoginStatus('failure');
      setIsModalOpen(true);
      setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }

    try {
        const response = await dispatch(loginAction({ email, password }));
        if (response.success) {
            setLoginStatus('success');
            setIsModalOpen(true);
            setTimeout(() => {
                setIsModalOpen(false);
                navigate('/'); // Điều hướng đến trang Home
            }, 2000);
        } else {
            setLoginStatus('failure');
            setIsModalOpen(true);
            // Hiển thị thông báo lỗi từ API
            setError(response.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
    } catch (error) {
        setLoginStatus('failure');
        setIsModalOpen(true);
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
};


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLoginStatus(null);
  };

  const renderLoginStatus = () => {
    if (loginStatus === 'success') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="flex flex-col items-center"
        >
          <SuccessIcon className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-lg font-semibold text-green-700">Đăng nhập thành công</p>
        </motion.div>
      );
    } else if (loginStatus === 'failure') {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <CardHeader className="border-b border-indigo-300">
          <div className="flex justify-between items-center mb-4">
            <a href="/"><img src={logo1} alt="JobRadar Logo" className="h-20 w-20" /></a>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-700 text-center">
            Đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50">
              <img src={googleIcon} className="w-5 h-5" alt="Google Icon" />
              <span>Sign In with Google</span>
            </Button>
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
              />
            </div>
            <div className="flex justify-between items-center">
              <a href="/auth/forgot-password" className="text-indigo-600 hover:underline text-sm">
                Quên mật khẩu?
              </a>
            </div>
            <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Đăng nhập
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <a href="/auth/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
              Đăng kí
            </a>
          </p>
        </CardContent>
      </Card>

      <Dialog isOpen={isModalOpen} onClose={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg text-center mb-2 font-semibold text-gray-900">
              {loginStatus === 'success' ? 'Đăng nhập thành công' : 'Đăng nhập thất bại'}
            </DialogTitle>
          </DialogHeader>
          <AnimatePresence>
            {renderLoginStatus()}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
