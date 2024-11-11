import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Calendar, Users, MapPin, Briefcase, Heart, Clock, GraduationCap, Users2, ChevronRight, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import JobCard_AllJob from '../../components/common/JobCard_AllJob/JobCard_AllJob';
import { getAllJobAction } from '../../redux/JobPost/jobPost.action';
import { getCompanyById } from "../../redux/Company/company.action";
import { getJobsByCompany } from '../../redux/JobPost/jobPost.action';
import { getTotalJobsByCompany } from '../../redux/JobPost/jobPost.action';
import logo from '../../assets/images/common/logo.jpg';
import Pagination from "../../components/layout/Pagination";
import axios from 'axios';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function CompanyProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { jobPost = [], totalPages = 0, loading, error, totalJobs } = useSelector(store => store.jobPost);
  const { company, loading: companyLoading, error: companyError } = useSelector(store => store.company);
  const [size] = useState(2);
  const { token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(getCompanyById(id));
      dispatch(getJobsByCompany(id, currentPage, size));
      dispatch(getTotalJobsByCompany(id));
    }
  }, [dispatch, id, currentPage, size]);

  // Thêm useEffect riêng để xử lý scroll
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  },); // Chỉ scroll khi id thay đổi

  if (companyLoading || loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (companyError) {
    return <div className="text-center py-8 text-red-500">{companyError}</div>;
  }

  if (!company) {
    return <div className="text-center py-8">Không tìm thấy thông tin công ty</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        {/* Company Header - Updated with API data */}
        <div className="flex items-start gap-6 mb-12">
          <div className="w-24 h-24 bg-indigo-100 rounded-xl overflow-hidden">
            <img
              src={company.logo || logo}
              alt={`${company.companyName || 'Company'} Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{company?.companyName}</h1>
              <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                {totalJobs} việc làm
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Thành lập: {formatDate(company?.establishedTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{company?.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{company?.industry?.industryName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Description - Updated with API data */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Giới thiệu công ty</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {company?.description}
          </p>
          
        {/* Contact Section
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Liên hệ</h2>
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
        </div> */}

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
            {company.locations && company.locations.length > 0 ? (
              company.locations.map((location) => (
                <Card key={location} className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-muted rounded" />
                    <span>{location}</span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                Chưa có thông tin văn phòng
              </div>
            )}
          </div>
        </div>

        {/* Team */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Đội ngũ</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {company.team && company.team.length > 0 ? (
              company.team.map((member) => (
                <div key={member.name} className="text-center">
                  <img src={member.avatar} alt={member.name} className="w-20 h-20 mx-auto mb-2 rounded-full bg-muted" />
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.position}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                Chưa có thông tin đội ngũ
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Phúc lợi</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.benefits && company.benefits.length > 0 ? (
              company.benefits.map((benefit) => (
                <Card key={benefit.title} className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    {benefit.icon && React.createElement(benefit.icon, {
                      className: "w-6 h-6 text-primary"
                    })}
                  </div>
                  <h3 className="font-medium mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                Chưa có thông tin phúc lợi
              </div>
            )}
          </div>
        </div>

        {/* Open Jobs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Vị trí đang tuyển ({totalJobs})</h2>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : jobPost.length > 0 ? (
            <>
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
              
              {totalPages > 0 && (
                <div className="mt-6 flex flex-col items-center gap-4">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      Trang trước
                    </Button>
                    <span className="mx-2">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Trang sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có vị trí nào đang tuyển.
            </div>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
