import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Briefcase, FileText, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../layout/Pagination";
import { getApplyJobByUser } from "../../redux/ApplyJob/applyJob.thunk";
import useWebSocket from "../../utils/useWebSocket";

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
    dispatch(getApplyJobByUser({ currentPage, size }));
  }, [dispatch, currentPage, size]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleMessage = useCallback(
    (_, __, topic) => {
      if (topic === "/topic/apply-updates") {
        dispatch(getApplyJobByUser({ currentPage, size }));
      }
    },
    [dispatch, currentPage, size]
  );

  useWebSocket(["/topic/apply-updates"], handleMessage);

  return (
    <div className="container mx-auto px-4 relative">
      <Card className="mb-8 shadow-lg rounded-lg bg-gradient-to-br from-purple-500 via-purple-500 to-blue-500 text-white overflow-visible">
        <CardContent className="p-6 overflow-visible">
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

      <Card className="overflow-visible">
        <CardContent className="p-6 bg-gray-50 overflow-visible">
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
                <div
                  key={app.postId}
                  className="flex flex-wrap items-center p-5 bg-gradient-to-r from-white via-gray-100 to-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
                  style={{ overflow: "visible" }}
                >
                  <div className="flex-grow min-w-0">
                    <Link
                      to={`/jobs/job-detail/${app.postId}`}
                      className="relative  flex items-center"
                      style={{
                        pointerEvents: "auto",
                        touchAction: "manipulation",
                      }}
                    >
                      <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4 shrink-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                            <img
                              src={app.logo || "/path/to/default-logo.png"}
                              alt="Logo"
                              className="w-full h-full object-cover bg-white"
                            />
                          </div>
                          <div className="flex items-center gap-1 text-sm text-yellow-500 mt-2">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{(app.averageStar || 0.0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-purple-800">
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
                            {app.companyName}
                          </p>

                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{app.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{app.typeOfWork}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Thời gian ứng tuyển: {formattedDate} {formattedTime}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center ml-4 sm:ml-0 sm:mt-4 shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Xem CV clicked");
                        window.open(app.pathCV, "_blank");
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Xem CV touched");
                        window.open(app.pathCV, "_blank");
                      }}
                      className="relative text-sm bg-purple-500 text-white py-2 px-4 min-w-[120px] min-h-[44px] rounded-lg hover:bg-purple-700 transition-all duration-300 font-medium"
                      style={{
                        pointerEvents: "auto",
                        touchAction: "manipulation",
                      }}
                    >
                      Xem CV
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
