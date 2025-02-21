import React from "react";

const PersonalDetail = ({ cvInfo }) => {
  const defaultAvatar =
    "https://res.cloudinary.com/ddqygrb0g/image/upload/v1739714221/avatar_fa4cj7.jpg";

  return (
    <div className="flex flex-col items-center gap-6 my-3 p-6 w-full rounded-lg relative">
      {/* Avatar */}
      <div className="flex justify-center items-center">
        <img
          src={cvInfo?.profileImage || defaultAvatar}
          alt={`${cvInfo?.firstName || ""} ${cvInfo?.lastName || ""}`}
          className="rounded-full border-4 shadow-md"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            borderColor: cvInfo?.themeColor,
          }}
        />
      </div>

      {/* Thông tin cá nhân */}
      <div className="flex flex-col items-center text-center w-full">
        <h3
          className="font-extrabold text-2xl text-gray-800"
          style={{ color: cvInfo?.themeColor }}
        >
          {cvInfo?.lastName} {cvInfo?.firstName}
        </h3>
        <h4 className="text-lg font-semibold text-gray-700">
          {cvInfo?.jobTitle}
        </h4>
        <p className="text-sm text-gray-500 italic">{cvInfo?.address}</p>
      </div>

      {/* Liên hệ (Phone và Email ở hai góc) */}
      <div className="flex justify-between w-full absolute bottom-0 px-6">
        {cvInfo?.phone && (
          <p className="text-gray-700 flex items-center gap-2">
            📞{" "}
            <span className="font-semibold" style={{ color: cvInfo?.themeColor }}>
              {cvInfo?.phone}
            </span>
          </p>
        )}
        {cvInfo?.email && (
          <p className="text-gray-700 flex items-center gap-2">
            ✉️{" "}
            <span className="font-semibold" style={{ color: cvInfo?.themeColor }}>
              {cvInfo?.email}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalDetail;
