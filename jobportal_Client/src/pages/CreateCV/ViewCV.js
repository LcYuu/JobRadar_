import React, { useEffect, useState, useRef } from "react";
import { Button } from "../../ui/button";
import CVPreview from "../../components/CV/CVPreview";
import { CVInfoContext } from "../../context/CVInfoContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getGenCVById } from "../../redux/GeneratedCV/generated_cv.thunk";
import "./ViewCV.css";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createCV } from "../../redux/CV/cv.thunk";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react";

// Thêm CSS cho việc in ấn
const printStyles = `
@media print {
  @page {
    margin: 5mm 10mm 10mm 10mm; /* Giảm margin-top xuống 5mm */
    size: A4;
  }
  
  body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
  }
  
  .page-break {
    page-break-after: always;
    margin-top: 20mm;
  }
  
  #print-area {
    overflow: visible !important;
    padding-top: 0 !important; /* Loại bỏ padding trên cùng */
    margin-top: 0 !important;
  }
  
  #print-area > div {
    margin-bottom: 0;
    padding-bottom: 0;
    margin-top: 0; /* Không có margin-top cho div con đầu tiên */
    padding-top: 0;
  }
  
  /* Thêm khoảng cách cho trang thứ 2 trở đi */
  #print-area > div:not(:first-child) {
    margin-top: 15mm; /* Giảm xuống 15mm */
  }
}
`;

