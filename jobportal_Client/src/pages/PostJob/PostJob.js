import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { X, ArrowLeft, ChevronDown, Clock, Bold, Italic, List, ListOrdered, Link2, Plus } from 'lucide-react';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";

const PostJob = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState({
    title: '',
    employmentType: [],
    salaryRange: {
      min: 5000,
      max: 22000
    },
    categories: '',
    skills: [],
    description: '',
    requirements: '',
    benefits: ''
  });

  const employmentTypes = [
    { id: 'full-time', label: 'Full-Time' },
    { id: 'part-time', label: 'Part-Time' },
    { id: 'remote', label: 'Remote' },
    { id: 'internship', label: 'Internship' },
    { id: 'contract', label: 'Contract' }
  ];

  // Danh sách categories mẫu
  const jobCategories = [
    "Software Development",
    "Design",
    "Marketing",
    "Sales",
    "Customer Service",
    "Finance",
    "Human Resources"
  ];

  const skillsList = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "UI/UX Design",
    "Product Management",
    "Digital Marketing",
    "Data Analysis",
    "Communication"
  ];

  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [descriptionState, setDescriptionState] = useState(EditorState.createEmpty());
  const [responsibilitiesState, setResponsibilitiesState] = useState(EditorState.createEmpty());
  const [requirementsState, setRequirementsState] = useState(EditorState.createEmpty());
  const [niceToHavesState, setNiceToHavesState] = useState(EditorState.createEmpty());
  const [benefits, setBenefits] = useState([
    {
      icon: "stethoscope",
      title: "Full Healthcare",
      description: "We believe in thriving communities and that starts with our team being happy and healthy."
    },
    {
      icon: "pool",
      title: "Unlimited Vacation",
      description: "We believe you should have a flexible schedule that makes space for family, wellness, and fun."
    },
    {
      icon: "graduation-cap", 
      title: "Skill Development",
      description: "We believe in always learning and leveling up our skills. Whether it's a conference or online course."
    }
  ]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAddSkill = (skill) => {
    if (skill && !jobData.skills.includes(skill)) {
      setJobData({
        ...jobData,
        skills: [...jobData.skills, skill]
      });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setJobData({
      ...jobData,
      skills: jobData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const getEditorContent = (editorState) => {
    const contentState = editorState.getCurrentContent();
    return JSON.stringify(convertToRaw(contentState));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Job Title</Label>
              <Input 
                placeholder="e.g. Software Engineer"
                value={jobData.title}
                onChange={(e) => setJobData({...jobData, title: e.target.value})}
              />
              <p className="text-sm text-gray-500 mt-1">At least 80 characters</p>
            </div>

            <div>
              <Label>Type of Employment</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {employmentTypes.map(type => (
                  <label key={type.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jobData.employmentType.includes(type.id)}
                      onChange={(e) => {
                        const newTypes = e.target.checked 
                          ? [...jobData.employmentType, type.id]
                          : jobData.employmentType.filter(t => t !== type.id);
                        setJobData({...jobData, employmentType: newTypes});
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Salary Range</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="5,000"
                    value={jobData.salaryRange.min}
                    onChange={(e) => setJobData({
                      ...jobData,
                      salaryRange: {...jobData.salaryRange, min: e.target.value}
                    })}
                    className="w-full"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="22,000"
                    value={jobData.salaryRange.max}
                    onChange={(e) => setJobData({
                      ...jobData,
                      salaryRange: {...jobData.salaryRange, max: e.target.value}
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Categories</Label>
              <select
                value={jobData.categories}
                onChange={(e) => setJobData({...jobData, categories: e.target.value})}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Job Categories</option>
                {jobCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {jobData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="relative mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-left flex justify-between items-center"
                  onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                >
                  <span>Add Skills</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSkillDropdownOpen ? 'transform rotate-180' : ''}`} />
                </Button>
                
                {isSkillDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {skillsList.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 mr-3"
                          checked={jobData.skills.includes(skill)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleAddSkill(skill);
                            } else {
                              handleRemoveSkill(skill);
                            }
                          }}
                        />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Details</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add the description of the job, responsibilities, who you are, and nice-to-haves.
              </p>

              {/* Job Description */}
              <div className="mb-6">
                <Label>Job Descriptions</Label>
                <p className="text-sm text-gray-500 mb-2">Job titles must be describe one position</p>
                <div className="border rounded-md">
                  <Editor
                    editorState={descriptionState}
                    onEditorStateChange={setDescriptionState}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ['inline', 'list', 'link'],
                      inline: {
                        options: ['bold', 'italic'],
                      },
                      list: {
                        options: ['unordered', 'ordered'],
                      },
                    }}
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div className="mb-6">
                <Label>Responsibilities</Label>
                <p className="text-sm text-gray-500 mb-2">Outline the core responsibilities of the position</p>
                <div className="border rounded-md">
                  <Editor
                    editorState={responsibilitiesState}
                    onEditorStateChange={setResponsibilitiesState}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ['inline', 'list', 'link'],
                      inline: {
                        options: ['bold', 'italic'],
                      },
                      list: {
                        options: ['unordered', 'ordered'],
                      },
                    }}
                  />
                </div>
              </div>

              {/* Who You Are */}
              <div className="mb-6">
                <Label>Who You Are</Label>
                <p className="text-sm text-gray-500 mb-2">Add your preferred candidates qualifications</p>
                <div className="border rounded-md">
                  <Editor
                    editorState={requirementsState}
                    onEditorStateChange={setRequirementsState}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ['inline', 'list', 'link'],
                      inline: {
                        options: ['bold', 'italic'],
                      },
                      list: {
                        options: ['unordered', 'ordered'],
                      },
                    }}
                  />
                </div>
              </div>

              {/* Nice-To-Haves */}
              <div>
                <Label>Nice-To-Haves</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Add nice-to-have skills and qualifications for the role to encourage a more diverse set of candidates to apply
                </p>
                <div className="border rounded-md">
                  <Editor
                    editorState={niceToHavesState}
                    onEditorStateChange={setNiceToHavesState}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ['inline', 'list', 'link'],
                      inline: {
                        options: ['bold', 'italic'],
                      },
                      list: {
                        options: ['unordered', 'ordered'],
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
              <p className="text-sm text-gray-500 mb-4">
                List out your top perks and benefits.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium">Perks and Benefits</h3>
                      <p className="text-sm text-gray-500">
                        Encourage more people to apply by sharing the attractive rewards and benefits you offer your employees
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 text-indigo-600"
                      onClick={() => {/* Handle add benefit */}}
                    >
                      <span>Add Benefit</span>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="relative border rounded-lg p-4">
                        <button 
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                          onClick={() => {/* Handle remove benefit */}}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            {/* Icon component based on benefit.icon */}
                          </div>
                          <div>
                            <h4 className="font-medium">{benefit.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      // Thêm case 3 cho các bước tiếp theo
      default:
        return null;
    }
  };

  const handleSubmitJob = async () => {
    try {
      // Xử lý submit job ở đây
      // await submitJob(jobData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting job:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Post a Job</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Job Information', 'Job Description', 'Perks & Benefit'].map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep > index + 1 ? 'bg-indigo-600 text-white' : 
                currentStep === index + 1 ? 'bg-indigo-600 text-white' : 
                'bg-gray-200'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm">{step}</span>
            </div>
            {index < 2 && <div className="flex-1 h-px bg-gray-200 mx-4" />}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg p-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <Button 
            variant="outline"
            className="text-gray-600"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Previous Step
          </Button>
        )}
        <div className="flex-1" />
        <Button 
          variant="default"
          className="bg-indigo-600"
          onClick={currentStep === 3 ? handleSubmitJob : () => setCurrentStep(currentStep + 1)}
        >
          {currentStep === 3 ? 'Post' : 'Next Step'}
        </Button>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Đăng tin thành công!</h3>
            <p className="text-gray-600 mb-4">
              Yêu cầu của bạn sẽ được duyệt để được hiển thị cho mọi người tìm việc
            </p>
            <div className="flex justify-end">
              <Button
                variant="default"
                className="bg-indigo-600"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/employer/jobs'); // Chuyển về trang quản lý việc làm
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJob; 