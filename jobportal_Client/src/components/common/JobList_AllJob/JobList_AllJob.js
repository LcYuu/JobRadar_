import React from "react";
import JobCard_AllJob from "../../common/JobCard_AllJob/JobCard_AllJob";
import Pagination from "../../layout/Pagination"; // Đúng nếu Pagination.js nằm trong src/components/layout/


const JobList_AllJob = ({ jobs = [], currentPage, size, totalPages, onPageChange }) => {
  return (
    <div className="space-y-4">
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <JobCard_AllJob key={job.postId} job={job} /> // Sử dụng postId làm key
        ))
      ) : (
        <p>Không có công việc nào được tìm thấy.</p>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          size={size}
          totalPages={totalPages} // Cập nhật totalPages
          onPageChange={onPageChange} // Gọi hàm xử lý khi trang thay đổi
        />
      )}
    </div>
  );
};

export default JobList_AllJob;
