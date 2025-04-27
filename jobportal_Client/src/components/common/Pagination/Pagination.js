import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css"; // Import the CSS file we'll create

/**
 * Component phân trang có thể tái sử dụng
 * @param {Object} props - Props component
 * @param {number} props.currentPage - Trang hiện tại (bắt đầu từ 0)
 * @param {number} props.totalPages - Tổng số trang
 * @param {Function} props.onPageChange - Callback khi thay đổi trang
 * @param {number} [props.siblingCount=1] - Số trang hiển thị bên cạnh trang hiện tại
 * @param {string} [props.className] - Class CSS tùy chỉnh
 * @returns {JSX.Element}
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = "",
}) => {
  const [inputPage, setInputPage] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Tạo mảng các trang sẽ hiển thị với ellipsis
  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // sibling + current + first + last

    // Nếu số trang ít hơn totalPageNumbers, hiển thị tất cả
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // Tính toán các bên trái và phải của trang hiện tại
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 0);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages - 1
    );

    // Không hiển thị ellipsis khi chỉ có 1 số ở giữa
    const shouldShowLeftDots = leftSiblingIndex > 1;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 0;
    const lastPageIndex = totalPages - 1;

    // Xác định các trường hợp hiển thị
    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Hiển thị 1, 2, 3, 4, 5 ... 10
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i);
      return [...leftRange, -1, lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      // Hiển thị 1 ... 6, 7, 8, 9, 10
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i
      );
      return [firstPageIndex, -1, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      // Hiển thị 1 ... 4, 5, 6 ... 10
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, -1, ...middleRange, -2, lastPageIndex];
    }
  };

  // Xử lý khi nhập số trang
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputPage(value);
    }
  };

  // Xử lý khi nhấn Enter trong input
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      const pageNumber = parseInt(inputPage, 10) - 1; // Điều chỉnh để 0-indexed
      if (!isNaN(pageNumber) && pageNumber >= 0 && pageNumber < totalPages) {
        onPageChange(pageNumber);
        setInputPage("");
        setIsInputActive(false);
      } else {
        // Hiển thị thông báo lỗi hoặc reset input
        setInputPage("");
      }
    } else if (e.key === "Escape") {
      setIsInputActive(false);
      setInputPage("");
    }
  };

  // Xử lý khi click vào nút "..."
  const handleEllipsisClick = () => {
    setIsInputActive(true);
  };

  // Enhanced page change handler with animation
  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;

    setAnimating(true);

    // Add a small delay before actually changing the page
    setTimeout(() => {
      onPageChange(newPage);

      // Scroll to the top of the page smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      // Reset animation state after a short delay
      setTimeout(() => {
        setAnimating(false);
      }, 50);
    }, 250);
  };

  // Nếu không có trang nào, không hiển thị phân trang
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className={`flex items-center justify-center space-x-1 ${className} ${animating ? 'pagination-fade-out' : 'pagination-fade-in'}`}
      aria-label="Pagination"
    >
      {/* Nút Previous */}
      <button
        onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition-all duration-300 ${
          currentPage === 0
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Previous</span>
      </button>

      {/* Page numbers */}
      {pageNumbers?.map((pageNumber, i) => {
        // Ellipsis hiển thị dưới dạng "..."
        if (pageNumber === -1 || pageNumber === -2) {
          return (
            <button
              key={`ellipsis-${i}`}
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-all duration-300"
              onClick={handleEllipsisClick}
            >
              ...
            </button>
          );
        }

        // Input trang hiển thị khi click vào ellipsis
        if (isInputActive && (pageNumber === -1 || i === Math.floor(pageNumbers.length / 2))) {
          return (
            <div key="page-input" className="relative inline-block">
              <input
                type="text"
                value={inputPage}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                autoFocus
                className="w-12 h-8 px-1 text-center border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                placeholder=" " 
                aria-label="Go to page"
              />
            </div>
          );
        }

        // Các trang thông thường
        return (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            disabled={pageNumber === currentPage}
            className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition-all duration-300 ${
              pageNumber === currentPage
                ? "bg-purple-600 text-white font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-current={pageNumber === currentPage ? "page" : undefined}
          >
            {pageNumber + 1}
          </button>
        );
      })}

      {/* Nút Next */}
      <button
        onClick={() =>
          currentPage < totalPages - 1 && handlePageChange(currentPage + 1)
        }
        disabled={currentPage >= totalPages - 1}
        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition-all duration-300 ${
          currentPage >= totalPages - 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Next</span>
      </button>
    </nav>
  );
};

export default Pagination; 