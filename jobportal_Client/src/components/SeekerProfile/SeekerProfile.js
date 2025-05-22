import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../ui/button";
import { ChevronLeft } from "lucide-react";
import { Card } from "../../ui/card";
import { useDispatch, useSelector } from "react-redux";
import { getEduCandidate } from "../../redux/Education/edu.thunk";
import { getExpCandidate } from "../../redux/Experience/exp.thunk";
import { fetchSocialLinksByUserId } from "../../redux/SocialLink/socialLink.thunk";
import React, { useEffect, useMemo } from "react";
import {
  findReviewByCompanyIdAndUserId,
  getReviewByCompany,
} from "../../redux/Review/review.thunk";
import { StarRounded } from "@mui/icons-material";

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

const SeekerProfile = () => {
  const colors = useMemo(
    () => ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
    []
  );
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const { companyId, userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { review, reviews } = useSelector((store) => store.review);
  const { eduCandidate } = useSelector((store) => store.edu);
  const { expCandidate } = useSelector((store) => store.exp);
  const { socialLinks } = useSelector((store) => store.socialLink);

  const timeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} năm trước`;
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  useEffect(() => {
    dispatch(getReviewByCompany(companyId));
    dispatch(findReviewByCompanyIdAndUserId({ companyId, userId }));
    dispatch(getEduCandidate(userId));
    dispatch(getExpCandidate(userId));
    dispatch(fetchSocialLinksByUserId(userId));
  }, [dispatch, companyId, userId]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-red-600 text-white hover:text-white hover:bg-red-400"
        >
          <ChevronLeft className="w-4 h-4" />
          Trở lại
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
        <div className="grid grid-cols-1 custom-1350:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div>
            <div className="text-center">
              <img
                src={review?.seeker.userAccount.avatar}
                alt={review?.seeker.userAccount.userName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3"
              />
              <h1 className="text-lg sm:text-xl font-bold">
                {review?.seeker.userAccount.userName}
              </h1>

              <div className="mt-4 sm:mt-6">
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={review?.company.logo}
                    alt={review?.company.companyName}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded"
                  />
                  <p className="text-lg sm:text-xl font-bold text-gray-600">
                    {review?.company.companyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-sm sm:text-base">
                  {reviews.length > 0
                    ? (
                        reviews.reduce(
                          (total, review) => total + review.star,
                          0
                        ) / reviews.length
                      ).toFixed(1)
                    : "0.0"}
                </span>
              </div>

              <div className="mt-6 sm:mt-10">
                <h3 className="font-medium text-left mb-4 text-base sm:text-lg">
                  Thông tin đánh giá
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                      Số sao:
                    </span>
                    <RatingStars value={review?.star} readOnly />
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-left mb-2 text-sm sm:text-base">
                      Nội dung đánh giá
                    </h4>
                    {review?.anonymous && (
                      <p className="text-gray-500 italic text-sm">
                        (Đây là đánh giá ẩn danh)
                      </p>
                    )}
                    <p className="text-gray-700 text-sm sm:text-base break-words">
                      {review?.message}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Được đánh giá vào:{" "}
                    {new Date(review?.createDate).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="custom-1350:col-span-2">
            <div className="grid grid-cols-1 custom:grid-cols-3 gap-4 sm:gap-6">
              <div className="custom:col-span-3 space-y-6">
                <Card className="bg-white rounded-lg p-3 xs:p-3 sm:p-6 shadow-lg">
                  <h2 className="font-semibold text-purple-600 mb-4 text-base sm:text-lg">
                    Thông tin cá nhân
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 xs:gap-y-3 sm:gap-4 xs:gap-x-2">
                    <div className="min-w-0">
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Họ và tên
                      </p>
                      <p className="text-xs xs:text-xs sm:text-base break-words">
                        {review?.seeker.userAccount.userName}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Giới tính
                      </p>
                      <p className="text-xs xs:text-xs sm:text-base break-words">
                        {review?.seeker.gender}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Email
                      </p>
                      <p className="text-xs xs:text-xs sm:text-base break-words">
                        {review?.seeker.emailContact}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Số điện thoại
                      </p>
                      <p className="text-xs xs:text-xs sm:text-base break-words">
                        {review?.seeker.phoneNumber}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Ngày sinh
                      </p>
                      <p className="text-xs xs:text-xs sm:text-base break-words">
                        {review?.seeker.dateOfBirth ? (
                          <>
                            <span>
                              {new Date(
                                review?.seeker.dateOfBirth
                              ).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                            <span>
                              {" "}
                              ({calculateAge(review?.seeker.dateOfBirth)} tuổi)
                            </span>
                          </>
                        ) : (
                          "Không có thông tin ngày sinh"
                        )}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Địa chỉ
                      </p>
                      <p className="text-xs xs:text-xs sm:text-base break-words">
                        {review?.seeker?.address}
                      </p>
                    </div>
                  </div>

                  <p className="text-base xs:text-sm sm:text-xl font-bold text-black mt-4">
                    Liên kết xã hội
                  </p>
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
                              src={
                                require(`../../assets/images/platforms/${link.platform.toLowerCase()}.png`).default
                              }
                              alt={link.platform.toLowerCase()}
                              className="h-full w-full object-contain rounded-full shadow-md"
                            />
                          </div>
                          <a
                            href={link.url}
                            className="text-xs xs:text-xs sm:text-base text-blue-600 truncate"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ maxWidth: "calc(100% - 28px)" }}
                          >
                            {link.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs xs:text-xs sm:text-base">
                      Không có liên kết xã hội nào
                    </p>
                  )}
                </Card>

                <Card className="bg-white rounded-lg p-3 xs:p-3 sm:p-6 shadow-lg">
                  <h2 className="font-semibold text-purple-600 mb-4 text-base sm:text-lg">
                    Thông tin chuyên môn
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Giới thiệu
                      </p>
                      <p className="text-xs xs:text-xs sm:text-base mt-1 break-words">
                        {review?.seeker.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-3 sm:gap-6">
                      <div className="min-w-0">
                        <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                          Kinh nghiệm
                        </p>
                        {expCandidate?.length > 0 ? (
                          expCandidate.map((exp, index) => (
                            <div key={index} className="space-y-4 pb-4">
                              <div className="space-y-2 flex items-start">
                                <span className="text-green-500 mr-2">⭐</span>
                                <p className="text-xs xs:text-xs sm:text-base font-semibold break-words">
                                  {exp.jobTitle}
                                </p>
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Công ty:</strong> {exp.companyName}
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Ngày bắt đầu: </strong>
                                {exp.startDate
                                  ? new Date(exp.startDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Không có"}
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Ngày kết thúc: </strong>
                                {exp.endDate
                                  ? new Date(exp.endDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Hiện tại"}
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Mô tả:</strong>{" "}
                                {exp.description || "Không có mô tả"}
                              </div>
                              {index < expCandidate.length - 1 && (
                                <div className="border-t border-gray-400 mt-4"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs xs:text-xs sm:text-base text-gray-500">
                            Không có thông tin kinh nghiệm.
                          </p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                          Học vấn
                        </p>
                        {eduCandidate?.length > 0 ? (
                          eduCandidate.map((edu, index) => (
                            <div key={index} className="space-y-4 pb-4">
                              <div className="space-y-2 flex items-start">
                                <span className="text-green-500 mr-2">⭐</span>
                                <p className="text-xs xs:text-xs sm:text-base font-semibold break-words">
                                  {edu?.certificateDegreeName}
                                </p>
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Ngày bắt đầu: </strong>
                                {edu?.startDate
                                  ? new Date(edu.startDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Không có"}
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Ngày kết thúc: </strong>
                                {edu?.endDate
                                  ? new Date(edu.endDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Hiện tại"}
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Chuyên ngành:</strong>{" "}
                                {edu?.major || "Không có thông tin"}
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>Tổ chức:</strong>{" "}
                                {edu?.universityName || "Không có thông tin"}
                              </div>
                              <div className="text-xs xs:text-xs sm:text-base text-gray-600 break-words">
                                <strong>GPA:</strong>{" "}
                                {edu?.gpa || "Chưa có GPA"}
                              </div>
                              {index < eduCandidate.length - 1 && (
                                <div className="border-t border-gray-400 mt-4"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs xs:text-xs sm:text-base text-gray-500">
                            Không có thông tin học vấn.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                        Kỹ năng
                      </p>
                      {review?.seeker?.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {review?.seeker.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="text-xs xs:text-xs sm:text-base text-white flex items-center px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: getRandomColor(),
                              }}
                            >
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs xs:text-xs sm:text-base text-gray-500">
                          Không có thông tin kỹ năng.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeekerProfile;