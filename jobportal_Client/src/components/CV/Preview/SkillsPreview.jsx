import React from "react";

const SkillsPreview = ({ cvInfo }) => {
  // Chuyển đổi rating sang tên level
  const getRatingName = (rating) => {
    switch (Number(rating)) {
      case 1: return "Beginner";
      case 2: return "Elementary";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Expert";
      default: return "";
    }
  };

  // Hàm để tạo dots hiển thị rating
  const renderSkillLevel = (rating, themeColor) => {
    // Đảm bảo rating là số
    const numRating = Number(rating) || 0;
    
    // Tạo 5 dấu chấm tròn để hiển thị cấp độ
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      // Hiển thị dots với màu đậm nếu rating >= i, ngược lại hiển thị màu mờ
      dots.push(
        <div 
          key={i} 
          className={`h-3 w-3 rounded-full mx-0.5 transition-all duration-300`}
          style={{
            backgroundColor: themeColor || "#8b5cf6",
            opacity: i <= numRating ? 1 : 0.2
          }}
        />
      );
    }
    
    return (
      <div className="flex items-center mt-1">
        {dots}
      </div>
    );
  };

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
            <div key={index} className="flex flex-col mb-3">
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold">{skill.name || "Không có tên"}</h3>
                <span className="text-xs text-gray-600">
                  {getRatingName(skill.rating)}
                </span>
              </div>
              {renderSkillLevel(skill.rating || 0, cvInfo?.themeColor)}
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
