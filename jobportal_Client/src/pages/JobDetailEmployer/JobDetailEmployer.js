import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  DollarSign,
  CheckCircle2,
  Calendar,
  User,
  Hourglass,
  Edit,
  ArrowLeft,
} from "lucide-react";

import { Badge } from "@mui/material";
import { toast } from "react-toastify";
import { getDetailJobById, updateJob } from "../../redux/JobPost/jobPost.thunk";
import IndustryJobPostModal from "./IndustryJobPostModal";
import SkillPostModal from "./SkillJobPostModal";

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

const JobDetailEmployer = () => {
  const statusStyles = {
    "Hết hạn": {
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      color: "red",
    },
    "Đang mở": {
      backgroundColor: "rgba(0, 255, 0, 0.1)",
      color: "green",
    },
    "Chờ duyệt": {
      backgroundColor: "rgba(255, 165, 0, 0.1)",
      color: "orange",
    },
  };

  const colors = [
    "bg-sky-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-green-500",
    "bg-orange-500",
  ];

  const getColorByIndex = (index) => {
    return colors[index % colors.length];
  };

  const { postId } = useParams();
  const { detailJob } = useSelector((store) => store.jobPost);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [openSkill, setOpenSkill] = useState(false);
  const handleOpenSkillModal = () => setOpenSkill(true);
  const handleCloseSkill = () => setOpenSkill(false);

  const [openIndustry, setOpenIndustry] = useState(false);
  const handleOpenIndustryModal = () => setOpenIndustry(true);
  const handleCloseIndustry = () => setOpenIndustry(false);
  const [jobData, setJobData] = useState({
    expireDate: "",
    title: "",
    description: "",
    benefit: "",
    experience: "",
    salary: "",
    requirement: "",
    location: "",
    typeOfWork: "",
    position: "",
    niceToHaves: "",
  });

  const handleSaveSkills = async (selectedSkills) => {
    try {
      const skillIds = selectedSkills.map((skill) => skill.skillId);
  
      const updatedJobData = {
        ...jobData,
        skillIds: skillIds,
      };
      console.log("Sending updateJob with data:", updatedJobData);
  
      const result = await dispatch(updateJob({ postId, jobPostData: updatedJobData }));
      console.log("Update job result:", result);
  
      toast.success("Cập nhật kỹ năng thành công!");
      dispatch(getDetailJobById(postId));
    } catch (error) {
      console.error("Error updating skills:", error);
      toast.error("Có lỗi khi cập nhật kỹ năng!");
    }
  };

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
    dispatch(getDetailJobById(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    if (detailJob) {
      setJobData({
        expireDate: detailJob.expireDate || "",
        title: detailJob.title || "",
        description: detailJob.description || "",
        benefit: detailJob.benefit || "",
        experience: detailJob.experience || "",
        salary: detailJob.salary || "",
        requirement: detailJob.requirement || "",
        location: detailJob.location || "",
        typeOfWork: detailJob.typeOfWork || "",
        position: detailJob.position || "",
        niceToHaves: detailJob.niceToHaves || "", 
      });
    }
  }, [detailJob]);
  console.log("🚀 ~ JobDetailEmployer ~ detailJob:", detailJob);

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
    if (isEditing && detailJob?.location) {
      const addressParts = detailJob.location
        .split(",")
        .map((part) => part.trim());
      if (addressParts.length >= 4) {
        const [ward, district, province] = addressParts.slice(-3);
        const specificAddressPart = addressParts.slice(0, -3).join(", ");

        setSpecificAddress(specificAddressPart);
        setLocation({
          ward,
          district,
          province,
        });
        const matchingProvince = provinces.find((p) => p.name === province);
        if (matchingProvince) {
          setSelectedProvince(matchingProvince.code);
        }
      }
    }
  }, [isEditing, detailJob, provinces]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
          );
          const data = await response.json();
          setDistricts(data.districts);
          const selectedProvinceData = provinces.find(
            (p) => p.code === Number(selectedProvince)
          );
          if (selectedProvinceData) {
            setLocation((prev) => ({
              ...prev,
              province: selectedProvinceData.name,
            }));
          }

          if (location.district) {
            const matchingDistrict = data.districts.find(
              (d) => d.name === location.district
            );
            if (matchingDistrict) {
              setSelectedDistrict(matchingDistrict.code);
            }
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      }
    };
    fetchDistricts();
  }, [selectedProvince, location.district, provinces]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
          );
          const data = await response.json();
          setWards(data.wards);
          const selectedDistrictData = districts.find(
            (d) => d.code === Number(selectedDistrict)
          );
          if (selectedDistrictData) {
            setLocation((prev) => ({
              ...prev,
              district: selectedDistrictData.name,
            }));
          }

          if (location.ward) {
            const matchingWard = data.wards.find(
              (w) => w.name === location.ward
            );
            if (matchingWard) {
              setSelectedWard(matchingWard.code);
            }
          }
        } catch (error) {
          console.error("Error fetching wards:", error);
        }
      }
    };
    fetchWards();
  }, [selectedDistrict, location.ward, districts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard ||
      !specificAddress
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    if (jobData.salary <= 0) {
      toast.error("Mức lương phải lớn hơn 0.");
      return;
    }

    if (jobData.experience <= 0) {
      toast.error("Yêu cầu kinh nghiệm phải lớn hơn 0.");
      return;
    }

    try {
      const selectedProvinceData = provinces.find(
        (p) => p.code === Number(selectedProvince)
      );
      const selectedDistrictData = districts.find(
        (d) => d.code === Number(selectedDistrict)
      );
      const selectedWardData = wards.find(
        (w) => w.code === Number(selectedWard)
      );

      if (!selectedProvinceData || !selectedDistrictData || !selectedWardData) {
        toast.error("Có lỗi xảy ra khi xử lý thông tin địa chỉ");
        return;
      }

      const fullAddress = `${specificAddress}, ${selectedWardData.name}, ${selectedDistrictData.name}, ${selectedProvinceData.name}`;

      const updatedJobData = {
        ...jobData,
        location: fullAddress,
        cityId: cityCodeMapping[selectedProvince] || detailJob.cityId,
      };

      await dispatch(updateJob({ postId, jobPostData: updatedJobData }));

      setIsEditing(false);
      console.log("Showing success toast...");
      toast.success("Cập nhật thành công!");
      dispatch(getDetailJobById(postId));
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
    }
  };

  const [errors, setErrors] = useState({
    emailContact: "",
    phoneNumber: "",
  });

  const validateForm = () => {
    let tempErrors = {
      emailContact: "",
      phoneNumber: "",
    };
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (jobData.emailContact && !emailRegex.test(jobData.emailContact)) {
      tempErrors.emailContact = "Email không hợp lệ";
      isValid = false;
    }

    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (jobData.phoneNumber && !phoneRegex.test(jobData.phoneNumber)) {
      tempErrors.phoneNumber = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const getRemainingTime = () => {
    const currentDate = new Date();
    const expireDate = new Date(detailJob?.expireDate);
    const remainingDays = Math.ceil(
      (expireDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    if (remainingDays <= 0) {
      return "Đã hết hạn";
    }
    return `Còn: ${remainingDays} ngày`;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6 mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-4 sm:mb-6 text-sm sm:text-base hover:bg-gray-100"
          onClick={() =>
            navigate("/employer/account-management/job-management")
          }
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" stroke="currentColor" />
          <span>Trở lại danh sách</span>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <img
              src={detailJob?.company?.logo}
              alt="Company Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-purple-100 flex items-center justify-center text-xl sm:text-2xl font-bold text-purple-600"
            />
            {isEditing ? (
              <div className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2">
                  <label className="block text-gray-700 font-bold w-full sm:w-1/4 text-sm sm:text-base">
                    Tiêu đề:
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-2 py-1 sm:px-3 sm:py-2 w-full text-sm sm:text-base mt-2 sm:mt-0"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 mt-4">
                  <label className="block text-gray-700 font-bold w-full sm:w-1/4 text-sm sm:text-base">
                    Vị trí:
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={jobData.position}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-2 py-1 sm:px-3 sm:py-2 w-full text-sm sm:text-base mt-2 sm:mt-0"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        const newProvinceCode = e.target.value;
                        setSelectedProvince(newProvinceCode);
                        setSelectedDistrict("");
                        setSelectedWard("");
                        setDistricts([]);
                        setWards([]);
                        const selectedProvinceData = provinces.find(
                          (p) => p.code === Number(newProvinceCode)
                        );
                        if (selectedProvinceData) {
                          setLocation((prev) => ({
                            ...prev,
                            province: selectedProvinceData.name,
                            district: "",
                            ward: "",
                          }));
                        }
                      }}
                      className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
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
                      value={selectedDistrict}
                      onChange={(e) => {
                        const newDistrictCode = e.target.value;
                        setSelectedDistrict(newDistrictCode);
                        setSelectedWard("");
                        setWards([]);
                        const selectedDistrictData = districts.find(
                          (d) => d.code === Number(newDistrictCode)
                        );
                        if (selectedDistrictData) {
                          setLocation((prev) => ({
                            ...prev,
                            district: selectedDistrictData.name,
                            ward: "",
                          }));
                        }
                      }}
                      disabled={!selectedProvince}
                      className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
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
                      className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
                      value={selectedWard}
                      onChange={(e) => {
                        setSelectedWard(e.target.value);
                        const selectedWardData = wards.find(
                          (w) => w.code === e.target.value
                        );
                        setLocation((prev) => ({
                          ...prev,
                          ward: selectedWardData?.name || "",
                        }));
                      }}
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

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Số nhà, tên đường
                    </label>
                    <input
                      type="text"
                      className="w-full p-1 sm:p-2 border rounded text-sm sm:text-base"
                      value={specificAddress}
                      onChange={(e) => setSpecificAddress(e.target.value)}
                      placeholder="Nhập địa chỉ cụ thể"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-xl sm:text-2xl text-purple-700 font-bold mb-2">
                  {detailJob?.title}
                </h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-600 text-sm sm:text-base">
                  <span className="flex items-center gap-1">
                    <User
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      stroke="currentColor"
                    />
                    {detailJob?.position}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      stroke="currentColor"
                    />
                    {detailJob?.location}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-0">
            {detailJob?.approve === false ? (
              isEditing ? (
                <Button
                  variant="outline"
                  onClick={handleSubmit}
                  className="text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
                >
                  Lưu
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
                >
                  Chỉnh sửa
                </Button>
              )
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4">
          <Badge
            style={
              detailJob?.approve === false
                ? statusStyles["Chờ duyệt"] || {
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    color: "black",
                  }
                : detailJob?.status
                ? statusStyles[detailJob?.status] || {
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    color: "black",
                  }
                : { backgroundColor: "rgba(0, 0, 0, 0.1)", color: "black" }
            }
            variant="secondary"
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
          >
            {detailJob?.approve === false
              ? "Chờ duyệt"
              : detailJob?.status === "Hết hạn"
              ? "Hết hạn"
              : detailJob?.status}
          </Badge>

          <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" stroke="currentColor" />
            Đã đăng:
            <span>
              {new Date(detailJob?.createDate).toLocaleDateString("vi-VN")}
            </span>
          </span>

          <span className="text-xs sm:text-sm text-gray-500">
            {new Date(detailJob?.expireDate) < new Date()
              ? null
              : `Còn: ${Math.ceil(
                  (new Date(detailJob?.expireDate) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )} ngày`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Description */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Mô tả công việc
            </h2>
            {isEditing ? (
              <textarea
                className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                value={jobData.description}
                onChange={handleChange}
                name="description"
              />
            ) : (
              <div className="text-gray-600 text-sm sm:text-base">
                {detailJob?.description ? (
                  detailJob.description.split("\n").map((line, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5"
                        stroke="currentColor"
                      />
                      <span className="flex-1">{line.trim()}</span>
                    </li>
                  ))
                ) : (
                  <p>Không có mô tả nào được cung cấp.</p>
                )}
              </div>
            )}
          </Card>

          {/* Yêu cầu */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Yêu cầu</h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  value={jobData.requirement}
                  onChange={handleChange}
                  name="requirement"
                />
              ) : detailJob?.requirement ? (
                detailJob.requirement.split("\n").map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5"
                      stroke="currentColor"
                    />
                    <span>
                      {req.charAt(0).toUpperCase() + req.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>

          <Card className="p-4 sm:p-6 bg-white shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Trách nhiệm công việc
            </h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  value={jobData.niceToHaves}
                  onChange={handleChange}
                  name="niceToHaves"
                />
              ) : detailJob?.niceToHaves ? (
                detailJob.niceToHaves.split("\n").map((nt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5"
                      stroke="currentColor"
                    />
                    <span>
                      {nt.charAt(0).toUpperCase() + nt.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>

          {/* Quyền lợi */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Quyền lợi</h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  value={jobData.benefit}
                  onChange={handleChange}
                  name="benefit"
                />
              ) : detailJob?.benefit ? (
                detailJob.benefit.split("\n").map((be, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5"
                      stroke="currentColor"
                    />
                    <span>
                      {be.charAt(0).toUpperCase() + be.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <Card className="p-4 sm:p-6 bg-white shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Thông tin chung
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {/* Hạn nộp hồ sơ */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Clock
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0"
                    stroke="currentColor"
                  />
                  <span className="text-xs sm:text-sm lg:text-base truncate">
                    Hạn nộp hồ sơ
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={jobData.expireDate.split("T")[0]} // Extract only the date part
                    onChange={handleChange}
                    name="expireDate"
                    className="border p-1.5 sm:p-2 rounded text-xs sm:text-sm lg:text-base w-full sm:w-auto max-w-[200px]"
                  />
                ) : (
                  <span className="font-medium text-xs sm:text-sm lg:text-base min-w-0 truncate">
                    {new Date(detailJob?.expireDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                )}
              </div>

              {/* Mức lương */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <DollarSign
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0"
                    stroke="currentColor"
                  />
                  <span className="text-xs sm:text-sm lg:text-base truncate">
                    Mức lương
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={jobData.salary}
                    onChange={handleChange}
                    name="salary"
                    className="border p-1.5 sm:p-2 rounded text-xs sm:text-sm lg:text-base w-full sm:w-auto max-w-[200px]"
                  />
                ) : (
                  <span className="font-medium text-xs sm:text-sm lg:text-base min-w-0 truncate">
                    {detailJob?.salary
                      ? detailJob.salary.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Chưa có thông tin"}
                  </span>
                )}
              </div>

              {/* Số năm kinh nghiệm */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Hourglass
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0"
                    stroke="currentColor"
                  />
                  <span className="text-xs sm:text-sm lg:text-base truncate">
                    Số năm kinh nghiệm
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.experience}
                    onChange={handleChange}
                    name="experience"
                    className="border p-1.5 sm:p-2 rounded text-xs sm:text-sm lg:text-base w-full sm:w-auto max-w-[200px]"
                  />
                ) : (
                  <span className="font-medium text-xs sm:text-sm lg:text-base min-w-0 truncate">
                    {detailJob?.experience}
                  </span>
                )}
              </div>

              {/* Vị trí công việc */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Hourglass
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0"
                    stroke="currentColor"
                  />
                  <span className="text-xs sm:text-sm lg:text-base truncate">
                    Vị trí công việc
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.position}
                    onChange={handleChange}
                    name="position"
                    className="border p-1.5 sm:p-2 rounded text-xs sm:text-sm lg:text-base w-full sm:w-auto max-w-[200px]"
                  />
                ) : (
                  <span className="font-medium text-xs sm:text-sm lg:text-base min-w-0 truncate">
                    {detailJob?.position}
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Chuyên ngành
              </h3>
              {detailJob?.status !== "Hết hạn" &&
              detailJob?.approve === false ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenIndustryModal}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <Edit
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    stroke="currentColor"
                  />
                </Button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.isArray(detailJob?.industry) &&
              detailJob.industry.length > 0 ? (
                detailJob.industry.map((industry, index) => {
                  const bgColor = getColorByIndex(index);
                  const textColor = bgColor.replace("bg-", "text-");

                  return (
                    <div
                      key={industry.industryId || index}
                      className={`${bgColor} bg-opacity-15 rounded-full px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm 
                        flex items-center gap-2 transition-all duration-200 hover:bg-opacity-25`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${bgColor}`}
                      ></span>
                      <span className={`font-medium ${textColor}`}>
                        {industry.industryName}
                      </span>
                    </div>
                  );
                })
              ) : (
                <span className="text-sm sm:text-base">
                  Không có chuyên ngành
                </span>
              )}
            </div>

            <section>
              <IndustryJobPostModal
                open={openIndustry}
                handleClose={handleCloseIndustry}
                postId={postId}
                className="w-full max-w-[90%] sm:max-w-lg md:max-w-2xl"
              />
            </section>
          </Card>
          <Card className="p-4 sm:p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Kỹ năng yêu cầu
              </h3>
              {detailJob?.status !== "Hết hạn" &&
              detailJob?.approve === false ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenSkillModal}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <Edit
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    stroke="currentColor"
                  />
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {detailJob?.skills?.length > 0 ? (
                detailJob.skills.map((skill, index) => (
                  <div
                    key={skill.skillId}
                    className={`${getColorByIndex(
                      index
                    )} bg-opacity-15 rounded-full px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm 
                          flex items-center gap-2 transition-all duration-200 hover:bg-opacity-25`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${getColorByIndex(
                        index
                      )}`}
                    ></span>
                    <span
                      className={`font-medium text-${getColorByIndex(
                        index
                      ).replace("bg-", "")}`}
                    >
                      {skill.skillName}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm sm:text-base">
                  Không có kỹ năng yêu cầu
                </span>
              )}
            </div>
            <section>
              <SkillPostModal
                open={openSkill}
                handleClose={handleCloseSkill}
                onSave={handleSaveSkills} // Thêm prop onSave
                initialSkills={detailJob?.skills || []} // Thêm prop initialSkills
                postId={postId}
                className="w-full max-w-[90%] sm:max-w-lg md:max-w-2xl"
              />
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailEmployer;
