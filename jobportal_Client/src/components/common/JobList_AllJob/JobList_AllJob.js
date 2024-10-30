import JobCard_AllJob from "../../common/JobCard_AllJob/JobCard_AllJob";

function JobList_AllJob({ jobs = [] }) {
  return (
    <div className="space-y-4">
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <JobCard_AllJob key={job.postId} job={job} /> // Sử dụng postId làm key
        ))
      ) : (
        <p>Không có công việc nào được tìm thấy.</p>
      )}
    </div>
  );
}

export default JobList_AllJob;
