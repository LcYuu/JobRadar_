import React, { useState } from 'react';
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
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState } from 'draft-js';

const ApplyModal = ({ job, isOpen, onClose, onSubmit, formData, handleInputChange, onFileChange }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleQuillChange = (content) => {
    handleInputChange({
      target: {
        name: 'additionalInfo',
        value: content
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2)
      });
      onFileChange(e);
    }
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
              className="absolute top-4 right-4 text-gray-500"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className=" cursor-text hover:cursor-default block text-sm font-medium text-gray-700 mb-1">
                  Thông tin thêm
                </label>
                <div className="border rounded-lg">
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={(newState) => {
                      const plainText = newState.getCurrentContent().getPlainText();
                      if (plainText.length <= 500) {
                        setEditorState(newState);
                        handleInputChange({
                          target: {
                            name: 'additionalInfo',
                            value: plainText
                          }
                        });
                      }
                    }}
                    toolbar={{
                      options: ['inline', 'list'],
                      inline: {
                        options: ['bold', 'italic', 'underline'],
                      },
                    }}
                    editorClassName="px-3 py-2 min-h-[200px] cursor-text"
                    toolbarClassName="!border-0 !mb-0 cursor-default"
                    wrapperClassName="!border-0 cursor-default"
                    toolbarStyle={{ cursor: 'default' }}
                    editorStyle={{ cursor: 'text' }}
                  />
                  <div className="border-t p-2 flex justify-end">
                    <span className="text-sm text-gray-500">
                      {formData.additionalInfo.length} / 500
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
                  {!selectedFile ? (
                    <label 
                      htmlFor="cv-upload"
                      className="cursor-pointer flex items-center justify-center space-x-2 text-indigo-600"
                    >
                      <LinkIcon className="h-5 w-5" />
                      <span>Attach CV</span>
                    </label>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-gray-700">
                        <LinkIcon className="h-5 w-5" />
                        <span>{selectedFile.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedFile.size} MB
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          document.getElementById('cv-upload').value = '';
                        }}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-3 rounded-lg"
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
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
            >
              Tiếp tục chỉnh sửa
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
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