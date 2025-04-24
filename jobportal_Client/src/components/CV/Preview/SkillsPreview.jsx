import React from "react";

const SkillsPreview = ({ cvInfo }) => {
  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm uppercase tracking-wide mb-3"
        style={{
          color: cvInfo?.themeColor,
        }}
      >
        Kỹ năng
      </h2>
      <hr
        className="mb-4"
        style={{
          borderColor: cvInfo?.themeColor,
          borderWidth: "2px",
        }}
      />
      <div className="grid grid-cols-2 gap-4">
        {cvInfo?.skills?.length > 0 ? (
          cvInfo.skills.map((skill, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="text-sm font-semibold">{skill.name || "Không có tên"}</h3>
              <div className="relative w-full h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="absolute top-0 left-0 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: cvInfo?.themeColor,
                    width: skill?.rating ? skill.rating * 20 + "%" : "0%",
                  }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 col-span-2 text-center">Không có kỹ năng nào.</p>
        )}
      </div>
    </div>
  );
};

export default SkillsPreview;
