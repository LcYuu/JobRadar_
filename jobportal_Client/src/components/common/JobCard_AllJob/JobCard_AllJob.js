import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ApplyModal from "../ApplyModal/ApplyModal";

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
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300" 
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4 flex items-center justify-center text-xl font-bold">
            <img 
              src={job.company.logo || '/placeholder.svg'} 
              alt={`${job.company.companyName} logo`} 
              className="w-full h-full object-cover rounded-xl" 
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-sm text-gray-500">
              {job.company.companyName} • {job.city.cityName}
            </p>
            <div className="flex space-x-2 mt-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                {job.typeOfWork}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {job.company.industry.industryName}
              </span>
            </div>
          </div>
          <div className="text-right">
            <Button 
              className="bg-purple-600 text-white hover:bg-purple-700"
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
          handleFileChange={handleFileChange}
        />
      )}
    </Card>
  );
}

export default JobCard_AllJob;
