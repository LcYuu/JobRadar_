
import React, { useEffect, useState } from 'react';
import { Button } from "../../ui/button";
import { format, formatDate } from 'date-fns';
import { Card } from "../../ui/card";
import { FileUp, X, Star, Upload, Eye } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { createCV, deleteCV, getCVBySeeker, updateCVIsMain } from '../../redux/CV/cv.action';
import { store } from '../../redux/store';

export default function MyCV() {
  const dispatch = useDispatch()
  const [cvFiles, setCvFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const {cvs = []} = useSelector((store) => store.cv)

  useEffect(() => {
    dispatch(getCVBySeeker());
  }, [dispatch]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
  
    if (file) {
      setCvFiles(file.name)
      // Kiểm tra file
      if (file.type !== 'application/pdf') {
        toast.error("Chỉ chấp nhận file PDF");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được vượt quá 5MB");
        return;
      }
  
      try {
        // Tải file lên Cloudinary
        const uploadedFile = await uploadToCloudinary(file);
        if (uploadedFile) {
          const cvData = { pathCV: uploadedFile, cvName: file.name}; // Đảm bảo gửi URL đúng
  
          await dispatch(createCV(cvData));
          dispatch(getCVBySeeker());
          toast.success("CV đã được tải lên thành công");
        }
      } catch (error) {
        toast.error("Đã có lỗi khi tải lên CV");
      }
  
      event.target.value = ''; // Reset input file
    }
  };
  
  

  const handleDeleteCV = async (cvId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa CV này?")) {
      await dispatch(deleteCV(cvId))
      dispatch(getCVBySeeker())
    }
  };

  const toggleStar = async (cvId) => {
    try {
      // Gọi API để cập nhật trạng thái 'isMain' (hoặc 'starred') của CV
      await dispatch(updateCVIsMain(cvId));
      dispatch(getCVBySeeker());
  
      // Hiển thị thông báo thành công sau khi cập nhật
      toast.success("Đã đánh dấu CV là chính");
    } catch (error) {
      // Hiển thị thông báo lỗi nếu có
      toast.error("Có lỗi khi cập nhật CV");
    }
  };
  

  const handleViewCV = (path) => {
    setSelectedPdf(path);  // URL trực tiếp từ Cloudinary để xem PDF
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
            {/* Input file ẩn */}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="cv-upload"
            />
            {/* Nút Upload CV, khi click sẽ mở cửa sổ tải lên */}
            <Button className="cursor-pointer" onClick={() => document.getElementById('cv-upload').click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload CV
            </Button>
          </div>
        </div>

        {cvs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileUp className="mx-auto h-12 w-12 mb-4" />
            <p>Chưa có CV nào được tải lên</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cvs.map(cv => (
              <div
                key={cv.cvId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleStar(cv.cvId)}
                    className={`focus:outline-none ${cv.isMain ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    <Star className="h-5 w-5" fill={cv.isMain ? "currentColor" : "none"} />
                  </button>
                  <div>
                  <p className="font-medium">{cv.cvName}</p> {/* Lấy tên file từ path */}
                  <p className="text-sm text-gray-500">
                      Cập nhật ngày: {formatDate(new Date(cv.createTime), 'dd/MM/yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:bg-blue-50"
                    onClick={() => handleViewCV(cv.pathCV)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteCV(cv.cvId)}
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

