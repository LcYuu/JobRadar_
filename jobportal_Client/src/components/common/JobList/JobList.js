import React, { useEffect, useState } from "react";
import JobCard from "../JobCard/JobCard";
import { useDispatch, useSelector } from "react-redux";
import logo1 from "../../../assets/images/common/logo1.jpg";
import { getAllJobAction } from "../../../redux/JobPost/jobPost.action";

export default function JobList() {
  const dispatch = useDispatch();
  const {
    jobPost = [],
    totalPages,
    loading,
    error,
  } = useSelector((store) => store.jobPost);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(12);

  useEffect(() => {
    // Set loading state when fetching new data
    dispatch(getAllJobAction(currentPage, size));
  }, [dispatch, currentPage, size]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Các công việc nổi bật</h2>
        
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {jobPost.length > 0 ? (
          jobPost.map((job) => (
            <JobCard
              key={job.postId}
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
      <div className="flex items-center justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-4 py-2 mx-2 text-white rounded-lg transition duration-300 
            ${
              currentPage === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
        >
          Trước
        </button>
        <span className="text-sm font-semibold mx-4">{`Trang ${
          currentPage + 1
        } / ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`px-4 py-2 mx-2 text-white rounded-lg transition duration-300 
            ${
              currentPage >= totalPages - 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
        >
          Tiếp theo
        </button>
      </div>
    </section>
  );
}
