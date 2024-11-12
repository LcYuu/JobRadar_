import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Calendar,
  Users,
  MapPin,
  Briefcase,
  Heart,
  Clock,
  GraduationCap,
  Users2,
  ChevronRight,
  Star,
  Phone,
  Mail,
  StarIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import JobCard_AllJob from "../../components/common/JobCard_AllJob/JobCard_AllJob";
import { getAllJobAction } from "../../redux/JobPost/jobPost.action";
import logo from "../../assets/images/common/logo.jpg";
import { getProfileAction } from "../../redux/Auth/auth.action";
import { store } from "../../redux/store";
import {
  checkIfSaved,
  checkSaved,
  getCompanyProfile,
} from "../../redux/Company/company.action";
//@ts-ignore
import Rating from "react-rating-stars-component";
import {
  createReview,
  getReviewByCompany,
  getRiviewByCompany,
} from "../../redux/Review/review.action";
import { StarBorder, StarRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import { checkIfApplied } from "../../redux/ApplyJob/applyJob.action";

export default function CompanyProfile() {
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const {
    jobPost = [],
    totalPages,
    loading,
    error,
  } = useSelector((store) => store.jobPost);

  const { checkIfSaved } = useSelector((store) => store.company);

  const { reviews } = useSelector((store) => store.review);

  const { companyProfile, companyByFeature } = useSelector(
    (store) => store.company
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(6);

  const [feedback, setFeedback] = useState({ star: 0, message: "" });

  const handleRatingChange = (newRating) => {
    setFeedback((prevFeedback) => ({ ...prevFeedback, star: newRating }));
  };

  const handleReviewChange = (event) => {
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      message: event.target.value,
    }));
  };

  const handleSubmitReview = async () => {
    // Kiểm tra nếu rating không có giá trị
    if (!feedback.star) {
      toast("Đánh giá sao không được để trống!");
      return;
    }

    // Kiểm tra nếu review trống
    if (feedback.message.trim() === "") {
      toast("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      await dispatch(createReview(feedback, companyId));
      toast("Gửi đánh giá thành công");
      dispatch(getReviewByCompany(companyId));
      console.log("Đánh giá:", feedback.star, "Nội dung:", feedback.message);
      setFeedback({ star: 0, message: "" });
    } catch (error) {
      // Nếu có lỗi khi gửi đánh giá
      toast("Có lỗi xảy ra khi gửi đánh giá");
      console.error("Error submitting review:", error);
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    dispatch(getAllJobAction(currentPage, size)); // Assuming your action can accept companyId
  }, [dispatch, currentPage, size]);

  useEffect(() => {
    dispatch(getCompanyProfile(companyId));
    dispatch(getReviewByCompany(companyId));
    dispatch(checkSaved(companyId));
  }, [dispatch]);

  const totalStars = reviews.reduce((total, review) => total + review.star, 0);

  // Tính trung bình
  const averageStars = reviews.length > 0 ? totalStars / reviews.length : 0;

  console.log(checkIfSaved);
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        {/* Company Header */}
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

            {!sessionStorage.getItem("jwt") || checkIfSaved === false ? (
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
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span>{companyProfile?.industry?.industryName}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Company Profile, Tech Stack, and Office Location Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Giới thiệu</h2>
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
          <h2 className="text-xl font-semibold mb-4">Liên hệ</h2>
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

        {/* Company Images */}
        <h2 className="text-xl font-semibold mb-4">Một số hình ảnh công ty</h2>
        <div className="mb-12">
          {companyProfile?.images && companyProfile?.images.length > 0 ? (
            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              loop={true}
              pagination={{ clickable: true }}
              navigation={true}
              // modules={[Pagination, Navigation]}
            >
              {companyProfile.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image.pathImg}
                    alt={`Company image ${index + 1}`}
                    className="w-full h-[400px] object-cover rounded-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-gray-500">Chưa có thông tin về hình ảnh</p>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">Đánh giá</h2>
        <div className="mt-8 p-4 border rounded-lg bg-gray-100">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Các đánh giá khác</h3>

            {reviews.length === 0 ? (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            ) : (
              // Sắp xếp các đánh giá theo thời gian (mới nhất đến cũ nhất)
              reviews
                .sort((a, b) => new Date(b.createDate) - new Date(a.createDate)) // Sắp xếp theo ngày tạo
                .map((review, index) => (
                  <div
                    key={index}
                    className="mb-6 p-4 border-b border-gray-300 rounded-md"
                  >
                    <div className="flex items-start mb-2">
                      {/* Avatar */}
                      <img
                        src={review?.seeker?.userAccount?.avatar}
                        alt={`${review?.seeker?.userAccount?.userName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover mr-4"
                      />

                      <div>
                        {/* Name and Date */}
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-800">
                            {review?.seeker?.userAccount?.userName
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
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(review?.createDate).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        {/* Rating */}
                        <Rating
                          count={5}
                          value={review.star}
                          size={20}
                          activeColor="#ffd700"
                          edit={false} // Disable editing for existing reviews
                        />
                        {/* Review Message */}
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
              Đánh giá của bạn
            </h2>

            {/* Đánh giá sao */}
            <div className="mb-4">
              <Rating
                count={5}
                onChange={handleRatingChange}
                size={30}
                activeColor="#ffd700"
                value={feedback.star}
              />
            </div>

            {/* Viết review */}
            <textarea
              placeholder="Nhập đánh giá của bạn..."
              value={feedback.message}
              onChange={handleReviewChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Nút gửi */}
            <button
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleSubmitReview}
            >
              Gửi đánh giá
            </button>
          </div>
        )}

        {/* <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Văn phòng</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {company.locations.map((location) => (
              <Card key={location} className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <span>{location}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

    
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Đội ngũ</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {company.team.map((member) => (
              <div key={member.name} className="text-center">
                <img src={member.avatar} alt='avatar' className="w-20 h-20 mx-auto mb-2 rounded-full bg-muted" />
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.position}</p>
              </div>
            ))}
          </div>
        </div>

        
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Phúc lợi</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.benefits.map((benefit) => (
              <Card key={benefit.title} className="p-6">
                <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  {React.createElement(benefit.icon, {
                    className: "w-6 h-6 text-primary"
                  })}
                </div>
                <h3 className="font-medium mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Open Jobs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Vị trí đang tuyển</h2>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  Tiếp theo
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : jobPost.length > 0 ? (
            <div className="grid gap-4">
              {jobPost.map((job) => (
                <JobCard_AllJob
                  key={job.postId}
                  job={{
                    ...job,
                    company: {
                      ...job.company,
                      logo: job.company.logo || "/placeholder.svg",
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có vị trí nào đang tuyển.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}