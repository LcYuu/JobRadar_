import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../ui/button";
import {
  MoreVertical,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllCompaniesForAdmin } from "../../../redux/Company/company.action";
import { getAllIndustries } from "../../../redux/Industry/industry.action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { getCompanyById } from '../../../redux/Company/company.action';
import { getCompanyJobCounts } from '../../../redux/Company/company.action';
import { toast } from 'react-hot-toast';
import { Input } from "../../../ui/input";
import { StarRounded } from "@mui/icons-material";
import { getReviewByCompany } from "../../../redux/Review/review.action";
import { store } from "../../../redux/store";


const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (error) {
    return "N/A";
  }
};

export default function CompanyList() {
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
  const { companies, loading, totalElements, totalPages } = useSelector(
    (state) => state.company
  );
  const { allIndustries } = useSelector((state) => state.industry);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const navigate = useNavigate();

  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [companyReviews, setCompanyReviews] = useState({});

  useEffect(() => {
    dispatch(
      getAllCompaniesForAdmin(
        searchTerm,
        selectedIndustry,
        currentPage,
        pageSize
      )
    );
  }, [dispatch, currentPage, pageSize]);

  // Xử lý tìm kiếm và lọc
  useEffect(() => {
    dispatch(getAllIndustries());
  }, [dispatch]);

  useEffect(() => {
    const fetchCompanyReviews = async () => {
      if (companies && companies.length > 0) {
        const reviewsData = {};
        for (const company of companies) {
          try {
            await dispatch(getReviewByCompany(company.companyId));
            const reviews = store.getState().review.reviews;
            
            // Tính trung bình đánh giá
            const totalStars = reviews.reduce((total, review) => total + review.star, 0);
            const averageRating = reviews.length > 0 ? totalStars / reviews.length : 0;
            
            reviewsData[company.companyId] = {
              reviews: reviews,
              averageRating: averageRating,
              totalReviews: reviews.length
            };
          } catch (error) {
            console.error(`Error fetching reviews for company ${company.companyId}:`, error);
          }
        }
        setCompanyReviews(reviewsData);
      }
    };

    fetchCompanyReviews();
  }, [companies, dispatch]);

  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(
      getAllCompaniesForAdmin(
        searchTerm,
        selectedIndustry,
        currentPage,
        pageSize
      )
    );
  };

  // Function to get industry name by ID
  const getIndustryName = (industryId) => {
    if (!allIndustries || !industryId) return "N/A";
    const industry = allIndustries.find((ind) => ind.industryId === industryId);
    return industry ? industry.industryName : "N/A";
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0); // Reset về trang đầu khi thay đổi số lượng bản ghi mỗi trang
  };

  // Thêm hàm handleViewDetail
  const handleViewDetail = async (companyId) => {
    try {
      // Pre-fetch data trước khi navigate
      await Promise.all([
        dispatch(getCompanyById(companyId)),
        dispatch(getCompanyJobCounts(companyId))
      ]);
      navigate(`/admin/companies/${companyId}`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải dữ liệu công ty');
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-end items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              className="w-[300px] pl-8"
              onChange={(e) => setSearchTerm(e.target.value)} // Lưu giá trị tìm kiếm
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Tất cả lĩnh vực</option>
            {allIndustries?.map((industry) => (
              <option key={industry.industryId} value={industry.industryName}>
                {industry.industryName}
              </option>
            ))}
          </select>
          <button
            onClick={applyFilters} // Thêm sự kiện áp dụng bộ lọc
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Áp dụng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <p className="text-sm text-gray-600">
            Tổng số <span className="font-medium">{totalElements}</span> công ty
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="text-left p-4 w-16">STT</th>
              <th className="text-left p-4 text-sm font-medium text-white">
                Tên công ty
              </th>
              <th className="text-left p-4 text-sm font-medium text-white">
                Địa chỉ
              </th>
              <th className="text-left p-4 text-sm font-medium text-white">
                Lĩnh vực
              </th>
              <th className="text-left p-4 text-sm font-medium text-white">
                Ngày thành lập
              </th>
              <th className="text-left p-4 text-sm font-medium text-white">
                Số điện thoại
              </th>
              <th className="text-left p-4 text-sm font-medium text-white">
                Đánh giá
              </th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              companies.map((company, index) => (
                <tr key={company.companyId} className="hover:bg-gray-50">
                  <td className="p-4">{index + 1 + currentPage * pageSize}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <img
                        src={company.logo || "/default-logo.png"}
                        alt=""
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <span className="font-medium">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{company.address}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                      style={{
                        backgroundColor:
                          industryStyles[
                            getIndustryName(company.industry?.industryId)
                          ]?.backgroundColor,
                        color:
                          industryStyles[
                            getIndustryName(company.industry?.industryId)
                          ]?.color,
                        border:
                          industryStyles[
                            getIndustryName(company.industry?.industryId)
                          ]?.border,
                      }}
                    >
                      {getIndustryName(company.industry?.industryId)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {formatDate(company.establishedTime)}
                  </td>
                  <td className="p-4 text-gray-500">{company.contact}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarRounded
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (companyReviews[company.companyId]?.averageRating || 0)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({companyReviews[company.companyId]?.totalReviews || 0})
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(company.companyId)}>
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              className="border rounded p-1"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>ứng viên mỗi trang</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="bg-purple-600 text-white"
              onClick={() => handlePageChange(currentPage)}
            >
              {currentPage + 1}
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
