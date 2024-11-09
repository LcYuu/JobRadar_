import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { CheckCircle2, Clock, DollarSign, MapPin, Users, Globe, Calendar, Building2, Trophy, Linkedin, Twitter, Facebook, Github } from 'lucide-react';
import logo from '../../assets/images/common/logo.jpg';
import ApplyModal from '../../components/common/ApplyModal/ApplyModal';
import JobCard_AllJob from '../../components/common/JobCard_AllJob/JobCard_AllJob';

export default function JobDetail() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  // TODO: Fetch job details using id
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  const job = {
    logo: logo,
    title: "Social Media Assistant",
    company: "ABCEFG",
    location: "Q9, Ho Chi Minh",
    type: "Full-Time",
    salary: "20,000,000 VND",
    deadline: "July 31, 2021",
    startDate: "July 1, 2021",
    description: "Chúng tôi đang tìm kiếm chuyên gia tiếp thị truyền thông xã hội để giúp quản lý mạng trực tuyến của chúng tôi...",
    responsibilities: [
      "Tập trung vào phát triển và xuất bản nội dung truyền thông xã hội",
      "Hỗ trợ tiếp thị và chiến lược",
      "Luôn cập nhật các xu hướng trên nền tảng truyền thông xã hội và đề xuất ý tưởng nội dung cho nhóm",
      "Tương tác với cộng đồng trực tuyến",
    ],
    requirements: [
      "Bạn tiếp thu được nhanh kiến thức từ mọi người và xây dựng môi trường làm việc lý tưởng",
      "Bạn có ý thức về khung giờ đọc và trải nghiệm sản phẩm",
      "Bạn là một người quản lý văn phòng tự tin, sẵn sàng đảm nhận thêm trách nhiệm",
      "Bạn là người có định hướng chi tiết và sáng tạo",
      "Bạn là nhà tiếp thị tăng trưởng và biết cách chạy chiến dịch",
    ],
    benefits: [
      "Chăm sóc sức khỏe đầy đủ",
      "Kỳ nghỉ không giới hạn",
      "Phát triển kỹ năng",
      "Làm việc từ xa",
      "Hỗ trợ đi lại",
    ],
    categories: ["Marketing", "Thiết kế"],
    skills: ["Project Management", "Copywriting", "English", "Social Media Marketing", "Copy Editing"],
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    additionalInfo: '',
    cv: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        cv: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setIsModalOpen(false);
  };

  const similarJobs = [
    {
      id: 1,
      title: "Social Media Assistant",
      company: "ABCEFG",
      location: "Q9, Ho Chi Minh",
      type: "Full-Time",
      categories: ["Marketing"],
    },
    {
      id: 2,
      title: "Social Media Assistant",
      company: "ABCEFG",
      location: "Q9, Ho Chi Minh",
      type: "Full-Time",
      categories: [ "Thiết kế", ],
    },
    {
      id: 3,
      title: "Social Media Assistant",
      company: "ABCEFG",
      location: "Q9, Ho Chi Minh",
      type: "Full-Time",
      categories: ["Marketing"]
    },
    {
      id: 4,
      title: "Social Media Assistant",
      company: "ABCEFG",
      location: "Q9, Ho Chi Minh",
      type: "Full-Time",
      categories: ["Kinh doanh"]
    },
    // Add more similar jobs...
  ];

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
                    src={logo} 
                    alt="Company Logo" 
                    className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600"
                  />
                  <div>
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <p className="text-sm text-gray-500">
                      {job.company} • {job.location} • {job.type}
                    </p>
                  </div>
                </div>
                <Button 
                  type="button"
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Button clicked");
                    setIsModalOpen(true);
                  }}
                >
                  Apply
                </Button>
              </div>

              {/* Job Description */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Mô tả</h2>
                <p className="text-sm text-gray-600">{job.description}</p>
              </section>

              {/* Responsibilities */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Trách nhiệm công việc</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Bạn là người phù hợp nếu</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Benefits */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Quyền lợi</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {job.benefits.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Company Info */}
              <section className="relative w-full -mx-4 lg:-mx-8 bg-white shadow-md">
                <div className="container mx-auto px-4 py-8">
                  <div className="flex flex-col lg:flex-row items-start justify-between space-y-6 lg:space-y-0">
                    {/* Company Info Left Side */}
                    <div className="flex items-start space-x-6 flex-1">
                      <img 
                        src={logo} 
                        alt="Company Logo" 
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold">{job.company}</h2>
                          <Link 
                            to={`/companies/${job.companyId}`} 
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Tìm hiểu thêm về {job.company} →
                          </Link>
                        </div>
                        <p className="text-sm text-gray-600 max-w-2xl">
                          {job.company} là một công ty công nghệ xây dựng cơ sở hạ tầng kinh tế cho Internet. 
                          Chúng tôi cung cấp các giải pháp công nghệ tiên tiến và đổi mới sáng tạo để giúp 
                          doanh nghiệp phát triển trong kỷ nguyên số.
                        </p>
                      </div>
                    </div>

                    {/* Company Images Right Side */}
                    <div className="lg:w-1/3 space-y-4">
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
                      </div>
                      
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
                    </div>
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
                    <span className="font-medium">{job.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <span>Ngày đăng bài</span>
                    </div>
                    <span className="font-medium">{job.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>Loại công việc</span>
                    </div>
                    <span className="font-medium">{job.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-5 w-5" />
                      <span>Lương</span>
                    </div>
                    <span className="font-medium">{job.salary}</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lĩnh vực</h3>
                <div className="flex flex-wrap gap-2">
                  {job.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">{category}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Các kĩ năng cần thiết</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Công việc tương tự</h2>
            <Link to="#" className="text-sm font-medium text-indigo-600 hover:underline">
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
                      industryNames: job.categories
                    }
                  },
                  city: {
                    cityName: job.location
                  },
                  typeOfWork: job.type,
                  categories: job.categories
                }}
              />
            ))}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <ApplyModal
          job={{
            title: job.title,
            company: {
              companyName: job.company,
              logo: job.logo
            },
            city: {
              cityName: job.location
            }
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          handleInputChange={handleInputChange}
          onFileChange={handleFileChange}
        />
      )}
    </div>
  );
}
