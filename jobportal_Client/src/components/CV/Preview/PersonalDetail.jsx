import React from "react";

const PersonalDetail = ({ cvInfo }) => {
  const defaultAvatar =
    "https://res.cloudinary.com/ddqygrb0g/image/upload/v1739714221/avatar_fa4cj7.jpg";
  
  const themeColor = cvInfo?.themeColor || "#3357FF"; // Default theme color

  return (
    <div 
      className="flex flex-col items-center gap-6 my-3 p-6 w-full rounded-lg relative"
      style={{
        borderLeft: `4px solid ${themeColor}`,
      }}
    >
      {/* Avatar */}
      <div className="flex justify-center items-center">
        <img
          src={cvInfo?.profileImage || defaultAvatar}
          alt={`${cvInfo?.firstName || ""} ${cvInfo?.lastName || ""}`}
          className="rounded-full border-4 shadow-md transition-all duration-200"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            borderColor: themeColor,
          }}
        />
      </div>

      {/* Personal Information */}
      <div className="flex flex-col items-center text-center w-full">
        <h3
          className="font-extrabold text-2xl transition-colors duration-200"
          style={{ color: themeColor }}
        >
          {cvInfo?.lastName} {cvInfo?.firstName}
        </h3>
        <h4 className="text-lg font-semibold text-gray-700 mt-1">
          {cvInfo?.jobTitle}
        </h4>
        <p className="text-sm text-gray-500 italic mt-1">{cvInfo?.address}</p>
      </div>

      {/* Contact Information */}
      <div className="flex justify-between w-full absolute bottom-0 px-6">
        {cvInfo?.phone && (
          <p className="text-gray-700 flex items-center gap-2 transition-colors duration-200">
            📞{" "}
            <span className="font-semibold" style={{ color: themeColor }}>
              {cvInfo?.phone}
            </span>
          </p>
        )}
        {cvInfo?.email && (
          <p className="text-gray-700 flex items-center gap-2 transition-colors duration-200">
            ✉️{" "}
            <span className="font-semibold" style={{ color: themeColor }}>
              {cvInfo?.email}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalDetail;
