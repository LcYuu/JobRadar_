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
            className={`w-6 h-6 ${
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
  const { jobPost = [], error, totalPages = 0, totalElements = 0 } = useSelector((store) => store.jobPost);

  const [loading, setLoading] = useState(true);

  const { checkIfSaved } = useSelector((store) => store.company);
  const { socialLinks } = useSelector((store) => store.socialLink);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
    setIsOpen(true); // Mở modal
  };

  const closeModal = () => {
    setIsOpen(false); // Đóng modal
  };

  const { reviews } = useSelector((store) => store.review);
  console.log("🚀 ~ CompanyProfile ~ reviews:", reviews);

  const { companyProfile } = useSelector((store) => store.company);
  const { seeker } = useSelector((store) => store.seeker);

  const [isFollowing, setIsFollowing] = useState(false); // Trạng thái theo dõi ban đầu

  const [currentPage, setCurrentPage] = useState(0);
  const [jobsPerPage] = useState(5);
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);

  const [feedback, setFeedback] = useState({
    star: 0,
    message: "",
    isAnonymous: false,
  });

  const handleRatingChange = (newRating) => {
    setFeedback((prevFeedback) => ({ ...prevFeedback, star: newRating }));
  };

  const handleReviewChange = (event) => {
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      message: event.target.value,
    }));
  };

  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const { user } = useSelector((store) => store.auth);

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

        // Sử dụng Swal để thay thế window.confirm
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

      setFeedback({
        star: 0,
        message: "",
        isAnonymous: false,
      });
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
        await dispatch(getSeekerByUser()); // Lấy dữ liệu chỉ khi chưa có seeker
        setLoading(false); // Đánh dấu là đã tải xong dữ liệu
      }

      if (seeker?.followedCompanies) {
        const isCurrentlyFollowing = seeker.followedCompanies.some(
          (company) => company.companyId === companyId
        );
        setIsFollowing(isCurrentlyFollowing); // Cập nhật trạng thái
      }
    };

    fetchSeekerAndCheckFollow();
  }, [dispatch, companyId, seeker, loading]); // Cập nhật state loading để kiểm soát việc gọi API

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [companyId]); // Chỉ cuộn khi companyId thay đổi

  // Fetch all jobs from the company
  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        // Use the getAllJobs param to fetch all jobs at once
        await dispatch(getJobsByCompany({ 
          companyId, 
          currentPage: 0,
          size: 100,
          getAllJobs: true 
        }));
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    
    fetchCompanyJobs();
  }, [dispatch, companyId]);

  // Update displayed jobs when page changes or when all jobs are loaded
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
      setIsFollowing((prevState) => !prevState); // Đảo trạng thái
      const mess = isFollowing
        ? "Bỏ theo dõi thành công!"
        : "Theo dõi thành công!";
      toast(mess);
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Có lỗi xảy ra khi theo dõi công ty:", error);
      toast("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  console.log("eqwe" + isFollowing);

  const totalStars = reviews.reduce((total, review) => total + review.star, 0);
  // Tính trung bình
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
    // Sử dụng Swal để xác nhận
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa đánh giá này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    // Kiểm tra nếu người dùng chọn "Xóa"
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

  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    
    // Calculate new displayed jobs
    const startIndex = newPage * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    setDisplayedJobs(allJobs.slice(startIndex, endIndex));
    
    window.scrollTo({
      top: document.getElementById('job-listings').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  // Calculate total pages based on all jobs and jobs per page
  const calculatedTotalPages = Math.ceil(allJobs.length / jobsPerPage);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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
        <div className="flex items-start gap-6 mb-12">
          <div className="w-24 h-24 bg-indigo-100 rounded-xl overflow-hidden">
            <img
              src={companyProfile?.logo}
              alt={`${companyProfile?.companyName} Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {companyProfile?.companyName}
              </h1>

              <div className="mt-3 mb-4">
                {averageStars !== 0 ? (
                  <div className="flex items-center">
                    <Badge
                      className={`
          px-3 py-1 text-white rounded-md hover:bg-opacity-80
          ${averageStars <= 1 ? "bg-red-500" : ""}
          ${averageStars > 1 && averageStars <= 2 ? "bg-orange-500" : ""}
          ${averageStars > 2 && averageStars <= 3 ? "bg-yellow-500" : ""}
          ${averageStars > 3 && averageStars <= 4 ? "bg-green-500" : ""}
          ${averageStars > 4 ? "bg-blue-500" : ""}
        `}
                    >
                      {averageStars.toFixed(1)}
                    </Badge>
                    <div className="ml-2">
                      {[...Array(5)].map((_, index) => (
                        <StarRounded
                          key={index}
                          className={`inline-block ${
                            index < averageStars
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="ml-2 text-gray-500">Chưa có đánh giá nào</p>
                )}
              </div>
            </div>
            {/* <a
              href={company.website}
              className="text-sm text-blue-600 hover:underline"
            >
              {company.website}
            </a> */}

            {!localStorage.getItem("jwt") || checkIfSaved === false ? (
              <div className="flex items-center p-3 border border-yellow-400 rounded-lg bg-yellow-50 shadow-sm">
                <Star className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-gray-700 font-medium">
                  Phải đăng nhập và được apply vào công ty thì mới được đánh giá
                </span>
              </div>
            ) : null}

            <div className="flex gap-8 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
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
              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{company.employeeCount}+ Nhân viên</span>
              </div> */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{companyProfile?.address}</span>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-600">
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
                className="mt-6 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700"
              >
                {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
              </Button>
            )}
          </div>
        </div>
        {/* Company Profile, Tech Stack, and Office Location Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="col-span-2">
            <h2 className="text-xl text-purple-600 font-semibold mb-4">
              Giới thiệu
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {companyProfile?.description}
            </p>
          </div>

          {/* <div>
            <h2 className="text-xl font-semibold mb-4">Tech stack</h2>
            <div className="grid grid-cols-3 gap-2">
              {company.techStack.map((tech) => (
                <Badge 
                  key={tech} 
                  className="justify-center py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  {tech}
                </Badge>
              ))}
            </div>
            <Button 
              variant="link" 
              className="mt-4 p-0 text-blue-600 hover:text-blue-700"
            >
              View tech stack <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div> */}
        </div>
        {/* Contact Section */}
        <div className="mb-8">
          <h2 className="text-xl text-purple-600 font-semibold mb-4">
            Liên hệ
          </h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-md">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{companyProfile?.email}</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-md">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{companyProfile?.contact}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-purple-600 font-semibold mb-4">
            Địa chỉ liên kết
          </h2>
          {socialLinks &&
          Array.isArray(socialLinks) &&
          socialLinks.length > 0 ? (
            <>
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Logo của nền tảng */}
                  <div
                    className="platform-icon-container"
                    style={{
                      width: "24px",
                      height: "24px",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={require(`../../assets/images/platforms/${link.platform.toLowerCase()}.png`)}
                      alt={link.platform.toLowerCase()}
                      className="h-full w-full object-contain rounded-full shadow-md"
                    />
                  </div>

                  {/* Liên kết */}
                  <a
                    href={link.url}
                    className="text-sm text-blue-600 truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ maxWidth: "calc(100% - 32px)" }} // Đảm bảo không tràn khi container hẹp
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </>
          ) : (
            <p className="text-sm ">Không có liên kết xã hội nào</p>
          )}
        </div>

        {/* Company Images */}
        <h2 className="text-xl text-purple-600 font-semibold mb-4">
          Một số hình ảnh công ty
        </h2>
        <div className="mb-12">
          {companyProfile?.images && companyProfile?.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {companyProfile?.images.map((image, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => handleImageClick(image.pathImg)}
                >
                  <img
                    src={image.pathImg}
                    alt={`Company image ${index + 1}`}
                    className="w-full h-auto rounded-lg object-cover"
                    style={{ objectFit: "cover", maxHeight: "300px" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có thông tin về hình ảnh</p>
          )}

          {/* Modal Zoom Image */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
              onClick={closeModal}
            >
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Zoomed Image"
                  className="max-w-full max-h-full object-contain"
                  style={{ width: "80vw", height: "80vh" }}
                />
                <button
                  onClick={closeModal}
                  className="absolute top-0 right-0 p-2 text-white bg-gray-800 rounded-full"
                >
                  X
                </button>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-xl text-purple-600 font-semibold mb-4">Đánh giá</h2>
        <div className="mt-8 p-6 border rounded-lg bg-gray-100 shadow-lg">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Các đánh giá khác
            </h3>

            {validReviews.length === 0 ? (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
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
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {review.anonymous
                              ? "Người dùng ẩn danh"
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
                          <div className="flex items-center gap-4">
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
                        <div className="flex items-center mb-2">
                          <RatingStars
                            count={5}
                            value={review.star}
                            size={20}
                            activeColor="#ffd700"
                            edit={false}
                          />
                        </div>
                        <p className="text-gray-700 mt-2">{review?.message}</p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {checkIfSaved === true && (
          <div className="mt-5 p-6 bg-white rounded-lg shadow-lg border border-gray-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {hasReviewed ? "Cập nhật đánh giá của bạn" : "Đánh giá của bạn"}
            </h2>

            {/* Hiển thị đánh giá hiện tại */}
            {hasReviewed && (
              <div className="mb-4 p-4 bg-blue-50 border border-purple-200 rounded-md">
                <p className="text-sm text-purple-600 mb-2">
                  Đánh giá hiện tại của bạn:
                </p>
                <div className="flex items-center mb-2">
                  <RatingStars value={existingReview.star} readOnly={true} />
                </div>
                <p className="font-bold text-purple-600">
                  {existingReview.message}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {existingReview.isAnonymous ? "(Đánh giá ẩn danh)" : ""}
                </p>
              </div>
            )}

            {/* Form đánh giá */}
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
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label htmlFor="anonymous" className="text-sm text-purple-600">
                  Đăng đánh giá ẩn danh
                </label>
              </div>

              <button
                type="button"
                className="w-full px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleSubmitReview}
              >
                {hasReviewed ? "Cập nhật đánh giá" : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        )}

        {/* <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Văn phòng</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {company.locations && company.locations.length > 0 ? (
              company.locations.map((location) => (
                <Card key={location} className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-muted rounded" />
                    <span>{location}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                Chưa có thông tin văn phòng
              </div>
            )}
          </div>
        </div>

    
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Đội ngũ</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {company.team && company.team.length > 0 ? (
              company.team.map((member) => (
                <div key={member.name} className="text-center">
                  <img src={member.avatar} alt={member.name} className="w-20 h-20 mx-auto mb-2 rounded-full bg-muted" />
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.position}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                Chưa có thông tin đội ngũ
              </div>
            )}
          </div>
        </div>

        
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Phúc lợi</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.benefits && company.benefits.length > 0 ? (
              company.benefits.map((benefit) => (
                <Card key={benefit.title} className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    {benefit.icon && React.createElement(benefit.icon, {
                      className: "w-6 h-6 text-primary"
                    })}
                  </div>
                  <h3 className="font-medium mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                Chưa có thông tin phúc lợi
              </div>
            )}
          </div>
        </div> */}

        {/* Open Jobs */}
        <div id="job-listings">
          <div className="flex items-center justify-between mb-6 mt-7">
            <h2 className="text-xl text-purple-600 font-semibold">
              Vị trí đang tuyển
            </h2>
            {allJobs.length > 0 && (
              <p className="text-sm text-gray-500">
                Hiển thị {Math.min(displayedJobs.length, jobsPerPage)} / {allJobs.length} công việc
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : jobPost && jobPost.length > 0 ? (
            <>
              <div className="grid gap-4">
                {displayedJobs.map((job) => (
                  <JobCard_AllJob
                    key={job.postId}
                    job={{
                      ...job,
                      company: {
                        ...job.company,
                        logo: job.company.logo,
                      },
                    }}
                  />
                ))}
              </div>
              
              {/* Thêm phần phân trang */}
              {calculatedTotalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={calculatedTotalPages}
                    onPageChange={handlePageChange}
                    siblingCount={1}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Công ty này hiện không có vị trí đang tuyển dụng nào.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
