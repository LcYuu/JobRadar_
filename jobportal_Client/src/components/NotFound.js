import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Trang không tồn tại hoặc bạn không có quyền truy cập</p>
        <Button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Về trang chủ
        </Button>
      </div>
    </div>
  );
} 