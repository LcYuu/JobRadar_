import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useDispatch, useSelector } from "react-redux";
import CompanyCard from "../../components/common/CompanyCard/CompanyCard";
import { Link } from "react-router-dom";
import {
  getCompanyFitSeeker,
  searchCompanies,
} from "../../redux/Company/company.thunk";
import { getCity } from "../../redux/City/city.thunk";
import { getAllIndustries } from "../../redux/Industry/industry.thunk";
import Pagination from "../../components/common/Pagination/Pagination";
import Swal from "sweetalert2";

export default function FindCompanies() {
  const industryStyles = {
    "Thương mại điện tử": {
      backgroundColor: "rgba(30, 144, 255, 0.1)",
      color: "#1E90FF",
      border: "1px solid #1E90FF",
    },
    "Marketing/Truyền thông": {
      backgroundColor: "rgba(255, 140, 0, 0.1)",
      color: "#FF8C00",
      border: "1px solid #FF8C00",
    },
    "IT phần cứng": {
      backgroundColor: "rgba(0, 0, 255, 0.1)",
      color: "#0000FF",
      border: "1px solid #0000FF",
    },
    "Công nghệ ô tô": {
      backgroundColor: "rgba(255, 99, 71, 0.1)",
      color: "#FF4500",
      border: "1px solid #FF4500",
    },
    "IT phần mềm": {
      backgroundColor: "rgba(0, 255, 255, 0.1)",
      color: "#00FFFF",
      border: "1px solid #00FFFF",
    },
    "Nhà hàng/Khách sạn": {
      backgroundColor: "rgba(255, 105, 180, 0.1)",
      color: "#FF69B4",
      border: "1px solid #FF69B4",
    },
    "Thiết kế/In ấn": {
      backgroundColor: "rgba(255, 99, 71, 0.1)",
      color: "#FF6347",
      border: "1px solid #FF6347",
    },
    "Cơ khí/Điện - điện tử": {
      backgroundColor: "rgba(70, 130, 180, 0.1)",
      color: "#4682B4",
      border: "1px solid #4682B4",
    },
    "Kinh doanh": {
      backgroundColor: "rgba(138, 43, 226, 0.1)",
      color: "#8A2BE2",
      border: "1px solid #8A2BE2",
    },
    "Giáo dục/Đào tạo": {
      backgroundColor: "rgba(40, 167, 69, 0.1)",
      color: "#28A745",
      border: "1px solid #28A745",
    },
    "Kiến trúc/Xây dựng": {
      backgroundColor: "rgba(255, 193, 7, 0.1)",
      color: "#FFC107",
      border: "1px solid #FFC107",
    },
    "Tài chính/Ngân hàng": {
      backgroundColor: "rgba(23, 162, 184, 0.1)",
      color: "#17A2B8",
      border: "1px solid #17A2B8",
    },
    "Viễn thông": {
      backgroundColor: "rgba(200, 35, 51, 0.1)",
      color: "#C82333",
      border: "1px solid #C82333",
    },
    "Y tế": {
      backgroundColor: "rgba(107, 114, 128, 0.1)",
      color: "#6B7280",
      border: "1px solid #6B7280",
    },
    "Logistics": {
      backgroundColor: "rgba(221, 160, 221, 0.1)",
      color: "#DDA0DD",
      border: "1px solid #DDA0DD",
    },
    "Kế toán/Kiểm toán": {
      backgroundColor: "rgba(244, 162, 97, 0.1)",
      color: "#F4A261",
      border: "1px solid #F4A261",
    },
    "Sản xuất": {
      backgroundColor: "rgba(43, 108, 176, 0.1)",
      color: "#2B6CB0",
      border: "1px solid #2B6CB0",
    },
    "Tài xế": {
      backgroundColor: "rgba(233, 30, 99, 0.1)",
      color: "#E91E63",
      border: "1px solid #E91E63",
    },
    "Luật": {
      backgroundColor: "rgba(72, 187, 120, 0.1)",
      color: "#48BB78",
      border: "1px solid #48BB78",
    },
    "Phiên dịch": {
      backgroundColor: "rgba(75, 85, 99, 0.1)",
      color: "#4B5563",
      border: "1px solid #4B5563",
    },
    "Hệ thống nhúng và IoT": {
      backgroundColor: "rgba(153, 27, 27, 0.1)",
      color: "#991B1B",
      border: "1px solid #991B1B",
    },
  };

  const dispatch = useDispatch();
  const {
    companyByFeature = [],
    companyFitSeeker = [],
    error,
    totalPages = 1,
    totalElements = 0,
    companyLoading,
  } = useSelector((store) => store.company);
  const { cities = [] } = useSelector((store) => store.city);
  const { allIndustries = [] } = useSelector((store) => store.industry);

  const [filters, setFilters] = useState({
    title: "",
    cityId: "",
    industryId: "",
  });
  const [tempFilters, setTempFilters] = useState({
    title: "",
    cityId: "",
    industryId: "",
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(12); // Tăng số lượng hiển thị mỗi trang
  const [selectedCategoryName, setSelectedCategoryName] =
    useState("Tất cả công ty");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    dispatch(searchCompanies({ filters, currentPage, size }));
    dispatch(getCity());
    dispatch(getCompanyFitSeeker());
    dispatch(getAllIndustries());
  }, [filters, currentPage, size, dispatch]);

  useEffect(() => {
    dispatch(getCity());
    dispatch(getCompanyFitSeeker());
    dispatch(getAllIndustries());
  }, [dispatch]);

  const handleSearch = async () => {
    const updatedFilters = {
      ...tempFilters,
      cityId: tempFilters.cityId === "all" ? "" : tempFilters.cityId,
    };
    setFilters(updatedFilters);
    setCurrentPage(0);
    
    // Gọi API để tìm kiếm công ty
    await dispatch(searchCompanies({ filters: updatedFilters, currentPage, size }));
  };

  useEffect(() => {
    if (!companyLoading && filters.title !== "") {
      if (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi tìm kiếm",
          text: error.message || "Có lỗi xảy ra khi tìm kiếm công ty",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#3085d6",
        });
      } else if (companyByFeature.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Không tìm thấy kết quả",
          text: "Không có công ty nào phù hợp với tiêu chí tìm kiếm của bạn",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Tìm kiếm thành công",
          text: `Đã tìm thấy ${totalElements} công ty phù hợp`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  }, [companyByFeature, error, totalElements, companyLoading, filters.title]);

  const handleCategoryChange = (industryId) => {
    setSelectedCategory(industryId);
    setSelectedCategoryName(
      industryId === null
        ? "Tất cả công ty"
        : allIndustries.find((industry) => industry.industryId === industryId)
            ?.industryName || "Tất cả công ty"
    );
    
    // Update both tempFilters and actual filters to trigger API call
    const newIndustryId = industryId || "";
    setTempFilters((prev) => ({ ...prev, industryId: newIndustryId }));
    
    // Update filters to trigger API search with the selected industry
    setFilters((prev) => ({ ...prev, industryId: newIndustryId }));
    setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi danh mục
  };
  // Replace with direct reference to API results
  const filteredCompanies = companyByFeature;
  
  const hasFilteredCompanies = filteredCompanies.length > 0;

  const hasSuggestedCompanies = companyFitSeeker.length > 0;

  // Filter out "None" from industries list
  const filteredIndustries = allIndustries.filter(
    (industry) =>
      industry &&
      industry.industryName !== "None" &&
      industry.industryName.toLowerCase() !== "none"
  );

  // Hàm lấy danh sách ngành cho từng công ty
  const getIndustryNames = (industryIds) => {
    return (industryIds || [])
      .map(
        (id) =>
          allIndustries.find((industry) => industry.industryId === id)
            ?.industryName
      )
      .filter(Boolean);
  };

  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    setLoading(true); // Start loading when page changes
    setCurrentPage(newPage);
    window.scrollTo({
      top: document.getElementById("companies-list").offsetTop - 80,
      behavior: "smooth",
    });

    // Add a small delay to show loading effect
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center my-8">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Tìm kiếm{" "}
            <span className="relative inline-block text-primary text-blue-500">
              công ty yêu thích của bạn
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 opacity-50"></span>
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            Tìm công ty mơ ước mà bạn muốn làm việc
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Nhập tên công ty hoặc từ khóa mong muốn"
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              value={tempFilters.title}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, title: e.target.value })
              }
            />
          </div>
          <div className="relative w-64">
            <Select
              onValueChange={(value) =>
                setTempFilters({ ...tempFilters, cityId: value })
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả địa điểm</SelectItem>
                  {cities.slice(1).map((c) => (
                    <SelectItem key={c.cityId} value={c.cityId}>
                      {c.cityName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition duration-200"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-500">Danh mục</h2>

          {/* Desktop View (>=768px) */}
          <div className="hidden md:flex md:gap-4 md:flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => handleCategoryChange(null)}
              className={`hover:bg-gray-200 transition duration-200 ${
                selectedCategory === null
                  ? "bg-purple-600 text-white"
                  : "bg-white"
              }`}
            >
              Tất cả ngành nghề
            </Button>
            {filteredIndustries.map((industry) => (
              <Button
                key={industry.industryId}
                variant={
                  selectedCategory === industry.industryId
                    ? "default"
                    : "outline"
                }
                onClick={() => handleCategoryChange(industry.industryId)}
                className={`hover:bg-gray-200 transition duration-200 ${
                  selectedCategory === industry.industryId
                    ? "bg-purple-600 text-white"
                    : "bg-white"
                }`}
              >
                {industry.industryName}
              </Button>
            ))}
          </div>

          {/* Mobile View (<768px) - Horizontal Scrollable with Navigation Buttons */}
          <div className="relative md:hidden">
            <div className="flex items-center">
              <button
                onClick={() => {
                  const container = document.getElementById(
                    "category-scroll-container"
                  );
                  container.scrollLeft -= 200;
                }}
                className="absolute left-0 z-10 bg-purple-600 rounded-full p-1 shadow-md hover:bg-purple-700"
                aria-label="Scroll left"
              >
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
                  className="w-5 h-5 text-white"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div
                id="category-scroll-container"
                className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-8 scroll-smooth"
                style={{
                  scrollBehavior: "smooth",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => handleCategoryChange(null)}
                  className={`flex-shrink-0 hover:bg-gray-200 transition duration-200 ${
                    selectedCategory === null
                      ? "bg-purple-600 text-white"
                      : "bg-white"
                  }`}
                >
                  Tất cả ngành nghề
                </Button>
                {filteredIndustries.map((industry) => (
                  <Button
                    key={industry.industryId}
                    variant={
                      selectedCategory === industry.industryId
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleCategoryChange(industry.industryId)}
                    className={`flex-shrink-0 hover:bg-gray-200 transition duration-200 ${
                      selectedCategory === industry.industryId
                        ? "bg-purple-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    {industry.industryName}
                  </Button>
                ))}
              </div>

              <button
                onClick={() => {
                  const container = document.getElementById(
                    "category-scroll-container"
                  );
                  container.scrollLeft += 200;
                }}
                className="absolute right-0 z-10 bg-purple-600 rounded-full p-1 shadow-md hover:bg-purple-700"
                aria-label="Scroll right"
              >
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
                  className="w-5 h-5 text-white"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Optional: Add indicator dots or progress bar here if needed */}
          </div>

          <style jsx>{`
            /* Hide scrollbar for Chrome, Safari and Opera */
            #category-scroll-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        <div id="companies-list" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedCategory === null ? (
                <span className="text-blue-500">Tất cả</span>
              ) : (
                <>
                  Các công ty trong lĩnh vực{" "}
                  <span className="font-bold text-blue-600">
                    {selectedCategoryName}
                  </span>
                </>
              )}
            </h2>
            <p className="text-gray-500">
              Tổng số: {totalElements > 0 ? totalElements : 0} kết quả | Trang {currentPage + 1}/{totalPages}
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : hasFilteredCompanies ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {filteredCompanies.map((company) => {
                  const industryNames = getIndustryNames(
                    company.industryIds || [company.industryId]
                  );
                  return (
                    <Link
                      to={`/companies/${company.companyId.toString()}`}
                      className="block"
                      key={company.companyId}
                    >
                      <Card className="p-6 space-y-4 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg bg-white hover:shadow-2xl card-company">
                        <div className="flex items-center gap-4">
                          <img
                            src={company.logo || "default-logo.png"}
                            alt={`${company.companyName || "Công ty"} logo`}
                            className="h-16 w-16 rounded-lg shadow-md"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">
                              {company.companyName || "Tên công ty không có"}
                            </h3>
                            <p className="text-sm text-primary">
                              {company.countJob || 0} công việc đang mở
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {company.description || "Không có mô tả"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {industryNames.map((name, index) => (
                            <Badge
                              key={index}
                              className="text-xs mr-1"
                              style={{
                                backgroundColor:
                                  industryStyles[name]?.backgroundColor ||
                                  "rgba(0, 0, 0, 0.1)",
                                color: industryStyles[name]?.color || "#000000",
                                border:
                                  industryStyles[name]?.border ||
                                  "1px solid #000000",
                              }}
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Hiển thị phân trang khi có nhiều trang */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    siblingCount={1}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">
              Không có kết quả nào phù hợp với tìm kiếm của bạn.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-500">
            Danh sách công ty đề xuất
          </h2>
          {hasSuggestedCompanies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyFitSeeker.map((company) => (
                <CompanyCard
                  key={company.companyId}
                  company={company}
                  variant="suggested"
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Không có công ty đề xuất nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
