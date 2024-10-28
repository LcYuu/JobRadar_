import JobCard_AllJob  from "../../common/JobCard_AllJob/JobCard_AllJob";

function JobList_AllJob({ jobs }) {
  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard_AllJob key={job.id} job={job} />
      ))}
    </div>
  );
}

export default JobList_AllJob;
