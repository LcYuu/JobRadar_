import React from "react";

const SummeryPreview = ({ cvInfo }) => {
  if (!cvInfo?.summery) return null; // Ẩn nếu không có nội dung

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
      <p className="text-sm text-gray-800 leading-relaxed text-justify">
        {cvInfo.summery}
      </p>
    </div>
  );
};

export default SummeryPreview;
