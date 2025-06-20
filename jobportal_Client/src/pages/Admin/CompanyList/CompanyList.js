import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../ui/button";
import { MoreVertical, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Input } from "../../../ui/input";
import { StarRounded } from "@mui/icons-material";
import { store } from "../../../redux/store.js";
import {
  getAllCompaniesForAdmin,
  getCompanyById,
  getCompanyJobCounts,
} from "../../../redux/Company/company.thunk.js";
import { getAllIndustries } from "../../../redux/Industry/industry.thunk.js";
import { getReviewByCompany } from "../../../redux/Review/review.thunk.js";
import IndustryBadge from "../../../components/common/IndustryBadge/IndustryBadge";

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
  const dispatch = useDispatch();
  const { companies, loading, totalElements, totalPages } = useSelector(
    (store) => store.company
  );
  const { allIndustries } = useSelector((state) => state.industry);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [companyReviews, setCompanyReviews] = useState({});

  useEffect(() => {
    dispatch(
      getAllCompaniesForAdmin({
        companyName: searchTerm,
        industryName: selectedIndustry,
        page: currentPage,
        size: pageSize,
      })
    );
  }, [dispatch, currentPage, pageSize, searchTerm, selectedIndustry]);

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
            const totalStars = reviews.reduce(
              (total, review) => total + review.star,
              0
            );
            const averageRating =
              reviews.length > 0 ? totalStars / reviews.length : 0;
            reviewsData[company.companyId] = {
              reviews: reviews,
              averageRating: averageRating,
              totalReviews: reviews.length,
            };
          } catch (error) {
            console.error(
              `Error fetching reviews for company ${company.companyId}:`,
              error
            );
          }
        }
        setCompanyReviews(reviewsData);
      }
    };
    fetchCompanyReviews();
  }, [companies, dispatch]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(
      getAllCompaniesForAdmin({
        companyName: searchTerm,
        industryName: selectedIndustry,
        page: currentPage,
        size: pageSize,
      })
    );
  };

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
    setCurrentPage(0);
  };

  const handleViewDetail = async (companyId) => {
    try {
      await Promise.all([
        dispatch(getCompanyById(companyId)),
        dispatch(getCompanyJobCounts(companyId)),
      ]);
      navigate(`/admin/companies/${companyId}`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu công ty");
    }
  };

  const isMobile = windowWidth < 800;
  const isMidRange = windowWidth >= 800 && windowWidth <= 1485;
  const isTableLayout = windowWidth > 1485;
  const fontSize = isMobile ? "text-xs" : isMidRange ? "text-sm" : "text-sm";
  const padding = isMobile ? "p-2" : isMidRange ? "p-3" : "p-4";
  const logoSize = isMobile ? "h-8 w-8" : "h-10 w-10";
  const starSize = isMobile ? "w-3 h-3" : "w-4 h-4";
  const inputWidth = isMobile ? "w-full" : isMidRange ? "w-64" : "w-[300px]";
  const cardPadding = isMobile ? "p-3" : "p-4";

  return (
    <div className="space-y-6 mt-8 px-4 sm:px-6 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              className={`${inputWidth} pl-8 ${fontSize}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className={`border rounded-lg px-3 py-2 ${fontSize} focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-auto`}
          >
            <option value="">Tất cả lĩnh vực</option>
            {allIndustries?.map((industry) => (
              <option key={industry.industryId} value={industry.industryName}>
                {industry.industryName}
              </option>
            ))}
          </select>
          <Button
            onClick={applyFilters}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 w-full sm:w-auto"
          >
            Áp dụng
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden max-w-full">
        <div className={`${padding} border-b`}>
          <p className={`${fontSize} text-gray-600`}>
            Tổng số <span className="font-medium">{totalElements}</span> công ty
          </p>
        </div>

        {isTableLayout ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-purple-600 text-white sticky top-0 z-10">
                <tr>
                  <th className={`${padding} text-left w-16 ${fontSize}`}>
                    STT
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Tên công ty
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Địa chỉ
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Lĩnh vực
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Ngày thành lập
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Số điện thoại
                  </th>
                  <th className={`${padding} text-left ${fontSize}`}>
                    Đánh giá
                  </th>
                  <th className={`${padding} w-20`}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-4 text-gray-500"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center text-gray-500 py-4"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  companies.map((company, index) => (
                    <tr
                      key={company.companyId}
                      className="hover:bg-gray-50"
                    >
                      <td className={`${padding} ${fontSize}`}>
                        {index + 1 + currentPage * pageSize}
                      </td>
                      <td className={`${padding}`}>
                        <div className="flex items-center">
                          <img
                            src={company.logo || "/default-logo.png"}
                            alt=""
                            className={`${logoSize} rounded-full mr-2 sm:mr-3`}
                          />
                          <span className={`font-medium ${fontSize}`}>
                            {company.companyName}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`${padding} text-gray-500 ${fontSize}`}
                      >
                        {company.address}
                      </td>
                      <td className={`${padding}`}>
                        <div className="flex flex-col gap-1">
                          {company.industry?.map((ind) => (
                            <IndustryBadge key={ind.industryId} name={ind.industryName} />
                          ))}
                        </div>
                      </td>
                      <td
                        className={`${padding} text-gray-500 ${fontSize}`}
                      >
                        {formatDate(company.establishedTime)}
                      </td>
                      <td
                        className={`${padding} text-gray-500 ${fontSize}`}
                      >
                        {company.contact}
                      </td>
                      <td className={`${padding}`}>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarRounded
                                key={star}
                                className={`${starSize} ${
                                  star <=
                                  (companyReviews[company.companyId]
                                    ?.averageRating || 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`${fontSize} text-gray-500`}>
                            (
                            {companyReviews[company.companyId]
                              ?.totalReviews || 0}
                            )
                          </span>
                        </div>
                      </td>
                      <td className={`${padding}`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleViewDetail(company.companyId)
                              }
                            >
                              Chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Đang tải...
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Không có dữ liệu
              </div>
            ) : (
              companies.map((company, index) => (
                <div
                  key={company.companyId}
                  className="bg-gray-50 rounded-lg shadow-sm overflow-hidden"
                >
                  <div className={`${cardPadding} flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={company.logo || "/default-logo.png"}
                          alt=""
                          className={`${logoSize} rounded-full`}
                        />
                        <div>
                          <span className={`font-medium ${fontSize}`}>
                            {company.companyName}
                          </span>
                          <p className={`${fontSize} text-gray-500`}>
                            #{index + 1 + currentPage * pageSize}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleViewDetail(company.companyId)
                            }
                          >
                            Chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2">
                      <p className={`${fontSize} text-gray-500`}>
                        <span className="font-medium">Địa chỉ:</span>{" "}
                        {company.address}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {company.industry?.map((ind) => (
                          <IndustryBadge key={ind.industryId} name={ind.industryName} />
                        ))}
                      </div>
                      {!isMobile && (
                        <p className={`${fontSize} text-gray-500`}>
                          <span className="font-medium">
                            Ngày thành lập:
                          </span>{" "}
                          {formatDate(company.establishedTime)}
                        </p>
                      )}
                      {!isMobile && (
                        <p className={`${fontSize} text-gray-500`}>
                          <span className="font-medium">Số điện thoại:</span>{" "}
                          {company.contact}
                        </p>
                      )}
                      <div className="flex items-center gap-1">
                        <span className={`${fontSize} font-medium text-gray-600`}>
                          Đánh giá:
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarRounded
                              key={star}
                              className={`${starSize} ${
                                star <=
                                (companyReviews[company.companyId]
                                  ?.averageRating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`${fontSize} text-gray-500`}>
                          (
                          {companyReviews[company.companyId]?.totalReviews ||
                            0}
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div
          className={`${padding} border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-2">
            <span className={fontSize}>Hiển thị</span>
            <select
              className={`border rounded p-1 ${fontSize}`}
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className={fontSize}>công ty mỗi trang</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
              className={fontSize}
            >
              Truocs đó
            </Button>
            <Button
              variant="outline"
              className={`bg-purple-600 text-white ${fontSize}`}
            >
              {currentPage + 1}
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
              className={fontSize}
            >
              Tiếp theo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}