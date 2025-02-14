import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../ui/button";
import { ChevronLeft } from "lucide-react";
import { Card } from "../../ui/card";
import { useDispatch, useSelector } from "react-redux";
import { getEduCandidate } from "../../redux/Education/edu.thunk";
import { getExpCandidate } from "../../redux/Experience/exp.thunk";
import { fetchSocialLinksByUserId } from "../../redux/SocialLink/socialLink.thunk";
import React, { useEffect } from "react";
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
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };
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

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} years ago`;
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

  //   const contactIcons = {
  //     email: <Mail className="w-4 h-4 text-gray-500" />,
  //     phone: <Phone className="w-4 h-4 text-gray-500" />,
  //   };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-red-600 text-white hover:text-white hover:bg-red-400"
        >
          <ChevronLeft className="w-4 h-4" />
          Trở lại
        </Button>

        {/* <Button variant="outline">More Action</Button> */}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-1">
            <div className="text-center">
              <img
                src={review?.seeker.userAccount.avatar}
                alt={review?.seeker.userAccount.userName}
                className="w-24 h-24 rounded-full mx-auto mb-3"
              />
              <h1 className="text-xl font-bold">
                {review?.seeker.userAccount.userName}
              </h1>

              <div className="mt-6">
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={review?.company.logo}
                    alt={review?.company.companyName}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <p className="text-xl font-bold text-gray-600">
                    {review?.company.companyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">
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

              <div className="mt-10">
                <h3 className="font-medium text-left mb-4">
                  Thông tin đánh giá
                </h3>
                <div className="space-y-3">
                  <>
                    {/* Hiển thị số sao */}

                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-800">Số sao:</span>
                      <RatingStars value={review?.star} readOnly />
                    </div>

                    {/* Hiển thị nội dung đánh giá */}

                    <div className="mt-4">
                      <h4 className="font-medium text-left mb-2">
                        Nội dung đánh giá
                      </h4>
                      {review?.anonymous && (
                        <p className="text-gray-500 italic">
                          (Đây là đánh giá ẩn danh)
                        </p>
                      )}
                      <p className="text-gray-700">{review?.message}</p>
                    </div>

                    {/* Hiển thị thời gian đánh giá */}

                    <p className="text-xs text-gray-500">
                      Được đánh giá vào:{" "}
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
                    </p>
                  </>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              {/* <div className="col-span-1 space-y-6"> */}
              {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h2 className="font-semibold mb-4">Applied Jobs</h2>
                      <div className="space-y-2">
                        <p className="font-medium">{applicant.appliedJob.title}</p>
                        <p className="text-sm text-gray-600">
                          {applicant.appliedJob.department} • {applicant.appliedJob.type}
                        </p>
                        <p className="text-sm text-gray-500">{applicant.appliedJob.appliedDate}</p>
                        <div className="mt-4">
                          <p className="text-sm mb-2">Stage: {applicant.appliedJob.stage}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${applicant.appliedJob.progress}%`}}
                            />
                          </div>
                        </div>
                      </div>
                    </div> */}

              {/* <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h2 className="font-semibold mb-4">Contact</h2>
                      <div className="space-y-4">
                        {Object.entries(applicant.contact).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-3">
                            {contactIcons[key]}
                            <div>
                              <p className="text-sm">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div> */}
              {/* </div> */}

              {/* Right Column */}
              <div className="col-span-3 space-y-6">
                <Card className="bg-white rounded-lg p-6 shadow-lg">
                  <h2 className="font-semibold text-purple-600 mb-4">
                    Thông tin cá nhân
                  </h2>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-xl font-bold text-black">Họ và tên</p>
                      <p className="text-sm">
                        {review?.seeker.userAccount.userName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-black">Giới tính</p>
                      <p className="text-sm">{review?.seeker.gender}</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-black">Email</p>
                      <p className="text-sm">{review?.seeker.emailContact}</p>
                    </div>

                    <div>
                      <p className="text-xl font-bold text-black">
                        Số điện thoại
                      </p>
                      <p className="text-sm">{review?.seeker.phoneNumber}</p>
                    </div>

                    <div>
                      <p className="text-xl font-bold text-black">Ngày sinh</p>
                      <p className="text-sm">
                        {review?.seeker.dateOfBirth ? (
                          <>
                            <span>
                              {review?.seeker.dateOfBirth
                                ? new Date(
                                    review?.seeker.dateOfBirth
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "Không có ngày sinh"}
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

                    <div>
                      <p className="text-xl font-bold text-black">Địa chỉ</p>
                      <p className="text-sm">{review?.seeker?.address}</p>
                    </div>
                  </div>

                  <p className="text-xl font-bold text-black">
                    Liên kết xã hội
                  </p>
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
                </Card>

                <Card className="bg-white rounded-lg p-6 shadow-lg">
                  <h2 className="font-semibold text-purple-600 mb-4">
                    Thông tin chuyên môn
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xl text-black font-bold">Giới thiệu</p>
                      <p className="text-sm mt-1">
                        {review?.seeker.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Cột bên trái - Kinh nghiệm */}
                      <div className="pr-6">
                        <p className="text-xl font-bold text-black">
                          Kinh nghiệm
                        </p>
                        {expCandidate?.length > 0 ? (
                          expCandidate.map((exp, index) => (
                            <div key={index} className="space-y-4 pb-4">
                              <div className="space-y-2 flex items-start">
                                <span className="text-green-500 mr-2">⭐</span>
                                <p className="text-sm font-semibold">
                                  {exp.jobTitle}
                                </p>
                              </div>

                              {/* Tên công ty */}
                              <div className="text-sm text-gray-600">
                                <strong>Công ty:</strong> {exp.companyName}
                              </div>

                              {/* Ngày bắt đầu và kết thúc */}

                              <div className="text-sm text-gray-600">
                                <strong>Ngày bắt đầu: </strong>
                                {exp.startDate
                                  ? new Date(exp.startDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Không có"}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Ngày kết thúc: </strong>
                                {exp.endDate
                                  ? new Date(exp.endDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Hiện tại"}
                              </div>

                              {/* Mô tả */}
                              <div className="text-sm text-gray-600">
                                <strong>Mô tả:</strong>{" "}
                                {exp.description || "Không có mô tả"}
                              </div>

                              {/* Đường viền ngăn cách giữa các kinh nghiệm */}
                              {index < expCandidate.length - 1 && (
                                <div className="border-t border-gray-400 mt-4"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            Không có thông tin kinh nghiệm.
                          </p>
                        )}
                      </div>

                      {/* Cột bên phải - Học vấn */}
                      <div className="pl-6">
                        <p className="text-xl font-bold text-black">Học vấn</p>
                        {eduCandidate?.length > 0 ? (
                          eduCandidate.map((edu, index) => (
                            <div key={index} className="space-y-4 pb-4">
                              <div className="space-y-2 flex items-start">
                                <span className="text-green-500 mr-2">⭐</span>
                                <p className="text-sm font-semibold">
                                  {edu?.certificateDegreeName}
                                </p>
                              </div>

                              {/* Ngày bắt đầu và kết thúc */}
                              <div className="text-sm text-gray-600">
                                <strong>Ngày bắt đầu: </strong>
                                {edu?.startDate
                                  ? new Date(edu.startDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Không có"}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Ngày kết thúc: </strong>
                                {edu?.endDate
                                  ? new Date(edu.endDate).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Hiện tại"}
                              </div>

                              {/* Major */}
                              <div className="text-sm text-gray-600">
                                <strong>Chuyên ngành:</strong>{" "}
                                {edu?.major || "Không có thông tin"}
                              </div>

                              {/* Tên tổ chức */}
                              <div className="text-sm text-gray-600">
                                <strong>Tổ chức:</strong>{" "}
                                {edu?.universityName || "Không có thông tin"}
                              </div>

                              {/* GPA */}
                              <div className="text-sm text-gray-600">
                                <strong>GPA:</strong>{" "}
                                {edu?.gpa || "Chưa có GPA"}
                              </div>

                              {/* Đường viền ngăn cách giữa các học vấn */}
                              {index < eduCandidate.length - 1 && (
                                <div className="border-t border-gray-400 mt-4"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            Không có thông tin học vấn.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xl font-bold text-black">Kỹ năng</p>
                      {review?.seeker?.skills?.length > 0 ? (
                        <div className="flex gap-2 mt-1">
                          {review?.seeker.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="text-sm text-white flex items-center px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: getRandomColor(), // Áp dụng màu ngẫu nhiên cho Badge
                              }}
                            >
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
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
