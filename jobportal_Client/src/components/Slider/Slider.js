import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/images/common/logo.jpg";
import logo1 from "../../assets/images/common/logo1.jpg";
import Swal from "sweetalert2";

const slides = [
  {
    image: logo,
    title: "Khám phá các cơ hội việc làm hấp dẫn",
    subtitle: "Tìm kiếm những vị trí công việc phù hợp với kỹ năng và đam mê của bạn",
    gradient: "from-blue-600/80 to-purple-600/80",
  },
  {
    image: logo1,
    title: "Tìm kiếm những công việc phù hợp với bạn",
    subtitle: "Kết nối với hàng nghìn nhà tuyển dụng uy tín trên toàn quốc",
    gradient: "from-emerald-600/80 to-teal-600/80",
  },
  {
    image: logo,
    title: "Xây dựng sự nghiệp vững chắc cho chính bạn",
    subtitle: "Phát triển kỹ năng và kinh nghiệm cùng các chuyên gia hàng đầu",
    gradient: "from-orange-600/80 to-red-600/80",
  },
  {
    image: logo1,
    title: "Kết nối với hàng trăm nhà tuyển dụng hàng đầu",
    subtitle: "Tiếp cận trực tiếp với các công ty Fortune 500 và startup hàng đầu",
    gradient: "from-indigo-600/80 to-blue-600/80",
  },
];

export default function ProfessionalSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const handleExploreClick = () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Vui lòng đăng nhập để khám phá các công việc",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth/sign-in");
        }
      });
      return;
    }
    navigate("/find-jobs");
  };

  useEffect(() => {
    if (!isPlaying || isHovered) return;
    const interval = setInterval(nextSlide, 2000); // 2 giây
    return () => clearInterval(interval);
  }, [isPlaying, isHovered, nextSlide]);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Main Slider Container */}
      <div
        className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url(${slide.image})` }}
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} pointer-events-none`} />

            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center px-6 md:px-12">
              <div className="max-w-4xl">
                <h1
                  className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 transition-all duration-1000 ${
                    index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                >
                  {slide.title}
                </h1>
                <p
                  className={`text-lg md:text-xl lg:text-2xl text-white/90 font-medium transition-all duration-1000 delay-200 ${
                    index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                >
                  {slide.subtitle}
                </p>

                {/* CTA Button */}
                <Button
                  onClick={handleExploreClick}
                  size="lg"
                  className="mt-16 md:mt-14 transition-all duration-1000 delay-400 bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative z-10"
                >
                  Khám phá ngay
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
          onClick={nextSlide}
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
        </Button>

        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 md:top-6 right-4 md:right-6 bg-white/20 hover:bg-white/30 text-white border-0 w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 md:mt-8 space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-blue-600 scale-125 shadow-lg"
                : "bg-gray-300 hover:bg-gray-400 hover:scale-110"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}