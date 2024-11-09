
import React, { useState } from 'react';
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { FileUp, X, Star, Upload, Eye } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function MyCV() {
  const [cvFiles, setCvFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Chỉ chấp nhận file PDF");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được vượt quá 5MB");
        return;
      }

      const newCV = {
        id: Date.now(),
        name: file.name,
        file: file,
        starred: false,
        uploadDate: new Date().toLocaleDateString()
      };

      setCvFiles(prev => [...prev, newCV]);
      toast.success("CV đã được tải lên thành công");
      
      event.target.value = '';
    }
  };

  const deleteCV = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa CV này?")) {
      setCvFiles(prev => prev.filter(cv => cv.id !== id));
      toast.success("CV đã được xóa");
    }
  };

  const toggleStar = (id) => {
    setCvFiles(prev => prev.map(cv => {
      if (cv.id === id) {
        const newStarred = !cv.starred;
        toast.success(newStarred ? "Đã đánh dấu CV" : "Đã bỏ đánh dấu CV");
        return { ...cv, starred: newStarred };
      }
      return cv;
    }));
  };

  const handleViewCV = (file) => {
    setSelectedPdf(URL.createObjectURL(file));
  };

  const handleClosePreview = () => {
    setSelectedPdf(null);
  };

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">CV của tôi</h2>
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="cv-upload"
            />
            <label htmlFor="cv-upload">
              <Button className="cursor-pointer" onClick={() => document.getElementById('cv-upload').click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload CV
              </Button>
            </label>
          </div>
        </div>

        {cvFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileUp className="mx-auto h-12 w-12 mb-4" />
            <p>Chưa có CV nào được tải lên</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cvFiles.map(cv => (
              <div
                key={cv.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleStar(cv.id)}
                    className={`focus:outline-none ${cv.starred ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    <Star className="h-5 w-5" fill={cv.starred ? "currentColor" : "none"} />
                  </button>
                  <div>
                    <p className="font-medium">{cv.name}</p>
                    <p className="text-sm text-gray-500">Tải lên ngày: {cv.uploadDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:bg-blue-50"
                    onClick={() => handleViewCV(cv.file)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => deleteCV(cv.id)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-3/4 h-3/4 relative">
            <Button 
              onClick={handleClosePreview}
              className="absolute right-2 top-2 z-10"
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
            <iframe
              src={selectedPdf}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

