import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { useNavigate } from "react-router-dom";
import "./JobCard.css"; // Đảm bảo tệp CSS được import
import { saveJob } from "../../../redux/Seeker/seeker.thunk"; // Đảm bảo import đúng
import { useDispatch, useSelector } from "react-redux";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { jobTypeColors } from "../../../configs/constants";

const categoryStyles = {
  "Thiết kế": {
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    color: "green",
  },
  "Kinh doanh": {
    backgroundColor: "rgba(128, 0, 128, 0.1)",
    color: "purple",
  },
  Marketing: {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    color: "orange",
  },
  "Công nghệ": {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "blue",
  },
  "IT phần cứng": {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "blue",
  },
};

function JobCardContent({ company, location, category = []  }) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm font-semibold inline-block max-w-[150px] truncate">
          {company}
        </span>
        <span className="text-muted-foreground text-sm">{location}</span>
      </div>
      <div className="flex space-x-2">
      {category.map((cat, index) => (
          <Badge
            key={index}
            style={
              categoryStyles[cat] || {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                color: "black",
              }
            }
            variant="secondary"
          >
            {cat}
          </Badge>
        ))}
      </div>
    </>
  );
}

export default function JobCard({
  postId,
  jobTitle,
  company,
  location,
  category,
  jobType,
  companyLogo,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { savedJobs } = useSelector((store) => store.seeker);
  const isSaved = savedJobs?.some((savedJob) => savedJob.postId === postId);
  const {user} = useSelector((store=>store.auth));
  const handleCardClick = () => {
    navigate(`/jobs/job-detail/${postId}`);
  };

  const handleSaveJob = async (e) => {
    e.stopPropagation();
    if (!user) {
      await Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Vui lòng đăng nhập để thực hiện thao tác này",
        icon: "warning",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#9333ea",
      });
      return;
    }
  
    try {
      const result = await dispatch(saveJob(postId)).unwrap();
      if (result.action === "saved") {
        await Swal.fire({
          title: "Thành công",
          text: "Đã lưu bài viết thành công",
          icon: "success",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#9333ea",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        await Swal.fire({
          title: "Thành công",
          text: "Đã bỏ lưu bài viết",
          icon: "success",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#9333ea",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Lỗi",
        text: "Có lỗi xảy ra khi thực hiện thao tác",
        icon: "error",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#9333ea"
      });
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className="card cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500 ease-in-out relative group hover:bg-gray-100"
    >
      <CardHeader className="card-header">
        <JobCardHeader
          jobType={jobType}
          companyLogo={companyLogo}
          className="rounded-full"
        />
        <CardTitle>{jobTitle}</CardTitle>
      </CardHeader>
      <CardContent className="card-content">
        <JobCardContent
          company={company}
          location={location}
          category={category}
        />
      </CardContent>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-200 bg-opacity-50">
      <div className="flex flex-col gap-3">
        <button
          onClick={handleCardClick}
          className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-medium px-5 py-2 rounded-full shadow-md transition duration-300 ease-in-out"
        >
          Xem chi tiết
        </button>
        <button
          onClick={handleSaveJob}
          className={`bg-gradient-to-r ${
            isSaved
              ? "from-red-400 to-red-600 hover:from-red-500 hover:to-red-700"
              : "from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700"
          } text-white font-medium px-5 py-2 rounded-full shadow-md transition duration-300 ease-in-out`}
        >
          {isSaved ? "Bỏ lưu" : "Lưu bài viết"}
        </button>
      </div>
    </div>

    </Card>
  );
}

function JobCardHeader({ jobType, companyLogo }) {
  return (
    <div className="flex justify-between items-start mb-4">
      <img
        src={companyLogo}
        alt="Company Logo"
        className="w-12 h-12 rounded-lg"
      />
      <div
        className={`border px-2 py-1 rounded-md text-xs font-semibold uppercase`}
        style={{
          backgroundColor: jobTypeColors[jobType]?.backgroundColor || "#6b7280",
          color: jobTypeColors[jobType]?.color || "#6b7280",
          border: jobTypeColors[jobType]?.border || "1px solid #6b7280"
        }}
      >
        {jobType}
      </div>  
    </div>
  );
}
