import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../ui/button";
import useWebSocket from "../../../utils/useWebSocket";
import Container from "../Container/Container";
import JobCard from "../JobCard/JobCard";
import {
  getAllJob,
  getAllJobAction,
} from "../../../redux/JobPost/jobPost.thunk";


export default function JobList() {
  const dispatch = useDispatch();
  const {
    jobPost = [],
    totalPages,
    loading,
    error,
  } = useSelector((store) => store.jobPost);

  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(12); // Số lượng bản ghi mỗi trang
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    dispatch(getAllJob({ currentPage, size }));
  }, [dispatch, currentPage, size]);

  useEffect(() => {
    // Listen for window resize events to detect mobile
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Automatically adjust records per page based on screen size
      if (mobile && size !== 5) {
        setSize(5);
        setCurrentPage(0); // Reset to first page
      } else if (!mobile && size === 5) {
        setSize(12);
        setCurrentPage(0); // Reset to first page
      }
    };

    // Set initial size based on screen
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleMessage = useCallback(
    (dispatch, message, topic) => {
      if (topic === "/topic/job-updates") {
        if (
          message === "ADD JOB" ||
          message === "EXPIRE JOB" ||
          message === "APPROVE JOB"
        ) {
          dispatch(getAllJob({ currentPage, size }));
        }
      }
    },
    [currentPage, size]
  );

  useWebSocket(["/topic/job-updates"], (dispatch, message, topic) =>
    handleMessage(dispatch, message, topic)
  )(dispatch);

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0);
  };

  if (loading)
    return (
      <Container>
        <div className="py-12 flex justify-center">
          <p className="text-center">Đang tải...</p>
        </div>
      </Container>
    );

  if (error)
    return (
      <Container>
        <div className="py-12 flex justify-center">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </Container>
    );

  return (
    <Container>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-0"
          style={{ color: "#43bfb3" }}
        >
          Các công việc nổi bật
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.isArray(jobPost) && jobPost.length > 0 ? (
          jobPost.map((job) => {
            const category = Array.isArray(job?.industryIds)
              ? job.industryIds.map((id, index) => ({
                  industryId: id,
                  industryName: job.industryNames?.[index] || "Không xác định",
                }))
              : [];

            return (
              <JobCard
                key={job.postId}
                postId={job.postId}
                jobTitle={job.title}
                company={job.companyName}
                location={job.cityName}
                category={category}
                jobType={job.typeOfWork}
                companyLogo={job.companyLogo}
                rating={job.averageStar}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p>Không có công việc nào để hiển thị.</p>
          </div>
        )}
      </div>
      <div className="mt-6 p-3 sm:p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
        {!isMobile && (
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              className="border rounded p-1"
              value={size}
              onChange={handleSizeChange}
            >
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
            </select>
            <span>ứng viên mỗi trang</span>
          </div>
        )}

        <div
          className={`flex items-center gap-2 ${
            isMobile ? "w-full justify-between" : ""
          }`}
        >
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-white text-black px-2 sm:px-4"
          >
            Trước đó
          </Button>
          <Button
            variant="outline"
            className="bg-purple-600 text-white px-2 sm:px-4"
            onClick={() => handlePageChange(currentPage)}
          >
            {currentPage + 1}
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-white text-black px-2 sm:px-4"
          >
            Tiếp theo
          </Button>
        </div>
      </div>
    </Container>
  );
}
