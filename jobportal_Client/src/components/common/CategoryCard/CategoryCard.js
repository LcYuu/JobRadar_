import React from 'react';
import './CategoryCard.css';

const CategoryCard = ({ icon, title, jobCount, isActive }) => {
  return (
    <div className={`category-card ${isActive ? 'active' : ''}`}>
      <div className="icon">
        <img src={icon} alt={title} />
      </div>
      <div className="category-info">
        <h3 className="category-title">{title}</h3>
        <p className="job-count">{jobCount} công việc</p>
      </div>
      <div className="arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
};

export default CategoryCard;
