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
          <JobCard_AllJob key={job.postId} job={job} />
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
