import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Calendar, Users, MapPin, Briefcase, Heart, Clock, GraduationCap, Users2, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import JobCard_AllJob from '../../components/common/JobCard_AllJob/JobCard_AllJob';
import { getAllJobAction } from '../../redux/JobPost/jobPost.action';
import logo from '../../assets/images/common/logo.jpg';
export default function CompanyProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { jobPost = [], totalPages, loading, error } = useSelector(store => store.jobPost);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(6);

  useEffect(() => {
    // Fetch jobs for this specific company
    dispatch(getAllJobAction(currentPage, size, id)); // Assuming your action can accept companyId
  }, [dispatch, currentPage, size, id]);

  // TODO: Fetch company details using id

  const company = {
    name: "Công ty TNHH ABC",
    website: "https://abc.com",
    logo: logo,
    foundedDate: "21/07/2011",
    employeeCount: "1000+",
    locations: ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
    industry: "Công nghệ thông tin",
    description: "ABC là công ty hàng đầu trong lĩnh vực công nghệ...",
    techStack: ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "MongoDB"],
    team: [
      { name: "Nguyễn Văn A", position: "CEO", avatar: logo },
      { name: "Trần Thị B", position: "CTO", avatar: logo },
      { name: "Lê Văn C", position: "Product Manager", avatar: logo },
      { name: "Phạm Thị D", position: "HR Manager", avatar: logo },
      { name: "Hoàng Văn E", position: "Tech Lead", avatar: logo }
    ],
    benefits: [
      {
        title: "Chăm sóc sức khỏe",
        description: "Bảo hiểm y tế toàn diện cho nhân viên",
        icon: Heart
      },
      {
        title: "Nghỉ phép linh hoạt",
        description: "Chính sách nghỉ phép linh hoạt",
        icon: Clock
      },
      {
        title: "Đào tạo & Phát triển",
        description: "Cơ hội học tập và phát triển kỹ năng",
        icon: GraduationCap
      },
      {
        title: "Team Building",
        description: "Hoạt động team building định kỳ 6 tháng/lần",
        icon: Users2
      }
    ],
    openJobs: [
      {
        title: "Frontend Developer",
        location: "Hồ Chí Minh",
        tags: ["Full-time", "React", "JavaScript"]
      },
      {
        title: "Backend Developer",
        location: "Hà Nội",
        tags: ["Full-time", "Node.js", "MongoDB"]
      },
      {
        title: "UI/UX Designer",
        location: "Đà Nẵng",
        tags: ["Full-time", "Figma", "UI/UX"]
      }
    ]
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        {/* Company Header */}
        <div className="flex items-start gap-6 mb-12">
        <div className="w-24 h-24 bg-indigo-100 rounded-xl overflow-hidden">
            <img
              src={logo}
              alt={`${company.name} Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                {jobPost.length} Jobs
              </Badge>
            </div>
            <a href={company.website} className="text-sm text-blue-600 hover:underline">
              {company.website}
            </a>
            <div className="flex gap-8 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Founded {company.foundedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{company.employeeCount}+ Employees</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{company.locations.length} countries</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span>{company.industry}</span>
              </div>
            </div>
          </div>
        </div>
{/* Company Profile, Tech Stack, and Office Location Grid */}
<div className="grid grid-cols-3 gap-8 mb-12">
  <div className="col-span-2">
    <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
    <p className="text-gray-600 leading-relaxed">{company.description}</p>
  </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Tech stack</h2>
            <div className="grid grid-cols-3 gap-2">
              {company.techStack.map((tech) => (
                <Badge 
                  key={tech} 
                  className="justify-center py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  {tech}
                </Badge>
              ))}
            </div>
            <Button 
              variant="link" 
              className="mt-4 p-0 text-blue-600 hover:text-blue-700"
            >
              View tech stack <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        {/* Contact Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <div className="space-y-2">
            <Link 
              to="/" 
              className="block px-4 py-2 bg-gray-100 text-blue-600 rounded-md hover:bg-gray-200"
            >
              facebook.com/{company.name}
            </Link>
            <Link 
              to="/" 
              className="block px-4 py-2 bg-gray-100 text-blue-600 rounded-md hover:bg-gray-200"
            >
              linkedin.com/company/{company.name}
            </Link>
          </div>
        </div>

        {/* Company Images */}
        <div className="mb-12">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <img 
                src={company.logo} 
                alt="Office space with plants" 
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-rows-3 gap-4">
              <img 
                src={company.logo} 
                alt="Team meeting" 
                className="w-full h-[128px] object-cover rounded-lg"
              />
              <img 
                src={company.logo} 
                alt="Office workspace" 
                className="w-full h-[128px] object-cover rounded-lg"
              />
              <img 
                src={company.logo} 
                alt="Team collaboration" 
                className="w-full h-[128px] object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        

        {/* Office Locations */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Văn phòng</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {company.locations.map((location) => (
              <Card key={location} className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <span>{location}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Đội ngũ</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {company.team.map((member) => (
              <div key={member.name} className="text-center">
                <img src={member.avatar} alt='avatar' className="w-20 h-20 mx-auto mb-2 rounded-full bg-muted" />
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.position}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Phúc lợi</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.benefits.map((benefit) => (
              <Card key={benefit.title} className="p-6">
                <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  {React.createElement(benefit.icon, {
                    className: "w-6 h-6 text-primary"
                  })}
                </div>
                <h3 className="font-medium mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Jobs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Vị trí đang tuyển</h2>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Tiếp theo
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : jobPost.length > 0 ? (
            <div className="grid gap-4">
              {jobPost.map((job) => (
                <JobCard_AllJob
                  key={job.postId}
                  job={{
                    ...job,
                    company: {
                      ...job.company,
                      logo: job.company.logo || '/placeholder.svg'
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có vị trí nào đang tuyển.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
