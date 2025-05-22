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
      className="card cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500 ease-in-out relative"
    >
      <CardHeader className="card-header">
        <JobCardHeader
          jobType={jobType}
          companyLogo={companyLogo}
          className="rounded-full"
        />
        <CardTitle>{jobTitle}</CardTitle>
        {user && (
          <button
            onClick={handleSaveJob}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
              isSaved 
                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        )}
      </CardHeader>
      <CardContent className="card-content">
        <JobCardContent
          company={company}
          location={location}
          category={category}
        />
      </CardContent>
    </Card>
  );
}

function JobCardHeader({ jobType, companyLogo }) {
  // Xác định màu sắc cho từng loại công việc bằng mã màu hex
  const jobTypeColors = {
    "Toàn thời gian": "#e68b0b", // Màu cho "Toàn thời gian" (mã hex)
    "Bán thời gian": "#fbbf24", // Màu cho "Bán thời gian" (mã hex)
    "Từ xa": "#3b82f6", // Màu cho "Từ xa" (mã hex)
    "Thực tập sinh": "#7c3aed", // Màu cho "Thực tập sinh" (mã hex)
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <img
        src={companyLogo}
        alt="Company Logo"
        className="w-12 h-12 rounded-lg"
      />
      <div
        className={`text-white border px-2 py-1 rounded-md text-xs font-semibold uppercase`}
        style={{ backgroundColor: jobTypeColors[jobType] || "#6b7280" }} // Màu mặc định là #6b7280 (xám)
      >
        {jobType}
      </div>
    </div>
  );
}
