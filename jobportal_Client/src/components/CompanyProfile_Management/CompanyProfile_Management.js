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
  Upload,
  Code,
  BanknoteIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  updateCompanyProfile,
  updateCompanyImages,
  getCompanyProfile,
  getCompanyByJWT,
} from "../../redux/Company/company.action";
import CompanyProfileModal from "./CompanyProfile_Management_Modal";
import { store } from "../../redux/store";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import {
  createImageCompany,
  deleteImageCompany,
} from "../../redux/ImageCompany/imageCompany.action";
import { Avatar } from "@mui/material";
import Swal from "sweetalert2";
import { getReviewByCompany } from "../../redux/Review/review.action";
import { StarRounded } from "@mui/icons-material";

const CompanyProfile_Management = () => {
  const dispatch = useDispatch();
  const { companyJwt, loading, error } = useSelector((store) => store.company);
  const { imageCompany } = useSelector((store) => store.imageCompany);
  const [isLoading, setIsLoading] = useState(false);
  const { reviews } = useSelector((store) => store.review);

  useEffect(() => {
    dispatch(getCompanyByJWT());
  }, [dispatch]);

  useEffect(() => {
    if (companyJwt?.companyId) {
      dispatch(getReviewByCompany(companyJwt.companyId));
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
  console.log("aaa" + formData.imgPath);

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
          await dispatch(createImageCompany(imageData)); // Gửi từng URL một
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
    console.log(imgId);

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
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Company Header */}
      <div className="flex items-center gap-6 mb-8 bg-white p-6 rounded-lg shadow-md">
        <Avatar
          className="transform mb-2"
          sx={{ width: "8rem", height: "8rem" }}
          src={companyJwt?.logo}
        />
        <div>
          <h1 className="text-2xl font-bold">{companyJwt?.companyName}</h1>
          <div className="flex gap-4 mt-2 text-gray-600">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Ngày thành lập</p>
                <p className="font-medium">
                  {companyJwt?.establishedTime 
                    ? new Date(companyJwt.establishedTime).toLocaleDateString('en-GB')
                    : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-6 h-6" />
              <span>{companyJwt?.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-6 h-6" />
              <span>{companyJwt?.industry?.industryName}</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 bg-purple-500 text-white hover:bg-purple-600 hover:text-white border border-purple-500 rounded-lg transition-all"
            onClick={handleOpenProfileModal}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </div>
        <section>
          <CompanyProfileModal open={open} handleClose={handleClose} />
        </section>
      </div>

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
                    star <= averageStars
                      ? "text-yellow-400"
                      : "text-gray-300"
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
                    onClick={() => removeImage(image.imgId)}
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
