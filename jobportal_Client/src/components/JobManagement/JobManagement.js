import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../ui/button";
import { Calendar, Filter, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const JobManagement = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("Jul 19 - Jul 25");
  
  // Mock data for jobs
  const jobs = [
    {
      id: 1,
      role: "Social Media Assistant",
      status: "Còn tuyển",
      datePosted: "20 May 2020",
      dueDate: "24 May 2020",
      jobType: "Fulltime",
      applicants: 19,
      needs: 11,
      appliedCount: 4
    },
    {
      id: 2,
      role: "Senior Designer",
      status: "Còn tuyển",
      datePosted: "16 May 2020",
      dueDate: "24 May 2020",
      jobType: "Fulltime",
      applicants: 1234,
      needs: 20,
      appliedCount: 0
    },
    // Add more mock data...
  ];

  const handleViewDetails = (jobId) => {
    navigate(`/employer/jobs/${jobId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Danh sách công việc</h1>
          <p className="text-gray-500 mt-1">Đây là danh sách việc làm từ {selectedDate}.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg p-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <span>{selectedDate}</span>
          </div>
          <Button 
            variant="default" 
            className="bg-indigo-600"
            onClick={() => navigate('/employer/jobs/post')}
          >
            + Đăng bài
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Danh sách</h2>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="text-left p-4">Roles</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date Posted</th>
              <th className="text-left p-4">Due Date</th>
              <th className="text-left p-4">Job Type</th>
              <th className="text-left p-4">Applicants</th>
              <th className="text-left p-4">Needs</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{job.role}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    job.status === "Còn tuyển" 
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-4">{job.datePosted}</td>
                <td className="p-4">{job.dueDate}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-600">
                    {job.jobType}
                  </span>
                </td>
                <td className="p-4">{job.applicants}</td>
                <td className="p-4">
                  {job.appliedCount} / {job.needs}
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDetails(job.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <span>View</span>
            <select className="border rounded p-1">
              <option>5</option>
              <option>10</option>
              <option>20</option>
            </select>
            <span>Applicants per page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="default" className="bg-indigo-600">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement; 