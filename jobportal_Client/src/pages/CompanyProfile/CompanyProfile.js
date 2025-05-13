import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "swiper/swiper-bundle.css";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Calendar, MapPin, Briefcase, Star, Phone, Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import JobCard_AllJob from "../../components/common/JobCard_AllJob/JobCard_AllJob";
import { StarRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination/Pagination";
import "react-toastify/dist/ReactToastify.css";
import anonymousIcon from "../../assets/icons/anonymous.png";
import Swal from "sweetalert2";
import {
  createReview,
  deleteReview,
  getReviewByCompany,
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
            className={`w-5 h-5 xs:w-6 xs:h-6 ${
              star <= value ? "text-yellow-500" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
});

export default function CompanyProfile() {
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    jobPost = [],
    error,
    totalPages = 0,
    totalElements = 0,
  } = useSelector((store) => store.jobPost);
  const { checkIfSaved, companyProfile } = useSelector(
    (store) => store.company
  );
  const { socialLinks } = useSelector((store) => store.socialLink);
  const { reviews } = useSelector((store) => store.review);
  const { seeker } = useSelector((store) => store.seeker);
  const { user } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState(true);
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

  const handleSubmitReview = async () => {
    if (!feedback.star) {
      toast.warning("Đánh giá sao không được để trống!");
      return;
    }
    if (feedback.message.trim() === "") {
      toast.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
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
          return;
        }
        const reviewId = existingReview.reviewId;
        await dispatch(deleteReview(reviewId));
      }

      await dispatch(
        createReview({
          reviewData: {
            star: feedback.star,
            message: feedback.message,
            isAnonymous: feedback.isAnonymous,
          },
          companyId,
        })
      );
      await dispatch(getReviewByCompany(companyId));
      toast.success("Gửi đánh giá thành công");
      setFeedback({ star: 0, message: "", isAnonymous: false });
    } catch (error) {
      console.error("Error in review process:", error);
      toast.error(
        error.response?.data || "Có lỗi xảy ra trong quá trình xử lý"
      );
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
    dispatch(getReviewByCompany(companyId));
    dispatch(checkSaved(companyId));
    dispatch(fetchSocialLinksByUserId(userId));
  }, [dispatch, companyId]);

  const handleFollowClick = async () => {
    try {
      await dispatch(followCompany(companyId));
      setIsFollowing((prevState) => !prevState);
      const mess = isFollowing
        ? "Bỏ theo dõi thành công!"
        : "Theo dõi thành công!";
      toast(mess);
    } catch (error) {
      console.error("Có lỗi xảy ra khi theo dõi công ty:", error);
      toast("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const totalStars = reviews.reduce((total, review) => total + review.star, 0);
  const averageStars = reviews.length > 0 ? totalStars / reviews.length : 0;

  const validReviews = Array.isArray(reviews)
    ? reviews.filter(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          item.hasOwnProperty("reviewId")
      )
    : [];

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
        await dispatch(deleteReview(reviewId));
        toast.success("Xóa đánh giá thành công");
        dispatch(getReviewByCompany(companyId));
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
        <div className="flex flex-col sm:flex-row items-start gap-2 xs:gap-4 sm:gap-6 mb-6 xs:mb-8 sm:mb-12">
          <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-indigo-100 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={companyProfile?.logo}
              alt={`${companyProfile?.companyName} Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full">
            <div className="flex flex-col xs:flex-row xs:items-center xs:gap-3 mb-1">
              <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
                {companyProfile?.companyName}
              </h1>
              <div className="mt-2 xs:mt-0">
                {averageStars !== 0 ? (
                  <div className="flex items-center">
                    <Badge
                      className={`
                        px-2 xs:px-3 py-0.5 xs:py-1 text-xs xs:text-sm text-white rounded-md hover:bg-opacity-80
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
                          className={`w-4 h-4 xs:w-5 xs:h-5 ${
                            index < averageStars
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs xs:text-sm text-gray-500">
                    Chưa có đánh giá nào
                  </p>
                )}
              </div>
            </div>
            {!localStorage.getItem("jwt") || checkIfSaved === false ? (
              <div className="flex items-center p-2 xs:p-3 border border-yellow-400 rounded-lg bg-yellow-50 shadow-sm mt-2 xs:mt-3">
                <Star className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-xs xs:text-sm text-gray-700 font-medium">
                  Phải đăng nhập và được apply vào công ty thì mới được đánh giá
                </span>
              </div>
            ) : null}
            <div className="flex flex-col xs:flex-row xs:flex-wrap gap-2 xs:gap-4 sm:gap-6 mt-2 xs:mt-4">
              <div className="flex items-center gap-2 text-xs xs:text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  Thành lập{" "}
                  {new Date(companyProfile?.establishedTime).toLocaleDateString(
                    "vi-VN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span
                  className="max-w-[200px] xs:max-w-[250px] sm:max-w-[300px] line-clamp-2"
                  title={companyProfile?.address || "Chưa có địa chỉ"}
                >
                  {companyProfile?.address || "Chưa có địa chỉ"}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-xs xs:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>
                    {companyProfile?.industry
                      ?.slice(0, 2)
                      .map((ind) => ind.industryName)
                      .join(" & ") || "Chưa có ngành"}
                  </span>
                </div>
                {companyProfile?.industry?.length > 2 && (
                  <div className="ml-6">
                    {companyProfile.industry.slice(2).map((ind, index) => (
                      <div key={index}>{ind.industryName}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!localStorage.getItem("jwt") || checkIfSaved === false ? null : (
              <Button
                onClick={handleFollowClick}
                className="mt-4 xs:mt-6 px-3 py-1.5 xs:px-4 xs:py-2 text-xs xs:text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-700 w-full xs:w-auto"
              >
                {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
              </Button>
            )}
          </div>
        </div>

        {/* Company Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-6 xs:mb-8 sm:mb-12">
          <div className="md:col-span-2">
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
            <div className="flex items-center space-x-2 px-2 xs:px-3 sm:px-4 py-2 bg-gray-100 rounded-md">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs xs:text-sm truncate">
                {companyProfile?.email || "Chưa có email"}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-2 xs:px-3 sm:px-4 py-2 bg-gray-100 rounded-md">
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
              {socialLinks.slice(1).map((link, index) => (
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
              <div className="flex flex-col gap-y-4 xs:gap-y-5 sm:gap-y-6">
                {validReviews
                  .sort(
                    (a, b) => new Date(b.createDate) - new Date(a.createDate)
                  )
                  .map((review, index) => (
                    <div
                      key={index}
                      className="p-2 xs:p-3 sm:p-4 border-b border-gray-300 rounded-md hover:bg-purple-100 hover:shadow-lg pb-4 last:pb-0 last:border-b-0"
                    >
                      <div className="flex flex-col xs:flex-row items-start gap-4 xs:gap-5 sm:gap-6">
                        <img
                          src={
                            review.anonymous
                              ? anonymousIcon
                              : review?.seeker?.userAccount?.avatar
                          }
                          alt="Avatar"
                          className="w-10 h-10 xs:w-12 xs:h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col w-full mb-2">
                            {/* Mobile design (under 640px) */}
                            <div className="flex flex-col sm:hidden w-full">
                              <div className="flex justify-between items-center mb-1">
                                <div className="font-semibold text-sm text-gray-800">
                                  {review.anonymous
                                    ? "Người dùng ẩn danh"
                                    : review?.seeker?.userAccount?.userName
                                    ? `${
                                        review.seeker.userAccount.userName[0]
                                      }${"*".repeat(
                                        review.seeker.userAccount.userName
                                          .length - 2
                                      )}${
                                        review.seeker.userAccount.userName[
                                          review.seeker.userAccount.userName
                                            .length - 1
                                        ]
                                      }`
                                    : ""}
                                </div>
                                {review?.seeker?.userAccount?.userId ===
                                  user?.userId && (
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(review.reviewId)
                                    }
                                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                {new Date(
                                  review?.createDate
                                ).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            {/* Desktop design (640px and above) */}
                            <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between w-full">
                              <span className="font-semibold text-sm text-gray-800">
                                {review.anonymous
                                  ? "Người dùng ẩn danh"
                                  : review?.seeker?.userAccount?.userName
                                  ? `${
                                      review.seeker.userAccount.userName[0]
                                    }${"*".repeat(
                                      review.seeker.userAccount.userName
                                        .length - 2
                                    )}${
                                      review.seeker.userAccount.userName[
                                        review.seeker.userAccount.userName
                                          .length - 1
                                      ]
                                    }`
                                  : ""}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    review?.createDate
                                  ).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {review?.seeker?.userAccount?.userId ===
                                  user?.userId && (
                                  <button
                                    onClick={() =>
                                      handleDeleteReview(review.reviewId)
                                    }
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <RatingStars value={review.star} readOnly={true} />
                          </div>
                          <p className="text-xs xs:text-sm text-gray-700">
                            {review?.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        {checkIfSaved === true && (
          <div className="p-4 xs:p-5 sm:p-6 bg-white rounded-lg shadow-lg border border-gray-300 mb-6 xs:mb-8 sm:mb-12">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-3 xs:mb-4 text-gray-800">
              {hasReviewed ? "Cập nhật đánh giá của bạn" : "Đánh giá của bạn"}
            </h2>
            {hasReviewed && (
              <div className="mb-4 p-3 xs:p-4 bg-blue-50 border border-purple-200 rounded-md">
                <p className="text-xs xs:text-sm text-purple-600 mb-2">
                  Đánh giá hiện tại của bạn:
                </p>
                <div className="flex items-center mb-2">
                  <RatingStars value={existingReview.star} readOnly={true} />
                </div>
                <p className="font-bold text-xs xs:text-sm text-purple-600">
                  {existingReview.message}
                </p>
                <p className="text-xs xs:text-sm text-gray-500 mt-2">
                  {existingReview.isAnonymous ? "(Đánh giá ẩn danh)" : ""}
                </p>
              </div>
            )}
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
                {hasReviewed ? "Cập nhật đánh giá" : "Gửi đánh giá"}
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
