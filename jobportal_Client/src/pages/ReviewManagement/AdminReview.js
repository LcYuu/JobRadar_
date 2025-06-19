import React, { useEffect, useRef, useState } from "react";
import ReviewManagement from "../../components/Review/ReviewManagement";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";
import {
  countReviewByStar,
  findAllReview,
  deleteReview,
  getReviewReactions,
  getAdminReviewStatistics, // Import action mới
} from "../../redux/Review/review.thunk";
import { useNavigate } from "react-router-dom";
import { findAllCompany } from "../../redux/Company/company.thunk";
import { StarRounded, ThumbUpAlt, ThumbDownAlt, TrendingUp, TrendingDown } from "@mui/icons-material";
import { FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

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

// Component hiển thị reaction stats
const ReactionStats = ({ reviewId, reactions }) => {
  const reaction = reactions[reviewId] || { likeCount: 0, dislikeCount: 0 };
  const totalReactions = reaction.likeCount + reaction.dislikeCount;

  return (
    <div className="flex items-center justify-between mt-3 p-2 bg-gray-50 rounded-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ThumbUpAlt className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-blue-600">{reaction.likeCount}</span>
          <span className="text-sm text-gray-500">Like</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbDownAlt className="w-4 h-4 text-red-500" />
          <span className="font-medium text-red-600">{reaction.dislikeCount}</span>
          <span className="text-sm text-gray-500">Dislike</span>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        Tổng: <span className="font-medium">{totalReactions}</span> tương tác
      </div>
    </div>
  );
};

// Component mới cho Statistics View
const StatisticsCard = ({ company }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {company.companyName}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/company/${company.companyId}`)}
        >
          Xem chi tiết
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{company.totalReviews}</div>
          <div className="text-sm text-gray-600">Tổng đánh giá</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {company.averageRating ? company.averageRating.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Điểm TB</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <ThumbUpAlt className="w-4 h-4 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{company.totalLikes}</span>
          </div>
          <div className="text-sm text-gray-600">Likes</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <ThumbDownAlt className="w-4 h-4 text-red-600" />
            <span className="text-2xl font-bold text-red-600">{company.totalDislikes}</span>
          </div>
          <div className="text-sm text-gray-600">Dislikes</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="text-center">
          <span className="text-lg font-semibold text-purple-600">
            {company.totalInteractions}
          </span>
          <span className="text-sm text-gray-600 ml-1">tương tác</span>
        </div>
      </div>
    </div>
  );
};

const AdminReview = () => {
  const { reviews, totalPages, countByStar, loading, reactions, adminStatistics } = useSelector(
    (store) => store.review
  );
  const { companies } = useSelector((store) => store.company);
  const role =1;
  // States cho view hiện tại
  const [viewMode, setViewMode] = useState('reviews'); // 'reviews' hoặc 'statistics'
  
  // States cho reviews (existing)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedStar, setSelectedStar] = useState("");
  
  // States cho statistics
  const [statsPage, setStatsPage] = useState(0);
  const [statsSize, setStatsSize] = useState(12);
  const [sortBy, setSortBy] = useState('totalReviews');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    minReviews: '',
    maxReviews: '',
    minLikes: '',
    maxLikes: '',
    minDislikes: '',
    maxDislikes: '',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const companyId = selectedCompany;

  // Responsive
  const isMobile = window.innerWidth < 800;
  const isMidRange = window.innerWidth >= 800 && window.innerWidth <= 1485;
  const fontSize = isMobile ? "text-xs" : isMidRange ? "text-sm" : "text-sm";
  const padding = isMobile ? "p-2" : isMidRange ? "p-3" : "p-4";

  // Load data based on view mode
  useEffect(() => {
    if (viewMode === 'reviews') {
      dispatch(findAllCompany());
      dispatch(countReviewByStar({ companyId }));
      dispatch(findAllReview({ page, size }));
    } else if (viewMode === 'statistics') {
      dispatch(getAdminReviewStatistics({
        page: statsPage,
        size: statsSize,
        sortBy,
        sortDirection,
        ...filters
      }));
    }
  }, [dispatch, viewMode, companyId, page, size, statsPage, statsSize, sortBy, sortDirection]);

  // Load reactions cho reviews
  useEffect(() => {
    if (viewMode === 'reviews' && reviews && reviews.length > 0) {
      const reviewIds = reviews.map((review) => review.reviewId);
      dispatch(getReviewReactions(reviewIds));
    }
  }, [reviews, dispatch, viewMode]);

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

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa đánh giá này không?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteReview(reviewId)).unwrap();
        toast.success("Xóa đánh giá thành công");
        // Refresh danh sách đánh giá
        dispatch(findAllReview({ page, size }));
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa đánh giá");
      }
    }
  };

  // Handlers cho Statistics
  const handleStatsFilter = () => {
    const validFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '') {
        validFilters[key] = parseInt(filters[key]);
      }
    });
    
    dispatch(getAdminReviewStatistics({
      page: 0,
      size: statsSize,
      sortBy,
      sortDirection,
      ...validFilters
    }));
    setStatsPage(0);
  };

  const handleSortChange = (newSortBy) => {
    const newDirection = sortBy === newSortBy && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  // Render Statistics View
  const renderStatisticsView = () => (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Bộ lọc và sắp xếp</h3>
        
        {/* Sort Controls */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          <Button
            variant={sortBy === 'totalReviews' ? 'default' : 'outline'}
            onClick={() => handleSortChange('totalReviews')}
            className="flex items-center gap-1 text-xs"
          >
            Tổng đánh giá
            {sortBy === 'totalReviews' && (
              sortDirection === 'desc' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
            )}
          </Button>
          
          <Button
            variant={sortBy === 'totalLikes' ? 'default' : 'outline'}
            onClick={() => handleSortChange('totalLikes')}
            className="flex items-center gap-1 text-xs"
          >
            Tổng Likes
            {sortBy === 'totalLikes' && (
              sortDirection === 'desc' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
            )}
          </Button>
          
          <Button
            variant={sortBy === 'totalDislikes' ? 'default' : 'outline'}
            onClick={() => handleSortChange('totalDislikes')}
            className="flex items-center gap-1 text-xs"
          >
            Tổng Dislikes
            {sortBy === 'totalDislikes' && (
              sortDirection === 'desc' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
            )}
          </Button>
          
          <Button
            variant={sortBy === 'totalInteractions' ? 'default' : 'outline'}
            onClick={() => handleSortChange('totalInteractions')}
            className="flex items-center gap-1 text-xs"
          >
            Tổng tương tác
            {sortBy === 'totalInteractions' && (
              sortDirection === 'desc' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
            )}
          </Button>
          
          <Button
            variant={sortBy === 'averageRating' ? 'default' : 'outline'}
            onClick={() => handleSortChange('averageRating')}
            className="flex items-center gap-1 text-xs"
          >
            Điểm TB
            {sortBy === 'averageRating' && (
              sortDirection === 'desc' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
            )}
          </Button>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <input
            type="number"
            placeholder="Min Reviews"
            className="border rounded px-3 py-2 text-sm"
            value={filters.minReviews}
            onChange={(e) => setFilters({...filters, minReviews: e.target.value})}
          />
          <input
            type="number"
            placeholder="Max Reviews"
            className="border rounded px-3 py-2 text-sm"
            value={filters.maxReviews}
            onChange={(e) => setFilters({...filters, maxReviews: e.target.value})}
          />
          <input
            type="number"
            placeholder="Min Likes"
            className="border rounded px-3 py-2 text-sm"
            value={filters.minLikes}
            onChange={(e) => setFilters({...filters, minLikes: e.target.value})}
          />
          <input
            type="number"
            placeholder="Max Likes"
            className="border rounded px-3 py-2 text-sm"
            value={filters.maxLikes}
            onChange={(e) => setFilters({...filters, maxLikes: e.target.value})}
          />
          <input
            type="number"
            placeholder="Min Dislikes"
            className="border rounded px-3 py-2 text-sm"
            value={filters.minDislikes}
            onChange={(e) => setFilters({...filters, minDislikes: e.target.value})}
          />
          <input
            type="number"
            placeholder="Max Dislikes"
            className="border rounded px-3 py-2 text-sm"
            value={filters.maxDislikes}
            onChange={(e) => setFilters({...filters, maxDislikes: e.target.value})}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleStatsFilter} className="bg-purple-600 hover:bg-purple-700">
            Áp dụng bộ lọc
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setFilters({
                minReviews: '', maxReviews: '', minLikes: '', 
                maxLikes: '', minDislikes: '', maxDislikes: ''
              });
              setSortBy('totalReviews');
              setSortDirection('desc');
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminStatistics.content.map((company) => (
              <StatisticsCard key={company.companyId} company={company} />
            ))}
          </div>

          {/* Statistics Pagination */}
          {adminStatistics.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                disabled={statsPage === 0}
                onClick={() => setStatsPage(statsPage - 1)}
              >
                Trước
              </Button>
              <span>
                Trang {statsPage + 1} / {adminStatistics.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={statsPage === adminStatistics.totalPages - 1}
                onClick={() => setStatsPage(statsPage + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4 max-w-full">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý đánh giá</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'reviews' ? 'default' : 'outline'}
            onClick={() => setViewMode('reviews')}
          >
            Danh sách đánh giá
          </Button>
          <Button
            variant={viewMode === 'statistics' ? 'default' : 'outline'}
            onClick={() => setViewMode('statistics')}
          >
            Thống kê công ty
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'statistics' ? renderStatisticsView() : (
        <>
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
                  >
                    <div className="relative">
                      <div
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
                        {/* Thêm ReactionStats component */}
                        <div className={`${padding} pt-0`}>
                          <ReactionStats reviewId={review.reviewId} reactions={reactions} />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        className="absolute top-2 right-2 text-xs text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(review.reviewId);
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
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
        </>
      )}
    </div>
  );
};

export default AdminReview;