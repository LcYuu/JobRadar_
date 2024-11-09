import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApplyModal from "../ApplyModal/ApplyModal";

const typeOfWorkStyles = {
  "Full-time": {
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    color: "rgb(0, 128, 0)",
    border: "1px solid rgb(0, 128, 0)",
  },
  "Part-time": {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    color: "rgb(255, 165, 0)",
    border: "1px solid rgb(255, 165, 0)",
  },
  "Remote": {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    color: "rgb(138, 43, 226)",
    border: "1px solid rgb(138, 43, 226)",
  },
  "Freelance": {
    backgroundColor: "rgba(0, 191, 255, 0.1)",
    color: "rgb(0, 191, 255)",
    border: "1px solid rgb(0, 191, 255)",
  },
  "Intern": {
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    color: "rgb(255, 69, 0)",
    border: "1px solid rgb(255, 69, 0)",
  },
};

const industryStyles = {
  "Thiết kế": {
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    color: "green",
    border: "1px solid green",
  },
  "Kinh doanh": {
    backgroundColor: "rgba(128, 0, 128, 0.1)",
    color: "purple",
    border: "1px solid purple",
  },
  "Marketing": {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    color: "orange",
    border: "1px solid orange",
  },
  "Công nghệ": {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "blue",
    border: "1px solid blue",
  },
  "IT phần cứng": {
    backgroundColor: "rgba(0, 0, 255, 0.1)",
    color: "blue",
    border: "1px solid blue",
  },
  "IT phần mềm": {
    backgroundColor: "rgba(0, 191, 255, 0.1)",
    color: "rgb(0, 191, 255)",
    border: "1px solid rgb(0, 191, 255)",
  },
  "Truyền thông": {
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    color: "rgb(255, 69, 0)",
    border: "1px solid rgb(255, 69, 0)",
  },
};

function JobCard_AllJob({ job }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    additionalInfo: '',
    cv: null
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        cv: file
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
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border border-stone-950 hover:border-spacing-y-40 hover:border-orange-800" 
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col">
          {/* Top section with job type */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4 flex items-center justify-center text-xl font-bold">
                <img 
                  src={job.company.logo || '/placeholder.svg'} 
                  alt={`${job.company.companyName} logo`} 
                  className="w-full h-full object-cover rounded-xl" 
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-gray-500">
                  {job.company.companyName} • {job.city.cityName}
                </p>
              </div>
            </div>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
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

          {/* Industry tags and Apply button */}
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {Array.isArray(job.company.industry.industryNames) ? 
                job.company.industry.industryNames.map((industry, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={
                      industryStyles[industry] || {
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        color: "rgb(0, 0, 0)",
                        border: "1px solid rgb(0, 0, 0)",
                      }
                    }
                  >
                    {industry}
                  </span>
                ))
                :
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
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
              }
            </div>
            <Button 
              className="bg-purple-600 text-white hover:bg-purple-700 ml-2"
              onClick={handleApplyClick}
            >
              Apply
            </Button>
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
