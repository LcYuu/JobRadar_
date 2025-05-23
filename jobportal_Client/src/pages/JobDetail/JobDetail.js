import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  ArrowLeft,
  Briefcase,
  UserCheck,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import ApplyModal from "../../components/common/ApplyModal/ApplyModal";
import JobCard_AllJob from "../../components/common/JobCard_AllJob/JobCard_AllJob";
import {
  checkIfApplied,
  getOneApplyJob,
} from "../../redux/ApplyJob/applyJob.thunk";
import {
  getJobPostByPostId,
  getSimilarJobs,
} from "../../redux/JobPost/jobPost.thunk";
import { saveJob } from "../../redux/Seeker/seeker.thunk";
import Swal from "sweetalert2";

export default function JobDetail() {
  const industryStyles = {
    "Thiết kế": {
      backgroundColor: "rgba(255, 99, 71, 0.1)", // Màu đỏ san hô nhạt
      color: "#FF6347", // Màu đỏ san hô
      border: "1px solid #FF6347", // Viền màu đỏ san hô
    },
    "Kinh doanh": {
      backgroundColor: "rgba(138, 43, 226, 0.1)", // Màu tím nhạt
      color: "#8A2BE2", // Màu tím
      border: "1px solid #8A2BE2", // Viền màu tím
    },
    Marketing: {
      backgroundColor: "rgba(255, 140, 0, 0.1)", // Màu cam nhạt
      color: "#FF8C00", // Màu cam
      border: "1px solid #FF8C00", // Viền màu cam
    },
    "Thương mại điện tử": {
      backgroundColor: "rgba(30, 144, 255, 0.1)", // Màu xanh dương đậm nhạt
      color: "#1E90FF", // Màu xanh dương đậm
      border: "1px solid #1E90FF", // Viền màu xanh dương đậm
    },
    "IT phần cứng": {
      backgroundColor: "rgba(0, 0, 255, 0.1)", // Màu xanh dương nhạt
      color: "#0000FF", // Màu xanh dương
      border: "1px solid #0000FF", // Viền màu xanh dương
    },
    "IT phần mềm": {
      backgroundColor: "rgba(0, 255, 255, 0.1)", // Màu xanh dương ngọc nhạt
      color: "#00FFFF", // Màu xanh dương ngọc
      border: "1px solid #00FFFF", // Viền màu xanh dương ngọc
    },
    "Công nghệ ô tô": {
      backgroundColor: "rgba(255, 99, 71, 0.1)", // Màu cam đỏ nhạt
      color: "#FF4500", // Màu cam đỏ
      border: "1px solid #FF4500", // Viền màu cam đỏ
    },
    "Nhà hàng/Khách sạn": {
      backgroundColor: "rgba(255, 105, 180, 0.1)", // Màu hồng nhạt
      color: "#FF69B4", // Màu hồng đậm
      border: "1px solid #FF69B4", // Viền màu hồng đậm
    },

    "Điện - điện tử": {
      backgroundColor: "rgba(70, 130, 180, 0.1)", // Màu xanh thép nhạt
      color: "#4682B4", // Màu xanh thép
      border: "1px solid #4682B4", // Viền màu xanh thép
    },
  };

  // Hàm để lấy màu ngẫu nhiên từ danh sách màu
  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const dispatch = useDispatch();
  const { postId } = useParams();
  const { postByPostId, similarJobs } = useSelector((store) => store.jobPost);
  const { hasApplied, oneApplyJob } = useSelector((store) => store.applyJob);
  const { user } = useSelector((store) => store.auth);
  const { savedJobs } = useSelector((store) => store.seeker);
  const isSaved = savedJobs?.some((savedJob) => savedJob.postId === postId);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [modalClosed, setModalClosed] = useState(false);
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    
    // Load dữ liệu khi component được mount
    dispatch(getOneApplyJob(postId));
    dispatch(checkIfApplied(postId));
    if (!postByPostId || postByPostId.postId !== postId) {
      dispatch(getJobPostByPostId(postId));
    }
  }, [dispatch, postId]); // Chỉ gọi API khi component được mount hoặc postId thay đổi
  
  // Cập nhật khi modal đóng
  useEffect(() => {
    if (modalClosed) {
      // Cập nhật lại thông tin từ server
      dispatch(getOneApplyJob(postId));
      dispatch(checkIfApplied(postId));
      // Reset để không trigger lại
      setModalClosed(false);
    }
  }, [modalClosed, dispatch, postId]);

  // API để lấy công việc tương tự
  useEffect(() => {
    if (postByPostId?.company?.companyId) {
      const companyId = postByPostId?.company?.companyId;
      const excludePostId = postId;
      dispatch(getSimilarJobs({ companyId, excludePostId }));
    }
  }, [dispatch, postByPostId, postId]);

  const handleOpenModal = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để ứng tuyển công việc", {
        position: "top-center",
        duration: 3000,
        style: {
          background: "#FF6B6B",
          color: "white",
        },
      });
      return;
    }
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setModalClosed(true);
  };

  const handleJobCardClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveJob = async (e) => {
    e.stopPropagation();
    if (!user) {
      await Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Vui lòng đăng nhập để thực hiện thao tác này",
        icon: "warning",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#9333ea",
      });
      return;
    }

    try {
      const result = await dispatch(saveJob(postId)).unwrap();
      if (result.action === "saved") {
        await Swal.fire({
          title: "Thành công",
          text: "Đã lưu bài viết thành công",
          icon: "success",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#9333ea",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        await Swal.fire({
          title: "Thành công",
          text: "Đã bỏ lưu bài viết",
          icon: "success",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#9333ea",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Lỗi",
        text: "Có lỗi xảy ra khi thực hiện thao tác",
        icon: "error",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#9333ea"
      });
    }
  };

  console.log("hasApplied:", hasApplied);
  console.log("oneApplyJob:", oneApplyJob);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-6 hover:bg-gray-100"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Button>
        {/* Main content wrapper */}
        <div className="relative">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Left column */}
            <div className="space-y-6">
              <div className="bg-white shadow-md rounded-lg p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4 w-full pr-7">
                  <img
                    src={postByPostId?.company.logo}
                    alt="Company Logo"
                    className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600"
                  />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold break-words">
                      {postByPostId?.title}
                    </h1>
                    <p className="text-sm text-gray-500 font-bold break-words">
                      {postByPostId?.company.companyName} •{" "}
                      {postByPostId?.location} • {postByPostId?.typeOfWork}
                    </p>
                  </div>
                </div>

                {/* Nút Lưu bài viết */}
                <div className="flex-shrink-0">
                  {user && (
                        <button
                        title={isSaved ? 'Bài viết đã được lưu' : 'Lưu bài viết để xem lại sau'}
                          onClick={handleSaveJob}
                          className={`p-3 rounded-full transition-all duration-300 ${
                            isSaved 
                              ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-6 h-6" />
                          ) : (
                            <Bookmark className="w-6 h-6" />
                          )}
                        </button>
                      
                  )}
                </div>

                <section>
                  <ApplyModal
                    job={postByPostId}
                    open={open}
                    handleClose={handleClose}
                    oneApplyJob={oneApplyJob}
                  />
                </section>
              </div>

              {/* Thông báo dưới nút */}
              {oneApplyJob && (
                <div className="flex items-center space-x-2 mt-4">
                  <p className="text-sm text-purple-600">
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
                      className="text-black hover:text-purple-400 ml-4"
                      key={oneApplyJob.pathCV}
                    >
                      Xem CV đã nộp
                    </a>
                  )}
                </div>
              )}

              {/* Job Description */}
              <section className="space-y-4">
                {/* Card for Job Description */}
                <div className="p-6 bg-white rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold">Mô tả</h2>
                  <div className="text-sm text-gray-600">
                    {postByPostId?.description
                      ?.split("\n")
                      .map((line, index) => (
                        <p key={index}>{line.trim()}</p>
                      ))}
                  </div>
                </div>

                {/* Card for Job Responsibilities */}
                <div className="p-6 bg-white rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold">
                    Yêu cầu công việc
                  </h2>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {postByPostId?.requirement ? (
                      postByPostId.requirement
                        .split("\n")
                        .map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{item.trim()}</span>
                          </li>
                        ))
                    ) : (
                      <li className="text-gray-500 italic">
                        Chưa có thông tin
                      </li>
                    )}
                  </ul>
                </div>

                {/* Card for Nice to Have */}
                <div className="p-6 bg-white rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold">
                    Bạn là người phù hợp nếu
                  </h2>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {postByPostId?.niceToHaves ? (
                      postByPostId.niceToHaves
                        .split("\n")
                        .map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{item.trim()}</span>
                          </li>
                        ))
                    ) : (
                      <li className="text-gray-500 italic">
                        Chưa có thông tin
                      </li>
                    )}
                  </ul>
                </div>

                {/* Card for Benefits */}
                <div className="p-6 bg-white rounded-lg shadow-lg">
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
                      <li className="text-gray-500 italic">
                        Chưa có thông tin
                      </li>
                    )}
                  </ul>
                </div>
              </section>

              {/* Company Info */}
              <Card className="relative w-full mx-auto bg-white shadow-md">
                <div className="container mx-auto px-8 py-8">
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
                  </div>
                </div>
              </Card>

              {/* Similar Jobs Section */}
              {similarJobs && similarJobs.length > 0 && (
                <section className="mt-12 bg-white rounded-lg shadow-sm p-4 w-full">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Công việc tương tự
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {postByPostId?.company?.name}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        navigate(`/find-jobs`, {
                          state: {
                            selectedIndustryIds: [
                              postByPostId?.company?.industryId,
                            ],
                          },
                        });
                      }}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Xem tất cả →
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {similarJobs.slice(0, 4).map((job) => (
                      <div key={job.postId} onClick={handleJobCardClick}>
                        <JobCard_AllJob
                          job={{
                            ...job,
                            company: {
                              ...job.company,
                              logo:
                                job.company.logo || "/default-company-logo.png",
                            },
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right column (Sidebar) */}
            <div className="space-y-6">
              <Card className="p-6 bg-white rounded-lg shadow-lg">
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
                      <Briefcase className="h-5 w-5" />
                      <span>Loại công việc</span>
                    </div>
                    <span className="font-medium">
                      {postByPostId?.typeOfWork}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <UserCheck className="h-5 w-5" />
                      <span>Vị trí</span>
                    </div>
                    <span className="font-medium">
                      {postByPostId?.position}
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

              <Card className="p-6 bg-white rounded-lg shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Lĩnh vực</h3>
                  <div className="flex flex-wrap gap-2">
                    {postByPostId?.industry?.map((industry) => (
                      <Badge
                        key={industry.industryId}
                        variant="secondary"
                        style={industryStyles[industry.industryName]}
                      >
                        {industry.industryName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white rounded-lg shadow-lg">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Các kĩ năng cần thiết
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {postByPostId?.skills?.map((skill, index) => (
                      // Áp dụng màu ngẫu nhiên cho mỗi Badge
                      <Badge
                        key={index}
                        className="text-white"
                        style={{ backgroundColor: getRandomColor() }}
                      >
                        {skill.skillName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
