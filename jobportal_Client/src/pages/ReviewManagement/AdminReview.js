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
import { FiChevronDown } from "react-icons/fi"; // Sử dụng icon mũi tên

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
  const { reviews, totalPages, countByStar } = useSelector(
    (store) => store.review
  );
  console.log("🚀 ~ AdminReview ~ countByStar:", countByStar);
  const { companies } = useSelector((store) => store.company);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const dispatch = useDispatch();
  const role = 1;
  const navigate = useNavigate();

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedStar, setSelectedStar] = useState("");
  const companyId = selectedCompany;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Quản lý trạng thái dropdown
  const dropdownRef = useRef(null); // Tham chiếu đến dropdown

  console.log("🚀 ~ AdminReview ~ companyId:", companyId);

  useEffect(() => {
    dispatch(findAllCompany());
    dispatch(countReviewByStar({ companyId }));
    dispatch(findAllReview({ page, size })); // Chỉ tải tất cả review ban đầu
  }, [dispatch, companyId, page, size]);

  useEffect(() => {
    // Đóng dropdown khi nhấp ngoài
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0); // Reset về trang đầu khi thay đổi số lượng bản ghi mỗi trang
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
    setPage(0); // Reset về trang đầu khi thay đổi bộ lọc
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Các đánh giá</h2>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex space-x-2">
          <div className="relative" ref={dropdownRef}>
            <button
              className="border rounded px-4 py-2 flex items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedStar ? (
                <RatingStars value={selectedStar} readOnly />
              ) : (
                "Tất cả đánh giá"
              )}
              <FiChevronDown className="ml-2" /> {/* Dấu mũi tên */}
            </button>
            {isDropdownOpen && (
              <div className="absolute bg-white shadow-lg mt-2 rounded-lg w-48">
                <div
                  className="cursor-pointer p-2"
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
            className="border rounded px-4 py-2"
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value); // Cập nhật công ty được chọn
              setSelectedStar(""); // Reset giá trị sao khi đổi công ty
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
            className="bg-primary bg-purple-600 text-white"
            onClick={handleFilters}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
      <ul className="space-y-4">
        {reviews.length > 0 ? (
          [...reviews]
            .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
            .map((review, index) => (
              <div
                key={review.reviewId}
                className="block hover:bg-purple-100 hover:shadow-lg transition rounded-md cursor-pointer"
                onClick={() =>
                  navigate(
                    `/admin/review-detail/${review.company.companyId}/${review.seeker.userId}`
                  )
                }
              >
                <ReviewManagement review={review} role={role} index={index} />
              </div>
            ))
        ) : (
          <li className="text-gray-500">Không có review nào</li>
        )}
      </ul>

      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              className="border rounded p-1"
              value={size}
              onChange={handleSizeChange}
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
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="bg-purple-600 text-white"
              onClick={() => handlePageChange(page)}
            >
              {page + 1}
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReview;
