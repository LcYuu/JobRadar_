import React from "react";

const ExperiencePreview = ({ cvInfo }) => {
  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm uppercase tracking-wide mb-3"
        style={{
          color: cvInfo?.themeColor,
        }}
      >
        Kinh nghiệm
      </h2>
      <hr
        className="mb-4"
        style={{
          borderColor: cvInfo?.themeColor,
          borderWidth: "2px",
        }}
      />
      {(cvInfo?.experience || []).map((experience, index) => (
        <div
          key={index}
          className="my-5 p-4 border-l-4 rounded-md shadow-sm bg-gray-50"
          style={{ borderColor: cvInfo?.themeColor }}
        >
          <h3
            className="text-base font-bold"
            style={{ color: cvInfo?.themeColor }}
          >
            {experience?.title}
          </h3>
          <h4 className="text-sm font-semibold mt-1">
            {experience?.companyName} - {experience?.address}
          </h4>
          <p className="text-xs text-gray-600 italic">
            {experience?.startDate} đến{" "}
            {experience?.currentlyWorking ? "Hiện tại" : experience?.endDate}
          </p>
          {experience?.workSummery && (
            <div
              className="text-sm mt-2 text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: experience?.workSummery }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ExperiencePreview;
