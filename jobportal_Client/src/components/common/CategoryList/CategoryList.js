import React, { useEffect } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import './CategoryList.css'; // Import CSS cho bố cục
import logo from '../../../assets/images/common/logo.jpg';// Icon giả lập, thay thế bằng các icon thực tế của bạn
import googleIcon from '../../../assets/icons/google.png';
import { useDispatch, useSelector } from 'react-redux';
import { getIndustry } from '../../../redux/Industry/industry.action';


const iconUrls = [
  'https://cdn-icons-png.flaticon.com/512/2906/2906273.png', // Công nghệ thông tin
  'https://cdn-icons-png.flaticon.com/512/2631/2631227.png', // Thương mại điện tử
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Marketing
  'https://cdn-icons-png.flaticon.com/512/1055/1055689.png', // IT phần cứng
  'https://cdn-icons-png.flaticon.com/512/741/741407.png',   // Công nghệ ô tô
  'https://cdn-icons-png.flaticon.com/512/2721/2721291.png'  // IT phần mềm
];

const CategoryList = () => {
  const dispatch = useDispatch();
  const { industries} = useSelector(store => store.industry);

  useEffect(() => {
    dispatch(getIndustry());
  }, [dispatch]);
  return (
    <>
    <h2 className="text-2xl font-bold">Danh mục </h2>
    <div className="category-list">
      {industries.slice(1).map((industry, index) => (
        <CategoryCard
          key={index}
          icon={iconUrls[index]} 
          title={industry.industryName}
          jobCount={industry.jobCount}
        />
      ))}
    </div>
    </>
    
  );
};

export default CategoryList;
