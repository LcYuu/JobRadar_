import React, { useEffect } from "react";
import CategoryCard from "../CategoryCard/CategoryCard";
import "./CategoryList.css"; // Import CSS cho bố cục
import logo from "../../../assets/images/common/logo.jpg"; // Icon giả lập, thay thế bằng các icon thực tế của bạn
import googleIcon from "../../../assets/icons/google.png";
import { useDispatch, useSelector } from "react-redux";
import { getIndustry } from "../../../redux/Industry/industry.action";

const iconUrls = [
  "https://cdn-icons-png.flaticon.com/128/3007/3007250.png", // Thương mại điện tử
  "https://cdn-icons-png.flaticon.com/128/1260/1260235.png", // Marketing
  "https://cdn-icons-png.flaticon.com/128/3868/3868395.png", // IT phần cứng
  "https://cdn-icons-png.flaticon.com/128/3085/3085330.png", // Công nghệ ô tô
  "https://cdn-icons-png.flaticon.com/128/1207/1207220.png", // IT phần mềm
  "https://cdn-icons-png.flaticon.com/128/1876/1876750.png", // Nhà hàng/Khách sạn
  "https://cdn-icons-png.flaticon.com/128/2779/2779775.png", // Thiết kế
  "https://cdn-icons-png.flaticon.com/128/675/675795.png", // Điện - điện tử
  "https://cdn-icons-png.flaticon.com/128/3135/3135727.png", // Kinh doanh
];

const CategoryList = () => {
  const dispatch = useDispatch();
  const { industries } = useSelector((store) => store.industry);

  useEffect(() => {
    dispatch(getIndustry());
  }, [dispatch]);
  return (
    <>
      <h2 className="text-2xl font-bold" style={{ color: "#43bfb3" }}>
        Công việc theo danh mục
      </h2>

      <div className="category-list">
        {industries.slice(1).map((industry, index) => (
          <CategoryCard
            key={industry.industryId}
            icon={iconUrls[index]}
            title={industry.industryName}
            jobCount={industry.jobCount}
            industryId={industry.industryId}
          />
        ))}
      </div>
    </>
  );
};

export default CategoryList;
