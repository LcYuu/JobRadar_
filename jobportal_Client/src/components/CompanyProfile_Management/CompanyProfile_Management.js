import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import {
  Calendar,
  MapPin,
  Building2,
  Mail,
  Phone,
  PenSquare,
  Plus,
  X,
  BanknoteIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import CompanyProfileModal from "./CompanyProfile_Management_Modal";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { Avatar } from "@mui/material";
import Swal from "sweetalert2";

import { StarRounded } from "@mui/icons-material";
import { createImageCompany, deleteImageCompany } from "../../redux/ImageCompany/imageCompany.thunk";
import { getCompanyByJWT, updateCompanyProfile } from "../../redux/Company/company.thunk";
import { getReviewByCompany } from "../../redux/Review/review.thunk";

const CompanyProfile_Management = () => {
  const dispatch = useDispatch();
  const { companyJwt, loading, error } = useSelector(store => store.company);
  const { imageCompany } = useSelector((store) => store.imageCompany);
  const [isLoading, setIsLoading] = useState(false);
  const { reviews } = useSelector(store => store.review);

  useEffect(() => {
    dispatch(getCompanyByJWT());
  }, [dispatch]);

  console.log("🚀 ~ constCompanyProfile_Management= ~  companyJwt?.images:",  companyJwt?.images)
  useEffect(() => {
    if (companyJwt?.companyId) {
      const companyId = companyJwt?.companyId; // Lấy giá trị cụ thể
      dispatch(getReviewByCompany(companyId));

    }
  }, [dispatch, companyJwt]);

  const [open, setOpen] = useState(false);
  const handleOpenProfileModal = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [isEditingDes, setIsEditingDes] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingImg, setIsEditingImg] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    taxCode: "",
    contact: "",
    email: "",
    imgPath: [],
  });

  // const [image, setImage] = useState(companyJwt?.images || []);
  const [images, setImages] = useState([]); // Lưu trữ nhiều hình ảnh

  const handleSelectImage = (event) => {
    const files = event.target.files; // Lấy tất cả các file ảnh
    if (files) {
      const newFiles = Array.from(files); // Lấy file gốc

      // Cập nhật formData với file gốc
      setFormData((prevData) => {
        const updatedImgPath = Array.isArray(prevData.imgPath)
          ? prevData.imgPath
          : [];
        return {
          ...prevData,
          imgPath: [...updatedImgPath, ...newFiles], // Lưu file gốc vào imgPath
        };
      });

      // Nếu cần hiển thị trước, tạo URL tạm thời
      const previewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImages((prevImages) => [...prevImages, ...previewUrls]);
    }
  };

  const handleEditDesClick = () => {
    setIsEditingDes(true);
  };
  const handleEditInfoClick = () => {
    setIsEditingInfo(true);
  };

  const handleEditImgClick = () => {
    setIsEditingImg(true);
  };

  const handleSaveClick = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      await dispatch(updateCompanyProfile(formData));
      setIsEditingDes(false);
      setIsEditingInfo(false);
      dispatch(getCompanyByJWT());
      showSuccessToast("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Update failed: ", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (formData.imgPath && formData.imgPath.length > 0) {
        for (const file of formData.imgPath) {
          // Upload từng file lên Cloudinary
          const uploadedUrl = await uploadToCloudinary(file);
          console.log(uploadedUrl);
          // Gửi URL đã upload đến API backend
          const imageData = {
            pathImg: uploadedUrl, // Đây là URL của ảnh sau khi được upload
          };
          const imgData = imageData
          await dispatch(createImageCompany(imgData)); // Gửi từng URL một
        }
      }
      showSuccessToast("Cập nhật thông tin thành công!");
      setIsEditingImg(false);
      dispatch(getCompanyByJWT());
      setImages([]);
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyJwt) {
      setFormData({
        description: companyJwt?.description || "",
        contact: companyJwt?.contact || "",
        email: companyJwt?.email || "",
        taxCode: companyJwt.taxCode || "",
      });
    }
  }, [companyJwt]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value); // Kiểm tra giá tr
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Cập nhật giá trị cho trường tương ứng
    }));
  };

  // const handleImageUpload = (e) => {
  //   const files = Array.from(e.target.files);
  //   setFormData((prev) => ({
  //     ...prev,
  //     workspaceImages: [...prev.workspaceImages, ...files],
  //   }));
  // };

  const removeImage = async (imgId) => {
    console.log("asasadasd" + imgId);

    // Sử dụng swal thay vì window.confirm
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa hình ảnh này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteImageCompany(imgId));
        dispatch(getCompanyByJWT());
        showSuccessToast("Xóa hình ảnh thành công!");
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa hình ảnh:", error);
        showSuccessToast("Xóa hình ảnh thất bại. Vui lòng thử lại!", "error");
      }
    }
  };

  const [errors, setErrors] = useState({
    contact: "",
    phone: "",
  });

  const validateForm = () => {
    let tempErrors = {
      emailContact: "",
      phoneNumber: "",
    };
    let isValid = true;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      tempErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Validate phone number (số điện thoại Việt Nam)
    const phoneRegex =
      /^(0[3|5|7|8|9])([0-9]{8})$|^(1900)[\s]?[0-9]{4,5}[\s]?[0-9]{2,3}$/;

    if (formData.contact && !phoneRegex.test(formData.contact)) {
      tempErrors.contact = "Số điện thoại không hợp lệ";
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

  // Tính trung bình đánh giá
  const totalStars = reviews.reduce((total, review) => total + review.star, 0);
  const averageStars = reviews.length > 0 ? totalStars / reviews.length : 0;

  const colors = [
    "from-sky-500 to-sky-700",
    "from-purple-500 to-purple-700",
    "from-red-500 to-red-700",
    "from-green-500 to-green-700",
    "from-orange-500 to-orange-700",
  ];

  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const handleChangeBackground = () => {
    setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
  };

  // Thêm state để kiểm soát việc hiển thị menu màu sắc
  const [showColorMenu, setShowColorMenu] = useState(false);

  // Định nghĩa mảng màu với tên và giá trị
  const colorOptions = [
    { name: 'Sky Blue', value: 'from-sky-500 to-sky-700' },
    { name: 'Purple', value: 'from-purple-500 to-purple-700' },
    { name: 'Red', value: 'from-red-500 to-red-700' },
    { name: 'Green', value: 'from-green-500 to-green-700' },
    { name: 'Orange', value: 'from-orange-500 to-orange-700' },
    { name: 'Pink', value: 'from-pink-500 to-pink-700' },
    { name: 'Indigo', value: 'from-indigo-500 to-indigo-700' },
    { name: 'Teal', value: 'from-teal-500 to-teal-700' }

  ];

  // Thêm state để lưu màu đã chọn
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  // Hàm xử lý khi chọn màu
  const handleColorSelect = (colorValue) => {
    setSelectedColor(colorValue);
    setShowColorMenu(false);
  };

  // Thêm useEffect để xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorMenu && !event.target.closest(".color-picker-container")) {
        setShowColorMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorMenu]);

  return (
    <div className="max-w-5xl mx-auto p-6 ">
      {/* Company Header */}
      <Card className="mb-8 overflow-hidden">
        {/* Cover Background with color picker */}
        <div className={`h-32 relative bg-gradient-to-r ${selectedColor}`}>
          <div className="absolute bottom-2 right-2">
            <Button
              variant="ghost"
              onClick={() => setShowColorMenu(!showColorMenu)}
              className="text-white hover:bg-white/20"
            >
              <PenSquare className="w-4 h-4 mr-2" />
              Đổi màu
            </Button>

            {/* Color Picker Menu */}
            {showColorMenu && (
              <div className="absolute top-full right-0 mt-2 p-2 bg-white rounded-lg shadow-lg w-48 color-picker-container animate-fade-in-down z-50">
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(color.value)}
                      className={`
                        w-full h-12 rounded-md transition-all duration-200
                        bg-gradient-to-r ${color.value}
                        hover:scale-105 focus:outline-none
                        transform hover:shadow-md
                        ${
                          selectedColor === color.value
                            ? "ring-2 ring-white ring-offset-2"
                            : ""
                        }
                      `}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 bg-white shadow-md rounded-lg">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section - Positioned slightly over the cover */}
            <div className="md:w-48 -mt-16 flex flex-col items-center">
              <Avatar
                className="ring-4 ring-purple-500"
                sx={{ width: "8rem", height: "8rem" }}
                src={companyJwt?.logo}
              />

              <Button
                variant="outline"
                className="mt-4 w-full bg-purple-500 text-white hover:bg-purple-600 hover:text-white border border-purple-500 rounded-lg transition-all"
                onClick={handleOpenProfileModal}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </div>

            {/* Company Info Section */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">
                {companyJwt?.companyName}
              </h1>

              {/* Company Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày thành lập</p>
                    <p className="font-medium">
                      {companyJwt?.establishedTime
                        ? new Date(
                            companyJwt.establishedTime
                          ).toLocaleDateString("en-GB")
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium">
                      {companyJwt?.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngành nghề</p>
                    <p className="font-medium">
                      {companyJwt?.industry?.industryName || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <CompanyProfileModal open={open} handleClose={handleClose} />
        </section>
      </Card>

      {/* Company Description */}
      <Card className="mb-6 p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hồ sơ công ty</h2>
          <Button onClick={() => handleEditDesClick()} variant="ghost">
            <PenSquare className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
        {isEditingDes ? (
          <div>
            <textarea
              name="description"
              className="w-full p-3 border rounded-md"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả về công ty..."
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={handleSaveClick}>Lưu</Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">{companyJwt?.description}</p>
        )}
      </Card>

      {/* Contact Information */}
      <Card className="mb-6 p-6  bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact</h2>
          <Button onClick={() => handleEditInfoClick()} variant="ghost">
            <PenSquare className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
        {isEditingInfo ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Số điện thoại</label>
              <input
                name="contact"
                type="tel"
                className={`border p-2 w-full mt-1 ${
                  errors.contact ? "border-red-500" : ""
                }`}
                value={formData.contact}
                onChange={handleChange}
              />
              {errors.contact && (
                <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
              )}
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                name="email"
                type="email"
                className={`border p-2 w-full mt-1 ${
                  errors.email ? "border-red-500" : ""
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block mb-2">TaxCode</label>
              <input
                name="taxCode"
                type="taxCode"
                className={`border p-2 w-full mt-1 ${
                  errors.email ? "border-red-500" : ""
                }`}
                value={formData.taxCode}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div className="mt-2 flex justify-end">
              <Button onClick={handleSaveClick}>Lưu</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{companyJwt?.contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{companyJwt?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <BanknoteIcon className="w-4 h-4 text-gray-500" />
              <span>{companyJwt?.taxCode}</span>
            </div>
            <p className="text-sm text-purple-500 mt-1">
              Hãy tự giác cung cấp chính xác mã số thuế, nếu không bạn sẽ không
              thể tuyển dụng.
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-white shadow-md rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Đánh giá từ ứng viên</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {averageStars.toFixed(1)}
            </div>
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarRounded
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageStars ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {reviews.length} đánh giá
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6  bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Hình ảnh công ty</h2>
          {!isEditingImg ? (
            <Button onClick={() => handleEditImgClick()} variant="ghost">
              <PenSquare className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <Button
              onClick={() => handleSave()}
              variant="primary"
              disabled={isLoading} // Vô hiệu hóa nút khi đang lưu
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.isArray(companyJwt?.images) &&
            companyJwt?.images.map((image, index) => (
              
              <div key={image.imgId} className="relative aspect-video">
                <img
                  src={image.pathImg}
                  alt={`Workspace ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                {isEditingImg && (
                  <button
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                    onClick={() => removeImage(image?.imgId)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          {isEditingImg && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelectImage} // Gọi hàm khi chọn file
                style={{ display: "none" }}
                id="add-image-input"
              />
              <label
                htmlFor="add-image-input"
                className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-6 h-6 text-gray-400" />
              </label>
            </>
          )}
          {isEditingImg && (
            <div className="mt-4">
              <div className="relative aspect-video">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Selected ${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default CompanyProfile_Management;
