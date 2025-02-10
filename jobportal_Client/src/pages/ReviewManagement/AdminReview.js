import React, { useEffect, useState } from "react";
import ReviewManagement from "../../components/Review/ReviewManagement";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";

import { findAllReview } from "../../redux/Review/review.thunk";
import { Link, useNavigate } from "react-router-dom";


const AdminReview = () => {
  const { reviews, totalPages } = useSelector((store) => store.review);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const dispatch = useDispatch();
  const role = 1;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(findAllReview({ page, size }));
  }, [dispatch, page, size]);

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0); // Reset về trang đầu khi thay đổi số lượng bản ghi mỗi trang
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Các đánh giá</h2>
      <ul className="space-y-4">
      {reviews.length > 0 ? (
        [...reviews]
          .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
          .map((review) => (
            <div
              key={review.reviewId}
              className="block hover:bg-purple-100 hover:shadow-lg transition rounded-md cursor-pointer"
              onClick={() => navigate(`/admin/review-detail/${review.company.companyId}/${review.seeker.userId}`)}
            >
              <ReviewManagement review={review} role={role} />
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
