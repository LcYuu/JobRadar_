import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tab";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../../ui/card";
import {
  getCandidateProfile,
  getCandidateSkills,
} from "../../redux/Seeker/seeker.thunk";
import { getEduCandidate } from "../../redux/Education/edu.thunk";
import { getExpCandidate } from "../../redux/Experience/exp.thunk";
import { getCandidateApplyInfo } from "../../redux/ApplyJob/applyJob.thunk";
import { fetchSocialLinksByUserId } from "../../redux/SocialLink/socialLink.thunk";

const ApplicantDetail = () => {
  const colors = useMemo(
    () => ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
    []
  );
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const { userId, postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("applicant-profile");
  const { profileCandidate, skillsCandidate } = useSelector(
    (store) => store.seeker
  );
  const { eduCandidate } = useSelector((store) => store.edu);
  const { expCandidate } = useSelector((store) => store.exp);
  const { candidateApplyInfo } = useSelector((store) => store.applyJob);
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
    dispatch(getCandidateProfile({ userId, postId }));
    dispatch(getCandidateSkills(userId));
    dispatch(getEduCandidate(userId));
    dispatch(getExpCandidate(userId));
    dispatch(getCandidateApplyInfo({ userId, postId }));
    dispatch(fetchSocialLinksByUserId(userId));
  }, [dispatch, userId, postId]);

  const contactIcons = {
    email: <Mail className="w-4 h-4 text-gray-500" />,
    phone: <Phone className="w-4 h-4 text-gray-500" />,
  };

  return (
    <div className="p-3 xs:p-3 sm:p-6 max-w-7xl mx-auto">
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
      <div className="bg-white rounded-lg p-3 xs:p-3 sm:p-6 shadow-sm mb-4 sm:mb-6">
        <div className="grid grid-cols-1 custom-1350:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div>
            <div className="text-center">
              <img
                src={profileCandidate?.avatar}
                alt={profileCandidate?.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3"
              />
              <h1 className="text-lg xs:text-base sm:text-xl font-bold">
                {profileCandidate?.fullName}
              </h1>

              <div className="mt-4 sm:mt-6">
                <p className="text-lg xs:text-base sm:text-xl font-bold text-gray-600">
                  {profileCandidate?.title}
                </p>
                <div className="text-xs xs:text-xs sm:text-sm text-gray-500">
                  <p>
                    {profileCandidate?.industryName?.map((industry, index) => (
                      <span key={index}>
                        {index > 0 && " • "} {industry}
                      </span>
                    ))}
                  </p>
                  <p className="break-words">{profileCandidate?.typeOfWork}</p>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {profileCandidate?.applyDate
                    ? `${timeAgo(profileCandidate.applyDate)}`
                    : "Không có ngày nộp đơn"}
                </p>
              </div>

              <div className="mt-6 sm:mt-10">
                <h3 className="font-medium text-left mb-4 text-base xs:text-sm sm:text-lg">
                  Thông tin liên hệ trên form
                </h3>
                <div className="space-y-3">
                  {candidateApplyInfo ? (
                    <>
                      {candidateApplyInfo?.email && (
                        <div className="flex items-center gap-3 text-left">
                          {contactIcons.email}
                          <span className="text-xs xs:text-xs sm:text-sm text-gray-600 break-words">
                            {candidateApplyInfo.email}
                          </span>
                        </div>
                      )}

                      {candidateApplyInfo?.description && (
                        <div className="mt-4">
                          <h4 className="font-medium text-left mb-2 text-sm xs:text-xs sm:text-base">
                            Thông tin thêm
                          </h4>
                          <p className="text-xs xs:text-xs sm:text-sm break-words">
                            {candidateApplyInfo.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs xs:text-xs sm:text-sm text-gray-500">
                      Đang tải thông tin...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="custom-1350:col-span-2">
            <Tabs defaultValue="applicant-profile" className="w-full">
              <TabsList className="border-b border-gray-200">
                <TabsTrigger
                  value="applicant-profile"
                  className={`px-4 py-2 -mb-px ${
                    activeTab === "applicant-profile"
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("applicant-profile")}
                >
                  Thông tin ứng viên
                </TabsTrigger>
                <TabsTrigger
                  value="resume"
                  className={`px-4 py-2 -mb-px ${
                    activeTab === "resume"
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("resume")}
                >
                  Hồ sơ cá nhân
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applicant-profile" className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 custom:grid-cols-3 gap-4 sm:gap-6">
                  <div className="custom:col-span-3 space-y-6">
                    <Card className="bg-white rounded-lg p-3 xs:p-3 sm:p-6 shadow-lg">
                      <h2 className="font-semibold text-purple-600 mb-4 text-base xs:text-sm sm:text-lg">
                        Thông tin cá nhân
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 xs:gap-y-3 sm:gap-4 xs:gap-x-2">
                        <div className="min-w-0">
                          <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                            Họ và tên
                          </p>
                          <p className="text-xs xs:text-xs sm:text-base break-words">
                            {profileCandidate?.fullName}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                            Giới tính
                          </p>
                          <p className="text-xs xs:text-xs sm:text-base break-words">
                            {profileCandidate?.gender}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                            Email
                          </p>
                          <p className="text-xs xs:text-xs sm:text-base break-words">
                            {profileCandidate?.emailContact}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                            Số điện thoại
                          </p>
                          <p className="text-xs xs:text-xs sm:text-base break-words">
                            {profileCandidate?.phoneNumber}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                            Ngày sinh
                          </p>
                          <p className="text-xs xs:text-xs sm:text-base break-words">
                            {profileCandidate?.dateOfBirth ? (
                              <>
                                <span>
                                  {new Date(
                                    profileCandidate.dateOfBirth
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </span>
                                <span>
                                  {" "}
                                  ({calculateAge(profileCandidate.dateOfBirth)}{" "}
                                  tuổi)
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
                            {profileCandidate?.address}
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
                      <h2 className="font-semibold text-purple-600 mb-4 text-base xs:text-sm sm:text-lg">
                        Thông tin chuyên môn
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <p className="text-base xs:text-sm sm:text-xl font-bold text-black">
                            Giới thiệu
                          </p>
                          <p className="text-xs xs:text-xs sm:text-base mt-1 break-words">
                            {profileCandidate?.description}
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
                          {skillsCandidate?.skills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {skillsCandidate.skills.map((skill, index) => (
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
              </TabsContent>

              <TabsContent value="resume">
                <div className="bg-white rounded-lg p-3 xs:p-3 sm:p-6 shadow-sm mt-4 sm:mt-6">
                  <h2 className="font-semibold mb-4 text-purple-600 text-base xs:text-sm sm:text-lg">
                    Hồ sơ cá nhân
                  </h2>
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {profileCandidate?.pathCV ? (
                      <iframe
                        src={profileCandidate.pathCV}
                        className="w-full h-full rounded-lg"
                        title="Resume Preview"
                      ></iframe>
                    ) : (
                      <p className="text-xs xs:text-xs sm:text-sm text-gray-500">
                        Không tìm thấy CV
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;