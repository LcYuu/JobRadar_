import { Card, CardContent } from "../../../ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApplyModal from "../ApplyModal/ApplyModal";
import { saveJob } from "../../../redux/Seeker/seeker.thunk";
import { useDispatch, useSelector } from "react-redux";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Swal from "sweetalert2";

const typeOfWorkStyles = {
  "Toàn thời gian": {
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    color: "rgb(0, 128, 0)",
    border: "1px solid rgb(0, 128, 0)",
  },
  "Bán thời gian": {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    color: "rgb(255, 165, 0)",
    border: "1px solid rgb(255, 165, 0)",
  },
  "Từ xa": {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    color: "rgb(138, 43, 226)",
    border: "1px solid rgb(138, 43, 226)",
  },
  "Thực tập sinh": {
    backgroundColor: "rgba(0, 191, 255, 0.1)",
    color: "rgb(0, 191, 255)",
    border: "1px solid rgb(0, 191, 255)",
  },
};

const industryStyles = {
  "Thiết kế": {
    backgroundColor: "rgba(255, 99, 71, 0.1)",
    color: "#FF6347",
    border: "1px solid #FF6347",
  },
  "Kinh doanh": {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    color: "#8A2BE2",
    border: "1px solid #8A2BE2",
  },
  Marketing: {
    backgroundColor: "rgba(255, 140, 0, 0.1)",
    color: "#FF8C00",
    border: "1px solid #FF8C00",
  },
  "Thương mại điện tử": {
    backgroundColor: "rgba(30, 144, 255, 0.1)",
    color: "#1E90FF",
    border: "1px solid #1E90FF",
  },
  "IT phần cứng": {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "#0000FF",
    border: "1px solid #0000FF",
  },
  "IT phần mềm": {
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    color: "#00FFFF",
    border: "1px solid #00FFFF",
  },
  "Công nghệ ô tô": {
    backgroundColor: "rgba(255, 99, 71, 0.1)",
    color: "#FF4500",
    border: "1px solid #FF4500",
  },
  "Nhà hàng/Khách sạn": {
    backgroundColor: "rgba(255, 105, 180, 0.1)",
    color: "#FF69B4",
    border: "1px solid #FF69B4",
  },
  "Điện - điện tử": {
    backgroundColor: "rgba(70, 130, 180, 0.1)",
    color: "#4682B4",
    border: "1px solid #4682B4",
  },
};

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
      className="w-full overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 bg-white group relative"
      onClick={handleCardClick}
      style={{ border: "none" }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          {/* Top section with job type */}
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
            {user && (
              <button
                onClick={handleSaveJob}
                className={`p-2 rounded-full transition-all duration-300 ${
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
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start lg:self-center flex-shrink-0"
              style={
                typeOfWorkStyles[job.typeOfWork] || {
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  color: "rgb(0, 0, 0)",
                  border: "1px solid rgb(0, 0, 0)",
                }
              }
            >
              {job.typeOfWork}
            </span>
          </div>

          {/* Industry tags */}
          <div className="flex justify-between items-center overflow-hidden">
            <div className="flex flex-wrap gap-2 overflow-hidden max-h-[40px]">
              {Array.isArray(job.industry)
                ? job.industry.slice(0, 3).map((industry, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full text-xs font-medium truncate"
                      style={
                        industryStyles[industry.industryName] || {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                          color: "rgb(0, 0, 0)",
                          border: "1px solid rgb(0, 0, 0)",
                        }
                      }
                    >
                      {industry.industryName}
                    </span>
                  ))
                : (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium truncate"
                      style={
                        industryStyles[job.company.industry.industryName] || {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                          color: "rgb(0, 0, 0)",
                          border: "1px solid rgb(0, 0, 0)",
                        }

                      }
                    >
                      {job.company.industry.industryName}
                    </span>
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
    </Card>
  );
}

export default JobCard_AllJob;