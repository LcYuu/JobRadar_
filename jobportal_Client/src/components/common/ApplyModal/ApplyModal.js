import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from "../../../ui/button";
import { X, LinkIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";

const ApplyModal = ({ job, isOpen, onClose, onSubmit, formData, handleInputChange, handleFileChange }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClose = () => {
    if (formData.fullName || formData.email || formData.phone || formData.additionalInfo || formData.cv) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      handleClose();
    }
  };

  const handleCloseButtonClick = (e) => {
    e.stopPropagation();
    handleClose();
  };

  const handleConfirmClose = (e) => {
    if (e) e.stopPropagation();
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancelClose = (e) => {
    if (e) e.stopPropagation();
    setShowConfirmDialog(false);
  };

  const modules = {
    toolbar: [
      ['bold', 'italic'],
      [{ 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic',
    'list', 'bullet',
    'link'
  ];

  const handleQuillChange = (content) => {
    handleInputChange({
      target: {
        name: 'additionalInfo',
        value: content
      }
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div 
          className="bg-white rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white z-10 p-6 border-b">
            <button 
              onClick={handleCloseButtonClick}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <img 
                  src={job.company.logo || '/placeholder.svg'} 
                  alt="Company logo"
                  className="w-8 h-8" 
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-sm text-gray-600">
                  {job.company.companyName} • {job.city.cityName} • {job.typeOfWork}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Gửi đơn đăng ký của bạn</h3>
            <p className="text-sm text-gray-600 mb-6">
              Những thông tin dưới đây là bắt buộc và sẽ chỉ được chia sẻ với công ty {job.company.companyName}
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên đầy đủ
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thông tin thêm
                </label>
                <div className="border rounded-lg">
                  <ReactQuill
                    theme="snow"
                    value={formData.additionalInfo}
                    onChange={handleQuillChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Thêm thư xin việc hoặc bất cứ điều gì khác mà bạn muốn chia sẻ"
                    className="h-[200px] mb-12"
                  />
                  <div className="border-t p-2 flex justify-end">
                    <span className="text-sm text-gray-500">
                      {formData.additionalInfo.replace(/<[^>]*>/g, '').length} / 500
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đính kèm CV của bạn tại đây
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                    required
                  />
                  <label 
                    htmlFor="cv-upload"
                    className="cursor-pointer flex items-center justify-center space-x-2 text-indigo-600"
                  >
                    <LinkIcon className="h-5 w-5" />
                    <span>Attach CV</span>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
              >
                Gửi
              </Button>

              <p className="text-sm text-gray-600 text-center">
                Bằng cách gửi yêu cầu, bạn có thể xác nhận rằng bạn chấp nhận{' '}
                <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                {' '}của chúng tôi
              </p>
            </form>
          </div>
        </div>
      </div>

      <AlertDialog 
        open={showConfirmDialog} 
        onOpenChange={setShowConfirmDialog}
      >
        <AlertDialogContent 
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-lg"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-red-600">
              Bạn có chắc chắn muốn hủy?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Tất cả thông tin bạn đã nhập sẽ bị mất. Bạn có chắc chắn muốn thoát?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel 
              onClick={handleCancelClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Tiếp tục chỉnh sửa
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Thoát
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApplyModal;