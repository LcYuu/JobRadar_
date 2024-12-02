import React from "react";
import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ icon, title, jobCount, isActive, industryId }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Chuyển hướng đến trang find-jobs với state chứa industryId
    navigate("/find-jobs", {
      state: {
        selectedIndustryIds: [industryId],
      },
    });
  };

  return (
    <div
      className={`category-card ${isActive ? "active" : ""}`}
      onClick={handleCardClick}
    >
      <div className="icon">
        <img src={icon} alt={title} />
      </div>
      <div className="category-info">
        <h3 className="category-title font-bold">{title}</h3>
        <p className="job-count text-[16px]" style={{ color: "#a86d36" }}>
          {jobCount} công việc
        </p>
      </div>
      <div className="arrow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-right"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
};

export default CategoryCard;
