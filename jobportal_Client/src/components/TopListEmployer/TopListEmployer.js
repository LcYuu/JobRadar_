import React, { useState, useEffect } from "react";
import EmployerCard from "../common/EmployerCard/EmployerCard";
import { useDispatch, useSelector } from "react-redux";
import { getCompanyPopular } from "../../redux/Company/company.thunk";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TopListEmployer.css";

export default function TopListEmployers() {
  const dispatch = useDispatch();
  const { companies = [] } = useSelector((store) => store.company); 
  const [currentImageIndexes, setCurrentImageIndexes] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    dispatch(getCompanyPopular());
    
    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  useEffect(() => {
    if (companies.length > 0) {
      setCurrentImageIndexes(companies.map(() => 0));
    }
  }, [companies]);

  // Custom arrow components
  function CustomNextArrow(props) {
    const { onClick } = props;
    return (
      <button
        className="employer-custom-next-arrow"
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
    const { onClick } = props;
    return (
      <button
        className="employer-custom-prev-arrow"
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

  // Carousel settings
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <section className="w-full py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{ color: "#43bfb3" }}
        >
          Top nhà tuyển dụng phổ biến
        </h2>
        
        {isMobile ? (
          <div className="employer-carousel-container">
            <Slider {...settings}>
              {companies.map((company, index) => (
                <div key={index} className="employer-carousel-item">
                  <EmployerCard company={company} />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company, index) => (
              <EmployerCard key={index} company={company} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
