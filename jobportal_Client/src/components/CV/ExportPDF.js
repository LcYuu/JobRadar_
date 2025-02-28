import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ExportPDF = ({ contentRef }) => {
  const handleDownload = async () => {
    const canvas = await html2canvas(contentRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
    pdf.save("cv.pdf");
  };

  return <button onClick={handleDownload}>📥 Xuất PDF</button>;
};

export default ExportPDF;
