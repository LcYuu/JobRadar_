import { Card, CardContent } from "../../../ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApplyModal from "../ApplyModal/ApplyModal";
import { saveJob } from "../../../redux/Seeker/seeker.thunk";
import { useDispatch, useSelector } from "react-redux";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Swal from "sweetalert2";
import { jobTypeColors } from "../../../configs/constants";
import IndustryBadge from "../IndustryBadge/IndustryBadge";



function JobCard_AllJob({ job }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    additionalInfo: "",
    cv: null,
  });
  const dispatch = useDispatch();
  const { savedJobs } = useSelector((store) => store.seeker);
  const {user} = useSelector((store=>store.auth));
  const isSaved = savedJobs?.some(savedJob => savedJob.postId === job.postId);

  const handleCardClick = () => {
    navigate(`/jobs/job-detail/${job.postId}`);
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        cv: file,
      }));
    }
  };

  const handleModalClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(formData);
    handleModalClose();
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
    <Card
      className="w-full overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 bg-white group relative hover:bg-gray-100"
      onClick={handleCardClick}
      style={{ border: "none" }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          {/* Thêm tag typeOfWork ở đây */}
          <div className="absolute top-4 right-4 p-1 rounded-md text-xs font-semibold uppercase"
            style={{
              backgroundColor: jobTypeColors[job.typeOfWork]?.backgroundColor || "rgba(0,0,0,0.1)",
              color: jobTypeColors[job.typeOfWork]?.color || "rgb(0,0,0)",
              border: jobTypeColors[job.typeOfWork]?.border || "1px solid rgb(0,0,0)",
            }}>
            {job.typeOfWork}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 mb-4">
            <div className="flex items-center w-full overflow-hidden">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4 flex items-center justify-center flex-shrink-0">
                <img
                  src={job.company.logo || "/placeholder.svg"}
                  alt={`${job.company.companyName} logo`}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors duration-300 line-clamp-1">
                  {job.title || "Không có tiêu đề"}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {job.company?.companyName || "Không có công ty"}
                </p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {job.city?.cityName || "Không có địa điểm"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Hiển thị lương trong một tag */}
          <div className="absolute bottom-4 right-4 p-1 rounded-md text-xs font-semibold">
            <div className="flex flex-wrap gap-2 overflow-hidden max-h-[40px]">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200">
                Lương: {job.salary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(job.salary) : "Không có thông tin về lương"}
              </span>
            </div>
          </div>
          {/* Industry tags */}
          <div className="flex justify-between items-center overflow-hidden">
            <div className="flex flex-wrap gap-2 overflow-hidden max-h-[40px]">
              {Array.isArray(job.industry)
                ? job.industry.slice(0, 3).map((industry, index) => (
                    <IndustryBadge key={index} name={industry.industryName} />
                  ))
                : (
                    <IndustryBadge name={job.company.industry.industryName} />
                  )}
            </div>
          </div>
        </div>
      </CardContent>

      {isModalOpen && (
        <ApplyModal
          job={job}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          formData={formData}
          handleInputChange={handleInputChange}
          onFileChange={handleFileChange}
        />
      )}

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

export default JobCard_AllJob;