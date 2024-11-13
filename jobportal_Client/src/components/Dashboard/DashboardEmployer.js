import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import {
  BarChart,
  Calendar,
  Users,
  Eye,
  MoreVertical,
  Pin
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link } from 'react-router-dom';

export default function Dashboard_Employer() {
  const dispatch = useDispatch();
  const [currentDateRange, setCurrentDateRange] = useState('Jul 19 - Jul 25');
  
  // Stats data (replace with actual data from Redux)
  const stats = {
    newCandidates: 76,
    totalJobs: 12,
    totalViews: 2342,
    totalApplications: 654,
    viewsChange: '+6.4%',
    applicationsChange: '-0.5%'
  };

  // Recent job posts (replace with actual data)
  const recentJobs = [
    {
      id: 1,
      title: 'Social Media Assistant',
      location: 'Q9, Ho Chi Minh',
      type: 'Full-Time',
      categories: ['Marketing', 'Thiết kế'],
      applicants: 5,
      logo: '/company-logo.png'
    },
    {
      id: 2,
      title: 'Brand Designer',
      location: 'Q2, Ho Chi Minh',
      type: 'Full-Time',
      categories: ['Business', 'Thiết kế'],
      applicants: 5,
      logo: '/company-logo.png'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Chào mừng trở lại</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentDateRange}</span>
          <Button variant="primary">+ Đăng bài</Button>
        </div>
      </div>

      {/* New Candidates Card */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold mb-2">{stats.newCandidates}</h2>
          <p className="text-indigo-100">New candidates to review</p>
        </div>
        <Button variant="outline" className="text-white border-white hover:bg-indigo-700">
          View all →
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Số công việc đang tuyển</h3>
            <span className="text-3xl font-bold">{stats.totalJobs}</span>
          </div>
          <p className="text-gray-600">công việc</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Lượt xem bài đăng</h3>
            <Eye className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold mb-2">{stats.totalViews}</div>
          <p className="text-sm text-gray-600">
            This Week <span className="text-green-500">{stats.viewsChange}</span>
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Số lượng ứng tuyển</h3>
            <Users className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold mb-2">{stats.totalApplications}</div>
          <p className="text-sm text-gray-600">
            This Week <span className="text-red-500">{stats.applicationsChange}</span>
          </p>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Các công việc đăng gần đây</h2>
          <Link to="/jobs" className="text-indigo-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>

        <div className="space-y-4">
          {recentJobs.map(job => (
            <Card key={job.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={job.logo} alt="" className="w-12 h-12 rounded-lg" />
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 space-x-2">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {job.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-gray-100"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {job.applicants} người đã ứng tuyển
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 