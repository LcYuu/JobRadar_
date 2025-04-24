import React, { useEffect } from "react";
import CategoryCard from "../CategoryCard/CategoryCard";
import "./CategoryList.css"; // Import CSS cho bố cục
import { useDispatch, useSelector } from "react-redux";
import { getIndustry } from "../../../redux/Industry/industry.thunk";


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
  "https://cdn-icons-png.flaticon.com/128/3976/3976625.png",
  "https://cdn-icons-png.flaticon.com/128/10365/10365919.png",
  "https://cdn-icons-png.flaticon.com/128/3635/3635987.png",
  "https://cdn-icons-png.flaticon.com/128/1667/1667118.png",
  "https://cdn-icons-png.flaticon.com/128/2966/2966327.png",
  "https://cdn-icons-png.flaticon.com/128/4363/4363531.png",
  "https://cdn-icons-png.flaticon.com/128/1570/1570887.png",
  "https://cdn-icons-png.flaticon.com/128/9280/9280764.png",
  "https://cdn-icons-png.flaticon.com/128/4900/4900915.png",
  "https://cdn-icons-png.flaticon.com/128/9068/9068413.png",
  "https://cdn-icons-png.flaticon.com/128/2974/2974086.png",

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
