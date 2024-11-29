import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Globe,
  Calendar,
  Building2,
  Trophy,
  Linkedin,
  Twitter,
  Facebook,
  Github,
} from "lucide-react";
import logo from "../../assets/images/common/logo.jpg";
import ApplyModal from "../../components/common/ApplyModal/ApplyModal";
import JobCard_AllJob from "../../components/common/JobCard_AllJob/JobCard_AllJob";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../redux/store";
import { getJobPostByPostId } from "../../redux/JobPost/jobPost.action";
import {
  checkIfApplied,
  getOneApplyJob,
} from "../../redux/ApplyJob/applyJob.action";

export default function JobDetail() {
  const dispatch = useDispatch();
  const { postId } = useParams();
  const { postByPostId } = useSelector((store) => store.jobPost);
  const { hasApplied, oneApplyJob } = useSelector((store) => store.applyJob);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    dispatch(getOneApplyJob(postId));
    dispatch(checkIfApplied(postId));
    dispatch(getJobPostByPostId(postId));
  }, [dispatch, postId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Main content wrapper */}
        <div className="relative">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Left column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={postByPostId?.company.logo}
                    alt="Company Logo"
                    className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600"
                  />
                  <div>
                    <h1 className="text-2xl font-bold">
                      {postByPostId?.title}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {postByPostId?.company.companyName} •{" "}
                      {postByPostId?.location} • {postByPostId?.typeOfWork}
                    </p>
                  </div>
                </div>

                {/* Nút Nộp đơn hoặc Cập nhật đơn */}
                {hasApplied ? (
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    onClick={handleOpenModal} // Cho phép người dùng mở modal để cập nhật
                  >
                    Cập nhật đơn
                  </button>
                ) : (
                  <Button
                    variant="default"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    onClick={handleOpenModal}
                  >
                    Nộp đơn
                  </Button>
                )}

                <section>
                  <ApplyModal
                    job={postByPostId}
                    open={open}
                    handleClose={handleClose}
                    oneApplyJob={oneApplyJob} // Truyền dữ liệu đơn đ nộp nếu có
                  />
                </section>
              </div>

              {/* Thông báo dưới nút */}
              {oneApplyJob && (
                <div className="flex items-center space-x-2 mt-4">
                  <p className="text-sm text-gray-500">
                    Đơn ứng tuyển đã được cập nhật vào lúc{" "}
                    {new Date(oneApplyJob.applyDate).toLocaleDateString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  {oneApplyJob.pathCV && (
                    <a
                      href={oneApplyJob.pathCV}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 ml-4"
                    >
                      Xem CV đã nộp
                    </a>
                  )}
                </div>
              )}

              {/* Job Description */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Mô tả</h2>
                <div className="text-sm text-gray-600">
                  {postByPostId?.description?.split("\n").map((line, index) => (
                    <p key={index}>{line.trim()}</p>
                  ))}
                </div>
              </section>

              {/* Nicetohaves */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Trách nhiệm công việc</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {postByPostId?.requirement ? (
                    postByPostId.requirement.split("\n").map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{item.trim()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">Chưa có thông tin</li>
                  )}
                </ul>
              </section>

              {/* Requirements */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">
                  Bạn là người phù hợp nếu
                </h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {postByPostId?.niceToHaves ? (
                    postByPostId.niceToHaves.split("\n").map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{item.trim()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">Chưa có thông tin</li>
                  )}
                </ul>
              </section>

              {/* Benefits */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Quyền lợi</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {postByPostId?.benefit ? (
                    postByPostId.benefit.split("\n").map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{item.trim()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">Chưa có thông tin</li>
                  )}
                </ul>
              </section>

              {/* Company Info */}
              <section className="relative w-full -mx-4 lg:-mx-8 bg-white shadow-md">
                <div className="container mx-auto px-4 py-8">
                  <div className="flex flex-col lg:flex-row items-start justify-between space-y-6 lg:space-y-0">
                    {/* Company Info Left Side */}
                    <div className="flex items-start space-x-6 flex-1">
                      <img
                        src={postByPostId?.company.logo}
                        alt="Company Logo"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold">
                            {postByPostId?.company.companyName}
                          </h2>
                          <Link
                            to={`/companies/${postByPostId?.company.companyId}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Tìm hiểu thêm về {postByPostId?.company.companyName}{" "}
                            →
                          </Link>
                        </div>
                        <p className="text-sm text-gray-600 max-w-2xl">
                          {postByPostId?.company.companyName}{" "}
                          {postByPostId?.company.description}.
                        </p>
                      </div>
                    </div>

                    {/* Company Images Right Side */}
                    {/* <div className="lg:w-1/3 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <img
                          src={logo}
                          alt="Main office"
                          className="h-48 w-full rounded-lg object-cover"
                        />
                        <div className="grid grid-rows-2 gap-4">
                          <img
                            src={logo}
                            alt="Team meeting"
                            className="h-[112px] w-full rounded-lg object-cover"
                          />
                          <img
                            src={logo}
                            alt="Office workspace"
                            className="h-[112px] w-full rounded-lg object-cover"
                          />
                        </div>
                      </div> */}

                    {/* Quick Stats
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold mb-3">Thống kê nhanh</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">95%</p>
                            <p className="text-xs text-gray-500">Tỷ lệ hài lòng</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">4.8</p>
                            <p className="text-xs text-gray-500">Đánh giá trung bình</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">200+</p>
                            <p className="text-xs text-gray-500">Dự án đã hoàn thành</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">50+</p>
                            <p className="text-xs text-gray-500">Khách hàng</p>
                          </div>
                        </div>
                      </div> */}
                    {/* </div> */}
                  </div>
                </div>
              </section>
            </div>

            {/* Right column (Sidebar) */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Thông tin khác</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <span>Hạn nộp</span>
                    </div>
                    <span className="font-medium">
                      {postByPostId?.expireDate
                        ? new Date(postByPostId.expireDate).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <span>Ngày đăng bài</span>
                    </div>
                    <span className="font-medium">
                      {postByPostId?.createDate
                        ? new Date(postByPostId.createDate).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>Loại công việc</span>
                    </div>
                    <span className="font-medium">
                      {postByPostId?.typeOfWork}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-5 w-5" />
                      <span>Lương</span>
                    </div>
                    <span className="font-medium">
                      {postByPostId?.salary
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(postByPostId.salary)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lĩnh vực</h3>
                <div className="flex flex-wrap gap-2">
                  {/* {job.categories.map((category, index) => ( */}
                  <Badge variant="secondary">
                    {postByPostId?.company.industry.industryName}
                  </Badge>
                  {/* ))} */}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Các kĩ năng cần thiết</h3>
                <div className="flex flex-wrap gap-2">
                  {postByPostId?.skills?.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill.skillName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {/* <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Công việc tương tự</h2>
            <Link
              to="#"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Hiển thị tất cả
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similarJobs.map((job) => (
              <JobCard_AllJob
                key={job.id}
                job={{
                  postId: job.id,
                  title: job.title,
                  company: {
                    companyName: job.company,
                    logo: logo,
                    industry: {
                      industryNames: job.categories,
                    },
                  },
                  city: {
                    cityName: job.location,
                  },
                  typeOfWork: job.type,
                  categories: job.categories,
                }}
              />
            ))}
          </div>
        </section> */}
      </main>
    </div>
  );
}
