import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { X, ArrowLeft, ChevronDown } from "lucide-react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState } from "draft-js";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { getAllSkill } from "../../redux/Skills/skill.thunk";
import { getCity } from "../../redux/City/city.thunk";
import { createJobPost } from "../../redux/JobPost/jobPost.thunk";
import { getCompanyByJWT } from "../../redux/Company/company.thunk";
import SkillPostModal from "../JobDetailEmployer/SkillJobPostModal.js"; // Import the SkillPostModal

// Existing cityCodeMapping remains unchanged
const cityCodeMapping = {
  1: 16, // Hà Nội
  2: 1, // Hà Giang
  4: 2, // Cao Bằng
  6: 6, // Bắc Kạn
  8: 8, // Tuyên Quang
  10: 3, // Lào Cai
  11: 11, // Điện Biên
  12: 5, // Lai Châu
  14: 4, // Sơn La
  15: 9, // Yên Bái
  17: 20, // Hoà Bình
  19: 10, // Thái Nguyên
  20: 7, // Lạng Sơn
  22: 17, // Quảng Ninh
  24: 14, // Bắc Giang
  25: 12, // Phú Thọ
  26: 13, // Vĩnh Phúc
  27: 15, // Bắc Ninh
  30: 18, // Hải Dương
  31: 19, // Hải Phòng
  33: 21, // Hưng Yên
  34: 23, // Thái Bình
  35: 22, // Hà Nam
  36: 24, // Nam Định
  37: 25, // Ninh Bình
  38: 26, // Thanh Hóa
  40: 27, // Nghệ An
  42: 28, // Hà Tĩnh
  44: 29, // Quảng Bình
  45: 30, // Quảng Trị
  46: 31, // Thừa Thiên Huế
  48: 32, // Đà Nẵng
  49: 33, // Quảng Nam
  51: 34, // Quảng Ngãi
  52: 37, // Bình Định
  54: 38, // Phú Yên
  56: 40, // Khánh Hòa
  58: 43, // Ninh Thuận
  60: 48, // Bình Thuận
  62: 35, // Kon Tum
  64: 36, // Gia Lai
  66: 39, // Đắk Lắk
  67: 41, // Đắk Nông
  68: 42, // Lâm Đồng
  70: 44, // Bình Phước
  72: 45, // Tây Ninh
  74: 46, // Bình Dương
  75: 47, // Đồng Nai
  77: 51, // Bà Rịa - Vũng Tàu
  79: 49, // TP Hồ Chí Minh
  80: 50, // Long An
  82: 54, // Tiền Giang
  83: 56, // Bến Tre
  84: 59, // Trà Vinh
  86: 55, // Vĩnh Long
  87: 52, // Đồng Tháp
  89: 53, // An Giang
  91: 58, // Kiên Giang
  92: 57, // Cần Thơ
  93: 60, // Hậu Giang
  94: 61, // Sóc Trăng
  95: 62, // Bạc Liêu
  96: 63, // Cà Mau
};

function mapApiCodeToCityId(apiCode) {
  return cityCodeMapping[apiCode] || null;
}

