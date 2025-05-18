import React, { useEffect, useRef, useState } from "react";
import ReviewManagement from "../../components/Review/ReviewManagement";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";
import {
  countReviewByStar,
  findAllReview,
} from "../../redux/Review/review.thunk";
import { useNavigate } from "react-router-dom";
import { findAllCompany } from "../../redux/Company/company.thunk";
import { StarRounded } from "@mui/icons-material";
import { FiChevronDown } from "react-icons/fi";

const RatingStars = React.memo(({ value, onChange, readOnly = false }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer"}`}
        >
          <StarRounded
            className={`w-6 h-6 ${
              star <= value ? "text-yellow-500" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
});

const AdminReview = () => {
  const { reviews, totalPages, countByStar, loading } = useSelector(
    (store) => store.review
  );
  const { companies } = useSelector((store) => store.company);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const dispatch = useDispatch();
  const role = 1;
  const navigate = useNavigate();

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedStar, setSelectedStar] = useState("");
  const companyId = selectedCompany;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isMobile = window.innerWidth < 800;
  const isMidRange = window.innerWidth >= 800 && window.innerWidth <= 1485;
  const fontSize = isMobile ? "text-xs" : isMidRange ? "text-sm" : "text-sm";
  const padding = isMobile ? "p-2" : isMidRange ? "p-3" : "p-4";

  useEffect(() => {
    dispatch(findAllCompany());
    dispatch(countReviewByStar({ companyId }));
    dispatch(findAllReview({ page, size }));
  }, [dispatch, companyId, page, size]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleFilters = () => {
    dispatch(
      findAllReview({
        page: 0,
        size,
        companyId: selectedCompany,
        star: selectedStar,
      })
    );
    setPage(0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4 max-w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Các đánh giá</h2>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col custom-800:flex-row custom-800:flex-wrap gap-3">
          <div className="relative w-full custom-800:w-auto" ref={dropdownRef}>
            <button
              className="border rounded px-4 py-2 flex items-center justify-between w-full custom-800:w-auto"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedStar ? (
                <RatingStars value={selectedStar} readOnly />
              ) : (
                "Tất cả đánh giá"
              )}
              <FiChevronDown className="ml-2" />
            </button>
            {isDropdownOpen && (
              <div className="absolute bg-white shadow-lg mt-2 rounded-lg w-full custom-800:w-48 z-10 left-0 custom-800:right-0">
                <div
                  className="cursor-pointer p-2 hover:bg-gray-100"
                  onClick={() => {
                    setSelectedStar("");
                    setIsDropdownOpen(false);
                  }}
                >
                  Tất cả đánh giá
                </div>
                {countByStar.map((c) => (
                  <div
                    key={c.star}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedStar(c.star);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <RatingStars value={c.star} readOnly />
                    <span className="ml-2">({c.count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <select
            className={`border rounded px-4 py-2 ${fontSize} w-full custom-800:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value);
              setSelectedStar("");
            }}
          >
            <option value="">Tất cả công ty</option>
            {companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.companyName}
              </option>
            ))}
          </select>
          <Button
            className={`bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full custom-800:w-auto ${fontSize}`}
            onClick={handleFilters}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Đang tải...</div>
      ) : reviews.length > 0 ? (
        <ul className="space-y-4 p-4 custom-1360:p-6">
          {[...reviews]
            .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
            .map((review, index) => (
              <li
                key={review.reviewId}
                className="block hover:bg-purple-100 hover:shadow-lg transition rounded-lg cursor-pointer bg-gray-50 shadow-sm"
                onClick={() =>
                  navigate(
                    `/admin/review-detail/${review.company.companyId}/${review.seeker.userId}`
                  )
                }
              >
                <ReviewManagement
                  review={review}
                  role={role}
                  index={index}
                  className={`${padding} ${fontSize}`}
                />
              </li>
            ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-500">Không có đánh giá nào</div>
      )}

      {totalPages > 1 && (
        <div
          className={`border-t flex flex-col custom-800:flex-row justify-between items-start custom-800:items-center gap-4 ${padding} custom-1360:p-6`}
        >
          <div className="flex items-center gap-2">
            <span className={fontSize}>Hiển thị</span>
            <select
              className={`border rounded p-1 ${fontSize}`}
              value={size}
              onChange={handleSizeChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className={fontSize}>đánh giá mỗi trang</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              className={fontSize}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              className={`bg-purple-600 text-white ${fontSize} hover:bg-purple-700`}
            >
              {page + 1}
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
              className={fontSize}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReview;