import { Card, CardContent } from "../../../ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApplyModal from "../ApplyModal/ApplyModal";

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
  "Thương mại điện tử": {
    backgroundColor: "rgba(30, 144, 255, 0.1)",
    color: "#1E90FF",
    border: "1px solid #1E90FF",
  },
  "Marketing/Truyền thông": {
    backgroundColor: "rgba(255, 140, 0, 0.1)",
    color: "#FF8C00",
    border: "1px solid #FF8C00",
  },
  "IT phần cứng": {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "#0000FF",
    border: "1px solid #0000FF",
  },
  "Công nghệ ô tô": {
    backgroundColor: "rgba(255, 99, 71, 0.1)",
    color: "#FF4500",
    border: "1px solid #FF4500",
  },
  "IT phần mềm": {
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    color: "#00FFFF",
    border: "1px solid #00FFFF",
  },
  "Nhà hàng/Khách sạn": {
    backgroundColor: "rgba(255, 105, 180, 0.1)",
    color: "#FF69B4",
    border: "1px solid #FF69B4",
  },
  "Thiết kế/In ấn": {
    backgroundColor: "rgba(255, 99, 71, 0.1)",
    color: "#FF6347",
    border: "1px solid #FF6347",
  },
  "Cơ khí/Điện - điện tử": {
    backgroundColor: "rgba(70, 130, 180, 0.1)",
    color: "#4682B4",
    border: "1px solid #4682B4",
  },
  "Kinh doanh": {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    color: "#8A2BE2",
    border: "1px solid #8A2BE2",
  },
  "Giáo dục/Đào tạo": {
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    color: "#28A745",
    border: "1px solid #28A745",
  },
  "Kiến trúc/Xây dựng": {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    color: "#FFC107",
    border: "1px solid #FFC107",
  },
  "Tài chính/Ngân hàng": {
    backgroundColor: "rgba(23, 162, 184, 0.1)",
    color: "#17A2B8",
    border: "1px solid #17A2B8",
  },
  "Viễn thông": {
    backgroundColor: "rgba(200, 35, 51, 0.1)",
    color: "#C82333",
    border: "1px solid #C82333",
  },
  "Y tế": {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    color: "#6B7280",
    border: "1px solid #6B7280",
  },
  "Logistics": {
    backgroundColor: "rgba(221, 160, 221, 0.1)",
    color: "#DDA0DD",
    border: "1px solid #DDA0DD",
  },
  "Kế toán/Kiểm toán": {
    backgroundColor: "rgba(244, 162, 97, 0.1)",
    color: "#F4A261",
    border: "1px solid #F4A261",
  },
  "Sản xuất": {
    backgroundColor: "rgba(43, 108, 176, 0.1)",
    color: "#2B6CB0",
    border: "1px solid #2B6CB0",
  },
  "Tài xế": {
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    color: "#E91E63",
    border: "1px solid #E91E63",
  },
  "Luật": {
    backgroundColor: "rgba(72, 187, 120, 0.1)",
    color: "#48BB78",
    border: "1px solid #48BB78",
  },
  "Phiên dịch": {
    backgroundColor: "rgba(75, 85, 99, 0.1)",
    color: "#4B5563",
    border: "1px solid #4B5563",
  },
  "Hệ thống nhúng và IoT": {
    backgroundColor: "rgba(153, 27, 27, 0.1)",
    color: "#991B1B",
    border: "1px solid #991B1B",
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

  return (
    <Card
      className="w-full overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 bg-white group"
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