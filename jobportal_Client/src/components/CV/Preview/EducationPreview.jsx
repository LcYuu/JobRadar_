import React from "react";

const EducationPreview = ({ cvInfo }) => {
  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm uppercase tracking-wide mb-3"
        style={{
          color: cvInfo?.themeColor,
        }}
      >
        Học vấn
      </h2>
      <hr
        className="mb-4"
        style={{
          borderColor: cvInfo?.themeColor,
          borderWidth: "2px",
        }}
      />
      {(cvInfo?.education || []).map((education, index) => (
        <div key={index} className="my-5 p-3 border-l-4 rounded-md shadow-sm" style={{ borderColor: cvInfo?.themeColor }}>
          <h3 className="text-base font-bold" style={{ color: cvInfo?.themeColor }}>
            {education.universityName}
          </h3>
          <h4 className="text-sm font-semibold mt-1">
            {education?.degree} - {education?.major}
          </h4>
          <p className="text-xs text-gray-600 italic">
            {education?.startDate} - {education?.endDate}
          </p>
          {education?.description && <p className="text-sm mt-2 text-gray-800">{education?.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default EducationPreview;
