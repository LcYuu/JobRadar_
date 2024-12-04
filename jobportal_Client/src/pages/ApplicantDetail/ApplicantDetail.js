import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  ChevronLeft,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Globe,
  MessageSquare,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tab";
import { useDispatch, useSelector } from "react-redux";
import {
  getCandidateProfile,
  getCandidateSkills,
} from "../../redux/Seeker/seeker.action";
import { getEduCandidate } from "../../redux/Education/edu.action";
import { getExpCandidate } from "../../redux/Experience/exp.action";

import { getCandidateApplyInfo } from "../../redux/ApplyJob/applyJob.action";
import { Card } from "../../ui/card";


const ApplicantDetail = () => {
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const { userId, postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("applicant-profile");
  
  const { profileCandidate, skillsCandidate } = useSelector((store) => store.seeker);
  const { eduCandidate } = useSelector((store) => store.edu);
  const { expCandidate } = useSelector((store) => store.exp);
   const { candidateApplyInfo } = useSelector((store) => store.applyJob);

  useEffect(() => {
    dispatch(getCandidateProfile(userId, postId));
    dispatch(getCandidateSkills(userId));
    dispatch(getEduCandidate(userId));
    dispatch(getExpCandidate(userId));
    dispatch(getCandidateApplyInfo(userId, postId));
  }, [dispatch, userId, postId]);

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

  const contactIcons = {
    email: <Mail className="w-4 h-4 text-gray-500" />,
    phone: <Phone className="w-4 h-4 text-gray-500" />,
  };
console.log(candidateApplyInfo);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/employer/account-management/candidate-management")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Trở lại danh sách 
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-1">
            <div className="text-center">
              <img
                src={profileCandidate?.avatar}
                alt={profileCandidate?.fullName}
                className="w-24 h-24 rounded-full mx-auto mb-3"
              />
              <h1 className="text-xl font-bold">
                {profileCandidate?.fullName}
              </h1>
              <div className="mt-6">
                
                <p className="text-xl font-bold text-gray-600">
                  {profileCandidate?.title}
                </p>
                <p className="text-sm text-gray-500">
                  {profileCandidate?.industryName} •{" "}
                  {profileCandidate?.typeOfWork}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {profileCandidate?.applyDate
                    ? `${timeAgo(profileCandidate.applyDate)}`
                    : "No apply date available"}
                </p>
              </div>
              {/* Contact Information */}
              <div className="mt-6 text-left">
                <h3 className="font-medium text-left mb-4">Thông tin đã điền trên form</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {contactIcons.email}
                    <p className="text-sm text-gray-600">{candidateApplyInfo?.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {contactIcons.phone}
                    <p className="text-sm text-gray-600">{profileCandidate?.phoneNumber}</p>
                  </div>
                  {candidateApplyInfo?.description && (
                    <div className="mt-4 flex items-center">
                      <Info className="w-5 h-5 text-gray-600 mr-2" />
                      <p className="text-sm font-medium">Thông tin thêm</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">{candidateApplyInfo?.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2">
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
                  Hồ sơ ứng viên

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
                  Đơn ứng tuyển
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applicant-profile" className="pt-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-3 space-y-6">
                    <Card className="bg-white rounded-lg p-6 shadow-lg">
                      <h2 className="font-semibold text-purple-600 mb-4">
                        Thông tin cá nhân
                      </h2>
                      <div className="grid grid-cols-2 gap-y-4">
                        <div>
                          <p className="text-xl font-bold text-black">
                            Họ và tên
                          </p>
                          <p className="text-sm">
                            {profileCandidate?.fullName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Giới tính</p>
                          <p className="text-sm">{profileCandidate?.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-sm">{profileCandidate?.emailContact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Số điện thoại</p>
                          <p className="text-sm">{profileCandidate?.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-black">Ngày sinh</p>
                          <p className="text-sm">
                            {profileCandidate?.dateOfBirth ? (
                              <>
                                <span>{new Date(profileCandidate.dateOfBirth).toLocaleDateString("en-GB")}</span>
                                <span>
                                  {" "}
                                  ({calculateAge(
                                    profileCandidate.dateOfBirth
                                  )}{" "}
                                  tuổi)
                                </span>
                              </>
                            ) : (
                              "Không có thông tin ngày sinh"
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Địa chỉ</p>
                          <p className="text-sm">{profileCandidate?.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h2 className="font-semibold mb-4">Thông tin chuyên môn</h2>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm text-gray-600">Giới thiệu</p>
                            <p className="text-sm mt-1">
                              {profileCandidate?.description}
                            </p>
                          </div>

                         <div className="grid grid-cols-2 gap-6">
  {/* Cột bên trái - Kinh nghiệm */}
  <div className="pr-6">
    <p className="text-xl font-bold text-black">Kinh nghiệm</p>
    {/* Kiểm tra nếu có dữ liệu kinh nghiệm */}
    {expCandidate?.length > 0 ? (
      expCandidate.map((exp, index) => (
        <div key={index} className="space-y-4 pb-4">
          <div className="space-y-2 flex items-start">
            <span className="text-green-500 mr-2">⭐</span>
            <p className="text-sm font-semibold">{exp.jobTitle}</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-600">Chưa có kinh nghiệm</p>
    )}
  </div>

  {/* Cột bên phải - Địa chỉ */}
  <div className="col-span-2">
    <p className="text-xl font-bold text-black">Địa chỉ</p>
    <p className="text-sm">{profileCandidate?.address}</p>
  </div>

  {/* Thông tin chuyên môn */}
  <div className="col-span-2">
    <Card className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="font-semibold text-purple-600 mb-4">
        Thông tin chuyên môn
      </h2>
      <div className="space-y-6">
        {/* Giới thiệu */}
        <div>
          <p className="text-xl text-black font-bold">Giới thiệu</p>
          <p className="text-sm mt-1">{profileCandidate?.description}</p>
        </div>
      </div>
    </Card>
  </div>
</div>

                                  {/* Tên công ty */}
                                  <div className="text-sm text-gray-600">
                                    <strong>Công ty:</strong> {exp.companyName}
                                  </div>

                                  {/* Ngày bắt đầu và kết thúc */}

                                  <div className="text-sm text-gray-600">
                                    <strong>Ngày bắt đầu:</strong>{" "}
                                    {exp.startDate}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <strong>Ngày kết thúc:</strong>{" "}
                                    {exp.endDate || "Hiện tại"}
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
                            <p className="text-xl font-bold text-black">
                              Học vấn
                            </p>
                            {eduCandidate?.length > 0 ? (
                              eduCandidate.map((edu, index) => (
                                <div key={index} className="space-y-4 pb-4">
                                  <div className="space-y-2 flex items-start">

                                    <span className="text-green-500 mr-2">
                                      ⭐
                                    </span>
                                    <p className="text-sm font-semibold">
                                      {edu?.certificateDegreeName}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No education information available.
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Các kỹ năng</p>
                            {skillsCandidate?.skills?.length > 0 ? (
                              <div className="flex gap-2 mt-1">
                                {skillsCandidate.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="text-sm text-indigo-600 flex items-center"
                                  >
                                    <span className="text-green-500 mr-2">
                                      ✔️
                                    </span>
                                    {skill.skillName}
                                  </span>
                                ))}
                              </div>

                                  {/* Ngày bắt đầu và kết thúc */}
                                  <div className="text-sm text-gray-600">
                                    <strong>Ngày bắt đầu:</strong>{" "}
                                    {edu?.startDate}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <strong>Ngày kết thúc:</strong>{" "}
                                    {edu?.endDate || "Hiện tại"}
                                  </div>

                                  {/* Major */}
                                  <div className="text-sm text-gray-600">
                                    <strong>Chuyên ngành:</strong>{" "}
                                    {edu?.major || "Không có thông tin"}
                                  </div>

                                  {/* Tên tổ chức */}
                                  <div className="text-sm text-gray-600">
                                    <strong>Tổ chức:</strong>{" "}
                                    {edu?.universityName ||
                                      "Không có thông tin"}
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
                          <p className="text-xl font-bold text-black">
                            Kỹ năng
                          </p>
                          {skillsCandidate?.skills?.length > 0 ? (
                            <div className="flex gap-2 mt-1">
                              {skillsCandidate.skills.map((skill, index) => (
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
              </TabsContent>

              <TabsContent value="resume">
                <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
                  <h2 className="font-semibold mb-4 text-purple-600">Resume</h2>
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                    {profileCandidate?.pathCV ? (
                      <iframe
                        src={profileCandidate.pathCV}
                        className="w-full h-full rounded-lg"
                        title="Resume Preview"
                      ></iframe>
                    ) : (
                      <p className="text-gray-500">Không tìm thấy CV</p>
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