const ViewCV = () => {
  const [cvInfo, setCvInfo] = useState();
  // State để kiểm soát trạng thái loading cho các nút
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Thêm tham chiếu để lưu trữ nội dung gốc khi in
  const originalContentRef = useRef(null);

  const { genCv, loading } = useSelector((store) => store.genCV);
  const { genCvId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (genCvId) {
      dispatch(getGenCVById(genCvId));
    }
  }, [dispatch, genCvId]);

  useEffect(() => {
    if (genCv && Object.keys(genCv).length > 0 && genCv.cvContent) {
      try {
        const jsonCv = JSON.parse(genCv?.cvContent.replace(/^"|"$/g, ""));
        setCvInfo(jsonCv);
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu CV:", error);
        toast.error("Không thể đọc dữ liệu CV");
      }
    }
  }, [genCv]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Thêm style cho việc in
      const styleElement = document.createElement('style');
      styleElement.id = 'print-styles';
      styleElement.innerHTML = printStyles;
      document.head.appendChild(styleElement);
      
      // Lưu lại nội dung gốc trước khi thay đổi DOM
      originalContentRef.current = document.body.innerHTML;
      
      // Chỉ sử dụng nội dung CV
      const cvContent = document.getElementById("print-area").innerHTML;
      
      // Tạo container với padding hợp lý, giảm padding-top
      document.body.innerHTML = `<div style="padding: 5mm 10mm 20mm 10mm;">${cvContent}</div>`;
      
      // Sử dụng setTimeout để đảm bảo DOM được cập nhật trước khi in
      setTimeout(() => {
        window.print();
        
        // Đợi một chút sau khi in xong để khôi phục DOM
        setTimeout(() => {
          // Khôi phục nội dung
          if (originalContentRef.current) {
            document.body.innerHTML = originalContentRef.current;
            
            // Xóa style đã thêm
            const addedStyle = document.getElementById('print-styles');
            if (addedStyle) addedStyle.remove();
            
            // Đánh dấu đã hoàn thành
            setIsDownloading(false);
            
            // Khôi phục các event listener sau khi đã thay đổi DOM
            const scriptElements = document.getElementsByTagName('script');
            Array.from(scriptElements).forEach(script => {
              if (script.src) {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                document.body.appendChild(newScript);
              }
            });
          }
        }, 500);
      }, 300);
    } catch (error) {
      console.error("Lỗi khi tải xuống:", error);
      setIsDownloading(false);
      toast.error("Có lỗi xảy ra khi tạo bản in");
    }
  };

  const handleUpload = async () => {
    // Ngăn không cho người dùng nhấn nhiều lần
    if (isUploading) return;
    
    setIsUploading(true);
    
    const cvElement = document.getElementById("print-area");

    if (!cvElement) {
      toast.error("Không tìm thấy nội dung CV để xuất PDF!");
      setIsUploading(false);
      return;
    }

    try {
      toast.info("Đang tạo file PDF, vui lòng đợi...");
      
      // Chụp ảnh nội dung CV với độ phân giải cao hơn
      const canvas = await html2canvas(cvElement, { 
        scale: 2, // Tăng độ phân giải
        useCORS: true,
        logging: false,
        allowTaint: true,
        windowWidth: 1200 // Đảm bảo rộng đủ
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Tính toán kích thước
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 5; // Giảm margin-top xuống 5mm
      
      pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Nếu CV dài, tự động chia trang với khoảng cách hợp lý
      if (imgHeight * ratio > pdfHeight - 15) { // Giảm khoảng cách xuống 15
        let heightLeft = imgHeight * ratio;
        let position = 0;
        
        pdf.addPage();
        heightLeft -= (pdfHeight - 15); // Giảm xuống 15
        position = 0;
        
        // Tính toán số trang và phân bố nội dung
        while (heightLeft > 0) {
          position += (pdfHeight - 15); // Giảm xuống 15
          pdf.addImage(imgData, "JPEG", imgX, 5 - position, imgWidth * ratio, imgHeight * ratio);
          heightLeft -= (pdfHeight - 15);
          
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }
      }
      
      const fileName = genCv?.cvName ? `${genCv.cvName}.pdf` : "cv.pdf";
      
      // Tạo và tải file PDF
      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], fileName, {
        type: "application/pdf",
      });

      // Upload file lên Cloudinary
      const uploadedUrl = await uploadToCloudinary(pdfFile);

      if (uploadedUrl) {
        const cvData = { pathCV: uploadedUrl, cvName: pdfFile.name };
        await dispatch(createCV(cvData));
        toast.success("CV đã được lưu thành công");
      } else {
        toast.error("Không thể lưu CV");
      }
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      toast.error("Có lỗi xảy ra khi tạo PDF!");
    } finally {
      // Luôn đặt lại trạng thái sau khi hoàn thành
      setIsUploading(false);
    } 
  };

  const handleBack = () => {
    try {
      console.log("Đang điều hướng về trang chi tiết CV...");
      
      // Sử dụng replace: true để thay thế URL hiện tại trong lịch sử
      // thay vì thêm một mục mới vào lịch sử trình duyệt
      navigate(`/create-cv/detail-cv/${genCvId}`, { replace: true });
      
      console.log("Đã điều hướng tới:", `/create-cv/detail-cv/${genCvId}`);
    } catch (error) {
      console.error("Lỗi khi điều hướng:", error);
      
      // Phương án dự phòng nếu có lỗi
      window.location.replace(`/create-cv/detail-cv/${genCvId}`);
    }
  };

  return (
    <CVInfoContext.Provider value={{ cvInfo, setCvInfo }}>
      <div id="no-print">
        <div className="my-10 mx-10 md:mx-20 lg:mx-36">
          <h2 className="text-center text-2xl font-medium">
            Chúc mừng bạn đã tạo CV thành công
          </h2>
          <p className="text-center text-gray-500">
            Giờ bạn đã có thể tải xuống hoặc lưu CV của mình
          </p>
          <div className="flex justify-center gap-4 my-10">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={isDownloading || isUploading}
            >
              Quay lại
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading || isUploading}
            >
              {isDownloading ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Tải xuống PDF"
              )}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isDownloading || isUploading}
            >
              {isUploading ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu CV"
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="my-10 mx-10 md:mx-20 lg:mx-36">
        <div id="print-area" className="bg-white shadow-lg">
          <CVPreview />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
    </CVInfoContext.Provider>
  );
};

export default ViewCV;
