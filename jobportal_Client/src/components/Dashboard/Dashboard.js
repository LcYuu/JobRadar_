import React, { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { FileText, MoreVertical, ChevronRight, Pin } from "lucide-react";
import { Link } from "react-router-dom";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { getApplyJobByUser } from "../../redux/ApplyJob/applyJob.action";
import Pagination from "../layout/Pagination";
export default function Dashboard_Seeker() {

  const dispatch = useDispatch();
  const {
    applyJobByUser = [],
    loading,
    error,
    totalPages,
    totalElements,
  } = useSelector((store) => store.applyJob);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(3);

  useEffect(() => {
    dispatch(getApplyJobByUser(currentPage, size));
  }, [dispatch, currentPage, size]);

  // const handlePin = (id) => {
  //   setApplications(applications.map(app =>
  //     app.id === id ? { ...app, pinned: !app.pinned } : app
  //   ));
  // };
  // const sortedApplications = applications.sort((a, b) => {
  //   return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
  // });

  


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-2">Tổng đơn đã ứng tuyển</h2>
          <div className="flex items-center">
            <span className="text-5xl font-bold mr-4">
              {totalElements}
            </span>
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Lịch sử ứng tuyển</h2>
          <div className="space-y-4">
            {applyJobByUser.map((app) => {
              const applyDate = new Date(app.applyDate);
              const formattedDate = applyDate.toLocaleDateString("en-GB");
              const formattedTime = applyDate.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });

              console.log("Application status:", app);

              return (
                <Link 
                  to={`/jobs/job-detail/${app.postId}`} 
                  key={app.postId}
                  className="block"
                >
                  <div className="flex items-start justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 border border-gray-300">
                        <img
                          src={app.logo}
                          alt="Logo"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-xl text-indigo-800">
                            {app.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              app.isSave
                                ? "bg-green-100 text-green-600"
                                : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {app.isSave ? "Đã duyệt" : "Chờ duyệt"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          {app.companyName} • {app.location} • {app.typeOfWork}
                        </p>
                        <span className="text-sm text-gray-500 mb-1">
                          Thời gian ứng tuyển: {formattedDate} {formattedTime}
                        </span>
                        <p className="text-sm text-gray-600">
                          CV tải lên:{" "}
                          <a
                            href={app.pathCV}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            CV tải lên
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {app.pinned && (
                        <Pin className="text-yellow-500 h-5 w-5 mr-2" />
                      )}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="min-w-[120px] bg-white rounded-md shadow-md">
                            <DropdownMenu.Item
                              className="cursor-pointer p-2 hover:bg-gray-200"
                            >
                              Xóa
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="cursor-pointer p-2 hover:bg-gray-200"
                            >
                              {app.pinned ? "Bỏ ghim" : "Ghim"}
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                size={size}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
