import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from "../../ui/badge";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  DollarSign,
  Users,
  CheckCircle2,
  Building,
  Calendar,
  Eye
} from 'lucide-react';

const JobDetailEmployer = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate= useNavigate();
  
  // Mock data để demo giao diện
  const [jobDetail, setJobDetail] = useState({
    logo: '/company-logo.png',
    title: 'Senior Frontend Developer',
    description: 'Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm để tham gia vào đội ngũ phát triển sản phẩm của công ty. Bạn sẽ được làm việc với các công nghệ hiện đại và tham gia vào các dự án đầy thách thức.',
    requirements: [
      'Tối thiểu 5 năm kinh nghiệm với Frontend Development',
      'Thành thạo JavaScript/TypeScript, React.js, và các công nghệ Frontend hiện đại',
      'Có kinh nghiệm với state management (Redux, MobX)',
      'Hiểu biết sâu về HTML5, CSS3, và responsive design',
      'Có khả năng tối ưu hiệu suất ứng dụng web'
    ],
    benefits: [
      'Mức lương cạnh tranh',
      'Bảo hiểm sức khỏe toàn diện',
      'Lịch làm việc linh hoạt',
      '13 tháng lương + thưởng theo hiệu suất'
    ],
    responsibilities: [
      'Phát triển và duy trì các ứng dụng web phức tạp',
      'Code review và mentoring cho các thành viên junior',
      'Tối ưu hóa hiệu suất ứng dụng',
      'Làm việc chặt chẽ với đội ngũ backend và design',
      'Tham gia vào quá trình thiết kế giải pháp kỹ thuật'
    ],
    applicants: new Array(12), // 12 ứng viên
    status: 'Đang tuyển',
    salary: '2000$ - 3500$',
    location: 'Quận 1, TP.HCM',
    department: 'Engineering',
    type: 'Full-time',
    postedDate: '15/03/2024',
    deadline: '15/04/2024',
    skills: [
      'JavaScript',
      'TypeScript',
      'React.js',
      'Redux',
      'HTML5',
      'CSS3',
      'Git',
      'Webpack',
      'Jest'
    ]
  });

  // Giả sử có một action để lấy chi tiết công việc
  useEffect(() => {
    // dispatch(getJobDetailForEmployer(jobId));
  }, [dispatch, jobId]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img
              src={jobDetail.logo}
              alt="Company Logo"
              className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600"
            />
            <div>
              <h1 className="text-2xl font-bold mb-2">{jobDetail.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {jobDetail.department}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {jobDetail.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Đăng ngày: {jobDetail.postedDate}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline">Chỉnh sửa</Button>
            <Button variant="destructive">Đóng tuyển dụng</Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Badge variant={jobDetail.status === 'Đang tuyển' ? 'success' : 'destructive'}>
            {jobDetail.status}
          </Badge>
          <span className="text-sm text-gray-500">
            Đã đăng: {new Date(jobDetail.postedDate).toLocaleDateString('vi-VN')}
          </span>
          <span className="text-sm text-gray-500">
            Còn: {Math.ceil((new Date(jobDetail.deadline) - new Date()) / (1000 * 60 * 60 * 24))} ngày
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Job Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mô tả công việc</h2>
            <p className="text-gray-600">{jobDetail.description}</p>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Yêu cầu</h2>
            <ul className="space-y-2">
              {jobDetail.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Responsibilities */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Trách nhiệm công việc</h2>
            <ul className="space-y-2">
              {jobDetail.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Benefits */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quyền lợi</h2>
            <ul className="space-y-2">
              {jobDetail.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Thống kê</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>Số lượng ứng tuyển</span>
                </div>
                <span className="font-medium">{jobDetail.applicants.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>Hạn nộp hồ sơ</span>
                </div>
                <span className="font-medium">{jobDetail.deadline}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>Mức lương</span>
                </div>
                <span className="font-medium">{jobDetail.salary}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>Tỷ lệ chấp nhận</span>
                </div>
                <span className="font-medium">
                  {Math.round((jobDetail.approvedApplicants / jobDetail.applicants.length) * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-500" />
                  <span>Lượt xem</span>
                </div>
                <span className="font-medium">{jobDetail.views}</span>
              </div>
            </div>
          </Card>

          {/* Required Skills */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Kỹ năng yêu cầu</h3>
            <div className="flex flex-wrap gap-2">
              {jobDetail.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Applicants List */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Danh sách ứng viên</h3>
              <Button variant="outline" size="sm" onClick={() => navigate(`/employer/jobs/${jobId}/applicants`)}>
                Xem tất cả
              </Button>
            </div>
            <div className="space-y-4">
              {jobDetail.applicants.slice(0, 5).map((applicant, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={applicant?.avatar || "/default-avatar.png"}
                      alt={applicant?.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{applicant?.fullName}</p>
                      <p className="text-sm text-gray-500">Ứng tuyển: {applicant?.applyDate}</p>
                    </div>
                  </div>
                  <Badge variant={applicant?.isSave ? "success" : "secondary"}>
                    {applicant?.isSave ? "Đã duyệt" : "Chưa duyệt"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailEmployer;
