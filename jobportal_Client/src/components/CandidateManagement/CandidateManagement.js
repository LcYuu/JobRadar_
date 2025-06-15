import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  MoreVertical,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  getApplyJobByCompany,
  getNotificationViewJob,
  updateApprove,
} from "../../redux/ApplyJob/applyJob.thunk";
import { getAllJobPost } from "../../redux/JobPost/jobPost.thunk";
import useCVAnalysis from "../../hooks/useCVAnalysis";
import useWebSocket from "../../utils/useWebSocket";
import "./CandidateManagement.css";

const CandidateManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    applyJobByCompany = [],
    viewedJobs = [],
    totalPages,
  } = useSelector((store) => store.applyJob);
  const { positions } = useSelector((store) => store.jobPost);
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [sortBy, setSortBy] = useState("applyDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showCustomDropdown, setShowCustomDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const {
    currentAnalysis,
    showAnalysisModal,
    analyzeCVMatch,
    getCachedScore,
    isAnalyzingCandidate,
    closeAnalysisModal,
  } = useCVAnalysis();

  useEffect(() => {
    dispatch(
      getApplyJobByCompany({
        currentPage,
        size,
        fullName: searchTerm,
        isSave: filterStatus,
        title: filterPosition,
        sortBy,
        sortDirection,
      })
    );
  }, [
    dispatch,
    currentPage,
    size,
    searchTerm,
    filterStatus,
    filterPosition,
    sortBy,
    sortDirection,
  ]);

  useEffect(() => {
    dispatch(getAllJobPost());
  }, [dispatch]);

  const handleUpdate = async (postId, userId) => {
    try {
      await dispatch(updateApprove({ postId, userId })).unwrap();
      toast.success("Đơn ứng tuyển đã được chấp thuận!");
      dispatch(
        getApplyJobByCompany({
          currentPage,
          size,
          fullName: searchTerm,
          isSave: filterStatus,
          title: filterPosition,
          sortBy,
          sortDirection,
        })
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra khi chấp thuận đơn.");
      console.error("Lỗi updateApprove:", error);
    }
  };

  const applyFilters = () => {
    setCurrentPage(0);
    dispatch(
      getApplyJobByCompany({
        currentPage: 0,
        size,
        fullName: searchTerm,
        isSave: filterStatus,
        title: filterPosition,
        sortBy,
        sortDirection,
      })
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const displayData =
    filteredCandidates.length > 0 ? filteredCandidates : applyJobByCompany;

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const handleAnalyzeCVMatch = (candidate, forceNewAnalysis = false) => {
    if (!candidate?.pathCV) {
      Swal.fire({
        icon: "error",
        title: "Không thể phân tích CV",
        text: "Ứng viên chưa tải lên CV hoặc đường dẫn CV không hợp lệ.",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#6b21a8",
      });
      return;
    }
    try {
      analyzeCVMatch(candidate, positions, forceNewAnalysis);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi khi phân tích CV",
        text:
          error.message ||
          "Có lỗi xảy ra trong quá trình phân tích CV. Vui lòng thử lại sau.",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#6b21a8",
      });
    }
  };

  const handleMessage = useCallback(
    (_, __, topic) => {
      if (topic === "/topic/apply-updates") {
        dispatch(getApplyJobByCompany({ currentPage, size }));
      }
    },
    [dispatch, currentPage, size]
  );

  useWebSocket(["/topic/apply-updates"], handleMessage);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCustomDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="p-4 sm:p-6">
      <div className="container-padding">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl text-purple-600 font-semibold">
            Quản lý ứng viên
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center filter-bar w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full max-w-[250px] flex-shrink"
              icon={<Search className="w-4 h-4" />}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border rounded px-4 py-2 w-full sm:w-auto max-w-[200px] flex-shrink"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Đã duyệt</option>
              <option value="0">Chưa duyệt</option>
            </select>
            <select
              className="border rounded px-4 py-2 w-full sm:w-auto max-w-[200px] flex-shrink"
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
            >
              <option value="">Tất cả vị trí</option>
              {positions.map((position) => (
                <option key={position.postId} value={position.title}>
                  {position.title}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={applyFilters}
              className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-500 transition-colors w-full sm:w-auto min-w-[100px] max-w-[120px] flex-shrink"
            >
              <Filter className="w-4 h-4 mr-2" />
              Áp dụng
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <h3 className="font-medium text-gray-700 mb-2">Sắp xếp theo:</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={sortBy === "fullname" ? "default" : "outline"}
              className={sortBy === "fullname" ? "bg-purple-600" : ""}
              onClick={() => handleSort("fullname")}
            >
              Tên ứng viên {renderSortIcon("fullname")}
            </Button>
            <Button
              variant={sortBy === "applydate" ? "default" : "outline"}
              className={sortBy === "applydate" ? "bg-purple-600" : ""}
              onClick={() => handleSort("applydate")}
            >
              Ngày nộp đơn {renderSortIcon("applydate")}
            </Button>
            <Button
              variant={sortBy === "matchingscore" ? "default" : "outline"}
              className={sortBy === "matchingscore" ? "bg-purple-600" : ""}
              onClick={() => handleSort("matchingscore")}
            >
              Mức độ phù hợp {renderSortIcon("matchingscore")}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="table-container max-w-full">
            <table className="w-full responsive-table" role="grid">
              <thead className="bg-purple-600 text-white hidden xl-custom:block">
                <tr role="row">
                  <th scope="col" className="p-4 text-left">
                    Tên ứng viên
                  </th>
                  <th scope="col" className="p-4 text-left">
                    Trạng thái
                  </th>
                  <th scope="col" className="p-4 text-left">
                    Ngày nộp
                  </th>
                  <th scope="col" className="p-4 text-left">
                    Vị trí công việc
                  </th>
                  <th scope="col" className="p-4 text-left">
                    Mức độ phù hợp
                  </th>
                  <th scope="col" className="p-4 text-left">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayData.length > 0 ? (
                  displayData.map((candidate) => (
                    <tr
                      key={`${candidate.postId}-${candidate.userId}`}
                      role="row"
                      className="border-t xl-custom:border-t xl-custom:table-row flex flex-col xl-custom:flex-row p-4 xl-custom:p-0 bg-white xl-custom:bg-transparent mb-4 xl-custom:mb-0"
                    >
                      <td
                        role="gridcell"
                        className="p-4 xl-custom:table-cell flex items-center gap-2"
                        data-label="Tên ứng viên"
                        before="Tên ứng viên:"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={candidate?.avatar}
                            alt={candidate?.fullName}
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="truncate max-w-[calc(100%-3rem)]">
                            {candidate?.fullName}
                          </span>
                        </div>
                      </td>
                      <td
                        role="gridcell"
                        className="p-4 xl-custom:table-cell"
                        data-label="Trạng thái"
                        before="Trạng thái:"
                      >
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            candidate.isSave
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {candidate?.isSave ? "Đã duyệt" : "Chưa duyệt"}
                        </span>
                      </td>
                      <td
                        role="gridcell"
                        className="p-4 xl-custom:table-cell"
                        data-label="Ngày nộp"
                        before="Ngày nộp:"
                      >
                        <span className="block whitespace-nowrap">
                          {new Date(candidate?.applyDate).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }
                          )}
                        </span>
                      </td>
                      <td
                        role="gridcell"
                        className="p-4 xl-custom:table-cell"
                        data-label="Vị trí công việc"
                        before="Vị trí công việc:"
                      >
                        <Link
                          to={`/employer/jobs/${candidate?.postId}`}
                          className="hover:underline text-purple-600 block truncate"
                        >
                          {candidate?.title}
                        </Link>
                      </td>
                      <td
                        role="gridcell"
                        className="p-4 xl-custom:table-cell"
                        data-label="Mức độ phù hợp"
                        before="Mức độ phù hợp:"
                      >
                        {candidate.matchingScore > 0 ||
                        getCachedScore(candidate) !== null ? (
                          <Button
                            variant="outline"
                            className={`text-sm px-3 py-1 rounded-full w-full sm:w-auto ${
                              (candidate.matchingScore ||
                                getCachedScore(candidate)) >= 70
                                ? "bg-green-100 text-green-600"
                                : (candidate.matchingScore ||
                                    getCachedScore(candidate)) >= 50
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            }`}
                            onClick={() =>
                              handleAnalyzeCVMatch(candidate, false)
                            }
                          >
                            {Math.round(
                              candidate.matchingScore ||
                                getCachedScore(candidate)
                            )}
                            %
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-600 w-full sm:w-auto"
                            onClick={() =>
                              handleAnalyzeCVMatch(candidate, true)
                            }
                            disabled={isAnalyzingCandidate(candidate)}
                          >
                            {isAnalyzingCandidate(candidate)
                              ? "Đang phân tích..."
                              : "Phân tích CV"}
                          </Button>
                        )}
                      </td>
                      <td
                        role="gridcell"
                        className="p-4 xl-custom:table-cell action-cell"
                        data-label="Hành động"
                        before="Hành động:"
                      >
                        <div className="flex items-center gap-2 xl-custom:flex xl-custom:items-center xl-custom:gap-2 card-actions">
                          <Button
                            variant="outline"
                            className="text-purple-600 w-full sm:w-auto"
                            onClick={() =>
                              window.open(candidate?.pathCV, "_blank")
                            }
                          >
                            Xem CV
                          </Button>
                          <div className="xl-custom:hidden flex flex-col gap-2 w-full">
                            <Button
                              variant="outline"
                              className="text-blue-600 w-full"
                              onClick={() => {
                                dispatch(
                                  getNotificationViewJob({
                                    userId: candidate?.userId,
                                    postId: candidate?.postId,
                                  })
                                );
                                navigate(
                                  `/employer/account-management/candidate-management/applicants/${candidate?.userId}/${candidate?.postId}`
                                );
                              }}
                            >
                              Xem chi tiết
                            </Button>
                            {!candidate?.isSave && (
                              <Button
                                variant="outline"
                                className="text-green-600 w-full"
                                onClick={() =>
                                  handleUpdate(
                                    candidate?.postId,
                                    candidate?.userId
                                  )
                                }
                              >
                                Chấp thuận đơn
                              </Button>
                            )}
                          </div>
                          <div className="hidden xl-custom:block relative">
                            <div
                              className="h-8 w-8 p-0 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCustomDropdown(candidate?.postId + '-' + candidate?.userId);
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </div>
                            {showCustomDropdown === candidate?.postId + '-' + candidate?.userId && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-md p-2 z-20"
                              >
                                <div
                                  className="hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(
                                      getNotificationViewJob({
                                        userId: candidate?.userId,
                                        postId: candidate?.postId,
                                      })
                                    );
                                    navigate(
                                      `/employer/account-management/candidate-management/applicants/${candidate?.userId}/${candidate?.postId}`
                                    );
                                    setShowCustomDropdown(null);
                                  }}
                                >
                                  Xem chi tiết
                                </div>
                                {!candidate?.isSave && (
                                  <div
                                    className="hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdate(candidate?.postId, candidate?.userId);
                                      setShowCustomDropdown(null);
                                    }}
                                  >
                                    Chấp thuận đơn
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-4 text-gray-500"
                      role="gridcell"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 pagination-bar">
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
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button variant="outline" className="bg-purple-600 text-white">
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

        {showAnalysisModal && currentAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b">
                <button
                  onClick={closeAnalysisModal}
                  className="absolute top-4 right-4 text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-semibold">Phân tích CV</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="bg-purple-50 p-4 sm:p-6 rounded-lg mb-6">
                  <div className="flex flex-col items-center mb-4">
                    <div className="text-3xl font-bold text-center text-purple-700 mb-2">
                      {Math.round(
                        currentAnalysis?.matching_score?.totalScore || 0
                      )}
                      %
                    </div>
                    <div className="text-center text-purple-600 text-lg font-medium">
                      Mức độ phù hợp với công việc
                    </div>
                    <div className="mt-2 text-center text-purple-500 font-medium">
                      {currentAnalysis?.matching_score?.suitabilityLevel ||
                        "Chưa đánh giá"}
                    </div>
                  </div>
                  {currentAnalysis?.matching_score?.recommendations && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Nhận xét</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {currentAnalysis.matching_score.recommendations.map(
                          (rec, index) => (
                            <li key={index} className="text-gray-700">
                              {rec}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                {currentAnalysis?.matching_score?.detailedScores && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                    <h4 className="font-semibold mb-3">Điểm chi tiết</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Kỹ năng:</span>
                          <span className="font-medium">
                            {Math.round(
                              currentAnalysis?.matching_score?.detailedScores
                                ?.skills_match || 0
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.round(
                                currentAnalysis?.matching_score?.detailedScores
                                  ?.skills_match || 0
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Học vấn:</span>
                          <span className="font-medium">
                            {Math.round(
                              currentAnalysis?.matching_score?.detailedScores
                                ?.education_match || 0
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.round(
                                currentAnalysis?.matching_score?.detailedScores
                                  ?.education_match || 0
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Kinh nghiệm:</span>
                          <span className="font-medium">
                            {Math.round(
                              currentAnalysis?.matching_score?.detailedScores
                                ?.experience_match || 0
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-yellow-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.round(
                                currentAnalysis?.matching_score?.detailedScores
                                  ?.experience_match || 0
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Độ tương đồng tổng thể:</span>
                          <span className="font-medium">
                            {Math.round(
                              currentAnalysis?.matching_score?.detailedScores
                                ?.overall_similarity || 0
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.round(
                                currentAnalysis?.matching_score?.detailedScores
                                  ?.overall_similarity || 0
                              )}%`,
                            }}                          ></div>
                        </div>
                      </div>
                      
                      {/* Nice-to-have bonus score */}
                      {currentAnalysis?.matching_score?.detailedScores?.nice_to_have_bonus !== undefined && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Điểm cộng ưu tiên bổ sung:</span>
                            <span className="font-medium text-purple-600">
                              +{Math.round(
                                currentAnalysis?.matching_score?.detailedScores
                                  ?.nice_to_have_bonus || 0
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-purple-400 h-2.5 rounded-full"
                              style={{
                                width: `${Math.min(Math.round(
                                  currentAnalysis?.matching_score?.detailedScores
                                    ?.nice_to_have_bonus || 0
                                ), 20) * 5}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Điểm thưởng cho kỹ năng nice-to-have (tối đa +20 điểm)
                          </p>
                        </div>
                      )}
                    </div>
                    {currentAnalysis?.detailedAnalysis?.weights && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <h5 className="font-medium text-sm mb-2">
                          Trọng số đánh giá:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="text-sm">
                            Kỹ năng:{" "}
                            {currentAnalysis.detailedAnalysis.weights.skills *
                              100}
                            %
                          </div>
                          <div className="text-sm">
                            Học vấn:{" "}
                            {currentAnalysis.detailedAnalysis.weights
                              .education * 100}
                            %
                          </div>
                          <div className="text-sm">
                            Kinh nghiệm:{" "}
                            {currentAnalysis.detailedAnalysis.weights
                              .experience * 100}
                            %
                          </div>
                          <div className="text-sm">
                            Ngữ cảnh:{" "}
                            {currentAnalysis.detailedAnalysis.weights.context *
                              100}
                            %
                          </div>                          <div className="text-sm">
                            Tương đồng tổng thể:{" "}
                            {currentAnalysis.detailedAnalysis.weights
                              .overall_similarity * 100}
                            %
                          </div>
                          {currentAnalysis.detailedAnalysis.weights.nice_to_have_bonus && (
                            <div className="text-sm text-purple-600">
                              Điểm cộng nice-to-have:{" "}
                              {currentAnalysis.detailedAnalysis.weights.nice_to_have_bonus * 100}
                              %
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {currentAnalysis?.matching_score?.extraSkills &&
                  currentAnalysis.matching_score.extraSkills.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                      <h4 className="font-semibold mb-3">Kỹ năng bổ sung</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.matching_score.extraSkills.map(
                          (skill, index) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {skill}
                            </span>
                          )                        )}
                      </div>
                    </div>
                  )}
                
                {/* Nice-to-have skills summary */}
                {currentAnalysis?.matching_score?.niceToHaveSkills &&
                  currentAnalysis.matching_score.niceToHaveSkills.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                      <h4 className="font-semibold mb-3 text-purple-700">
                        Kỹ năng ưu tiên bổ sung (Nice-to-have)
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          - Điểm cộng nếu ứng viên có
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.matching_score.niceToHaveSkills.map(
                          (skill, index) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                      {currentAnalysis?.matching_score?.detailedScores?.nice_to_have_bonus > 0 && (
                        <p className="text-sm text-purple-600 mt-2 font-medium">
                          ✨ Ứng viên đã nhận {Math.round(currentAnalysis.matching_score.detailedScores.nice_to_have_bonus)} điểm cộng cho các kỹ năng này
                        </p>
                      )}
                    </div>
                  )}
                  
                {currentAnalysis?.detailedAnalysis?.skills && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                    <h4 className="font-semibold mb-3">
                      Phân tích kỹ năng chi tiết
                    </h4>
                    <div className="mb-2">
                      <span className="font-medium text-sm">
                        Điểm đánh giá:{" "}
                      </span>
                      <span
                        className={`${
                          currentAnalysis.detailedAnalysis.skills.score > 50
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {currentAnalysis.detailedAnalysis.skills.score}/100
                      </span>
                    </div>                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">
                          Kỹ năng yêu cầu bắt buộc - Phù hợp:
                        </h5>
                        {currentAnalysis.detailedAnalysis.skills.required_skills_matched
                          ?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {currentAnalysis.detailedAnalysis.skills.required_skills_matched.map(
                              (skill, index) => (
                                <span
                                  key={index}
                                  className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          currentAnalysis.detailedAnalysis.skills.matched_skills
                            ?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {currentAnalysis.detailedAnalysis.skills.matched_skills.map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              Không tìm thấy kỹ năng phù hợp
                            </p>
                          )
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-2">
                          Kỹ năng yêu cầu bắt buộc - Còn thiếu:
                        </h5>
                        {currentAnalysis.detailedAnalysis.skills.required_skills_missing
                          ?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {currentAnalysis.detailedAnalysis.skills.required_skills_missing.map(
                              (skill, index) => (
                                <span
                                  key={index}
                                  className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          currentAnalysis.detailedAnalysis.skills.missing_skills
                            ?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {currentAnalysis.detailedAnalysis.skills.missing_skills.map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              Không có kỹ năng nào còn thiếu
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    {/* Nice-to-have skills section */}
                    {(currentAnalysis.detailedAnalysis.skills.nice_to_have_matched?.length > 0 || 
                      currentAnalysis.detailedAnalysis.skills.nice_to_have_missing?.length > 0) && (
                      <div className="border-t pt-4 mt-4">
                        <h5 className="font-medium text-sm mb-3 text-purple-700">
                          Kỹ năng ưu tiên bổ sung (Nice-to-have)
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h6 className="font-medium text-xs mb-2 text-green-700">
                              Có sẵn (Điểm cộng):
                            </h6>
                            {currentAnalysis.detailedAnalysis.skills.nice_to_have_matched
                              ?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {currentAnalysis.detailedAnalysis.skills.nice_to_have_matched.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs">
                                Không có kỹ năng nice-to-have phù hợp
                              </p>
                            )}
                          </div>
                          <div>
                            <h6 className="font-medium text-xs mb-2 text-orange-700">
                              Chưa có (Không ảnh hưởng tiêu cực):
                            </h6>
                            {currentAnalysis.detailedAnalysis.skills.nice_to_have_missing
                              ?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {currentAnalysis.detailedAnalysis.skills.nice_to_have_missing.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs">
                                Không có kỹ năng nice-to-have nào còn thiếu
                              </p>                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skills Source Analysis */}
                    {(currentAnalysis.detailedAnalysis.skills.skills_from_requirements_text?.length > 0 || 
                      currentAnalysis.detailedAnalysis.skills.skills_from_selected_list?.length > 0) && (
                      <div className="border-t pt-4 mt-4">
                        <h5 className="font-medium text-sm mb-3 text-blue-700">
                          Nguồn trích xuất kỹ năng yêu cầu
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h6 className="font-medium text-xs mb-2 text-blue-700">
                              Từ danh sách kỹ năng được chọn:
                            </h6>
                            {currentAnalysis.detailedAnalysis.skills.skills_from_selected_list
                              ?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {currentAnalysis.detailedAnalysis.skills.skills_from_selected_list.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs">
                                Không có kỹ năng từ danh sách được chọn
                              </p>
                            )}
                          </div>
                          <div>
                            <h6 className="font-medium text-xs mb-2 text-green-700">
                              Từ mô tả yêu cầu công việc:
                            </h6>
                            {currentAnalysis.detailedAnalysis.skills.skills_from_requirements_text
                              ?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {currentAnalysis.detailedAnalysis.skills.skills_from_requirements_text.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs">
                                Không có kỹ năng từ mô tả yêu cầu
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-sm mb-1">
                        Lý do đánh giá:
                      </h5>
                      <p className="text-sm text-gray-700">
                        {currentAnalysis.detailedAnalysis.skills.reason}
                      </p>
                    </div>
                  </div>
                )}
                {currentAnalysis?.detailedAnalysis?.education && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                    <h4 className="font-semibold mb-3">
                      Phân tích học vấn chi tiết
                    </h4>
                    <div className="mb-3">
                      <span className="font-medium text-sm">
                        Điểm đánh giá:{" "}
                      </span>
                      <span
                        className={`${
                          currentAnalysis.detailedAnalysis.education.score > 50
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {currentAnalysis.detailedAnalysis.education.score}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-sm mb-1">
                          CV - Trình độ:
                        </h5>
                        <p className="text-sm">
                          {currentAnalysis.detailedAnalysis.education
                            .cv_level || "Không có thông tin"}
                        </p>
                        <h5 className="font-medium text-sm mt-3 mb-1">
                          CV - Chuyên ngành:
                        </h5>
                        {currentAnalysis.detailedAnalysis.education.cv_majors
                          ?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {currentAnalysis.detailedAnalysis.education.cv_majors.map(
                              (major, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                                >
                                  {major}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Không có thông tin
                          </p>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">
                          Yêu cầu JD - Trình độ:
                        </h5>
                        <p className="text-sm">
                          {currentAnalysis.detailedAnalysis.education
                            .job_level || "Không yêu cầu cụ thể"}
                        </p>
                        <h5 className="font-medium text-sm mt-3 mb-1">
                          Yêu cầu JD - Chuyên ngành:
                        </h5>
                        {currentAnalysis.detailedAnalysis.education.job_majors
                          ?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {currentAnalysis.detailedAnalysis.education.job_majors.map(
                              (major, index) => (
                                <span
                                  key={index}
                                  className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded"
                                >
                                  {major}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Không yêu cầu cụ thể
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">
                        Lý do đánh giá:
                      </h5>
                      <p className="text-sm text-gray-700">
                        {currentAnalysis.detailedAnalysis.education.reason}
                      </p>
                    </div>
                  </div>
                )}
                {currentAnalysis?.detailedAnalysis?.experience && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                    <h4 className="font-semibold mb-3">
                      Phân tích kinh nghiệm chi tiết
                    </h4>
                    <div className="mb-3">
                      <span className="font-medium text-sm">
                        Điểm đánh giá:{" "}
                      </span>
                      <span
                        className={`${
                          currentAnalysis.detailedAnalysis.experience.score > 50
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {currentAnalysis.detailedAnalysis.experience.score}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-sm mb-1">
                          CV - Số năm kinh nghiệm:
                        </h5>
                        <p className="text-sm">
                          {currentAnalysis.detailedAnalysis.experience
                            .cv_years || "Không có thông tin"}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">
                          Yêu cầu JD - Số năm kinh nghiệm:
                        </h5>
                        <p className="text-sm">
                          {currentAnalysis.detailedAnalysis.experience
                            .job_years || "Không yêu cầu cụ thể"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">
                        Lý do đánh giá:
                      </h5>
                      <p className="text-sm text-gray-700">
                        {currentAnalysis.detailedAnalysis.experience.reason}
                      </p>
                    </div>
                  </div>
                )}
                {currentAnalysis?.matching_score?.cvImprovementSuggestions &&
                  currentAnalysis.matching_score.cvImprovementSuggestions
                    .length > 0 && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
                      <h4 className="font-semibold mb-3 text-purple-700">
                        Gợi ý cải thiện CV
                      </h4>
                      <ul className="space-y-2">
                        {currentAnalysis.matching_score.cvImprovementSuggestions.map(
                          (suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <svg
                                  className="w-4 h-4 text-purple-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                              <p className="ml-2 text-gray-700">{suggestion}</p>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
              <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(currentAnalysis?.candidate?.pathCV, "_blank")
                    }
                    className="text-purple-600"
                  >
                    Xem CV gốc
                  </Button>
                  <Button
                    variant="default"
                    onClick={closeAnalysisModal}
                    className="bg-purple-700 text-white hover:bg-purple-500"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateManagement;
