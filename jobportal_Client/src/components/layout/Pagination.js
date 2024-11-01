import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';

const Pagination = ({ currentPage, pageSize, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Hiển thị các trang */}
      {Array.from({ length: totalPages }).map((_, index) => {
        // Hiển thị các trang từ 0 đến 4, trang cuối cùng và trang hiện tại
        if (index < 5 || index === totalPages - 1 || index === currentPage) {
          return (
            <Button
              key={index}
              variant="outline"
              className={currentPage === index ? 'bg-purple-600 text-white' : ''}
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </Button>
          );
        }
        // Hiển thị dấu "..." nếu tổng số trang lớn hơn 5 và currentPage lớn hơn 5
        if ( totalPages > 5) {
          return <span key={index}>...</span>; // Hiển thị dấu "..."
        }
        return null; // Không hiển thị trang
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;
