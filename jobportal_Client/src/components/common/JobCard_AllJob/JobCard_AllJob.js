import { Card, CardContent } from "../../../ui/card";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bookmark, BookmarkCheck, MapPin, Building2 } from "lucide-react";
import Swal from "sweetalert2";
import { saveJob } from "../../../redux/Seeker/seeker.thunk";
import { jobTypeColors } from "../../../configs/constants";
import IndustryBadge from "../IndustryBadge/IndustryBadge";


function JobCard_AllJob({ job }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { savedJobs } = useSelector((store) => store.seeker);
  const { user } = useSelector((store) => store.auth);
  const isSaved = savedJobs?.some(savedJob => savedJob.postId === job.postId);

  const handleCardClick = () => {
    navigate(`/jobs/job-detail/${job.postId}`);
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
      const result = await dispatch(saveJob(job.postId)).unwrap();
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
    <Card className="group relative cursor-pointer overflow-hidden border border-gray-200 bg-white hover:border-primary/30 hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 h-full">
      {/* Badge jobType */}
      <div
        className="absolute bottom-4 right-4 z-10 text-xs font-semibold px-3 py-1 rounded-md"
        style={{
          backgroundColor: jobTypeColors[job.typeOfWork]?.backgroundColor || "#f3f4f6",
          color: jobTypeColors[job.typeOfWork]?.color || "#6b7280",
        }}
      >
        {job.typeOfWork}
      </div>
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

      <CardContent onClick={handleCardClick} className="p-6 h-full flex flex-col">
        {/* Logo + Job Title */}
        <div className="flex items-center space-x-4 mb-3">
          <img
            src={job.company.logo || "/placeholder.svg"}
            alt={`${job.company.companyName} logo`}
            className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 leading-tight mb-1">
              {job.title || "Không có tiêu đề"}
            </h3>
            <div className="flex items-center text-gray-600 mb-1">
              <Building2 className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{job.company?.companyName || "Không có công ty"}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{job.city?.cityName || "Không có địa điểm"}</span>
            </div>
          </div>
        </div>
        {/* Industry badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {Array.isArray(job.industry)
            ? job.industry.slice(0, 3).map((industry, index) => (
                <IndustryBadge key={index} name={industry.industryName} />
              ))
            : job.company?.industry?.industryName && (
                <IndustryBadge name={job.company.industry.industryName} />
              )}
        </div>
        {/* Salary */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200">
            Lương: {job.salary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(job.salary) : "Không có thông tin về lương"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default JobCard_AllJob;