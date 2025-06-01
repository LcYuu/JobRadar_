import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Badge } from "../../../ui/badge"
import { useNavigate } from "react-router-dom"
import { saveJob } from "../../../redux/Seeker/seeker.thunk"
import { useDispatch, useSelector } from "react-redux"
import { Bookmark, BookmarkCheck, MapPin, ArrowRight } from "lucide-react"
import Swal from "sweetalert2"
import { jobTypeColors } from "../../../configs/constants"
import IndustryBadge from "../IndustryBadge/IndustryBadge"
import "./JobCard.css";

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
}

function JobCardHeader({ jobType, companyLogo, company }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <img
          src={companyLogo || "/placeholder.svg"}
          alt="Logo công ty"
          className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100 flex-shrink-0"
        />
        <div className="min-w-0 flex-1 pr-10">
          <h4 className="font-semibold text-gray-800 text-sm break-words">{company}</h4>
          <Badge
            variant="secondary"
            className="text-xs font-medium px-2 py-1 mt-1"
            style={{
              backgroundColor: jobTypeColors[jobType]?.backgroundColor || "#f3f4f6",
              color: jobTypeColors[jobType]?.color || "#6b7280",
            }}
          >
            {jobType}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function JobCardContent({ location, category = [] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center text-gray-500">
        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="text-sm">{location}</span>
      </div>

      {category.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {category.slice(0, 3).map((cat, index) => (
            <IndustryBadge key={index} name={cat} />
          ))}
          {category.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{category.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default function JobCard({ postId, jobTitle, company, location, category, jobType, companyLogo }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { savedJobs } = useSelector((store) => store.seeker)
  const isSaved = savedJobs?.some((savedJob) => savedJob.postId === postId)
  const { user } = useSelector((store) => store.auth)

  const handleCardClick = () => {
    navigate(`/jobs/job-detail/${postId}`)
  }

  const handleSaveJob = async (e) => {
    e.stopPropagation()
    if (!user) {
      await Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Vui lòng đăng nhập để thực hiện thao tác này",
        icon: "warning",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#9333ea",
      })
      return
    }
  
    try {
      const result = await dispatch(saveJob(postId)).unwrap()
      if (result.action === "saved") {
        await Swal.fire({
          title: "Thành công",
          text: "Đã lưu bài viết thành công",
          icon: "success",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#9333ea",
          timer: 1500,
          timerProgressBar: true
          showConfirmButton: false,
        })
      } else {
        await Swal.fire({
          title: "Thành công",
          text: "Đã bỏ lưu bài viết",
          icon: "success",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#9333ea",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      await Swal.fire({
        title: "Lỗi",
        text: "Có lỗi xảy ra khi thực hiện thao tác",
        icon: "error",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#9333ea",
      })
    }
  }

  return (
    <Card className="group relative cursor-pointer overflow-hidden border border-gray-200 bg-white hover:border-primary/30 hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 h-full">
      {/* Bookmark Button */}
      <button
        onClick={handleSaveJob}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-300 shadow-sm ${
          isSaved
            ? "bg-primary text-white shadow-md scale-110"
            : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-primary hover:bg-white hover:scale-110"
        } active:scale-95`}
        title={isSaved ? "Bỏ lưu" : "Lưu công việc"}
      >
        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </button>

      {/* Card Content */}
      <div onClick={handleCardClick} className="p-6 h-full flex flex-col">
        <CardHeader className="p-0 mb-4">
          <JobCardHeader jobType={jobType} companyLogo={companyLogo} company={company} />
        </CardHeader>

        {/* Job Title */}
        <CardTitle className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
          {jobTitle}
        </CardTitle>

        {/* Job Details */}
        <CardContent className="p-0 flex-1">
          <JobCardContent location={location} category={category} />
        </CardContent>

        {/* View Details Button - appears on hover */}
        <div className="mt-6 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center justify-between text-primary font-semibold text-sm">
            <span>Xem chi tiết</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )
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