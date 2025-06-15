import React, { useEffect, useState } from "react";
import JobCard from "../JobCard/JobCard";
import { useDispatch, useSelector } from "react-redux";
import logo1 from "../../../assets/images/common/logo1.jpg";
import { getTop8LastestJob } from "../../../redux/JobPost/jobPost.thunk";
import useWebSocket from "../../../utils/useWebSocket";
import Container from "../Container/Container";

export default function Top8Job() {
  const dispatch = useDispatch();
  const {
    top8Job = [],
    loading,
    error,
  } = useSelector((store) => store.jobPost);

  useEffect(() => {
    dispatch(getTop8LastestJob());
  }, [dispatch]);

  const handleMessage = (dispatch, message, topic) => {
    if (topic === "/topic/job-updates") {
      if (message === "ADD JOB") {
        dispatch(getTop8LastestJob());
      } else if (message === "EXPIRE JOB") {
        dispatch(getTop8LastestJob());
      } else if (message === "APPROVE JOB") {
        dispatch(getTop8LastestJob());
      }
    }
  };

  useWebSocket(["/topic/job-updates"], handleMessage);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container>
      <section className="py-12">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-3xl font-bold text-center mb-8"
            style={{ color: "#43bfb3" }}
          >
            Các công việc mới nhất
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {top8Job.length > 0 ? (
          top8Job.map((job) => {
            // Tạo mảng category từ industryIds và industryNames
            const category = job.industryIds.map((id, index) => ({
              industryId: id,
              industryName: job.industryNames[index] || "Không xác định",
            }));

            return (
              <JobCard
                key={job.postId}
                postId={job.postId}
                jobTitle={job.title}
                company={job.companyName}
                location={job.cityName}
                category={category} // Truyền mảng category
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
      </section>
    </Container>
  );
}
