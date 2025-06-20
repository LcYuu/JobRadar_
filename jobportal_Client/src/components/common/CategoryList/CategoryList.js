import React, { useEffect, useState } from "react";
import CategoryCard from "../CategoryCard/CategoryCard";
import "./CategoryList.css"; // Import CSS cho bố cục
import { useDispatch, useSelector } from "react-redux";
import { getIndustry } from "../../../redux/Industry/industry.thunk";
import Container from "../Container/Container";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

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
  "https://cdn-icons-png.flaticon.com/512/6702/6702322.png",
];

const CategoryList = () => {
  const dispatch = useDispatch();
  const { industries } = useSelector((store) => store.industry);
  const navigate = useNavigate();
  // Change the threshold to 768px for mobile carousel view
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    dispatch(getIndustry());
    
    // Update resize listener to use the new breakpoint
    const handleResize = () => {
      setIsSmallMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  // Carousel settings for mobile
  const carouselSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    variableWidth: false,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          variableWidth: true,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          variableWidth: true,
        }
      }
    ]
  };

  // Custom arrow components
  function CustomNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <button
        className="custom-next-arrow"
        style={{ ...style }}
        onClick={onClick}
        aria-label="Next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    );
  }
  
  function CustomPrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <button
        className="custom-prev-arrow"
        style={{ ...style }}
        onClick={onClick}
        aria-label="Previous"
        disabled={props.currentSlide === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    );
  }

  // Hàm xử lý khi click vào danh mục
  const handleCategoryClick = (industryId) => {
    navigate("/find-jobs", {
      state: {
        selectedIndustryIds: [industryId],
        key: Date.now(), // Thêm key random để luôn khác nhau
      },
    });
  };

  return (
    <Container>
      <>
        <h2 className="text-2xl font-bold" style={{ color: "#43bfb3" }}>
          Công việc theo danh mục
        </h2>

        {isSmallMobile ? (
          // Show carousel only on small mobile screens
          <div className="category-carousel-container">
            <Slider {...carouselSettings}>
              {industries.slice(1).map((industry, index) => (
                <div key={industry.industryId} className="carousel-item-wrapper" onClick={() => handleCategoryClick(industry.industryId)}>
                  <CategoryCard
                    icon={iconUrls[index]}
                    title={industry.industryName}
                    jobCount={industry.jobCount}
                    industryId={industry.industryId}
                  />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          // Show regular grid layout for larger screens
          <div className="category-list">
            {industries.slice(1).map((industry, index) => (
              <div key={industry.industryId} onClick={() => handleCategoryClick(industry.industryId)}>
                <CategoryCard
                  icon={iconUrls[index]}
                  title={industry.industryName}
                  jobCount={industry.jobCount}
                  industryId={industry.industryId}
                />
              </div>
            ))}
          </div>
        )}
      </>
    </Container>
  );
};

export default CategoryList;
