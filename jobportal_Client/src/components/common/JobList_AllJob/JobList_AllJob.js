import React from "react";
import JobCard_AllJob from "../../common/JobCard_AllJob/JobCard_AllJob";
import Pagination from "../../layout/Pagination"; // Đúng nếu Pagination.js nằm trong src/components/layout/


const JobList_AllJob = ({ jobs = [], currentPage, size, totalPages, onPageChange }) => {
  console.log("JobList_AllJob received:", {
    totalJobs: jobs.length,
    currentPage,
    size,
    totalPages
  });

  return (
    <div className="space-y-4">
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job.postId} className="flex items-center space-x-4">
            <JobCard_AllJob job={job} />
            {/* {job.similarity_score !== undefined && (
              <div className="ml-auto">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.similarity_score > 0.8 
                      ? "bg-green-100 text-green-700" 
                      : job.similarity_score > 0.6 
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="mr-1">🔍</span>
                  Độ phù hợp: {Math.round(job.similarity_score * 100)}%
                </span>
              </div>
            )} */}
          </div>
        ))
      ) : (
        <p>Không có công việc nào được tìm thấy.</p>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          size={size}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default JobList_AllJob;
