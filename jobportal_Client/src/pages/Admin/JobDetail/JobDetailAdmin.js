import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getJobPostByPostId, approveJob } from "../../../redux/JobPost/jobPost.action";
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
} from "lucide-react";

export default function JobDetailAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { postId } = useParams();
  const { postByPostId: job, loading, error } = useSelector((store) => store.jobPost);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!postId) {
        console.log("No postId found");
        return;
      }

      try {
        console.log("Fetching details for postId:", postId);
        await dispatch(getJobPostByPostId(postId));
      } catch (err) {
        console.error("Error fetching job details:", err);
      }
    };

    fetchJobDetails();
  }, [dispatch, postId]);

  useEffect(() => {
    console.log("Redux State:", {
      job,
      loading,
      error,
      postId
    });
  }, [job, loading, error, postId]);

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
    try {
      console.log("Approving job with ID:", job.postId);
      await dispatch(approveJob(job.postId));
      dispatch(getJobPostByPostId(postId));
    } catch (err) {
      console.error("Error approving job:", err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-red-500 font-medium">
          {error || "Có lỗi xảy ra khi tải thông tin công việc"}
        </p>
      </div>
    );
  }

  if (!job) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <FileX className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg text-gray-600 font-medium">Không tìm thấy công việc</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-gray-100"
              onClick={() => navigate("/admin/job-list")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Quay lại danh sách</span>
            </Button>
            
            {!job.approve && (
              <Button 
                variant="default"
                className="bg-green-600 hover:bg-green-700 transition-colors"
                onClick={handleApprove}
              >
                <Check className="w-4 h-4 mr-2" />
                Phê duyệt công việc
              </Button>
            )}
          </div>

          <div className="flex items-start justify-between border-b pb-6">
            <div className="flex items-center space-x-6">
              <div className="relative h-24 w-24 rounded-xl overflow-hidden border">
                <img
                  src={job.company?.logo || "/default-company-logo.png"}
                  alt="Company Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">{job.company?.companyName}</span>
                  <span>•</span>
                  <MapPin className="h-5 w-5" />
                  <span>{job.city?.cityName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                job.approve ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {job.approve ? 'Đã duyệt' : 'Chờ duyệt'}
              </span>
              {!job.approve && (
                <span className="flex items-center text-sm text-yellow-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Đang chờ xét duyệt
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="col-span-2 space-y-6">
            <Card className="bg-white rounded-lg shadow-md">
              <CardHeader>
                <h2 className="text-xl font-semibold">Thông tin chi tiết</h2>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-8">
                {/* Job Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                      Thông tin cơ bản
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Mức lương</p>
                          <p className="font-medium text-gray-900">{formatSalary(job.salary)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Loại công việc</p>
                          <p className="font-medium text-gray-900">{job.typeOfWork}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-600">Ngày đăng</p>
                          <p className="font-medium text-gray-900">{formatDate(job.createDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                        <Calendar className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">Hạn nộp</p>
                          <p className="font-medium text-gray-900">{formatDate(job.expireDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Industry */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                      Kỹ năng yêu cầu
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-3">
                        {job.skills?.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <Code className="w-4 h-4 text-indigo-500" />
                            <span className="font-medium text-gray-700">{skill.skillName}</span>
                          </Badge>
                        ))}
                      </div>
                      {(!job.skills || job.skills.length === 0) && (
                        <div className="text-center py-3 text-gray-500">
                          Chưa có kỹ năng yêu cầu
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                      Lĩnh vực
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="px-4 py-2 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors duration-200"
                    >
                      {job.company?.industry?.industryName || 'Chưa cập nhật'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="bg-white rounded-lg shadow-md">
              <CardContent className="space-y-6 pt-6">
                <section className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4">Mô tả công việc</h2>
                  <p className="text-gray-600 leading-relaxed">{job.description}</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">Trách nhiệm công việc</h2>
                  <ul className="space-y-3">
                    {job.requirement?.split(";")?.map((item, index) => (
                      <li key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item.trim()}</span>
                      </li>
                    )) || (
                      <li className="text-gray-500 italic">Chưa có thông tin</li>
                    )}
                  </ul>
                </section>
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">Kiến thức, kỹ năng cần có</h2>
                  <ul className="space-y-3">
                    {job.niceToHaves?.split(";")?.map((item, index) => (
                      <li key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item.trim()}</span>
                      </li>
                    )) || (
                      <li className="text-gray-500 italic">Chưa có thông tin</li>
                    )}
                  </ul>
                </section>
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">Quyền lợi</h2>
                  <ul className="space-y-3">
                    {job.benefit?.split(";")?.map((item, index) => (
                      <li key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item.trim()}</span>
                      </li>
                    )) || (
                      <li className="text-gray-500 italic">Chưa có thông tin</li>
                    )}
                  </ul>
                </section>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <Card className="hover:shadow-lg bg-white rounded-lg shadow-md transition-shadow cursor-pointer" 
                  onClick={() => navigate(`/admin/companies/${job.company?.companyId}`)}>
              <CardHeader>
                <h2 className="text-xl font-semibold">Thông tin công ty</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={job.company?.logo || "/default-company-logo.png"}
                  alt="Company Logo"
                  className="w-full h-32 object-contain mb-4"
                />
                <h3 className="text-lg font-semibold text-indigo-600 hover:text-indigo-700">
                  {job.company?.companyName}
                </h3>
                <p className="text-gray-600 line-clamp-3">{job.company?.description}</p>
                
                <div className="flex items-center text-sm text-indigo-600 hover:text-indigo-700">
                  <span>Xem chi tiết công ty</span>
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
      <span>{label}</span>
    </div>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);
