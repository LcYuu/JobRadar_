import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { useNavigate } from "react-router-dom";
import "./JobCard.css"; // Đảm bảo tệp CSS được import

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

function JobCardContent({ company, location, category }) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm font-semibold inline-block max-w-[150px] truncate">
          {company}
        </span>
        <span className="text-muted-foreground text-sm">{location}</span>
      </div>
      <div className="flex space-x-2">
        <Badge
          style={
            categoryStyles[category] || {
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              color: "black",
            }
          }
          variant="secondary"
        >
          {category}
        </Badge>
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

  const handleCardClick = () => {
    navigate(`/jobs/job-detail/${postId}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="card cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500 ease-in-out"
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
