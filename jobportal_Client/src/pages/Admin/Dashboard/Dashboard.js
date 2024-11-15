import React from 'react';
import { Card } from "../../../ui/card";
import { Users, Building2, FileText, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  // Mock data - replace with real API data
  const stats = {
    totalUsers: 1234,
    totalCompanies: 567,
    totalJobs: 890,
    activeJobs: 234
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <h3 className="text-2xl font-bold mt-2">{stats.totalUsers}</h3>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng công ty</p>
              <h3 className="text-2xl font-bold mt-2">{stats.totalCompanies}</h3>
            </div>
            <Building2 className="h-8 w-8 text-indigo-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng việc làm</p>
              <h3 className="text-2xl font-bold mt-2">{stats.totalJobs}</h3>
            </div>
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Việc làm đang tuyển</p>
              <h3 className="text-2xl font-bold mt-2">{stats.activeJobs}</h3>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </Card>
      </div>
    </div>
  );
} 