const PostJob = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const { allIndustries } = useSelector((store) => store.industry);
  const { skills } = useSelector((store) => store.skill);
  const { companyJwt } = useSelector((store) => store.company);

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
    industryIds: [],
  });
  console.log("🚀 ~ PostJob ~ jobData:", jobData);

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false); // State for modal
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const [descriptionState, setDescriptionState] = useState(
    EditorState.createEmpty()
  );
  const [requirementsState, setRequirementsState] = useState(
    EditorState.createEmpty()
  );
  const [niceToHavesState, setNiceToHavesState] = useState(
    EditorState.createEmpty()
  );
  const [benefit, setBenefit] = useState(EditorState.createEmpty());
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");
  const [location, setLocation] = useState({
    province: "",
    district: "",
    ward: "",
  });

  useEffect(() => {
    dispatch(getAllSkill());
    dispatch(getCity());
    dispatch(getCompanyByJWT());
  }, [dispatch]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
          );
          const data = await response.json();
          setDistricts(data.districts);
          setLocation((prevLocation) => ({
            ...prevLocation,
            province: data.name,
          }));
          setSelectedDistrict("");
          setSelectedWard("");
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
          );
          const data = await response.json();
          setWards(data.wards);
          setLocation((prevLocation) => ({
            ...prevLocation,
            district: data.name,
          }));
          setSelectedWard("");
        } catch (error) {
          console.error("Error fetching wards:", error);
        }
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedWard && wards.length > 0) {
      const selectedWardData = wards.find(
        (ward) => ward.code === parseInt(selectedWard)
      );
      if (selectedWardData) {
        setLocation((prevLocation) => ({
          ...prevLocation,
          ward: selectedWardData.name,
        }));
      }
    }
  }, [selectedWard, wards]);

  const handleRemoveSkill = (skillId) => {
    setJobData({
      ...jobData,
      skillIds: jobData.skillIds.filter((id) => id !== skillId),
    });
  };

  const handleAddIndustry = (industry) => {
    if (industry && !jobData.industryIds.includes(industry)) {
      setJobData({
        ...jobData,
        industryIds: [...jobData.industryIds, industry],
      });
    }
  };

  const handleRemoveIndustry = (industryToRemove) => {
    setJobData({
      ...jobData,
      industryIds: jobData.industryIds.filter(
        (industry) => industry !== industryToRemove
      ),
    });
  };

  // Handle saving skills from the modal
  const handleSaveSkills = (selectedSkills) => {
    const skillIds = selectedSkills.map((skill) => skill.skillId);
    setJobData({
      ...jobData,
      skillIds,
    });
    setIsSkillModalOpen(false);
  };

  const validateJobData = (step, jobData) => {
    let tempErrors = {
      expireDate: "",
      title: "",
      cityId: "",
      typeOfWork: "",
      experience: "",
      salary: "",
      skillIds: "",
      industryIds: "",
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
        const currentDate = new Date();
        if (expireDate <= currentDate) {
          tempErrors.expireDate = "Ngày hết hạn phải lớn hơn ngày hiện tại.";
          isValid = false;
        }
      }

      if (!Array.isArray(jobData.skillIds) || jobData.skillIds.length === 0) {
        tempErrors.skillIds = "Bạn cần chọn ít nhất một kỹ năng.";
        isValid = false;
      }

      if (
        !Array.isArray(jobData.industryIds) ||
        jobData.industryIds.length === 0
      ) {
        tempErrors.industryIds = "Bạn cần chọn ít nhất một ngành.";
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
        tempErrors.experience = "Yêu cầu kinh nghiệm không được để trống";
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

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    try {
      const fullAddress =
        specificAddress +
        ", " +
        `${location.ward}, ${location.district}, ${location.province}`;

      const finalJobData = {
        ...jobData,
        cityId: cityCodeMapping[selectedProvince],
        location: fullAddress,
      };
      const jobPostData = finalJobData;

      const result = await dispatch(createJobPost(jobPostData));

      if (result?.payload?.success) {
        Swal.fire({
          icon: "success",
          title: "Tạo tin tuyển dụng thành công!",
          text:
            JSON.stringify(result?.payload?.message) ||
            "Tin tuyển dụng đã được tạo thành công.",
          confirmButtonText: "OK",
        }).then((response) => {
          if (response.isConfirmed) {
            navigate("/employer/account-management/job-management");
          }
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Có lỗi xảy ra",
          text:
            JSON.stringify(result?.payload.error) ||
            "Không thể tạo tin tuyển dụng.",
          confirmButtonText: "OK",
        }).then((response) => {
          if (response.isConfirmed) {
            navigate("/employer/account-management/job-management");
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "warning",
        title: "Có lỗi xảy ra",
        text: "Không thể tạo tin tuyển dụng. Vui lòng thử lại.",
        confirmButtonText: "OK",
      }).then((response) => {
        if (response.isConfirmed) {
          navigate("/employer/account-management/job-management");
        }
      });
    }
  };

  const handleProvinceSelection = (provinceCode) => {
    setSelectedProvince(provinceCode);
  };

  const handleNextStep = () => {
    const { isValid, errors } = validateJobData(currentStep, jobData);
    if (!isValid) {
      setErrors(errors);
    } else {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handleExpireDateChange = (e) => {
    const selectedDate = e.target.value;
    const defaultTime = "T00:00:00";
    setJobData({ ...jobData, expireDate: `${selectedDate}${defaultTime}` });
  };

  const typeOfWork = [
    { id: "Toàn thời gian", label: "Toàn thời gian" },
    { id: "Bán thời gian", label: "Bán thời gian" },
    { id: "Từ xa", label: "Từ xa" },
    { id: "Thực tập sinh", label: "Thực tập sinh" },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Tiêu đề công việc</Label>
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
              <Label>Hình thức làm việc</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {typeOfWork.map((type) => (
                  <label key={type.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="typeOfWork"
                      value={type.id}
                      checked={jobData.typeOfWork === type.id}
                      onChange={(e) =>
                        setJobData({
                          ...jobData,
                          typeOfWork: e.target.value,
                        })
                      }
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
              <Label>Lương</Label>
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
                Nhập một giá trị lương duy nhất.
              </p>
              {errors.salary && (
                <p className="text-red-500 text-sm">{errors.salary}</p>
              )}
            </div>
            <div>
              <Label>Vị trí</Label>
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
                Nhập vị trí công việc.
              </p>
              {errors.position && (
                <p className="text-red-500 text-sm">{errors.position}</p>
              )}
            </div>
            <div className="mt-4">
              <Label>Ngày hết hạn</Label>
              <Input
                type="date"
                value={jobData.expireDate.split("T")[0] || ""}
                onChange={(e) => handleExpireDateChange(e)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Chọn ngày hết hạn cho tin tuyển dụng này.
              </p>
              {errors.expireDate && (
                <p className="text-red-500 text-sm">{errors.expireDate}</p>
              )}
            </div>
            <div>
              <Label>Chọn chuyên ngành</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {jobData?.industryIds.map((industryId) => {
                  const industry = companyJwt?.industry.find(
                    (i) => i.industryId === industryId
                  );
                  return (
                    industry && (
                      <Badge
                        key={industry.industryId}
                        variant="secondary"
                        className="flex items-center gap-1 bg-purple-600 text-white"
                      >
                        {industry.industryName}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveIndustry(industryId)}
                        />
                      </Badge>
                    )
                  );
                })}
              </div>
              <div className="relative mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-left flex justify-between items-center"
                  onClick={() =>
                    setIsIndustryDropdownOpen(!isIndustryDropdownOpen)
                  }
                >
                  <span>Thêm</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isIndustryDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </Button>

                {isIndustryDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {companyJwt?.industry.map((industry) => (
                      <label
                        key={industry.industryId}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 mr-3"
                          checked={jobData.industryIds.includes(
                            industry.industryId
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleAddIndustry(industry.industryId);
                            } else {
                              handleRemoveIndustry(industry.industryId);
                            }
                          }}
                        />
                        <span className="text-sm">{industry.industryName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.industryIds && (
                <p className="text-red-500 text-sm">{errors.industryIds}</p>
              )}
            </div>
            <div>
              <Label>Các kỹ năng cần thiết</Label>
              <div className="flex flex-wrap gap-2 mt-2 min-h-[32px]">
                {jobData.skillIds.length > 0 ? (
                  jobData.skillIds
                    .map((skillId) => {
                      const skill = skills.find((s) => s.skillId === skillId);
                      return skill ? (
                        <Badge
                          key={skillId}
                          variant="secondary"
                          className="flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-300 px-2 py-1 rounded-md hover:bg-purple-200 transition-colors"
                        >
                          {skill.skillName}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-purple-500"
                            onClick={() => handleRemoveSkill(skillId)}
                          />
                        </Badge>
                      ) : null;
                    })
                    .filter(Boolean)
                ) : (
                  <p className="text-sm text-gray-500">
                    Chưa có kỹ năng nào được chọn.
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                onClick={() => setIsSkillModalOpen(true)}
              >
                Chọn kỹ năng
              </Button>
              {errors.skillIds && (
                <p className="text-red-500 text-sm mt-1">{errors.skillIds}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Chi tiết</h2>
              <p className="text-sm text-gray-500 mb-4">
                Thêm mô tả, trách nhiệm về công việc, thế nào là ứng viên phù
                hợp và cần có những kỹ năng gì.
              </p>

              <div className="mb-6">
                <Label>Mô tả công việc</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Thêm những mô tả công việc vào khung văn bản dưới đây
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
                      inline: { options: ["bold", "italic"] },
                      list: { options: ["unordered", "ordered"] },
                    }}
                    placeholder="Nhập mô tả công việc..."
                  />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              <div className="mb-6">
                <Label>Trách nhiệm công việc</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Danh sách các trách nhiệm cho vị trí công việc này (**Chú ý:
                  Mỗi trách nhiệm cách nhau bởi dấu xuống dòng)
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
                      inline: { options: ["bold", "italic"] },
                      list: { options: ["unordered", "ordered"] },
                    }}
                    placeholder="Nhập trách nhiệm công việc..."
                  />
                </div>
                {errors.requirement && (
                  <p className="text-red-500 text-sm">{errors.requirement}</p>
                )}
              </div>

              <div className="mb-6">
                <Label>Kinh nghiệm</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Nhập số năm kinh nghiệm cần thiết cho vị trí này (**Chú ý: Nhập 0 nếu
                  không yêu cầu kinh nghiệm)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={
                      jobData.experience === "Không yêu cầu"
                        ? "0"
                        : jobData.experience.replace(" năm", "")
                    }
                    onChange={(e) => {
                      const experienceValue = e.target.value;
                      setJobData({
                        ...jobData,
                        experience:
                          experienceValue === "0"
                            ? "Không yêu cầu"
                            : experienceValue
                            ? `${experienceValue} năm`
                            : "",
                      });
                    }}
                    placeholder="Nhập số năm kinh nghiệm"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-sm text-gray-600 mr-2">Gợi ý:</p>
                  {["Không yêu cầu", "1 năm", "2 năm", "3 năm", "5 năm"].map(
                    (exp) => (
                      <Badge
                        key={exp}
                        variant="outline"
                        className={`cursor-pointer hover:bg-gray-100 ${
                          jobData.experience === exp
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : "bg-gray-50"
                        }`}
                        onClick={() =>
                          setJobData({ ...jobData, experience: exp })
                        }
                      >
                        {exp}
                      </Badge>
                    )
                  )}
                </div>

                {errors.experience && (
                  <p className="text-red-500 text-sm">{errors.experience}</p>
                )}
              </div>

              <div className="mb-6">
                <Label>Các yêu cầu cần có</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Thêm các kỹ năng và trình độ cần có cho vai trò này để khuyến
                  khích nhiều ứng viên đa dạng hơn nộp đơn (**Chú ý: Mỗi yêu cầu
                  cách nhau bởi dấu xuống dòng)
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
                      inline: { options: ["bold", "italic"] },
                      list: { options: ["unordered", "ordered"] },
                    }}
                    placeholder="Nhập yêu cầu thêm..."
                  />
                </div>
                {errors.niceToHaves && (
                  <p className="text-red-500 text-sm">{errors.niceToHaves}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Thông tin cơ bản</h2>
              <p className="text-sm text-gray-500 mb-4">
                Liệt kê các đặc quyền và lợi ích hàng đầu của công ty
              </p>

              <div className="mb-6">
                <Label>Phúc lợi</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Thêm các phúc lợi mà công ty cung cấp để khuyến khích ứng viên
                  nộp đơn (**Chú ý: Mỗi đặc quyền hoặc lợi ích cách nhau bởi dấu
                  xuống dòng)
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
                      inline: { options: ["bold", "italic"] },
                      list: { options: ["unordered", "ordered"] },
                    }}
                    placeholder="Nhập lợi ích..."
                  />
                </div>
                {errors.benefit && (
                  <p className="text-red-500 text-sm">{errors.benefit}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedProvince}
                    id="tinh"
                    onChange={(e) => handleProvinceSelection(e.target.value)}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Quận/Huyện
                  </label>
                  <select
                    id="quan"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Phường/Xã
                  </label>
                  <select
                    id="xa"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Số nhà, tên đường
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={specificAddress}
                  onChange={(e) => setSpecificAddress(e.target.value)}
                  placeholder="Nhập địa chỉ cụ thể"
                />
              </div>
            </div>
          </div>
        );
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
        <h1 className="text-xl font-semibold">Đăng việc làm</h1>
      </div>

      <div className="flex items-center justify-between mb-8">
        {[
          "Thông tin công việc",
          "Mô tả công việc",
          "Phúc lợi và đặc quyền",
        ].map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > index + 1
                    ? "bg-purple-600 text-white"
                    : currentStep === index + 1
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-sm">{step}</span>
            </div>
            {index < 2 && <div className="flex-1 h-px bg-gray-200 mx-4" />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-lg p-6">{renderStepContent()}</div>

      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <Button
            variant="outline"
            className="text-gray-600"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Bước trước
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="default"
          className="bg-purple-600 text-white"
          onClick={currentStep === 3 ? handleSubmitJob : handleNextStep}
        >
          {currentStep === 3 ? "Đăng" : "Bước tiếp theo"}
        </Button>
      </div>

      {/* SkillPostModal for skill selection */}
      <SkillPostModal
        open={isSkillModalOpen}
        handleClose={() => setIsSkillModalOpen(false)}
        onSave={handleSaveSkills}
        initialSkills={jobData.skillIds
          .map((skillId) => skills.find((s) => s.skillId === skillId))
          .filter(Boolean)}
      />
    </div>
  );
};

export default PostJob;
