'use client'

import React, { useState } from "react"
import { Bell, Calendar, Image as ImageIcon } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Card } from "../../ui/card"
import { Label } from "../../ui/label"
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth)
  const [activeTab, setActiveTab] = useState("profile")
  const [profileImage, setProfileImage] = useState(user?.avatar || "/placeholder.svg")
  const [formData, setFormData] = useState({
    fullName: user?.userName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'male'
  })

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ảnh không được vượt quá 2MB');
        return;
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          ...formData,
          avatar: profileImage
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();
      dispatch({ type: 'UPDATE_PROFILE', payload: data });
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <ToastContainer />

      <div className="border-b mb-6">
        <nav className="flex gap-6">
          <button 
            className={`pb-2 ${activeTab === "profile" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>
          <button 
            className={`pb-2 ${activeTab === "login" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("login")}
          >
            Login Details
          </button>
          <button 
            className={`pb-2 ${activeTab === "notifications" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </nav>
      </div>

      {activeTab === "profile" && (
        <div className="max-w-3xl">
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Thông tin cơ bản</h2>
            <p className="text-gray-600 mb-6">Đây là thông tin cá nhân của bạn mà bạn có thể cập nhật bất cứ lúc nào.</p>
            
            <div className="mb-8">
              <h3 className="text-base font-medium mb-2">Ảnh đại diện</h3>
              <p className="text-gray-600 mb-4">Hình ảnh này sẽ được hiển thị công khai dưới dạng ảnh hồ sơ của bạn, nó sẽ giúp nhà tuyển dụng nhận ra bạn!</p>
              
              <div className="flex items-center gap-8">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto mb-2" />
                  <p className="text-blue-600 mb-1">Nhấp để chọn</p>
                  <p className="text-gray-500 text-sm">hoặc kéo và thả</p>
                  <p className="text-gray-500 text-sm">SVG, PNG, JPG or GIF (max. 400 x 400px)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Tên <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Nhập tên của bạn"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số điện thoại<span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Nhập email"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày sinh <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Giới tính <span className="text-red-500">*</span></Label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveProfile}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              Lưu hồ sơ
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings