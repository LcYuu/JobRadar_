import React from "react";
import { industryColors } from "../../../configs/constants";

export default function IndustryBadge({ name, className = "", onClick }) {
  const style = industryColors[name] || industryColors["default"];
  
  // Tạo màu hover cho background (sáng hơn hoặc tối hơn một chút)
  const getHoverBackgroundColor = (bgColor) => {
    // Nếu đã có hover color được định nghĩa
    if (style.hoverBackgroundColor) {
      return style.hoverBackgroundColor;
    }
    
    // Tự động tạo màu hover dựa trên màu gốc
    // Có thể dùng CSS filter hoặc opacity để tạo hiệu ứng
    return bgColor;
  };

  const hoverTextColor = style.hoverColor || style.color;
  const hoverBgColor = getHoverBackgroundColor(style.backgroundColor);

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium mr-1 mb-1 inline-block transition-all duration-200 cursor-pointer ${className}`}
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: style.border,
        "--hover-bg-color": hoverBgColor,
        "--hover-text-color": hoverTextColor,
      }}
      onClick={onClick}
    >
      {name}
      <style jsx>{`
        span:hover {
          color: var(--hover-text-color);
          filter: brightness(1.15) saturate(1.1);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </span>
  );
}