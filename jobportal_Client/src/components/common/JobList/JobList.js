import React, { useEffect, useState } from "react";
import JobCard from "../JobCard/JobCard";
import { useDispatch, useSelector } from "react-redux";
import logo1 from "../../../assets/images/common/logo1.jpg";
import { getAllJobAction } from "../../../redux/JobPost/jobPost.action";
import { Button } from "../../../ui/button";

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

  useEffect(() => {
    // Set loading state when fetching new data
    dispatch(getAllJobAction(currentPage, size));
  }, [dispatch, currentPage, size]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setCurrentPage(0); // Reset về trang đầu khi thay đổi số lượng bản ghi mỗi trang
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{ color: "#43bfb3" }}
        >
          Các công việc nổi bật
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {jobPost.length > 0 ? (
          jobPost.map((job) => (
            <JobCard
              key={job.postId}
              postId={job.postId}
              jobTitle={job.title}
              company={job.company.companyName}
              location={job.city.cityName}
              category={job.company.industry.industryName}
              jobType={job.typeOfWork}
              companyLogo={job.company.logo}
            />
          ))
        ) : (
          <p>Không có công việc nào để hiển thị.</p>
        )}
      </div>
      <div className="p-4 border-t flex items-center justify-between">
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-white text-black"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="bg-purple-600 text-white"
            onClick={() => handlePageChange(currentPage)}
          >
            {currentPage + 1}
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-white text-black"
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
