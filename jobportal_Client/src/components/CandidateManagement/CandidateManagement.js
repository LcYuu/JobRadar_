import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { MoreVertical, Search, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const CandidateManagement = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [candidates] = useState([
    {
      id: 1,
      name: "Jake Gyll",
      avatar: "/avatars/jake.jpg",
      rating: 0.0,
      status: "Đã xem hồ sơ",
      appliedDate: "13 July, 2021",
      jobRole: "Designer"
    },
    {
      id: 2, 
      name: "Guy Hawkins",
      avatar: "/avatars/guy.jpg",
      rating: 0.0,
      status: "Đã xem hồ sơ",
      appliedDate: "13 July, 2021",
      jobRole: "JavaScript Dev"
    },
    // Thêm các ứng viên khác tương tự
  ]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(candidates.map(c => c.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tổng số người ứng tuyển: {candidates.length}</h1>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Tìm kiếm"
            className="w-[300px]"
            icon={<Search className="w-4 h-4" />}
          />
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === candidates.length}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="p-4 text-left">Tên ứng viên</th>
              <th className="p-4 text-left">Đánh giá</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Ngày nộp</th>
              <th className="p-4 text-left">Vị trí công việc</th>
              <th className="p-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-t">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(candidate.id)}
                    onChange={() => handleSelectItem(candidate.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{candidate.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span>{candidate.rating}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    candidate.status === "Đã xem hồ sơ" 
                      ? "bg-orange-100 text-orange-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {candidate.status}
                  </span>
                </td>
                <td className="p-4">{candidate.appliedDate}</td>
                <td className="p-4">{candidate.jobRole}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-indigo-600">
                      See Application
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/employer/account-management/candidate-management/applicants/${candidate.id}`)}>
  Xem chi tiết
</DropdownMenuItem>
                        <DropdownMenuItem>Từ chối</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>View</span>
            <select className="border rounded p-1">
              <option>5</option>
              <option>10</option>
              <option>20</option>
            </select>
            <span>ứng viên mỗi trang</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" className="bg-indigo-600 text-white">
              1
            </Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateManagement; 