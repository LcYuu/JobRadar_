import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import {
  Building2,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle2,
  Globe,
  AlertTriangle,
  ArrowLeft,
  Check,
  FileX,
  ArrowRight,
  Briefcase,
  Code,
  FileText,
  UserCheck,
} from "lucide-react";
import {
  approveJob,
  getJobPostByPostId,
} from "../../../redux/JobPost/jobPost.thunk";

export default function JobDetailAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { postId } = useParams();
  const { postByPostId: job, loading, error } = useSelector((store) => store.jobPost);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!postId) return;
      await dispatch(getJobPostByPostId(postId));
    };
    fetchJobDetails();
  }, [dispatch, postId]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 800;
  const isMidRange = windowWidth >= 800 && windowWidth <= 1485;
  const fontSize = isMobile ? "text-xs" : isMidRange ? "text-sm" : "text-sm";
  const padding = isMobile ? "p-2" : isMidRange ? "p-3" : "p-4";

  const formatSalary = (salary) => {
    if (!salary) return "Thương lượng";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(salary);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleApprove = async () => {
    await dispatch(approveJob(job.postId));
    dispatch(getJobPostByPostId(postId));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen max-w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-full">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className={`text-base custom-800:text-lg text-red-500 font-medium ${fontSize}`}>
          {error || "Có lỗi xảy ra khi tải thông tin công việc"}
        </p>
      </div>
    );

  if (!job)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-full">
        <FileX className="h-12 w-12 text-gray-400 mb-4" />
        <p className={`text-base custom-800:text-lg text-gray-600 font-medium ${fontSize}`}>
          Không tìm thấy công việc
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-4 custom-1360:py-8 max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <Card className="bg-white rounded-lg shadow-md p-4 custom-1360:p-6 mb-6">
          <div className="flex flex-col custom-800:flex-row custom-800:justify-between custom-800:items-center gap-4 mb-6">
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-gray-100 w-full custom-800:w-auto"
              onClick={() => navigate("/admin/job-list")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className={`font-medium ${fontSize}`}>Quay lại danh sách</span>
            </Button>

            {!job.approve && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 transition-colors w-full custom-800:w-auto"
                onClick={handleApprove}
              >
                <Check className="w-4 h-4 mr-2" />
                <span className={fontSize}>Phê duyệt công việc</span>
              </Button>
            )}
          </div>

          <div className="flex flex-col custom-800:flex-row items-start justify-between border-b pb-4 custom-1360:pb-6 gap-4">
            <div className="flex flex-col custom-800:flex-row items-start custom-800:items-center space-y-4 custom-800:space-y-0 custom-800:space-x-6 w-full">
              <div className="relative h-16 w-16 custom-1360:h-24 custom-1360:w-24 rounded-xl overflow-hidden border">
                <img
                  src={job.company?.logo || "/default-company-logo.png"}
                  alt="Company Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl custom-1360:text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-col custom-800:flex-row custom-800:items-center space-y-2 custom-800:space-y-0 custom-800:space-x-2 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span className={`font-medium ${fontSize}`}>
                      {job.company?.companyName || "N/A"}
                    </span>
                  </div>
                  <span className="hidden custom-800:inline">•</span>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span className={fontSize}>{job.city?.cityName || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2 w-full custom-800:w-auto">
              <span
                className={`px-4 py-2 rounded-full text-xs custom-1360:text-sm font-medium ${
                  job.approve
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                } w-full custom-800:w-auto text-center`}
              >
                {job.approve ? "Đã duyệt" : "Chờ duyệt"}
              </span>
              {!job.approve && (
                <span className={`flex items-center text-xs custom-1360:text-sm text-yellow-600 w-full custom-800:w-auto text-center`}>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Đang chờ xét duyệt
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 custom-800:grid-cols-3 gap-4 custom-1360:gap-6">
          {/* Left Column - 2/3 width */}
          <div className="col-span-1 custom-800:col-span-2 space-y-6">
            <Card className="bg-white rounded-lg shadow-md">
              <CardHeader className={padding}>
                <h2 className="text-lg custom-1360:text-xl font-semibold">Thông tin chi tiết</h2>
              </CardHeader>
              <CardContent className="grid grid-cols-1 custom-800:grid-cols-2 gap-4 custom-1360:gap-8">
                {/* Job Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base custom-1360:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-500" />
                      Thông tin cơ bản
                    </h3>
                    <div className="bg-gray-50 p-3 custom-1360:p-4 rounded-lg space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <div>
                          <p className={`text-xs custom-1360:text-sm text-gray-600`}>Mức lương</p>
                          <p className={`font-medium text-gray-900 ${fontSize}`}>
                            {formatSalary(job.salary)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className={`text-xs custom-1360:text-sm text-gray-600`}>Loại công việc</p>
                          <p className={`font-medium text-gray-900 ${fontSize}`}>
                            {job.typeOfWork || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <UserCheck className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className={`text-xs custom-1360:text-sm text-gray-600`}>Vai trò</p>
                          <p className={`font-medium text-gray-900 ${fontSize}`}>
                            {job.position || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className={`text-xs custom-1360:text-sm text-gray-600`}>Ngày đăng</p>
                          <p className={`font-medium text-gray-900 ${fontSize}`}>
                            {formatDate(job.createDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <Calendar className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className={`text-xs custom-1360:text-sm text-gray-600`}>Hạn nộp</p>
                          <p className={`font-medium text-gray-900 ${fontSize}`}>
                            {formatDate(job.expireDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Industry */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base custom-1360:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                      Kỹ năng yêu cầu
                    </h3>
                    <div className="bg-gray-50 p-3 custom-1360:p-4 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {job.skills?.length > 0 ? (
                          job.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={`px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 ${fontSize}`}
                            >
                              <Code className="w-4 h-4 text-purple-500" />
                              <span className="font-medium text-gray-700">
                                {skill.skillName}
                              </span>
                            </Badge>
                          ))
                        ) : (
                          <div className={`text-center py-3 text-gray-500 ${fontSize}`}>
                            Chưa có kỹ năng yêu cầu
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base custom-1360:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-purple-500" />
                      Lĩnh vực
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job?.industry?.length > 0 ? (
                        job.industry.map((ind) => (
                          <Badge
                            key={ind.industryId}
                            variant="outline"
                            className={`px-3 py-1 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors duration-200 ${fontSize}`}
                          >
                            {ind.industryName}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className={`px-3 py-1 bg-white border-gray-300 text-gray-500 ${fontSize}`}
                        >
                          Chưa cập nhật
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="bg-white rounded-lg shadow-md">
              <CardContent className="space-y-6 p-4 custom-1360:p-6">
                <section className="prose max-w-none">
                  <h2 className="text-lg custom-1360:text-xl font-semibold mb-4">
                    Mô tả công việc
                  </h2>
                  <p className={`text-gray-600 leading-relaxed text-sm custom-1360:text-base`}>
                    {job.description || "Chưa có thông tin"}
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-lg custom-1360:text-xl font-semibold">
                    Yêu cầu công việc
                  </h2>
                  <ul className="space-y-3">
                    {job.requirement?.split(";")?.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-gray-50 p-3 rounded-lg"
                      >
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className={`text-gray-700 ${fontSize}`}>
                          {item.trim() || "N/A"}
                        </span>
                      </li>
                    )) || (
                      <li className={`text-gray-500 italic ${fontSize}`}>
                        Chưa có thông tin
                      </li>
                    )}
                  </ul>
                </section>
                <section className="space-y-4">
                  <h2 className="text-lg custom-1360:text-xl font-semibold">
                    Kiến thức, kỹ năng cần có
                  </h2>
                  <ul className="space-y-3">
                    {job.niceToHaves?.split(";")?.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-gray-50 p-3 rounded-lg"
                      >
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className={`text-gray-700 ${fontSize}`}>
                          {item.trim() || "N/A"}
                        </span>
                      </li>
                    )) || (
                      <li className={`text-gray-500 italic ${fontSize}`}>
                        Chưa có thông tin
                      </li>
                    )}
                  </ul>
                </section>
                <section className="space-y-4">
                  <h2 className="text-lg custom-1360:text-xl font-semibold">
                    Quyền lợi
                  </h2>
                  <ul className="space-y-3">
                    {job.benefit?.split(";")?.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-gray-50 p-3 rounded-lg"
                      >
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className={`text-gray-700 ${fontSize}`}>
                          {item.trim() || "N/A"}
                        </span>
                      </li>
                    )) || (
                      <li className={`text-gray-500 italic ${fontSize}`}>
                        Chưa có thông tin
                      </li>
                    )}
                  </ul>
                </section>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="col-span-1 space-y-6">
            <Card
              className="hover:shadow-lg bg-white rounded-lg shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                job.company?.companyId && navigate(`/admin/companies/${job.company.companyId}`)
              }
            >
              <CardHeader className={padding}>
                <h2 className="text-lg custom-1360:text-xl font-semibold">Thông tin công ty</h2>
              </CardHeader>
              <CardContent className="space-y-4 p-3 custom-1360:p-4">
                <img
                  src={job.company?.logo || "/default-company-logo.png"}
                  alt="Company Logo"
                  className="w-full h-24 custom-1360:h-32 object-contain mb-4"
                />
                <h3 className={`text-base custom-1360:text-lg font-semibold text-purple-600 hover:text-purple-700 ${fontSize}`}>
                  {job.company?.companyName || "N/A"}
                </h3>
                <p className={`text-gray-600 line-clamp-4 custom-800:line-clamp-3 ${fontSize}`}>
                  {job.company?.description || "Chưa có thông tin"}
                </p>

                <div className="flex items-center text-sm text-purple-600 hover:text-purple-700">
                  <span className={fontSize}>Xem chi tiết công ty</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-2 text-gray-600">
      {icon}
      <span className="text-xs custom-1360:text-sm">{label}</span>
    </div>
    <span className="font-medium text-gray-900 text-xs custom-1360:text-sm">{value}</span>
  </div>
);