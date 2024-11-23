import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  X,
  ArrowLeft,
  ChevronDown,
  Clock,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Plus,
} from "lucide-react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { getAllSkill } from "../../redux/Skills/skill.action";
import { useDispatch, useSelector } from "react-redux";
import { createJobPost } from "../../redux/JobPost/jobPost.action";
import { store } from "../../redux/store";
import { getCity } from "../../redux/City/city.action";

const PostJob = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const { skills } = useSelector((store) => store.skill);
  const { cities } = useSelector((store) => store.city);
  const [errors, setErrors] = useState({});
  const [jobData, setJobData] = useState({
    expireDate: "",
    title: "",
    cityId: "",
    typeOfWork: "",
    experience: "",
    salary: "",
    skillIds: [],
    location: "",
    description: "",
    requirement: "",
    position: "",
    niceToHaves: "",
    benefit: "",
    expireDate: "",
  });

  const typeOfWork = [
    { id: "Toàn thời gian", label: "Toàn thời gian" },
    { id: "Bán thời gian", label: "Bán thời gian" },
    { id: "Từ xa", label: "Từ xa" },
    { id: "Thực tập sinh", label: "Thực tập sinh" },
  ];

  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [descriptionState, setDescriptionState] = useState();

  const [requirementsState, setRequirementsState] = useState();
  const [niceToHavesState, setNiceToHavesState] = useState(() =>
    EditorState.createEmpty()
  );
  const [benefit, setBenefit] = useState(() => EditorState.createEmpty());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    dispatch(getAllSkill());
    dispatch(getCity());
    setDescriptionState(EditorState.createEmpty());
    setRequirementsState(EditorState.createEmpty());
    setNiceToHavesState(EditorState.createEmpty());
    setBenefit(EditorState.createEmpty());
  }, [dispatch]);

  const handleAddSkill = (skill) => {
    if (skill && !jobData.skillIds.includes(skill)) {
      setJobData({
        ...jobData,
        skillIds: [...jobData.skillIds, skill],
      });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setJobData({
      ...jobData,
      skillIds: jobData.skillIds.filter((skill) => skill !== skillToRemove),
    });
  };

  // const getEditorContent = (editorState) => {
  //   if (!editorState || editorState.getCurrentContent) {
  //     console.error("EditorState is undefined or invalid");
  //     return "{}"; // Trả về nội dung mặc định
  //   }
  //   const contentState = editorState.getCurrentContent();
  //   return JSON.stringify(convertToRaw(contentState));
  // };

  const validateJobData = (step, jobData) => {
    let tempErrors = {
      expireDate: "",
      title: "",
      cityId: "",
      typeOfWork: "",
      experience: "",
      salary: "",
      skillIds: "",
      location: "",
      description: "",
      requirement: "",
      position: "",
      niceToHaves: "",
      benefit: "",
    };
    let isValid = true;

    if (step === 1) {
      if (!jobData.title || jobData.title.trim() === "") {
        tempErrors.title = "Tiêu đề công việc không được để trống.";
        isValid = false;
      }

      if (!jobData.typeOfWork || jobData.typeOfWork.trim() === "") {
        tempErrors.typeOfWork = "Loại công việc không được để trống.";
        isValid = false;
      }

      if (!jobData.salary || isNaN(jobData.salary) || jobData.salary <= 0) {
        tempErrors.salary = "Lương phải là một số lớn hơn 0.";
        isValid = false;
      }

      if (!jobData.position || jobData.position.trim() === "") {
        tempErrors.position = "Vị trí công việc không được để trống.";
        isValid = false;
      }

      if (!jobData.expireDate || isNaN(Date.parse(jobData.expireDate))) {
        tempErrors.expireDate = "Vui lòng chọn ngày hết hạn.";
        isValid = false;
      } else {
        const expireDate = new Date(jobData.expireDate);
        const currentDate = new Date(); // Lấy thời gian hiện tại

        // Kiểm tra nếu ngày hết hạn phải lớn hơn ngày hiện tại
        if (expireDate <= currentDate) {
          tempErrors.expireDate = "Ngày hết hạn phải lớn hơn ngày hiện tại.";
          isValid = false;
        }
      }

      if (!Array.isArray(jobData.skillIds) || jobData.skillIds.length === 0) {
        tempErrors.skillIds = "Bạn cần chọn ít nhất một kỹ năng.";
        isValid = false;
      }
    }

    if (step === 2) {
      if (!jobData.description || jobData.description.trim() === "") {
        tempErrors.description = "Mô tả công việc không được để trống.";
        isValid = false;
      } else if (jobData.description.length > 5000) {
        tempErrors.description =
          "Mô tả công việc không được vượt quá 5000 ký tự.";
        isValid = false;
      }

      if (!jobData.requirement || jobData.requirement.trim() === "") {
        tempErrors.requirement = "Yêu cầu công việc không được để trống.";
        isValid = false;
      } else if (jobData.requirement.length > 5000) {
        tempErrors.requirement =
          "Yêu cầu công việc không được vượt quá 5000 ký tự.";
        isValid = false;
      }

      if (!jobData.experience || jobData.experience <= 0) {
        tempErrors.experience = "Yêu cầu kinh nghiệm không được để trống và lớn hơn 0";
        isValid = false;
      } 

      if (!jobData.niceToHaves || jobData.niceToHaves.trim() === "") {
        tempErrors.niceToHaves = "Điều kiện bổ sung không được để trống.";
        isValid = false;
      } else if (jobData.niceToHaves.length > 5000) {
        tempErrors.niceToHaves =
          "Điều kiện bổ sung không được vượt quá 5000 ký tự.";
        isValid = false;
      }
    }
    if (step === 3) {
      if (!jobData.benefit || jobData.benefit.trim() === "") {
        tempErrors.benefit = "Lợi ích công việc không được để trống.";
        isValid = false;
      }

      if (!jobData.cityId || jobData.cityId.trim() === "") {
        tempErrors.cityId = "Bạn cần chọn thành phố.";
        isValid = false;
      }

      if (!jobData.location || jobData.location.trim() === "") {
        tempErrors.location = "Địa chỉ làm việc không được để trống.";
        isValid = false;
      }
    }

    return { isValid, errors: tempErrors };
  };

  const handleSubmitJob = async () => {
    if (!validateJobData(currentStep, jobData)) {
      return;
    }
    try {
      dispatch(createJobPost(jobData));
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting job:", error);
    }
  };

  const handleNextStep = () => {
    const { isValid, errors } = validateJobData(currentStep, jobData);
    console.log(errors);

    if (!isValid) {
      setErrors(errors); // Lưu lỗi vào state
    } else {
      // Sử dụng callback để đảm bảo cập nhật đúng trạng thái
      setCurrentStep((prevStep) => {
        console.log("Current Step before update:", prevStep); // Log trước khi cập nhật
        const nextStep = prevStep + 1;
        console.log("Current Step after update:", nextStep); // Log sau khi cập nhật
        return nextStep;
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Job Title</Label>
              <Input
                placeholder="Ví dụ: Kỹ sư"
                value={jobData?.title}
                onChange={(e) =>
                  setJobData({ ...jobData, title: e.target.value })
                }
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
            </div>

            <div>
              <Label>Type of Employment</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {typeOfWork.map((type) => (
                  <label key={type.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="typeOfWork" // Đảm bảo tất cả radio button thuộc cùng nhóm
                      value={type.id}
                      checked={jobData.typeOfWork === type.id} // Kiểm tra nếu được chọn
                      onChange={(e) =>
                        setJobData({
                          ...jobData,
                          typeOfWork: e.target.value,
                        })
                      } // Cập nhật trạng thái
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.typeOfWork && (
                <p className="text-red-500 text-sm">{errors.typeOfWork}</p>
              )}
            </div>

            <div>
              <Label>Salary</Label>
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="Ví dụ: 20000000"
                  value={jobData.salary}
                  onChange={(e) =>
                    setJobData({ ...jobData, salary: e.target.value })
                  }
                  min="1"
                  className="w-full"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Enter a single salary value.
              </p>
              {errors.salary && (
                <p className="text-red-500 text-sm">{errors.salary}</p>
              )}
            </div>

            <div>
              <Label>Position</Label>
              <Input
                type="text"
                placeholder="e.g. Software Engineer"
                value={jobData.position}
                onChange={(e) =>
                  setJobData({ ...jobData, position: e.target.value })
                }
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the job position.
              </p>
              {errors.position && (
                <p className="text-red-500 text-sm">{errors.position}</p>
              )}
            </div>

            <div className="mt-4">
              <Label>Expire Date</Label>
              <Input
                type="date"
                value={jobData.expireDate} // Giá trị ngày hết hạn
                onChange={
                  (e) => setJobData({ ...jobData, expireDate: e.target.value }) // Cập nhật ngày hết hạn
                }
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Select the expiration date for this job posting.
              </p>
              {errors.expireDate && (
                <p className="text-red-500 text-sm">{errors.expireDate}</p>
              )}
            </div>

            <div>
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {jobData.skillIds.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
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
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isSkillDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </Button>

                {isSkillDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {skills.map((skill) => (
                      <label
                        key={skill.skillId}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 mr-3"
                          checked={jobData.skillIds.includes(skill.skillId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleAddSkill(skill.skillId);
                            } else {
                              handleRemoveSkill(skill.skillId);
                            }
                          }}
                        />
                        <span className="text-sm">{skill.skillName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.skillIds && (
                <p className="text-red-500 text-sm">{errors.skillIds}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Details</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add the description of the job, responsibilities, who you are,
                and nice-to-haves.
              </p>

              {/* Job Description */}
              <div className="mb-6">
                <Label>Job Descriptions</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Job titles must be described in one position
                </p>
                <div className="border rounded-md">
                  <Editor
                    editorState={descriptionState}
                    onEditorStateChange={(newEditorState) => {
                      const plainText = newEditorState
                        .getCurrentContent()
                        .getPlainText();
                      if (plainText.length <= 1000) {
                        setDescriptionState(newEditorState);
                        setJobData({
                          ...jobData,
                          description: plainText,
                        });
                      }
                    }}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ["inline", "list", "link"],
                      inline: {
                        options: ["bold", "italic"],
                      },
                      list: {
                        options: ["unordered", "ordered"],
                      },
                    }}
                  />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Responsibilities */}
              <div className="mb-6">
                <Label>Requirements</Label>
                <p className="text-sm text-gray-500 mb-2">
                  List the requirements for this position
                </p>
                <div className="border rounded-md">
                  <Editor
                    editorState={requirementsState}
                    onEditorStateChange={(newEditorState) => {
                      const plainText = newEditorState
                        .getCurrentContent()
                        .getPlainText();
                      if (plainText.length <= 1000) {
                        setRequirementsState(newEditorState);
                        setJobData({
                          ...jobData,
                          requirement: plainText,
                        });
                      }
                    }}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ["inline", "list", "link"],
                      inline: {
                        options: ["bold", "italic"],
                      },
                      list: {
                        options: ["unordered", "ordered"],
                      },
                    }}
                  />
                </div>
                {errors.requirement && (
                  <p className="text-red-500 text-sm">{errors.requirement}</p>
                )}
              </div>

              <div className="mb-6">
                <Label>Experience</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Enter the required years of experience for this position
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={jobData.experience.replace(" năm", "")} // Hiển thị giá trị chỉ là số
                    onChange={(e) => {
                      const experienceValue = e.target.value;
                      setJobData({
                        ...jobData,
                        experience: experienceValue
                          ? `${experienceValue} năm`
                          : "", // Lưu giá trị dạng chuỗi với "năm"
                      });
                    }}
                    placeholder="Enter years of experience"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {errors.experience && (
                  <p className="text-red-500 text-sm">{errors.experience}</p>
                )}
              </div>

              {/* Nice-To-Haves */}
              <div className="mb-6">
                <Label>Nice-To-Haves</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Add nice-to-have skills and qualifications for the role to
                  encourage a more diverse set of candidates to apply
                </p>
                <div className="border rounded-md">
                  <Editor
                    editorState={niceToHavesState}
                    onEditorStateChange={(newEditorState) => {
                      const plainText = newEditorState
                        .getCurrentContent()
                        .getPlainText();
                      if (plainText.length <= 1000) {
                        setNiceToHavesState(newEditorState);
                        setJobData({
                          ...jobData,
                          niceToHaves: plainText,
                        });
                      }
                    }}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ["inline", "list", "link"],
                      inline: {
                        options: ["bold", "italic"],
                      },
                      list: {
                        options: ["unordered", "ordered"],
                      },
                    }}
                  />
                </div>
              </div>
              {errors.niceToHaves && (
                <p className="text-red-500 text-sm">{errors.niceToHaves}</p>
              )}
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

              <div className="mb-6">
                <Label>Benefits</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Add benefits offered by the company to encourage candidates to
                  apply.
                </p>
                <div className="border rounded-md">
                  <Editor
                    editorState={benefit}
                    onEditorStateChange={(newEditorState) => {
                      const plainText = newEditorState
                        .getCurrentContent()
                        .getPlainText();
                      if (plainText.length <= 1000) {
                        setBenefit(newEditorState);
                        setJobData({
                          ...jobData,
                          benefit: plainText,
                        });
                      }
                    }}
                    wrapperClassName="w-full"
                    editorClassName="px-3 min-h-[100px] focus:outline-none"
                    toolbar={{
                      options: ["inline", "list", "link"],
                      inline: {
                        options: ["bold", "italic"],
                      },
                      list: {
                        options: ["unordered", "ordered"],
                      },
                    }}
                  />
                </div>
                {errors.benefit && (
                  <p className="text-red-500 text-sm">{errors.benefit}</p>
                )}
              </div>

              <div>
                <Label>City</Label>
                <select
                  value={jobData.cityId} // Giá trị của city sẽ được lưu trong jobData
                  onChange={
                    (e) => setJobData({ ...jobData, cityId: e.target.value }) // Cập nhật giá trị city
                  }
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    Select a city
                  </option>
                  {cities.map((city) => (
                    <option key={city.cityId} value={city.cityId}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Select the city for the job position.
                </p>
                {errors.cityId && (
                  <p className="text-red-500 text-sm">{errors.cityId}</p>
                )}
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  type="text"
                  placeholder="e.g. New York, San Francisco"
                  value={jobData.location}
                  onChange={
                    (e) => setJobData({ ...jobData, location: e.target.value }) // Cập nhật giá trị location
                  }
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the location for the job position.
                </p>
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}
              </div>
            </div>
          </div>
        );
      // Thêm case 3 cho các bước tiếp theo
      default:
        return null;
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
        {["Job Information", "Job Description", "Perks & Benefit"].map(
          (step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > index + 1
                      ? "bg-indigo-600 text-white"
                      : currentStep === index + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
              {index < 2 && <div className="flex-1 h-px bg-gray-200 mx-4" />}
            </React.Fragment>
          )
        )}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg p-6">{renderStepContent()}</div>

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
          onClick={currentStep === 3 ? handleSubmitJob : handleNextStep}
        >
          {currentStep === 3 ? "Post" : "Next Step"}
        </Button>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Đăng tin thành công!</h3>
            <p className="text-gray-600 mb-4">
              Yêu cầu của bạn sẽ được duyệt để được hiển thị cho mọi người tìm
              việc
            </p>
            <div className="flex justify-end">
              <Button
                variant="default"
                className="bg-indigo-600"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/employer/account-management/job-management"); // Chuyển về trang quản lý việc làm
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
