import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "swiper/swiper-bundle.css";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Calendar,
  MapPin,
  Briefcase,
  Star,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import JobCard_AllJob from "../../components/common/JobCard_AllJob/JobCard_AllJob";
import IndustryBadge from "../../components/common/IndustryBadge/IndustryBadge";
import {
  StarRounded,
  ThumbUpAlt,
  ThumbDownAlt,
  Reply,
  Close,
  Delete,
  Edit,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination/Pagination";
import "react-toastify/dist/ReactToastify.css";
import anonymousIcon from "../../assets/icons/anonymous.png";
import Swal from "sweetalert2";
import {
  createReview,
  deleteReview,
  getReviewByCompany,
  createReplyToReview,
  getReviewReplies,
  reactToReview,
  getReviewReactions,
  deleteReviewReply,
  updateReview,
  updateReviewReply,
} from "../../redux/Review/review.thunk";
import {
  followCompany,
  getSeekerByUser,
} from "../../redux/Seeker/seeker.thunk";
import {
  getAllJobAction,
  getJobsByCompany,
} from "../../redux/JobPost/jobPost.thunk";
import {
  checkSaved,
  getCompanyProfile,
} from "../../redux/Company/company.thunk";
import {
  fetchSocialLinks,
  fetchSocialLinksByUserId,
} from "../../redux/SocialLink/socialLink.thunk";
import { resetJobPost } from "../../redux/JobPost/jobPostSlice";
import { API_URL } from '../../configs/constants';
import { updateReactionLocally } from "../../redux/Review/reviewSlice";

const RatingStars = React.memo(({ value, onChange, readOnly = false, size = "default" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-6 h-6",
  };


  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <StarRounded
            className={`${sizeClasses[size]} ${
              star <= value ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
});

// Add a new EditReplyForm component before ReplyItem
const EditReplyForm = ({
  reply,
  editReplyData,
  setEditReplyData,
  handleCancelReplyEdit,
  handleSaveReplyEdit,
}) => {
  // Check if this is a reply to another comment
  const isReplyToComment =
    reply.content.startsWith("@") && reply.content.includes(":");

  return (
    <div className="mt-2 p-3 border border-blue-200 rounded-md bg-blue-50">
      {isReplyToComment && (
        <div className="mb-2 text-sm text-blue-600 bg-blue-100 p-2 rounded">
          <span className="font-medium">Lưu ý:</span> Bạn đang chỉnh sửa phần
          nội dung phản hồi. Phần tag người dùng sẽ được giữ nguyên.
        </div>
      )}

      <textarea
        value={editReplyData.content}
        onChange={(e) =>
          setEditReplyData({ ...editReplyData, content: e.target.value })
        }
        className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        rows={2}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`edit-reply-anonymous-${reply.replyId}`}
            checked={editReplyData.anonymous}
            onChange={(e) =>
              setEditReplyData({
                ...editReplyData,
                anonymous: e.target.checked,
              })
            }
            className="mr-2"
          />
          <label
            htmlFor={`edit-reply-anonymous-${reply.replyId}`}
            className="text-sm"
          >
            Ẩn danh
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCancelReplyEdit}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveReplyEdit}
            className="px-3 py-1 bg-purple-500 text-white rounded-md text-sm hover:bg-purple-600"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced ReplyItem component with better visual hierarchy
const ReplyItem = ({
  reply,
  reviewId,
  onEdit,
  onDelete,
  onReply,
  currentUser,
  checkIfSaved,
  editingReplyId,
  editReplyData,
  handleCancelReplyEdit,
  handleSaveReplyEdit,
  setEditReplyData,
  level = 0,
  maxLevel = 2,
}) => {
  const [showNestedReplyForm, setShowNestedReplyForm] = useState(false);
  const [nestedReplyText, setNestedReplyText] = useState("");
  const [isNestedReplyAnonymous, setIsNestedReplyAnonymous] = useState(false);
  const [showChildReplies, setShowChildReplies] = useState(false);

  // Visual styling based on nesting level
  const getIndentStyle = (level) => {
    const baseIndent = level * 16;
    return {
      marginLeft: `${Math.min(baseIndent, 32)}px`,
      borderLeft: level > 0 ? "2px solid #e5e7eb" : "none",
      paddingLeft: level > 0 ? "12px" : "0",
    };
  };

  const getBorderColor = (level) => {
    const colors = ["border-purple-200", "border-blue-200", "border-green-200"];
    return colors[level % colors.length] || "border-gray-200";
  };

  const getBackgroundColor = (level) => {
    const backgrounds = ["bg-white", "bg-purple-50", "bg-blue-50"];
    return backgrounds[level % backgrounds.length] || "bg-gray-50";
  };  const handleNestedReplyClick = () => {
    if (level >= maxLevel || checkIfSaved === false) return;
    if (!currentUser) {
      toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    if (checkIfSaved === false) {
      toast.warning("Bạn cần apply vào công ty để có thể phản hồi");
      return;
    }

    setShowNestedReplyForm(!showNestedReplyForm);
  };

  const handleNestedReplySubmit = () => {
    if (!nestedReplyText.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    const parentDisplayName = reply.anonymous
      ? `Người dùng ẩn danh ${reply.anonymousId || ""}`
      : maskUsername(reply.userName);

    const replyContent = `@${parentDisplayName}: ${nestedReplyText}`;

    const parentUserInfo = {
      parentUserName: reply.userName,
      parentUserId: reply.userId,
      parentIsAnonymous: reply.anonymous,
      parentAnonymousId: reply.anonymousId,
    };

    onReply(
      reviewId,
      reply.replyId,
      replyContent,
      isNestedReplyAnonymous,
      parentUserInfo
    );
    setNestedReplyText("");
    setIsNestedReplyAnonymous(false);
    setShowNestedReplyForm(false);
  };

  const handleCloseNestedReply = () => {
    setShowNestedReplyForm(false);
    setNestedReplyText("");
    setIsNestedReplyAnonymous(false);
  };
  // Function to mask username
  const maskUsername = (username) => {
    if (!username) return "Người dùng";
    if (username.length <= 2) return username;
    return `${username[0]}${"*".repeat(username.length - 2)}${username[username.length - 1]}`;
  };
  return (
    <div style={getIndentStyle(level)} className="reply-container">
      <div
        className={`p-3 border ${getBorderColor(level)} ${getBackgroundColor(level)} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-3`}
      >
        <div className="flex items-start">
          <img
            src={reply.anonymous ? anonymousIcon : reply.userAvatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            {/* Reply Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm text-gray-900 truncate">
                  {reply.anonymous
                    ? `Người dùng ẩn danh ${reply.anonymousId || ""}`
                    : maskUsername(reply.userName)}
                </span>
                
                {level > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                    Cấp {level + 1}
                  </span>
                )}

                {/* {reply.parentReplyId && (
                  <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-md flex-shrink-0">
                    <span className="text-gray-500 mr-1">trả lời</span>
                    <span className="font-medium text-purple-600">
                      {reply.parentIsAnonymous
                        ? `Người dùng ẩn danh ${reply.parentAnonymousId || ""}`
                        : reply.parentUserName
                        ? maskUsername(reply.parentUserName)
                        : "Người dùng"}
                    </span>
                  </span>
                )} */}
              </div>

              {/* Action buttons */}
              {currentUser && currentUser.userId === reply.userId && (
                <div className="flex gap-1 flex-shrink-0">
                  {/* <button
                    onClick={() => onEdit(reply)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100 transition-colors"
                    title="Chỉnh sửa phản hồi"
                  >
                    <Edit fontSize="small" />
                  </button> */}
                  <button
                    onClick={() => onDelete(reply.replyId, reviewId)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                    title="Xóa phản hồi"
                  >
                    <Delete fontSize="small" />
                  </button>
                </div>
              )}
            </div>

            {/* Time stamp */}
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <span>🕒</span>
              <span>
                {new Date(reply.createDate).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Reply Content */}
            {editingReplyId !== reply.replyId && (
              <div className="mb-3">
                {reply.content.startsWith("@") ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                      <Reply fontSize="small" className="mr-1" />
                      {reply.content.split(":")[0]}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-purple-200">
                      {reply.content.split(":").slice(1).join(":").trim()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-2 rounded">
                    {reply.content}
                  </p>
                )}
              </div>
            )}

            {/* Edit Reply Form */}
            {currentUser &&
              currentUser.userId === reply.userId &&
              editingReplyId === reply.replyId && (
                <EditReplyForm
                  reply={reply}
                  editReplyData={editReplyData}
                  setEditReplyData={setEditReplyData}
                  handleCancelReplyEdit={handleCancelReplyEdit}
                  handleSaveReplyEdit={handleSaveReplyEdit}
                />
              )}            {/* Reply Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNestedReplyClick}
                  className={`text-sm flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    level >= maxLevel || checkIfSaved === false
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-purple-700 hover:bg-purple-100"
                  }`}
                  disabled={level >= maxLevel || checkIfSaved === false}
                  title={
                    level >= maxLevel
                      ? "Đã đạt giới hạn độ sâu phản hồi"
                      : checkIfSaved === false
                      ? "Bạn cần apply vào công ty để phản hồi"
                      : "Phản hồi"
                  }
                >
                  <Reply fontSize="small" />
                  <span>Phản hồi</span>
                  {level >= maxLevel && <span className="text-xs">(Giới hạn)</span>}
                </button>                {/* Show/Hide Child Replies Button */}
                {reply.childReplies && reply.childReplies.length > 0 && (
                  <button
                    onClick={() => setShowChildReplies(!showChildReplies)}
                    className="group text-sm flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 transition-all duration-300 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all duration-200">
                      <Reply fontSize="small" className="text-purple-600" />
                    </div>
                    <span className="font-semibold">
                      {reply.childReplies.length} phản hồi
                    </span>
                    <span className="text-xs ml-1 transition-transform duration-200 group-hover:scale-110">
                      {showChildReplies ? "▲ Ẩn" : "▼ Xem"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Nested Reply Form */}
            {showNestedReplyForm && (
              <div className="mt-3 p-3 border border-purple-200 rounded-md bg-purple-50 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-purple-700 flex items-center gap-1">
                    <Reply fontSize="small" />
                    Phản hồi đến{" "}
                    <span className="bg-white px-2 py-1 rounded-md text-purple-600 text-xs">
                      {reply.anonymous
                        ? "Người dùng ẩn danh"
                        : maskUsername(reply.userName)}
                    </span>
                  </h4>
                  <button
                    onClick={handleCloseNestedReply}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-200 transition-colors"
                  >
                    <Close fontSize="small" />
                  </button>
                </div>

                <textarea
                  value={nestedReplyText}
                  onChange={(e) => setNestedReplyText(e.target.value)}
                  placeholder="Nhập phản hồi của bạn..."
                  className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                  rows={2}
                />

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`anonymous-nested-reply-${reply.replyId}`}
                      checked={isNestedReplyAnonymous}
                      onChange={(e) =>
                        setIsNestedReplyAnonymous(e.target.checked)
                      }
                      className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label
                      htmlFor={`anonymous-nested-reply-${reply.replyId}`}
                      className="text-sm text-purple-600"
                    >
                      Ẩn danh
                    </label>
                  </div>

                  <button
                    onClick={handleNestedReplySubmit}
                    className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>      {/* Render child replies with better visual hierarchy - Only show if showChildReplies is true */}
      {showChildReplies &&
        reply.childReplies &&
        Array.isArray(reply.childReplies) &&
        reply.childReplies.length > 0 && (
          <div className="mt-3 space-y-2 animate-in slide-in-from-top duration-300">
            {/* Header for child replies section */}
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded"></div>
                <span className="text-xs font-medium text-gray-600">
                  {reply.childReplies.length} phản hồi
                </span>
                <div className="w-4 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded"></div>
              </div>
              <button
                onClick={() => setShowChildReplies(false)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <span>Ẩn phản hồi</span>
                <span>▲</span>
              </button>
            </div>
            
            {reply.childReplies.map((childReply) => (
              <ReplyItem
                key={childReply.replyId}
                reply={childReply}
                reviewId={reviewId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                currentUser={currentUser}
                checkIfSaved={checkIfSaved}
                editingReplyId={editingReplyId}
                editReplyData={editReplyData}
                handleCancelReplyEdit={handleCancelReplyEdit}
                handleSaveReplyEdit={handleSaveReplyEdit}
                setEditReplyData={setEditReplyData}
                level={level + 1}
                maxLevel={maxLevel}
              />
            ))}
          </div>
        )}
    </div>
  );
};

export default function CompanyProfile() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    jobPost = [],
    error,
    totalPages = 0,
    totalElements = 0,
  } = useSelector((store) => store.jobPost);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const { socialLinks } = useSelector((store) => store.socialLink);
  const handleIndustryClick = (industryId) => {
    if (industryId) {
      navigate("/find-companies", {
        state: { selectedIndustryId: industryId },
      });
    } else {
      console.warn(`Không tìm thấy industryId cho ngành: ${industryId}`);
      navigate("/find-companies");
    }
  };

  // States for edit functionality
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({
    star: 0,
    message: "",
    isAnonymous: false,
  });
  const [editReplyData, setEditReplyData] = useState({
    content: "",
    anonymous: false,
  });

  // Add a function to highlight potentially problematic words
  const highlightProblematicContent = (content) => {
    // List of common problematic words in Vietnamese and English
    const problematicWords = [
      // Vietnamese
      "địt",
      "đụ",
      "đéo",
      "cặc",
      "lồn",
      "đĩ",
      "điếm",
      "chó",
      "ngu",
      "ngu ngốc",
      "ngu si",
      "đần",
      "đần độn",
      "khốn nạn",
      "đồ khốn",
      "đồ ngu",
      "đồ chó",
      "đồ điếm",
      "đồ đĩ",
      "đồ khốn nạn",
      "đồ vô dụng",
      "đồ vô tích sự",
      "đồ bỏ đi",
      "đồ rác rưởi",
      "đồ hèn",
      "đồ hèn nhát",
      "đồ hèn mạt",
      "đồ hèn hạ",
      "đồ hèn kém",
      "đồ hèn mọn",
      "đồ hèn nhược",
      "đồ hèn yếu",
      // English
      "fuck",
      "shit",
      "asshole",
      "bitch",
      "cunt",
      "dick",
      "pussy",
      "bastard",
      "motherfucker",
      "retard",
      "idiot",
      "moron",
      "stupid",
      "dumb",
      "fool",
      "loser",
      "jerk",
      "scum",
      "trash",
      "garbage",
      "worthless",
      "useless",
    ];

    if (!content) return "";

    // Create a regex pattern to match any of the problematic words
    const pattern = new RegExp(`\\b(${problematicWords.join("|")})\\b`, "gi");

    // Replace problematic words with highlighted versions
    return content.replace(
      pattern,
      '<span class="bg-red-200 text-red-800 px-1 rounded">$1</span>'
    );
  };
  // Update the showModerationError function to highlight problematic content
  const showModerationError = (error, content) => {
    console.log("showModerationError called with:", error, content);

    // Extract error message - handle different error formats
    const errorMessage =
      error.message || (error.payload ? error.payload : "Lỗi không xác định");
    console.log("Extracted error message:", errorMessage);

    // Extract score from error message if available
    const scoreMatch =
      errorMessage && errorMessage.match(/score: (\d+(?:\.\d+)?)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
    console.log("Extracted score:", score);

    // Format score for display - if score is already a percentage (>=1), display as is, otherwise multiply by 100
    const scoreDisplay =
      score !== null ? (score >= 1 ? score : score * 100).toFixed(1) : null;

    // Check if content is already highlighted (contains HTML tags) or needs highlighting
    const highlightedContent = content && content.includes('<span class="bg-red-200')
      ? content  // Content is already highlighted
      : content ? highlightProblematicContent(content) : "";  // Content needs highlighting

    // Use SweetAlert2 for a more prominent and helpful message
    Swal.fire({
      title: "Nội dung không phù hợp",
      html: `
        <div class="text-left">
          <p>Hệ thống AI của chúng tôi đã phát hiện nội dung không phù hợp trong bình luận của bạn.</p>
          ${
            scoreDisplay !== null
              ? `<p class="mt-2"></p>`
              : ""
          }
          
          ${
            highlightedContent
              ? `
            <div class="mt-3 p-3 bg-gray-100 rounded-md">
              <p class="font-semibold mb-1">Nội dung của bạn:</p>
              <p class="text-gray-700">${highlightedContent}</p>
            </div>
          `
              : ""
          }
          
          <p class="mt-3 font-semibold">Hướng dẫn:</p>
          <ul class="list-disc pl-5 mt-1">
            <li>Tránh sử dụng ngôn ngữ thô tục, xúc phạm</li>
            <li>Không sử dụng từ ngữ phân biệt đối xử</li>
            <li>Không đề cập đến nội dung nhạy cảm</li>
            <li>Giữ ngôn ngữ lịch sự và chuyên nghiệp</li>
          </ul>
          <p class="mt-3">Vui lòng chỉnh sửa nội dung và thử lại.</p>
        </div>
      `,
      icon: "warning",
      confirmButtonText: "Đã hiểu",
      confirmButtonColor: "#8B5CF6",
    });
  };

  const { reviews, replies, reactions } = useSelector((store) => store.review);

  const { checkIfSaved, companyProfile } = useSelector(
    (store) => store.company
  );

  const { seeker } = useSelector((store) => store.seeker);
  const { user } = useSelector((store) => store.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [jobsPerPage] = useState(5);
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [feedback, setFeedback] = useState({
    star: 0,
    message: "",
    isAnonymous: false,
  });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleRatingChange = (newRating) => {
    setFeedback((prevFeedback) => ({ ...prevFeedback, star: newRating }));
  };

  const handleReviewChange = (event) => {
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      message: event.target.value,
    }));
  };

  useEffect(() => {
    if (reviews && user) {
      const userReview = reviews.find(
        (review) => review.seeker?.userAccount?.userId === user.userId
      );
      if (userReview) {
        setHasReviewed(true);
        setExistingReview(userReview);
        setFeedback({
          star: userReview.star,
          message: userReview.message,
          isAnonymous: userReview.anonymous,
        });
      } else {
        setHasReviewed(false);
        setExistingReview(null);
      }
    }
  }, [reviews, user]);

  // Update handleSubmitReview function to dismiss loading toast in error cases
  const handleSubmitReview = async () => {
    if (!feedback.star) {
      toast.warning("Đánh giá sao không được để trống!");
      return;
    }
    if (feedback.message.trim() === "") {
      toast.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }

    // Khai báo loadingToastId ở đây
    const loadingToastId = toast.loading("Đang kiểm tra nội dung đánh giá...");

    try {      // Kiểm tra nội dung với AI
      const response = await fetch('http://localhost:5000/check-comment', {
        method: 'POST',

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: feedback.message }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const result = await response.json();

      if (result.is_toxic) {
        // Dismiss loading toast trước khi hiển thị lỗi
        toast.dismiss(loadingToastId);

        // Hiển thị thông báo lỗi UI
        toast.error("Nội dung đánh giá không phù hợp. Vui lòng kiểm tra lại.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,        });

        // Highlight nội dung có vấn đề
        showModerationError({ message: result.message }, feedback.message);
        
        return;
      }

      // Use a consistent anonymousId based on userId to ensure stability
      const anonymousId = user
        ? parseInt(user.userId.replace(/-/g, "").substring(0, 4), 16) % 1000
        : Math.floor(Math.random() * 1000);

      if (hasReviewed && existingReview) {
        const confirmMessage = `Bạn đã đánh giá công ty này trước đó:
- Đánh giá cũ: ${existingReview.star}⭐ - "${existingReview.message}"
- Đánh giá mới: ${feedback.star}⭐ - "${feedback.message}"
${feedback.isAnonymous ? "\n(Đánh giá này sẽ được đăng ẩn danh)" : ""}

Bạn có chắc chắn muốn thay đổi đánh giá không?`;

        const result = await Swal.fire({
          title: "Xác nhận thay đổi đánh giá",
          text: confirmMessage,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy",
        });

        if (!result.isConfirmed) {
          toast.dismiss(loadingToastId);
          return;
        }
        const reviewId = existingReview.reviewId;
        await dispatch(deleteReview(reviewId));
      }

      const result2 = await dispatch(
        createReview({
          reviewData: {
            star: feedback.star,
            message: feedback.message,
            isAnonymous: feedback.isAnonymous,
            anonymousId: anonymousId,
          },
          companyId,
        })
      );

      toast.dismiss(loadingToastId);
      await dispatch(getReviewByCompany(companyId));
      toast.success("Gửi đánh giá thành công");
      setFeedback({ star: 0, message: "", isAnonymous: false });    } catch (error) {
      // Always dismiss the loading toast in case of error
      toast.dismiss(loadingToastId);

      // Check for different error formats
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message ||
            (error.payload
              ? error.payload
              : "Có lỗi xảy ra trong quá trình xử lý");

      // Check if this is an AI service error (network or service unavailable)
      if (errorMessage.includes("AI service error") || errorMessage.includes("fetch") || errorMessage.includes("NetworkError")) {
        toast.warning("Dịch vụ kiểm tra nội dung tạm thời không khả dụng. Đánh giá của bạn sẽ được gửi mà không qua kiểm tra.");
        
        // Continue with submission without AI check
        try {
          const anonymousId = user
            ? parseInt(user.userId.replace(/-/g, "").substring(0, 4), 16) % 1000
            : Math.floor(Math.random() * 1000);

          if (hasReviewed && existingReview) {
            const reviewId = existingReview.reviewId;
            await dispatch(deleteReview(reviewId));
          }

          const result2 = await dispatch(
            createReview({
              reviewData: {
                star: feedback.star,
                message: feedback.message,
                isAnonymous: feedback.isAnonymous,
                anonymousId: anonymousId,
              },
              companyId,
            })
          );

          await dispatch(getReviewByCompany(companyId));
          toast.success("Gửi đánh giá thành công");
          setFeedback({ star: 0, message: "", isAnonymous: false });
          return;
        } catch (submitError) {
          toast.error("Có lỗi xảy ra khi gửi đánh giá");
          return;
        }
      }

      // Check if the error is from content moderation
      if (errorMessage && errorMessage.includes("không phù hợp")) {
        // Tạo một đối tượng lỗi đúng định dạng để truyền vào showModerationError
        const moderationError = {
          message: errorMessage,
        };

        // Hiển thị lỗi kiểm duyệt nội dung với nội dung thực tế
        showModerationError(moderationError, feedback.message);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  useEffect(() => {
    const fetchSeekerAndCheckFollow = async () => {
      if (loading) {
        await dispatch(getSeekerByUser());
        setLoading(false);
      }
      if (seeker?.followedCompanies) {
        const isCurrentlyFollowing = seeker.followedCompanies.some(
          (company) => company.companyId === companyId
        );
        setIsFollowing(isCurrentlyFollowing);
      }
    };
    fetchSeekerAndCheckFollow();
  }, [dispatch, companyId, seeker, loading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [companyId]);

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        await dispatch(
          getJobsByCompany({
            companyId,
            currentPage: 0,
            size: 100,
            getAllJobs: true,
          })
        );
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchCompanyJobs();
  }, [dispatch, companyId]);

  useEffect(() => {
    if (jobPost && jobPost.length > 0) {
      setAllJobs(jobPost);
      const startIndex = currentPage * jobsPerPage;
      const endIndex = startIndex + jobsPerPage;
      setDisplayedJobs(jobPost.slice(startIndex, endIndex));
    }
  }, [jobPost, currentPage, jobsPerPage]);

  useEffect(() => {
  const userId = companyId;
  dispatch(resetJobPost());
  dispatch(getCompanyProfile(companyId));
  
  // Load reviews trước, sau đó load reactions
  dispatch(getReviewByCompany(companyId)).then((result) => {
    if (result.payload && result.payload.length > 0 && user) {
      const reviewIds = result.payload.map((review) => review.reviewId);
      dispatch(getReviewReactions(reviewIds));
    }
  });
  
  dispatch(checkSaved(companyId));
  dispatch(fetchSocialLinksByUserId(userId));
}, [dispatch, companyId, user]);

  const handleFollowClick = async () => {
    try {
      await dispatch(followCompany(companyId));
      setIsFollowing((prevState) => !prevState);
      const mess = isFollowing
        ? "Bỏ theo dõi thành công!"
        : "Theo dõi thành công!";
      toast.success(mess);
    } catch (error) {
      console.error("Có lỗi xảy ra khi theo dõi công ty:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const totalStars = reviews.reduce((total, review) => total + review.star, 0);
  const averageStars = reviews.length > 0 ? totalStars / reviews.length : 0;

  const validReviews = useMemo(
  () =>
    Array.isArray(reviews)
      ? reviews.filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            item.hasOwnProperty("reviewId")
        )
        // Map over filtered reviews to attach replies from the 'replies' slice
        .map(review => ({
          ...review,
          replies: replies[review.reviewId] || [] // Attach replies for this reviewId
        }))
      : [],
  [reviews, replies] // Depend on 'replies' as well
);

  const [showRepliesMap, setShowRepliesMap] = useState({}); // State to manage showing/hiding replies for each review

  useEffect(() => {
    // Khi validReviews thay đổi, đảm bảo showRepliesMap vẫn có các mục nhập cho các đánh giá hiện có
    // và loại bỏ các mục nhập cho các đánh giá không còn tồn tại.
    setShowRepliesMap(currentMap => {
      const newMap = {};
      validReviews.forEach(review => {
        if (currentMap[review.reviewId]) {
          newMap[review.reviewId] = currentMap[review.reviewId];
        }
      });
      return newMap;
    });
  }, [validReviews]); // Chạy lại khi validReviews thay đổi

  // Cập nhật hàm loadRepliesForReview
  const loadRepliesForReview = async (reviewId) => {
    try {
      // Kiểm tra xem đã có replies trong store chưa và có độ dài > 0
      if (replies && replies[reviewId] && replies[reviewId].length > 0) {
        return; // Không cần gọi API nếu đã có dữ liệu trong store
      }

      // Nếu chưa có, gọi API để lấy replies
      await dispatch(getReviewReplies(reviewId)).unwrap();
    } catch (error) {
      console.error("Error loading replies:", error);
    }
  };

  // Cập nhật useEffect để tránh gọi API liên tục
  useEffect(() => {
    if (validReviews.length > 0) {
      // Chỉ load replies cho các review chưa được load
      validReviews.forEach((review) => {
        loadRepliesForReview(review.reviewId);
      });
    }
  }, [validReviews, replies]); // Depend on replies as well

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa đánh giá này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        // Store the reply data for this review before deleting
        const reviewToDelete = reviews.find(r => r.reviewId === reviewId);
        const replyData = reviewToDelete?.replies || [];

        // Remove the reply data from the Redux store's 'replies' object for this reviewId
        if (replies && replies[reviewId]) {
          // Create a new replies object without the deleted review's replies
          const updatedReplies = { ...replies };
          delete updatedReplies[reviewId];

          // No need to update this since we're deleting the review anyway which will remove its replies
        }

        await dispatch(deleteReview(reviewId));
        toast.success("Xóa đánh giá thành công");

        // Update reviews list without fetching from the server
        const updatedReviews = reviews.filter(
          (review) => review.reviewId !== reviewId
        );
        dispatch({
          type: "review/getReviewByCompany/fulfilled",
          payload: updatedReviews,
        });

        setHasReviewed(false);
        setExistingReview(null);
        setFeedback({ star: 0, message: "", isAnonymous: false });
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error("Có lỗi xảy ra khi xóa đánh giá");
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const startIndex = newPage * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    setDisplayedJobs(allJobs.slice(startIndex, endIndex));
    window.scrollTo({
      top: document.getElementById("job-listings").offsetTop - 100,
      behavior: "smooth",
    });
  };

  const calculatedTotalPages = Math.ceil(allJobs.length / jobsPerPage);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(false);

  // Function to handle replies
  const handleReplyClick = (reviewId) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    if (checkIfSaved === false) {
      toast.warning("Bạn cần apply vào công ty để có thể phản hồi đánh giá");
      return;
    }

    // Toggle reply form - if it's already open for this review, close it
    if (replyTo === reviewId) {
      setReplyTo(null);
    } else {
      setReplyTo(reviewId);
      setReplyText("");
      setIsReplyAnonymous(false);
    }
  };
  const handleCloseReply = () => {
    setReplyTo(null);
  };

  // Functions to manage showing/hiding replies for each review
  const toggleShowReplies = (reviewId) => {
    setShowRepliesMap(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const hideReplies = (reviewId) => {
    setShowRepliesMap(prev => ({
      ...prev,
      [reviewId]: false
    }));
  };

  // Update handleReplySubmit function to dismiss loading toast in error cases
  const handleReplySubmit = async (
    reviewId,
    parentReplyId = null,
    replyContent = null,
    isAnonymous = null,
    parentUserInfo = null
  ) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    if (checkIfSaved === false) {
      toast.warning("Bạn cần apply vào công ty để có thể phản hồi đánh giá");
      return;
    }

    // Use provided content or from the state
    let content = replyContent || replyText;

    // If it's a top-level reply (to review) and there's no parentReplyId, and the content doesn't already have a tag
    if (!parentReplyId && !content.startsWith("@") && !replyContent) {
      // Get the review from the reviews array
      const targetReview = reviews.find(
        (review) => review.reviewId === reviewId
      );
      if (targetReview) {
        // Create display name for review author
        const reviewAuthorName = targetReview.anonymous
          ? `Người dùng ẩn danh ${targetReview.anonymousId || ""}`
          : targetReview.seeker?.userAccount?.userName
          ? `${targetReview.seeker.userAccount.userName[0]}${"*".repeat(
              targetReview.seeker.userAccount.userName.length - 2
            )}${
              targetReview.seeker.userAccount.userName[
                targetReview.seeker.userAccount.userName.length - 1
              ]
            }`
          : "Người dùng";

        // Add tag to the beginning
        content = `@${reviewAuthorName}: ${content}`;
      }
    }

    if (!content || !content.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    // Khai báo loadingToastId ở đây
    const loadingToastId = toast.loading("Đang kiểm tra nội dung phản hồi...");

    // Trích xuất nội dung bình luận thực tế (không bao gồm tag người dùng)
    let contentToCheck = content;
    if (content.startsWith("@") && content.includes(":")) {
      contentToCheck = content.split(":").slice(1).join(":").trim();
    }

    // Nếu nội dung sau khi trích xuất rỗng, có thể chỉ chứa tag, không cần kiểm tra toxic
    if (!contentToCheck) {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        toast.warning("Nội dung phản hồi không được để trống sau tag người dùng.");
        return;
    }    // Kiểm tra nội dung với AI (sử dụng contentToCheck)
    try {
      const response = await fetch("http://localhost:5000/check-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: contentToCheck }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const result = await response.json();

      if (result.is_toxic) {
        // Dismiss loading toast trước khi hiển thị lỗi
        toast.dismiss(loadingToastId);

        // Hiển thị thông báo lỗi UI
        toast.error(
          "Nội dung bình luận không phù hợp. Vui lòng kiểm tra lại.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // Highlight nội dung có vấn đề
        const highlightedContent = highlightProblematicContent(contentToCheck);
        showModerationError(result.message, highlightedContent);


        return;
      }

      // Use provided anonymous value or from the state
      const anonymous = isAnonymous !== null ? isAnonymous : isReplyAnonymous;

      // Use a consistent anonymousId based on userId or create a stable one
      const anonymousId = user
        ? parseInt(user.userId.replace(/-/g, "").substring(0, 4), 16) % 1000
        : Math.floor(Math.random() * 1000);

      // Prepare the payload for the API (sử dụng content gốc)
      const replyPayload = {
        reviewId,
        content: content,
        anonymous,
        anonymousId,
      };

      // Add parentReplyId if provided (for nested replies)
      if (parentReplyId) {
        replyPayload.parentReplyId = parentReplyId;
      }

      // Add parent user information if available
      if (parentUserInfo) {
        replyPayload.parentUserName = parentUserInfo.parentUserName;
        replyPayload.parentUserId = parentUserInfo.parentUserId;

        // Add anonymous information if parent is anonymous
        if (parentUserInfo.parentIsAnonymous) {
          replyPayload.parentIsAnonymous = true;
          replyPayload.parentAnonymousId =
            parentUserInfo.parentAnonymousId ||
            Math.floor(Math.random() * 1000);
        }
      }

      // Use the Redux action instead of direct API call
      await dispatch(
        createReplyToReview(replyPayload)
      ).unwrap();

      // Dismiss the loading toast
      toast.dismiss(loadingToastId);

      // Remove manual state updates, rely on thunk reducers
      await dispatch(getReviewReplies(reviewId));

      // Reset reply form
      setReplyTo(null);
      setReplyText("");
      setIsReplyAnonymous(false);

      // Show success message
      toast.success("Phản hồi đã được gửi thành công");
    } catch (error) {
      // Always dismiss the loading toast in case of error
      toast.dismiss(loadingToastId);

      // Check for different error formats
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message ||
            (error.payload
              ? error.payload
              : "Có lỗi xảy ra trong quá trình xử lý");

      // Check if the error is from content moderation
      if (errorMessage && errorMessage.includes("không phù hợp")) {
        // Tạo một đối tượng lỗi đúng định dạng để truyền vào showModerationError
        const moderationError = {
          message: errorMessage,
        };

        // Hiển thị lỗi kiểm duyệt nội dung với nội dung thực tế
        showModerationError(moderationError, content);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Helper function to recursively add a reply to its parent in the hierarchy
  const addReplyToParent = (repliesArray, parentReplyId, newReply) => {
    for (let i = 0; i < repliesArray.length; i++) {
      if (repliesArray[i].replyId === parentReplyId) {
        // Found the parent, add the new reply to its children
        if (!repliesArray[i].childReplies) {
          repliesArray[i].childReplies = [];
        }

        // Create a mutable copy of the newReply object
        const mutableReply = { ...newReply };

        // Set the correct level based on parent's level
        mutableReply.level = (repliesArray[i].level || 0) + 1;

        // Add to child replies
        repliesArray[i].childReplies.push(mutableReply);
        return true;
      }

      // Check in child replies recursively
      if (
        repliesArray[i].childReplies &&
        repliesArray[i].childReplies.length > 0
      ) {
        const found = addReplyToParent(
          repliesArray[i].childReplies,
          parentReplyId,
          newReply
        );
        if (found) return true;
      }
    }

    return false;
  };

  // Function to handle likes/dislikes
  const handleReaction = async (reviewId, type) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    if (checkIfSaved === false) {
      toast.warning(
        "Bạn cần apply vào công ty để có thể thích/không thích đánh giá"
      );
      return;
    }

    try {
      // Get the current reaction from Redux store
      const currentReaction = reactions[reviewId]?.userReaction;

      // Determine if we're toggling the reaction off or changing reaction type
      let newReactionType = null;
      if (currentReaction === type) {
        // User clicked the same reaction - remove it
        newReactionType = null;
      } else {
        // User clicked a different reaction or is adding a new one
        newReactionType = type;
      }

      // Cập nhật UI ngay lập tức
      dispatch(updateReactionLocally({
        reviewId,
        reactionType: newReactionType,
        userId: user.userId
      }));

      // Gọi API để cập nhật database
      await dispatch(
        reactToReview({
          reviewId,
          reactionType: newReactionType,
        })
      ).unwrap();

    } catch (error) {
      console.error("Error updating reaction:", error);
      toast.error("Có lỗi xảy ra khi cập nhật phản ứng");
      
      // Nếu có lỗi, refresh lại reactions từ server
      const reviewIds = validReviews.map((review) => review.reviewId);
      dispatch(getReviewReactions(reviewIds));
    }
  };
// Thêm useEffect này để load reactions sau khi reviews được load
useEffect(() => {
  if (validReviews && validReviews.length > 0) {
    const reviewIds = validReviews.map((review) => review.reviewId);
    
    // Chỉ dispatch nếu user đã đăng nhập
    if (user) {
      dispatch(getReviewReactions(reviewIds));
    }
  }
}, [validReviews, dispatch, user]);
  // Function to load replies for a specific review

  // Load replies for all reviews when component mounts or when reviews change
  useEffect(() => {
    console.log("User:", user);
    console.log("Replies:", replies);
    if (validReviews.length > 0) {
      validReviews.forEach((review) => {
        // Always refresh replies to ensure we have the latest data
        loadRepliesForReview(review.reviewId);
      });
    }
  }, [validReviews]);

  // Function to handle reply deletion
  const handleDeleteReply = async (replyId, reviewId) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    try {
      // Show confirmation dialog using SweetAlert2
      const result = await Swal.fire({
        title: "Xác nhận xóa phản hồi",
        text: "Bạn có chắc chắn muốn xóa phản hồi này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        console.log("Attempting to delete reply ID:", replyId);

        console.log("Parent Review ID for deletion:", reviewId);

        // Call the API to delete the reply
        const deleteResult = await dispatch(
          deleteReviewReply(replyId)
        ).unwrap();
        console.log("Delete reply API response:", deleteResult);

        // Re-fetch only the replies for this specific review to ensure UI update
        await dispatch(getReviewReplies(reviewId));

        toast.success("Đã xóa phản hồi thành công");
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Có lỗi xảy ra khi xóa phản hồi");
    }
  };

  // Function to handle editing review
  const handleEditReviewClick = (review) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    // Ensure this is the user's review
    if (review?.seeker?.userAccount?.userId !== user?.userId) {
      toast.warning("Bạn chỉ có thể chỉnh sửa đánh giá của mình");
      return;
    }

    setEditingReviewId(review.reviewId);
    setEditReviewData({
      star: review.star,
      message: review.message,
      isAnonymous: review.anonymous,
    });
  };

  // Function to save edited review
  const handleSaveReviewEdit = async () => {
    if (!editingReviewId) return;

    // Show loading toast while checking content moderation
    const loadingToastId = toast.loading("Đang kiểm tra nội dung đánh giá...");

    try {
      // Get the current review with its replies
      const currentReview = reviews.find((r) => r.reviewId === editingReviewId);
      if (!currentReview) {
        toast.dismiss(loadingToastId);
        toast.error("Không tìm thấy đánh giá để cập nhật");
        return;
      }

      // const currentReplies = currentReview?.replies || []; // No need to preserve if re-fetching

      await dispatch(
        updateReview({
          reviewId: editingReviewId,
          reviewData: {
            star: editReviewData.star,
            message: editReviewData.message,
            anonymous: editReviewData.isAnonymous,
          },
        })
      ).unwrap();

      toast.dismiss(loadingToastId);
      // console.log("API response for updated review:", updatedReview); // No need to log this if re-fetching

      // Removed: Manual update of reviews array directly with new data
      // const completeUpdatedReview = {
      //   ...updatedReview,
      //   replies: currentReplies, // Make sure to keep the existing replies
      // };
      // const updatedReviews = reviews.map((review) =>
      //   review.reviewId === editingReviewId ? completeUpdatedReview : review
      // );

      // Removed: Manual update Redux store
      // dispatch({
      //   type: "review/getReviewByCompany/fulfilled",
      //   payload: updatedReviews,
      // });

      // ADDED: Re-fetch all reviews for the company to ensure UI update
      await dispatch(getReviewByCompany(companyId));

      // Reset edit state
      setEditingReviewId(null);
      setEditReviewData({ star: 0, message: "", isAnonymous: false });

      toast.success("Đánh giá đã được cập nhật thành công");
    } catch (error) {
      // Always dismiss the loading toast in case of error
      toast.dismiss(loadingToastId);

      console.error("Error updating review:", error);

      // Check for different error formats
      // Lỗi có thể là một chuỗi hoặc một đối tượng
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message ||
            (error.payload
              ? error.payload
              : "Có lỗi xảy ra khi cập nhật đánh giá");

      // Log detailed error information for debugging
      console.log("Error details:", {
        error,
        message: errorMessage,
        hasPayload: !!error.payload,
        content: editReviewData.message,
      });

      // Check if the error is from content moderation
      if (errorMessage && errorMessage.includes("không phù hợp")) {
        console.log("Moderation error detected:", errorMessage);

        // Tạo một đối tượng lỗi đúng định dạng để truyền vào showModerationError
        const moderationError = {
          message: errorMessage,
        };

        // Hiển thị lỗi kiểm duyệt nội dung với nội dung thực tế
        showModerationError(moderationError, editReviewData.message);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Function to cancel editing review
  const handleCancelReviewEdit = () => {
    setEditingReviewId(null);
    setEditReviewData({ star: 0, message: "", isAnonymous: false });
  };

  // Function to handle editing reply
  const handleEditReplyClick = (reply) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    // Check if this reply belongs to the current user
    if (reply.userId !== user.userId) {
      toast.warning("Bạn chỉ có thể chỉnh sửa phản hồi của mình");
      return;
    }

    // Extract the actual content without the @username part
    let content = reply.content;
    if (content.startsWith("@") && content.includes(":")) {
      // Remove the @username: part
      content = content.split(":").slice(1).join(":").trim();
    }

    setEditingReplyId(reply.replyId);
    setEditReplyData({
      id: reply.replyId,
      content: content,
      isAnonymous: reply.anonymous,
      parentReplyId: reply.parentReplyId
    });
  };

  const handleSaveReplyEdit = async () => {
    try {
      if (!editReplyData || !editReplyData.id) {
        toast.error('Không tìm thấy thông tin reply cần chỉnh sửa');
        return;
      }      // Kiểm tra nội dung với AI
      const response = await fetch('http://localhost:5000/check-comment', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editReplyData.content }),
      });


      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const result = await response.json();      if (result.is_toxic) {
        toast.error('Nội dung bình luận không phù hợp. Vui lòng kiểm tra lại.');
        showModerationError({ message: result.message }, editReplyData.content);
        return;
      }

      const token = localStorage.getItem("jwt");
      // Gọi API cập nhật reply
      const response2 = await fetch(
        `${API_URL}/review/update-reply/${editReplyData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: editReplyData.content,
            isAnonymous: editReplyData.isAnonymous,
            parentReplyId: editReplyData.parentReplyId || null,
          }),
        }
      );      if (!response2.ok) {
        const errorData = await response2.json();
        throw new Error(errorData.message || 'Failed to update reply');
      }

      const updatedReply = await response2.json();

      // ADDED: Re-fetch all reviews for the company to ensure UI update
      await dispatch(getReviewByCompany(companyId));

      // Cập nhật Redux store
      dispatch({
        type: "review/updateReviewReply/fulfilled",
        payload: updatedReply
      });

      // Cập nhật lại tất cả các reply trong Redux store
      const updatedReviews = reviews.map(review => {
        if (review.replies && review.replies.length > 0) {
          const updateReplyRecursive = (repliesArray, replyId, updatedData) => {
            return repliesArray.map(reply => {
              if (reply.replyId === replyId) {
                return {
                  ...reply,
                  ...updatedData,
                  replies: reply.replies || []
                };
              }
              if (reply.replies && reply.replies.length > 0) {
                return {
                  ...reply,
                  replies: updateReplyRecursive(reply.replies, replyId, updatedData)
                };
              }
              return reply;
            });
          };

          return {
            ...review,
            replies: updateReplyRecursive(review.replies, editReplyData.id, updatedReply)
          };
        }
        return review;
      });

      // Cập nhật toàn bộ reviews trong Redux store
      dispatch({
        type: "review/getReviewByCompany/fulfilled",
        payload: updatedReviews
      });

      toast.success('Đã cập nhật bình luận thành công!');

    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật bình luận. Vui lòng thử lại sau.');
    }
  };

  // Function to cancel editing reply
  const handleCancelReplyEdit = () => {
    setEditingReplyId(null);
    setEditReplyData({ content: "", anonymous: false });
  };

  return (
    <main className="container mx-auto px-2 xs:px-4 sm:px-6 md:px-8 py-4 xs:py-6 sm:py-8">
      {/* Back button */}
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 text-xs xs:text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Quay lại
      </Button>

      <div className="max-w-7xl mx-auto">
        {/* Company Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 to-purple-100 rounded-2xl overflow-hidden flex-shrink-0 transform transition-transform duration-300 group-hover:scale-105">
                <img
                  src={companyProfile?.logo}
                  alt={`${companyProfile?.companyName} Logo`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col xs:flex-row xs:items-center xs:gap-4 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent">
                  {companyProfile?.companyName}
                </h1>
                <div className="mt-2 xs:mt-0">
                  {averageStars !== 0 ? (
                    <div className="flex items-center bg-white rounded-full px-3 py-1.5 shadow-sm">
                      <Badge
                        className={`
                          px-2 py-1 text-sm text-white rounded-full
                          ${averageStars <= 1 ? "bg-red-500" : ""}
                          ${
                            averageStars > 1 && averageStars <= 2
                              ? "bg-orange-500"
                              : ""
                          }
                          ${
                            averageStars > 2 && averageStars <= 3
                              ? "bg-yellow-500"
                              : ""
                          }
                          ${
                            averageStars > 3 && averageStars <= 4
                              ? "bg-green-500"
                              : ""
                          }
                          ${averageStars > 4 ? "bg-blue-500" : ""}
                        `}
                      >
                        {averageStars.toFixed(1)}
                      </Badge>
                      <div className="ml-2 flex">
                        {[...Array(5)].map((_, index) => (
                          <StarRounded
                            key={index}
                            className={`w-5 h-5 ${
                              index < averageStars
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                      Chưa có đánh giá nào
                    </p>
                  )}
                </div>
              </div>

              {!localStorage.getItem("jwt") || checkIfSaved === false ? (
                <div className="flex items-center p-3 border border-yellow-400 rounded-xl bg-yellow-50 shadow-sm mb-4">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-sm text-gray-700 font-medium">
                    Phải đăng nhập và được apply vào công ty thì mới được đánh
                    giá
                  </span>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <Calendar className="w-5 h-5 min-w-5 min-h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Thành lập</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(
                        companyProfile?.establishedTime
                      ).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <MapPin className="w-5 h-5 min-w-5 min-h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Địa chỉ</p>
                    <p
                      className="text-sm font-medium text-gray-700 break-words"
                      title={companyProfile?.address || "Chưa có địa chỉ"}
                    >
                      {companyProfile?.address || "Chưa có địa chỉ"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <Briefcase className="w-5 h-5 min-w-5 min-h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Lĩnh vực</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {companyProfile?.industry?.map((ind, index) => (
                        <IndustryBadge
                          key={index}
                          name={ind.industryName}
                          onClick={() => handleIndustryClick(ind.industryId)}
                        />

                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {!localStorage.getItem("jwt") ? null : (
                <Button
                  onClick={handleFollowClick}
                  className="px-6 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-xl hover:from-purple-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Company Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-6 xs:mb-8 sm:mb-12">
          <div className="md:col-span-3">
            <h2 className="text-lg xs:text-xl sm:text-2xl text-purple-600 font-semibold mb-3 xs:mb-4">
              Giới thiệu
            </h2>
            <p className="text-xs xs:text-sm sm:text-base text-gray-600 leading-relaxed">
              {companyProfile?.description || "Chưa có thông tin giới thiệu"}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-6 xs:mb-8 sm:mb-12">
          <h2 className="text-lg xs:text-xl sm:text-2xl text-purple-600 font-semibold mb-3 xs:mb-4">
            Liên hệ
          </h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 px-2 xs:px-3 sm:px-4 py-2  rounded-md">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs xs:text-sm truncate">
                {companyProfile?.email || "Chưa có email"}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-2 xs:px-3 sm:px-4 py-2  rounded-md">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs xs:text-sm">
                {companyProfile?.contact || "Chưa có số liên hệ"}
              </span>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-6 xs:mb-8 sm:mb-12">
          <h2 className="text-lg xs:text-xl sm:text-2xl text-purple-600 font-semibold mb-3 xs:mb-4">
            Địa chỉ liên kết
          </h2>
          {socialLinks &&
          Array.isArray(socialLinks) &&
          socialLinks.length > 0 ? (
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="platform-icon-container"
                    style={{
                      width: "20px",
                      height: "20px",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={require(`../../assets/images/platforms/${link.platform.toLowerCase()}.png`)}
                      alt={link.platform.toLowerCase()}
                      className="h-full w-full object-contain rounded-full shadow-md"
                    />
                  </div>
                  <a
                    href={link.url}
                    className="text-xs xs:text-sm text-blue-600 truncate max-w-[80%]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs xs:text-sm text-gray-500">
              Không có liên kết xã hội nào
            </p>
          )}
        </div>

        {/* Company Images */}
        <div className="mb-6 xs:mb-8 sm:mb-12">
          <h2 className="text-lg xs:text-xl sm:text-2xl text-purple-600 font-semibold mb-3 xs:mb-4">
            Một số hình ảnh công ty
          </h2>
          {companyProfile?.images && companyProfile?.images.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
              {companyProfile?.images.map((image, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => handleImageClick(image.pathImg)}
                >
                  <img
                    src={image.pathImg}
                    alt={`Company image ${index + 1}`}
                    className="w-full h-auto rounded-lg object-cover max-h-40 xs:max-h-48 sm:max-h-64"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs xs:text-sm text-gray-500 text-center">
              Chưa có thông tin về hình ảnh
            </p>
          )}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
              onClick={closeModal}
            >
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Zoomed Image"
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                />
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 p-1.5 xs:p-2 text-white bg-gray-800 rounded-full text-xs xs:text-sm"
                >
                  X
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="mb-6 xs:mb-8 sm:mb-12">
          <h2 className="text-lg xs:text-xl sm:text-2xl text-purple-600 font-semibold mb-3 xs:mb-4">
            Đánh giá
          </h2>
          <div className="p-4 xs:p-5 sm:p-6 border rounded-lg bg-gray-100 shadow-lg">
            <h3 className="text-base xs:text-lg sm:text-xl font-semibold mb-4 xs:mb-6 text-gray-800">
              Các đánh giá khác
            </h3>
            {validReviews.length === 0 ? (
              <p className="text-xs xs:text-sm text-gray-500 text-center">
                Chưa có đánh giá nào.
              </p>
            ) : (
              validReviews
                .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
                .map((review, index) => (
                  <div
                    key={index}
                    className="mb-6 p-4 border-b border-gray-300 rounded-md hover:bg-purple-100 hover:shadow-lg"
                  >
                    <div className="flex items-start mb-4">
                      <img
                        src={
                          review.anonymous
                            ? anonymousIcon
                            : review?.seeker?.userAccount?.avatar
                        }
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1">
                        {/* Thông tin người dùng và thời gian */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {review.anonymous
                              ? `Người dùng ẩn danh ${review.anonymousId || ""}`
                              : review?.seeker?.userAccount?.userName
                              ? `${
                                  review.seeker.userAccount.userName[0]
                                }${"*".repeat(
                                  review.seeker.userAccount.userName.length - 2
                                )}${
                                  review.seeker.userAccount.userName[
                                    review.seeker.userAccount.userName.length -
                                      1
                                  ]
                                }`
                              : ""}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(review?.createDate).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        {/* Nút chỉnh sửa và xóa */}
                        {user &&
                          review?.seeker?.userAccount?.userId ===
                            user?.userId && (
                            <div className="flex items-center gap-4 mb-2">
                              <button
                                onClick={() => handleEditReviewClick(review)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                              >
                                <Edit fontSize="small" />
                                <span>Chỉnh sửa</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteReview(review.reviewId)
                                }
                                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                              >
                                <Delete fontSize="small" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          )}

                        {/* Rating stars */}
                        <div className="flex items-center mb-2">
                          <RatingStars
                            count={5}
                            value={review.star}
                            size={20}
                            activeColor="#ffd700"
                            edit={false}
                          />
                        </div>

                        {/* Review message */}
                        {editingReviewId !== review.reviewId && (
                          <p className="text-gray-700 mt-2">
                            {review?.message}
                          </p>
                        )}

                        {/* Edit review form */}
                        {editingReviewId === review.reviewId ? (
                          <div className="mt-3 p-4 border border-blue-300 rounded-md bg-blue-50">
                            <h4 className="text-lg font-semibold mb-2">
                              Chỉnh sửa đánh giá
                            </h4>

                            <div className="mb-3">
                              <RatingStars
                                value={editReviewData.star}
                                onChange={(newValue) =>
                                  setEditReviewData({
                                    ...editReviewData,
                                    star: newValue,
                                  })
                                }
                              />
                            </div>

                            <textarea
                              value={editReviewData.message}
                              onChange={(e) =>
                                setEditReviewData({
                                  ...editReviewData,
                                  message: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded-md mb-3"
                              rows={4}
                            />

                            <div className="flex items-center mb-3">
                              <input
                                type="checkbox"
                                id="edit-anonymous"
                                checked={editReviewData.isAnonymous}
                                onChange={(e) =>
                                  setEditReviewData({
                                    ...editReviewData,
                                    isAnonymous: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              <label htmlFor="edit-anonymous">
                                Đánh giá ẩn danh
                              </label>
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleCancelReviewEdit}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleSaveReviewEdit}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {/* Reaction buttons */}
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() =>
                              handleReaction(review.reviewId, "LIKE")
                            }
                            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                              reactions[review.reviewId]?.userReaction ===
                              "LIKE"
                                ? "bg-blue-100 text-blue-600"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <ThumbUpAlt fontSize="small" />
                            <span>
                              {reactions[review.reviewId]?.likeCount || 0}
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              handleReaction(review.reviewId, "DISLIKE")
                            }
                            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                              reactions[review.reviewId]?.userReaction ===
                              "DISLIKE"
                                ? "bg-red-100 text-red-600"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <ThumbDownAlt fontSize="small" />
                            <span>
                              {reactions[review.reviewId]?.dislikeCount || 0}
                            </span>
                          </button>

                          {user && (
                            <button
                              onClick={() => handleReplyClick(review.reviewId)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-gray-600 hover:bg-gray-200 ${
                                checkIfSaved === false
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              title={
                                checkIfSaved === false
                                  ? "Bạn cần apply vào công ty để có thể phản hồi đánh giá"
                                  : "Phản hồi"
                              }
                            >
                              <Reply fontSize="small" />
                              <span>Phản hồi</span>
                            </button>
                          )}
                        </div>

                        {/* Reply form */}
                        {replyTo === review.reviewId && (
                          <div className="mt-4 p-4 border border-purple-200 rounded-lg bg-purple-50 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-purple-700 flex items-center gap-1">
                                <Reply fontSize="small" />
                                Phản hồi đánh giá
                              </h4>
                              <button
                                onClick={handleCloseReply}
                                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-200"
                              >
                                <Close fontSize="small" />
                              </button>
                            </div>

                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Nhập phản hồi của bạn..."
                              className="w-full p-3 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                              rows={3}
                            />

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`anonymous-reply-${review.reviewId}`}
                                  checked={isReplyAnonymous}
                                  onChange={(e) =>
                                    setIsReplyAnonymous(e.target.checked)
                                  }
                                  className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                />
                                <label
                                  htmlFor={`anonymous-reply-${review.reviewId}`}
                                  className="text-sm text-purple-600"
                                >
                                  Phản hồi ẩn danh
                                </label>
                              </div>

                              <button
                                onClick={() =>
                                  handleReplySubmit(review.reviewId)
                                }
                                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-1"
                              >
                                <span>Gửi phản hồi</span>
                              </button>
                            </div>
                          </div>
                        )}                        {/* Display replies count and toggle button */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4">                            {!showRepliesMap[review.reviewId] ? (
                              // Show replies count button when replies are hidden
                              <button
                                onClick={() => toggleShowReplies(review.reviewId)}
                                className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 text-purple-700 rounded-xl hover:from-purple-100 hover:via-blue-100 hover:to-indigo-100 transition-all duration-300 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                              >
                                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all duration-200">
                                  <Reply fontSize="small" className="text-purple-600" />
                                </div>
                                <div className="flex flex-col items-start">
                                  <span className="font-semibold text-sm">
                                    {review.replies.filter(reply => !reply.parentReplyId).length} phản hồi
                                  </span>
                                  <span className="text-xs text-purple-600 opacity-75">Nhấn để xem tất cả</span>
                                </div>
                                <div className="ml-auto flex items-center">
                                  <span className="text-purple-500 group-hover:text-purple-600 transition-colors duration-200">▼</span>
                                </div>
                              </button>
                            ) : (                              // Show replies when toggled on
                              <div className="space-y-4 animate-in fade-in duration-500 slide-in-from-top-4">
                                <div className="ml-4 pl-6 border-l-4 border-gradient-to-b from-purple-400 via-blue-400 to-indigo-400 py-4 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 rounded-xl shadow-sm">
                                  {/* Header with reply count and hide button */}
                                  <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md">
                                        <Reply fontSize="medium" className="text-purple-600" />
                                      </div>
                                      <div className="flex flex-col">
                                        <h4 className="text-base font-bold text-purple-800">
                                          Phản hồi ({review.replies.filter(reply => !reply.parentReplyId).length})
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                                          <span className="text-xs text-purple-600 font-medium">Tất cả phản hồi</span>
                                          <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => hideReplies(review.reviewId)}
                                      className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-300"
                                    >
                                      <span className="text-sm text-gray-600 group-hover:text-purple-700 font-medium">Ẩn phản hồi</span>
                                      <span className="text-gray-500 group-hover:text-purple-600 transition-colors duration-200">▲</span>
                                    </button>
                                  </div>                                  {/* Only render top-level replies here (replies without a parent) */}
                                  <div className="space-y-6">
                                    {review.replies &&
                                      Array.isArray(review.replies) &&
                                      review.replies
                                        .filter((reply) => !reply.parentReplyId)
                                        .map((reply, index) => (
                                          <div 
                                            key={reply.replyId}
                                            className="animate-in fade-in duration-300"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                          >
                                            <ReplyItem
                                              reply={reply}
                                              reviewId={review.reviewId}
                                              onEdit={handleEditReplyClick}
                                              onDelete={handleDeleteReply}
                                              onReply={handleReplySubmit}
                                              currentUser={user}
                                              checkIfSaved={checkIfSaved}
                                              editingReplyId={editingReplyId}
                                              editReplyData={editReplyData}
                                              handleCancelReplyEdit={
                                                handleCancelReplyEdit
                                              }
                                              handleSaveReplyEdit={
                                                handleSaveReplyEdit
                                              }
                                              setEditReplyData={setEditReplyData}
                                              level={0}
                                              maxLevel={2}
                                            />
                                          </div>
                                        ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Review Form */}
        {!hasReviewed && checkIfSaved === true && (
          <div className="p-4 xs:p-5 sm:p-6 bg-white rounded-lg shadow-lg border border-gray-300 mb-6 xs:mb-8 sm:mb-12">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-3 xs:mb-4 text-gray-800">
              Đánh giá của bạn
            </h2>
            <div className="space-y-4">
              <div className="mb-4">
                <RatingStars
                  value={feedback.star}
                  onChange={handleRatingChange}
                  readOnly={false}
                />
              </div>
              <textarea
                placeholder="Nhập đánh giá của bạn..."
                value={feedback.message}
                onChange={handleReviewChange}
                rows={4}
                className="w-full p-2 xs:p-3 text-xs xs:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={feedback.isAnonymous}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      isAnonymous: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="anonymous"
                  className="text-xs xs:text-sm text-purple-600"
                >
                  Đăng đánh giá ẩn danh
                </label>
              </div>
              <button
                type="button"
                className="w-full px-4 py-2 xs:px-6 xs:py-3 text-xs xs:text-sm bg-purple-500 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleSubmitReview}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        )}

        {/* Open Jobs */}
        <div id="job-listings">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 xs:mb-6 sm:mb-7">
            <h2 className="text-lg xs:text-xl sm:text-2xl text-purple-600 font-semibold">
              Vị trí đang tuyển
            </h2>
            {allJobs.length > 0 && (
              <p className="text-xs xs:text-sm text-gray-500 mt-1 sm:mt-0">
                Hiển thị {Math.min(displayedJobs.length, jobsPerPage)} /{" "}
                {allJobs.length} công việc
              </p>
            )}
          </div>
          {loading ? (
            <div className="text-center py-8 text-xs xs:text-sm">
              Đang tải...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 text-xs xs:text-sm">
              {error}
            </div>
          ) : jobPost && jobPost.length > 0 ? (
            <>
              <div className="grid gap-4">
                {displayedJobs.map((job) => (
                  <div key={job.postId} className="w-full max-w-full">
                    <JobCard_AllJob
                      job={{
                        ...job,
                        company: {
                          ...job.company,
                          logo: job.company.logo,
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
              {calculatedTotalPages > 1 && (
                <div className="mt-6 xs:mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={calculatedTotalPages}
                    onPageChange={handlePageChange}
                    siblingCount={1}
                    className="text-xs xs:text-sm"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-xs xs:text-sm">
              Công ty này hiện không có vị trí đang tuyển dụng nào.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
