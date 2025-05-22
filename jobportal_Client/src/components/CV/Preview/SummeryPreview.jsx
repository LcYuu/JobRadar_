import React from "react";
import DOMPurify from "dompurify";

const SummaryPreview = ({ cvInfo }) => {
  // Preprocess summery to replace &nbsp; with regular spaces
  const preprocessSummary = (text) => {
    if (!text) return "";
    // Replace &nbsp; (including encoded forms) with a regular space
    return text.replace(/&nbsp;|\u00A0/g, " ");
  };

  // Sanitize HTML to prevent XSS and render content
  const sanitizedSummary = cvInfo?.summery
    ? DOMPurify.sanitize(preprocessSummary(cvInfo.summery))
    : "";

  return (
    <div className="my-6">
      {/* Tiêu đề */}
      <h2
        className="text-center font-bold text-sm mb-2 uppercase"
        style={{
          color: cvInfo?.themeColor,
        }}
      >
        Giới thiệu bản thân
      </h2>
      <hr
        className="border-t-[1.5px] w-16 mx-auto mb-3"
        style={{
          borderColor: cvInfo?.themeColor,
        }}
      />
      {/* Nội dung */}
      <div
        className="text-sm text-gray-800 leading-relaxed text-justify"
        dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
      />
    </div>
  );
};

export default SummaryPreview;