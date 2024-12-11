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
  ArrowLeft
} from "lucide-react";
import {
  getDetailJobById,
  updateJob,
} from "../../redux/JobPost/jobPost.action";
// import { store } from "../../redux/store";
import SkillJobPostModal from "./SkillJobPostModal";
import { Badge } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { getCity } from "../../redux/City/city.action";
const cityCodeMapping = {
  1: 16,    // Hà Nội
  2: 1,     // Hà Giang 
  4: 2,     // Cao Bằng
  6: 6,     // Bắc Kạn
  8: 8,     // Tuyên Quang
  10: 3,    // Lào Cai
  11: 11,   // Điện Biên
  12: 5,    // Lai Châu
  14: 4,    // Sơn La
  15: 9,    // Yên Bái
  17: 20,   // Hoà Bình
  19: 10,   // Thái Nguyên
  20: 7,    // Lạng Sơn
  22: 17,   // Quảng Ninh
  24: 14,   // Bắc Giang
  25: 12,   // Phú Thọ
  26: 13,   // Vĩnh Phúc
  27: 15,   // Bắc Ninh
  30: 18,   // Hải Dương
  31: 19,   // Hải Phòng
  33: 21,   // Hưng Yên
  34: 23,   // Thái Bình
  35: 22,   // Hà Nam
  36: 24,   // Nam Định
  37: 25,   // Ninh Bình
  38: 26,   // Thanh Hóa
  40: 27,   // Nghệ An
  42: 28,   // Hà Tĩnh
  44: 29,   // Quảng Bình
  45: 30,   // Quảng Trị
  46: 31,   // Thừa Thiên Huế
  48: 32,   // Đà Nẵng
  49: 33,   // Quảng Nam
  51: 34,   // Quảng Ngãi
  52: 37,   // Bình Định
  54: 38,   // Phú Yên
  56: 40,   // Khánh Hòa
  58: 43,   // Ninh Thuận
  60: 48,   // Bình Thuận
  62: 35,   // Kon Tum
  64: 36,   // Gia Lai
  66: 39,   // Đắk Lắk
  67: 41,   // Đắk Nông
  68: 42,   // Lâm Đồng
  70: 44,   // Bình Phước
  72: 45,   // Tây Ninh
  74: 46,   // Bình Dương
  75: 47,   // Đồng Nai
  77: 51,   // Bà Rịa - Vũng Tàu
  79: 49,   // TP Hồ Chí Minh
  80: 50,   // Long An
  82: 54,   // Tiền Giang
  83: 56,   // Bến Tre
  84: 59,   // Trà Vinh
  86: 55,   // Vĩnh Long
  87: 52,   // Đồng Tháp
  89: 53,   // An Giang
  91: 58,   // Kiên Giang
  92: 57,   // Cần Thơ
  93: 60,   // Hậu Giang
  94: 61,   // Sóc Trăng
  95: 62,   // Bạc Liêu
  96: 63    // Cà Mau
};
const JobDetailEmployer = () => {
  const statusStyles = {
    "Hết hạn": {
      backgroundColor: "rgba(255, 0, 0, 0.1)", // Màu đỏ nhạt cho Hết hạn
      color: "red", // Màu chữ đỏ
    },
    "Đang mở": {
      backgroundColor: "rgba(0, 255, 0, 0.1)", // Màu xanh lá nhạt cho Đang mở
      color: "green", // Màu chữ xanh lá
    },
    "Chưa được duyệt": {
      backgroundColor: "rgba(255, 165, 0, 0.1)", // Màu cam nhạt cho Chưa được duyệt
      color: "orange", // Màu chữ cam
    },
    // Bạn có thể thêm các trạng thái khác nếu cần
  };

  const colors = [
    "bg-sky-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-green-500",
    "bg-orange-500",
  ];

  // Hàm lấy màu sắc theo thứ tự
  const getColorByIndex = (index) => {
    return colors[index % colors.length]; // Quay lại đầu mảng khi đến cuối
  };

  const { postId } = useParams();
  const { detailJob } = useSelector((store) => store.jobPost);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [openSkill, setOpenSkill] = useState(false);
  const handleOpenSkillModal = () => setOpenSkill(true);
  const handleCloseSkill = () => setOpenSkill(false);
  const [jobData, setJobData] = useState({
    // createDate: "",
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
    // status: "",
    niceToHaves: "",
    skillIds: [], // Danh sách kỹ năng, mặc định là mảng rỗng
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');
  const [location, setLocation] = useState({
    province: '',
    district: '',
    ward: ''
  });

  useEffect(() => {
    dispatch(getDetailJobById(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    if (detailJob) {
      setJobData({
        // Gán giá trị hoặc giá trị mặc định
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
        // skillIds: detailJob.skillIds ? [...detailJob.skillIds] : [], // Nếu có danh sách kỹ năng, sao chép sang mảng mới
      });
    }
  }, [detailJob]); // Theo dõi sự thay đổi của jobDetail

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (isEditing && detailJob?.location) {
      const addressParts = detailJob.location.split(',').map(part => part.trim());
      if (addressParts.length >= 4) {
        // Lấy 3 phần cuối cho ward, district, province
        const [ward, district, province] = addressParts.slice(-3);
        // Phần còn lại là số nhà, tên đường (có thể chứa nhiều dấu phẩy)
        const specificAddressPart = addressParts.slice(0, -3).join(', ');

        setSpecificAddress(specificAddressPart);
        setLocation({
          ward,
          district,
          province
        });

        // Tìm và set province code
        const matchingProvince = provinces.find(p => p.name === province);
        if (matchingProvince) {
          setSelectedProvince(matchingProvince.code);
          // Districts và Wards sẽ được set thông qua các useEffect khác
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
          
          // Cập nhật tên tỉnh/thành phố trong location state
          const selectedProvinceData = provinces.find(p => p.code === Number(selectedProvince));
          if (selectedProvinceData) {
            setLocation(prev => ({ ...prev, province: selectedProvinceData.name }));
          }

          // Nếu đang trong chế độ chỉnh sửa và có district ban đầu
          if (location.district) {
            const matchingDistrict = data.districts.find(d => d.name === location.district);
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
  
  // Thêm useEffect để xử lý wards khi selectedDistrict thay đổi
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
          );
          const data = await response.json();
          setWards(data.wards);
          
          // Cập nhật tên quận/huyện trong location state
          const selectedDistrictData = districts.find(d => d.code === Number(selectedDistrict));
          if (selectedDistrictData) {
            setLocation(prev => ({ ...prev, district: selectedDistrictData.name }));
          }

          // Nếu đang trong chế độ chỉnh sửa và có ward ban đầu
          if (location.ward) {
            const matchingWard = data.wards.find(w => w.name === location.ward);
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
    // Validate required fields
    if (!selectedProvince || !selectedDistrict || !selectedWard || !specificAddress) {
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
      // Lấy tên đầy đủ của các địa điểm đã chọn
      const selectedProvinceData = provinces.find(p => p.code === Number(selectedProvince));
      const selectedDistrictData = districts.find(d => d.code === Number(selectedDistrict));
      const selectedWardData = wards.find(w => w.code === Number(selectedWard));

      if (!selectedProvinceData || !selectedDistrictData || !selectedWardData) {
        toast.error("Có lỗi xảy ra khi xử lý thông tin địa chỉ");
        return;
      }

      // Tạo địa chỉ đầy đủ
      const fullAddress = `${specificAddress}, ${selectedWardData.name}, ${selectedDistrictData.name}, ${selectedProvinceData.name}`;

      // Cập nhật dữ liệu công việc với địa chỉ mới
      const updatedJobData = {
        ...jobData,
        location: fullAddress,
        cityId: cityCodeMapping[selectedProvince] || detailJob.cityId,
      };

      // Gọi API cập nhật
      await dispatch(updateJob(postId, updatedJobData));
      
      // Reset form và hiển thị thông báo thành công
      setIsEditing(false);
      toast.success("Cập nhật thành công!");
      
      // Refresh dữ liệu
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

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (jobData.emailContact && !emailRegex.test(jobData.emailContact)) {
      tempErrors.emailContact = "Email không hợp lệ";
      isValid = false;
    }

    // Validate phone number (số điện thoại Việt Nam)
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (jobData.phoneNumber && !phoneRegex.test(jobData.phoneNumber)) {
      tempErrors.phoneNumber = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const Toast = ({ message, onClose }) => (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-fade-in-down z-50">
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  );

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Tạo hàm tính toán và format thời gian còn lại
  const getRemainingTime = () => {
    const currentDate = new Date();
    const expireDate = new Date(detailJob?.expireDate);
    const remainingDays = Math.ceil((expireDate - currentDate) / (1000 * 60 * 60 * 24));
    
    if (remainingDays <= 0) {
      return "Đã hết hạn";
    }
    return `Còn: ${remainingDays} ngày`;
  };

  

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-6">
      <Button
          variant="ghost"
          className="flex items-center gap-2 mb-6 hover:bg-gray-100"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở lại danh sách</span>
        </Button>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img
              src={detailJob?.company?.logo}
              alt="Company Logo"
              className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600"
            />
            {isEditing ? (
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-gray-700 font-bold w-1/4">
                    Tiêu đề:
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-3/4"
                  />
                </div>

                <div className="flex items-center mb-2 mt-4">
                  <label className="block text-gray-700 font-bold w-1/4">
                    Vị trí:
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={jobData.position}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 w-3/4 h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        const newProvinceCode = e.target.value;
                        setSelectedProvince(newProvinceCode);
                        // Reset district và ward
                        setSelectedDistrict("");
                        setSelectedWard("");
                        setDistricts([]);
                        setWards([]);
                        // Cập nhật location state
                        const selectedProvinceData = provinces.find(p => p.code === Number(newProvinceCode));
                        if (selectedProvinceData) {
                          setLocation(prev => ({
                            ...prev,
                            province: selectedProvinceData.name,
                            district: "",
                            ward: ""
                          }));
                        }
                      }}
                      className="w-full p-1 border rounded"
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
                        // Reset ward
                        setSelectedWard("");
                        setWards([]);
                        // Cập nhật location state
                        const selectedDistrictData = districts.find(d => d.code === Number(newDistrictCode));
                        if (selectedDistrictData) {
                          setLocation(prev => ({
                            ...prev,
                            district: selectedDistrictData.name,
                            ward: ""
                          }));
                        }
                      }}
                      disabled={!selectedProvince}
                      className="w-full p-1 border rounded"
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
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={selectedWard}
                      onChange={(e) => {
                        setSelectedWard(e.target.value);
                        const selectedWardData = wards.find(w => w.code === e.target.value);
                        setLocation(prev => ({...prev, ward: selectedWardData?.name || ''}));
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

                  <div className="col-span-3">
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
            ) : (
              <div>
                <h1 className="text-2xl text-purple-700 font-bold mb-2">{detailJob?.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {detailJob?.position}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {detailJob?.location}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {detailJob?.status === "Hết hạn" ? null : detailJob?.approve === // Kiểm tra xem công việc chưa được duyệt hay không (approve === false)
              false ? (
              isEditing ? (
                // Nếu đang trong chế độ chỉnh sửa, hiển thị nút Lưu
                <Button variant="outline" onClick={handleSubmit}>
                  Lưu
                </Button>
              ) : (
                // Nếu không trong chế độ chỉnh sửa, hiển thị nút Chỉnh sửa
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa
                </Button>
              )
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 p-4 ">
          <Badge
            style={
              detailJob?.approve === false
                ? statusStyles["Chưa được duyệt"] || {
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
          >
            {detailJob?.approve === false
              ? "Chưa được duyệt"
              : detailJob?.status === "Hết hạn"
              ? "Hết hạn"
              : detailJob?.status}
          </Badge>

          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Đã đăng:
            <span>
              {new Date(detailJob?.createDate).toLocaleDateString("vi-VN")}
            </span>
          </span>

          <span className="text-sm text-gray-500">

            {new Date(detailJob?.expireDate) < new Date()
              ? null
              : `Còn: ${Math.ceil(
                  (new Date(detailJob?.expireDate) - new Date()) /
                    (1000 * 60 * 60 * 24)
                )} ngày`}

          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Job Description */}
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Mô tả công việc</h2>
            {isEditing ? (
              <textarea
                className="w-full p-2 border rounded"
                value={jobData.description}
                onChange={handleChange}
                name="description"
              />
            ) : (
              <div className="text-gray-600">
                {detailJob?.description ? (
                  detailJob.description.split("\n").map((line, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
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
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Yêu cầu</h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={jobData.requirement}
                  onChange={handleChange}
                  name="requirement"
                />
              ) : detailJob?.requirement ? (
                detailJob.requirement.split("\n").map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>
                      {req.charAt(0).toUpperCase() + req.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>

          {/* Trách nhiệm công việc */}
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Trách nhiệm công việc
            </h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={jobData.niceToHaves}
                  onChange={handleChange}
                  name="niceToHaves"
                />
              ) : detailJob?.niceToHaves ? (
                detailJob.niceToHaves.split("\n").map((nt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>
                      {nt.charAt(0).toUpperCase() + nt.slice(1).trim()}
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </Card>

          {/* Quyền lợi */}
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Quyền lợi</h2>
            <ul className="space-y-2">
              {isEditing ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={jobData.benefit}
                  onChange={handleChange}
                  name="benefit"
                />
              ) : detailJob?.benefit ? (
                detailJob.benefit.split("\n").map((be, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
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
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="font-semibold mb-4">Thông tin chung</h3>
            <div className="space-y-4">
              {/* Hạn nộp hồ sơ */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>Hạn nộp hồ sơ</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={jobData.expireDate}
                    onChange={handleChange}
                    name="expireDate"
                    className="border p-1 rounded"
                  />
                ) : (
                  <span className="font-medium">
                    {new Date(detailJob?.expireDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                )}
              </div>

              {/* Mức lương */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>Mức lương</span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    value={jobData.salary}
                    onChange={handleChange}
                    name="salary"
                    className="border p-1 rounded"
                  />
                ) : (
                  <span className="font-medium">
                    {detailJob?.salary
                      ? detailJob.salary.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Chưa có thông tin"}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-gray-500" />
                  <span>Số năm kinh nghiệm</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobData.experience}
                    onChange={handleChange}
                    name="experience"
                    className="border p-1 rounded"
                  />
                ) : (
                  <span className="font-medium">{detailJob?.experience}</span>
                )}
              </div>

              {/* Add Address Section */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>Địa điểm làm việc</span>
                </div>
                {isEditing ? (
                  <div className="space-y-2 w-1/2">
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        const newProvinceCode = e.target.value;
                        setSelectedProvince(newProvinceCode);
                        // Reset district và ward
                        setSelectedDistrict("");
                        setSelectedWard("");
                        setDistricts([]);
                        setWards([]);
                        // Cập nhật location state
                        const selectedProvinceData = provinces.find(p => p.code === Number(newProvinceCode));
                        if (selectedProvinceData) {
                          setLocation(prev => ({
                            ...prev,
                            province: selectedProvinceData.name,
                            district: "",
                            ward: ""
                          }));
                        }
                      }}
                      className="w-full p-1 border rounded"
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        const newDistrictCode = e.target.value;
                        setSelectedDistrict(newDistrictCode);
                        // Reset ward
                        setSelectedWard("");
                        setWards([]);
                        // Cập nhật location state
                        const selectedDistrictData = districts.find(d => d.code === Number(newDistrictCode));
                        if (selectedDistrictData) {
                          setLocation(prev => ({
                            ...prev,
                            district: selectedDistrictData.name,
                            ward: ""
                          }));
                        }
                      }}
                      disabled={!selectedProvince}
                      className="w-full p-1 border rounded"
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full p-1 border rounded"
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={specificAddress}
                      onChange={(e) => setSpecificAddress(e.target.value)}
                      placeholder="Số nhà, tên đường"
                      className="w-full p-1 border rounded"
                    />
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="font-medium">{detailJob?.location || "Chưa có thông tin"}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Required Skills */}
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Kỹ năng yêu cầu</h3>
              {detailJob?.status !== "Hết hạn" &&
              detailJob?.approve === false ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleOpenSkillModal}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4" />
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
                    )} bg-opacity-15 rounded-full px-4 py-2 text-sm 
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
                <span>Không có kỹ năng yêu cầu</span> // Thông báo nếu không có kỹ năng
              )}
            </div>
            <section>
              <SkillJobPostModal
                open={openSkill}
                handleClose={handleCloseSkill}
                postId={postId}
              />
            </section>
          </Card>

          {/* Applicants List */}
          {/* <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Danh sách ứng viên</h3>
              <Button variant="outline" size="sm" onClick={() => navigate(`/employer/jobs/${jobId}/applicants`)}>
                Xem tất cả
              </Button>
            </div>
            <div className="space-y-4">
              {jobDetail.applicants.slice(0, 5).map((applicant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={applicant?.avatar || "/default-avatar.png"}
                      alt={applicant?.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{applicant?.fullName}</p>
                      <p className="text-sm text-gray-500">
                        Ứng tuyển: {applicant?.applyDate}
                      </p>
                    </div>
                  </div>
                  <Badge variant={applicant?.isSave ? "success" : "secondary"}>
                    {applicant?.isSave ? "Đã duyệt" : "Chưa duyệt"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card> */}
        </div>
      </div>
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default JobDetailEmployer;
