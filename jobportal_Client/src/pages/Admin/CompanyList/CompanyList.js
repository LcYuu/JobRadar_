import React from 'react';
import { Button } from "../../../ui/button";
import { MoreVertical, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";

export default function CompanyList() {
  // Mock data - replace with real API data
  const companies = [
    {
      id: 1,
      name: "Tech Corp",
      industry: "Technology",
      location: "Ho Chi Minh City",
      employees: "100-500",
      status: "Active",
      joinDate: "2024-01-15"
    },
    // Add more companies...
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Danh sách công ty</h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="text-left p-4">Tên công ty</th>
              <th className="text-left p-4">Ngành nghề</th>
              <th className="text-left p-4">Địa điểm</th>
              <th className="text-left p-4">Số nhân viên</th>
              <th className="text-left p-4">Trạng thái</th>
              <th className="text-left p-4">Ngày tham gia</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b">
                <td className="p-4">{company.name}</td>
                <td className="p-4">{company.industry}</td>
                <td className="p-4">{company.location}</td>
                <td className="p-4">{company.employees}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    company.status === "Active" 
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {company.status}
                  </span>
                </td>
                <td className="p-4">{company.joinDate}</td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                      <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 