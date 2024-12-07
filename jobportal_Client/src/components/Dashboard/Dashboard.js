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
      <Card className="mb-8 shadow-lg rounded-lg bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4">Tổng đơn đã ứng tuyển</h2>
          <div className="flex items-center">
            <div className="flex flex-col items-center justify-center">
              <span className="text-6xl font-extrabold mb-2">
                {totalElements}
              </span>
              <span className="text-sm font-medium tracking-wide opacity-90">
                Đơn đã gửi thành công
              </span>
            </div>
            <div className="ml-6 flex items-center justify-center bg-white bg-opacity-30 p-4 rounded-full shadow-inner">
              <FileText className="h-16 w-16 text-white" />
            </div>
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

              return (
                <div key={app.postId} className="flex justify-between p-5 bg-gradient-to-r from-white via-gray-100 to-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <Link
                    to={`/jobs/job-detail/${app.postId}`}
                    className="flex items-center flex-grow"
                  >
                    {/* Logo */}
                    <div className="flex items-center">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm mr-4">
                        <img
                          src={app.logo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Job Info */}
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg text-indigo-800">
                            {app.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              app.isSave
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {app.isSave ? "Đã duyệt" : "Chờ duyệt"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {app.companyName} • {app.location} • {app.typeOfWork}
                        </p>
                        <span className="text-sm text-gray-500">
                          Thời gian ứng tuyển: {formattedDate} {formattedTime}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Action Menu */}
                  <div className="flex items-center ml-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(app.pathCV, "_blank");
                      }}
                      className="text-sm bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 font-medium"
                    >
                      Xem CV tải lên
                    </button>
                  </div>
                </div>
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
