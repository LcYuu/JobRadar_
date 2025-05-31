import React from "react";
import { industryColors } from "../../../configs/constants";

export default function IndustryBadge({ name, className = "" }) {
  const style = industryColors[name] || industryColors["default"];
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium mr-1 mb-1 inline-block ${className}`}
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: style.border,
      }}
    >
      {name}
    </span>
  );
}
