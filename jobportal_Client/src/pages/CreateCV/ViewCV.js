import React, { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import CVPreview from "../../components/CV/CVPreview";
import { CVInfoContext } from "../../context/CVInfoContext";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getGenCVById } from "../../redux/GeneratedCV/generated_cv.thunk";
import "./ViewCV.css";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createCV } from "../../redux/CV/cv.thunk";
import { toast } from "react-toastify";
const ViewCV = () => {
  const [cvInfo, setCvInfo] = useState();

  const { genCv, loading } = useSelector((store) => store.genCV);
  const { genCvId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (genCvId) {
      dispatch(getGenCVById(genCvId));
    }
  }, [dispatch, genCvId]);

  useEffect(() => {
    if (genCv && Object.keys(genCv).length > 0) {
      const jsonCv = JSON.parse(genCv?.cvContent.replace(/^"|"$/g, ""));
      setCvInfo(jsonCv);
    }
  }, [genCv]);

  const handleDownload = () => {
    var cvContent = document.getElementById("print-area").innerHTML;
    var originalContent = document.body.innerHTML;

    document.body.innerHTML = cvContent;
    window.print();
    document.body.innerHTML = originalContent;
  };

  const handleUpload = async () => {
    const cvElement = document.getElementById("print-area");

    if (!cvElement) {
      alert("Không tìm thấy nội dung CV để xuất PDF!");
      return;
    }

    try {
      // Chụp ảnh nội dung CV
      const canvas = await html2canvas(cvElement, { scale: 1.5 });
      const imgData = canvas.toDataURL("image/png");

      // Tạo file PDF
      const pdf = new jsPDF("p", "mm", "a4", true); // true = bật nén

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const fileName = genCv?.cvName ? `${genCv.cvName}.pdf` : "cv.pdf";
      // Chuyển PDF thành Blob với MIME type đúng
      const pdfBlob = new Blob([pdf.output("blob")], {
        type: "application/pdf",
      });
      const pdfFile = new File([pdfBlob], fileName, {
        type: "application/pdf",
      });

      // Upload file lên Cloudinary
      const uploadedUrl = await uploadToCloudinary(pdfFile);

      if (uploadedUrl) {
        const cvData = { pathCV: uploadedUrl, cvName: pdfFile.name };
        await dispatch(createCV(cvData));
        toast.success("CV đã được tải lên thành công");
      } else {
        toast.error("CV tải lên thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      alert("Có lỗi xảy ra khi tạo PDF!");
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
            Giờ bạn đã có thể download CV của mình
          </p>
          <div className="flex justify-between px-44 my-10">
            <Button onClick={handleDownload}>Download</Button>
            <Button>Share</Button>
            <Button onClick={handleUpload}>Upload CV</Button>
          </div>
        </div>
      </div>
      <div className="my-10 mx-10 md:mx-20 lg:mx-36">
        <div id="print-area">
          <CVPreview />
        </div>
      </div>
    </CVInfoContext.Provider>
  );
};

export default ViewCV;
