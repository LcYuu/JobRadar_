import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
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
  Building2,
  Calendar,
  Users,
  Star,
  ExternalLink,
  Share2,
} from "lucide-react";
import ApplyModal from "../../components/common/ApplyModal/ApplyModal";
import JobCard_AllJob from "../../components/common/JobCard_AllJob/JobCard_AllJob";
import { checkIfApplied, getOneApplyJob } from "../../redux/ApplyJob/applyJob.thunk";
import { getJobPostByPostId, getSimilarJobs } from "../../redux/JobPost/jobPost.thunk";
import { saveJob } from "../../redux/Seeker/seeker.thunk";
import Swal from "sweetalert2";
import IndustryBadge from "../../components/common/IndustryBadge/IndustryBadge";

export default function JobDetail() {
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
    dispatch(getOneApplyJob(postId));
    dispatch(checkIfApplied(postId));
    if (!postByPostId || postByPostId.postId !== postId) {
      dispatch(getJobPostByPostId(postId));
    }
  }, [dispatch, postId]);

  useEffect(() => {
    if (modalClosed) {
      dispatch(getOneApplyJob(postId));
      dispatch(checkIfApplied(postId));
      setModalClosed(false);
    }
  }, [modalClosed, dispatch, postId]);

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
          showConfirmButton: false,
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
          showConfirmButton: false,
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Lỗi",
        text: "Có lỗi xảy ra khi thực hiện thao tác",
        icon: "error",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#9333ea",
      });
    }
  };

  const getSkillColor = (index) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-6 hover:bg-gray-100"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Job Header */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-6 flex-1">
                    <div className="relative">
                      <img
                        src={postByPostId?.company.logo || "/placeholder.svg"}
                        alt="Company Logo"
                        className="h-20 w-20 rounded-xl object-cover shadow-sm border border-gray-200"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{postByPostId?.title}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{postByPostId?.company.companyName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{postByPostId?.location}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {postByPostId?.typeOfWork}
                        </Badge>
                      </div>
                      {postByPostId?.salary && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <DollarSign className="h-5 w-5" />
                          <span>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(postByPostId.salary)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {user && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSaveJob}
                        className={`transition-all duration-300 ${
                          isSaved ? "bg-primary text-white border-primary hover:bg-primary/90" : "hover:bg-gray-50"
                        }`}
                        title={isSaved ? "Bỏ lưu công việc" : "Lưu công việc"}
                      >
                        {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </Button>
                    )}
                    <Button variant="outline" size="icon" className="hover:bg-gray-50" title="Chia sẻ công việc">
                      <Share2 className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleOpenModal}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold"
                      disabled={hasApplied}
                    >
                      {hasApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
                    </Button>
                  </div>
                </div>

                {/* Application Status */}
                {oneApplyJob && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Đã ứng tuyển thành công</p>
                        <p className="text-sm text-blue-700">
                          Ngày ứng tuyển: {new Date(oneApplyJob.applyDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    {oneApplyJob.pathCV && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={oneApplyJob.pathCV}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Xem CV
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Job Details Sections */}
            <div className="space-y-6">
              {/* Job Description */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Mô tả công việc
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    {postByPostId?.description?.split("\n").map((line, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed mb-3">
                        {line.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Requirements */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Yêu cầu công việc
                  </h2>
                  <ul className="space-y-3">
                    {postByPostId?.requirement ? (
                      postByPostId.requirement.split("\n").map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-relaxed">{item.trim()}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">Chưa có thông tin</li>
                    )}
                  </ul>
                </div>
              </Card>

              {/* Nice to Have */}
              {postByPostId?.niceToHaves && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-600" />
                      Bạn là người phù hợp nếu
                    </h2>
                    <ul className="space-y-3">
                      {postByPostId.niceToHaves.split("\n").map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Star className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-relaxed">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}

              {/* Benefits */}
              {postByPostId?.benefit && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      Quyền lợi
                    </h2>
                    <ul className="space-y-3">
                      {postByPostId.benefit.split("\n").map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-relaxed">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}
            </div>

            {/* Company Info */}
            <Card>
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <img
                    src={postByPostId?.company.logo || "/placeholder.svg"}
                    alt="Company Logo"
                    className="h-24 w-24 rounded-xl object-cover shadow-sm border border-gray-200"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{postByPostId?.company.companyName}</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">{postByPostId?.company.description}</p>
                    <Button variant="outline" asChild>
                      <Link to={`/companies/${postByPostId?.company.companyId}`} className="flex items-center gap-2">
                        Tìm hiểu thêm về công ty
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Similar Jobs */}
            {similarJobs && similarJobs.length > 0 && (
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Công việc tương tự</h2>
                    <Button variant="outline" size="sm">
                      Xem tất cả
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {similarJobs.slice(0, 3).map((job) => (
                      <div key={job.postId} onClick={handleJobCardClick}>
                        <JobCard_AllJob
                          job={{
                            ...job,
                            company: {
                              ...job.company,
                              logo: job.company.logo || "/placeholder.svg",
                            },
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin công việc</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Hạn nộp</span>
                    </div>
                    <span className="font-medium text-sm">
                      {postByPostId?.expireDate ? new Date(postByPostId.expireDate).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Ngày đăng</span>
                    </div>
                    <span className="font-medium text-sm">
                      {postByPostId?.createDate ? new Date(postByPostId.createDate).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm">Loại công việc</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {postByPostId?.typeOfWork}
                    </Badge>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserCheck className="h-4 w-4" />
                      <span className="text-sm">Vị trí</span>
                    </div>
                    <span className="font-medium text-sm">{postByPostId?.position}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Industries */}
            {postByPostId?.industry && postByPostId.industry.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Lĩnh vực</h3>
                  <div className="flex flex-wrap gap-2">
                    {postByPostId.industry.map((industry) => (
                      <IndustryBadge key={industry.industryId} name={industry.industryName} />
                    ))}
                  </div>
                </div>
              </Card>
            )}
            {/* Skills */}
            {postByPostId?.skills && postByPostId.skills.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Kỹ năng yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {postByPostId.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className={`${getSkillColor(index)} border-0`}>
                        {skill.skillName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <ApplyModal job={postByPostId} open={open} handleClose={handleClose} oneApplyJob={oneApplyJob} />
      </main>
    </div>
  );
}
