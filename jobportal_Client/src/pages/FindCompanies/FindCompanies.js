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


export default function FindCompanies() {
  const industryStyles = {
    "Thiết kế": {
      backgroundColor: "rgba(255, 99, 71, 0.1)", // Màu đỏ san hô nhạt
      color: "#FF6347", // Màu đỏ san hô
      border: "1px solid #FF6347", // Viền màu đỏ san hô
    },
    "Kinh doanh": {
      backgroundColor: "rgba(138, 43, 226, 0.1)", // Màu tím nhạt
      color: "#8A2BE2", // Màu tím
      border: "1px solid #8A2BE2", // Viền màu tím
    },
    Marketing: {
      backgroundColor: "rgba(255, 140, 0, 0.1)", // Màu cam nhạt
      color: "#FF8C00", // Màu cam
      border: "1px solid #FF8C00", // Viền màu cam
    },
    "Thương mại điện tử": {
      backgroundColor: "rgba(30, 144, 255, 0.1)", // Màu xanh dương đậm nhạt
      color: "#1E90FF", // Màu xanh dương đậm
      border: "1px solid #1E90FF", // Viền màu xanh dương đậm
    },
    "IT phần cứng": {
      backgroundColor: "rgba(0, 0, 255, 0.1)", // Màu xanh dương nhạt
      color: "#0000FF", // Màu xanh dương
      border: "1px solid #0000FF", // Viền màu xanh dương
    },
    "IT phần mềm": {
      backgroundColor: "rgba(0, 255, 255, 0.1)", // Màu xanh dương ngọc nhạt
      color: "#00FFFF", // Màu xanh dương ngọc
      border: "1px solid #00FFFF", // Viền màu xanh dương ngọc
    },
    "Công nghệ ô tô": {
      backgroundColor: "rgba(255, 99, 71, 0.1)", // Màu cam đỏ nhạt
      color: "#FF4500", // Màu cam đỏ
      border: "1px solid #FF4500", // Viền màu cam đỏ
    },
    "Nhà hàng/Khách sạn": {
      backgroundColor: "rgba(255, 105, 180, 0.1)", // Màu hồng nhạt
      color: "#FF69B4", // Màu hồng đậm
      border: "1px solid #FF69B4", // Viền màu hồng đậm
    },

    "Điện - điện tử": {
      backgroundColor: "rgba(70, 130, 180, 0.1)", // Màu xanh thép nhạt
      color: "#4682B4", // Màu xanh thép
      border: "1px solid #4682B4", // Viền màu xanh thép
    },
  };

  const dispatch = useDispatch();
  const {
    companyByFeature = [],
    companyFitSeeker = [],
    error,
    totalPages = 1,
    totalElements = 0
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

  useEffect(() => {
    dispatch(searchCompanies({ filters, currentPage, size }));
    dispatch(getCity());
    dispatch(getCompanyFitSeeker());
    dispatch(getAllIndustries());
  }, [filters, currentPage, size, dispatch]);

  useEffect(()=>{
    dispatch(getCity());
    dispatch(getCompanyFitSeeker());
    dispatch(getAllIndustries());
  }, [dispatch])

  const handleSearch = () => {
    const updatedFilters = {
      ...tempFilters,
      cityId: tempFilters.cityId === "all" ? "" : tempFilters.cityId
    };
    setFilters(updatedFilters);
    setCurrentPage(0);
  };

  const handleCategoryChange = (industryId) => {
    setSelectedCategory(industryId);
    setSelectedCategoryName(
      industryId === null
        ? "Tất cả công ty"
        : allIndustries.find((industry) => industry.industryId === industryId)
            ?.industryName || "Tất cả công ty"
    );
    setTempFilters((prev) => ({ ...prev, industryId: industryId || "" }));
    setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi danh mục
  };

  const filteredCompanies = selectedCategory
  ? companyByFeature.filter((company) =>
      company.industryIds.includes(selectedCategory)
    )
  : companyByFeature;

  const hasFilteredCompanies = filteredCompanies.length > 0;

  const hasSuggestedCompanies = companyFitSeeker.length > 0;

  // Filter out "None" from industries list
  const filteredIndustries = allIndustries.filter(
    industry => industry && industry.industryName !== "None" && industry.industryName.toLowerCase() !== "none"
  );

  // Hàm lấy danh sách ngành cho từng công ty
  const getIndustryNames = (industryIds) => {
    return (industryIds || [])
      .map((id) =>
        allIndustries.find((industry) => industry.industryId === id)?.industryName
      )
      .filter(Boolean);
  };

  // Xử lý phân trang
  const handlePageChange = (newPage) => {
    setLoading(true); // Start loading when page changes
    setCurrentPage(newPage);
    window.scrollTo({
      top: document.getElementById('companies-list').offsetTop - 80,
      behavior: 'smooth'
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
                  {cities.map((c) => (
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
          <div className="flex gap-4 flex-wrap">
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
              {hasFilteredCompanies ? 
                selectedCategory ? filteredCompanies.length : totalElements 
              : 0} kết quả
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
                                color:
                                  industryStyles[name]?.color || "#000000",
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

              {/* Hiển thị phân trang khi không chọn danh mục hoặc tổng số trang > 1 */}
              {(selectedCategory === null && totalPages > 1) && (
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