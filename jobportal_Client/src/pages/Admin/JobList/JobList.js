import React, { useState } from 'react';
import { Button } from "../../../ui/button";
import { MoreVertical, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";

export default function AdminJobList() {
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(5);
  
  // Mock data - replace with API data later
  const jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Ho Chi Minh",
      type: "Full-time",
      status: "Active",
      postedDate: "2024-01-15",
      deadline: "2024-02-15"
    }
  ];

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Danh sách công việc</h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <table className="w-full">
          {/* Table header and body here */}
        </table>

        <div className="flex items-center justify-center mt-6 p-4 border-t">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="mx-4 text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 