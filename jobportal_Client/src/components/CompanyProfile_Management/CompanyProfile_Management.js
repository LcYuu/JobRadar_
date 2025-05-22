import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
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
  Edit2,
  DeleteIcon,
} from "lucide-react";

import CompanyProfileModal from "./CompanyProfile_Management_Modal";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { Avatar } from "@mui/material";
import Swal from "sweetalert2";

import { StarRounded } from "@mui/icons-material";
import {
  createImageCompany,
  deleteImageCompany,
} from "../../redux/ImageCompany/imageCompany.thunk";
import {
  getCompanyByJWT,
  updateCompanyProfile,
} from "../../redux/Company/company.thunk";
import { getReviewByCompany } from "../../redux/Review/review.thunk";
import { Label } from "../../ui/label";
import {
  deleteSocialLink,
  fetchSocialLinks,
} from "../../redux/SocialLink/socialLink.thunk";
import SocialLinkModal from "../MyProfile/SocialLinkModal";
import { toast } from "react-toastify";

const CompanyProfile_Management = () => {
  const dispatch = useDispatch();
  const { companyJwt } = useSelector((store) => store.company);

  const [isLoading, setIsLoading] = useState(false);
  const { reviews } = useSelector((store) => store.review);
  const [socialLinkUpdated, setSocialLinkUpdated] = useState(false);

  useEffect(() => {
    dispatch(getCompanyByJWT());
    dispatch(fetchSocialLinks());
    setSocialLinkUpdated(false);
  }, [dispatch, socialLinkUpdated]);

  useEffect(() => {
    if (companyJwt?.companyId) {
      const companyId = companyJwt?.companyId;
      dispatch(getReviewByCompany(companyId));
    }
  }, [dispatch, companyJwt]);

  const { socialLinks } = useSelector((store) => store.socialLink);

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

  const [images, setImages] = useState([]);
  const [openSocialLink, setOpenSocialLink] = useState(false);
  const handleOpenSocialLinkModal = () => setOpenSocialLink(true);
  const handleCloseSocialLink = () => {
    setOpenSocialLink(false);
  };
  const [editingSocialLinkId, setEditingSocialLinkId] = useState(null);
  const handleEditSocialLink = (socialLink) => {
    setEditingSocialLinkId(socialLink.id);
    setFormData({
      platform: socialLink.platform,
      url: socialLink.url,
    });
    handleOpenSocialLinkModal();
  };

  const handleDeleteSocialLink = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa link này",
      text: "Bạn có chắc chắn muốn xóa link này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteSocialLink(id));
        dispatch(fetchSocialLinks());
        toast.success("Xóa link thành công!");
      } catch (error) {
        toast.error("Xóa link thất bại. Vui lòng thử lại!");
      }
    }
  };

  const handleSelectImage = (event) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData((prevData) => {
        const updatedImgPath = Array.isArray(prevData.imgPath)
          ? prevData.imgPath
          : [];
        return {
          ...prevData,
          imgPath: [...updatedImgPath, ...newFiles],
        };
      });
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
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Update failed: ", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (formData.imgPath && formData.imgPath.length > 0) {
        for (const file of formData.imgPath) {
          const uploadedUrl = await uploadToCloudinary(file);
          const imageData = {
            pathImg: uploadedUrl,
          };
          await dispatch(createImageCompany(imageData));
        }
      }
      toast.success("Cập nhật thông tin thành công!");
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const removeImage = async (imgId) => {
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
        toast.success("Xóa hình ảnh thành công!");
      } catch (error) {
        console.error("Có lỗi xảy ra khi xóa hình ảnh:", error);
        toast.error("Xóa hình ảnh thất bại. Vui lòng thử lại!", "error");
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      tempErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    const phoneRegex =
      /^(0[3|5|7|8|9])([0-9]{8})$|^(1900)[\s]?[0-9]{4,5}[\s]?[0-9]{2,3}$/;

    if (formData.contact && !phoneRegex.test(formData.contact)) {
      tempErrors.contact = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };




  const totalStars = reviews.reduce((total, review) => total + review.star, 0);
  const averageStars = reviews.length > 0 ? totalStars / reviews.length : 0;

  const [showColorMenu, setShowColorMenu] = useState(false);

  const colorOptions = [
    { name: "Sky Blue", value: "from-sky-500 to-sky-700" },
    { name: "Purple", value: "from-purple-500 to-purple-700" },
    { name: "Red", value: "from-red-500 to-red-700" },
    { name: "Green", value: "from-green-500 to-green-700" },
    { name: "Orange", value: "from-orange-500 to-orange-700" },
    { name: "Pink", value: "from-pink-500 to-pink-700" },
    { name: "Indigo", value: "from-indigo-500 to-indigo-700" },
    { name: "Teal", value: "from-teal-500 to-teal-700" },
  ];

  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  const handleColorSelect = (colorValue) => {
    setSelectedColor(colorValue);
    setShowColorMenu(false);
  };

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
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 overflow-x-hidden">
      {/* Company Header */}
      <Card className="mb-4 sm:mb-6 md:mb-8 overflow-hidden max-w-full">
        <div
          className={`h-16 sm:h-20 md:h-24 relative bg-gradient-to-r ${selectedColor}`}
        >
          <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2">
            <Button
              className="bg-transparent text-white hover:bg-white/20 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded flex items-center"
              onClick={() => setShowColorMenu(!showColorMenu)}
            >
              <PenSquare className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Đổi màu</span>
            </Button>

            {showColorMenu && (
              <div className="absolute top-full right-0 mt-1 sm:mt-2 p-1 sm:p-2 bg-white rounded-lg shadow-lg w-32 sm:w-40 z-50">
                <div className="grid grid-cols-2 gap-1 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto">
                  {colorOptions.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(color.value)}
                      className={`
                        w-full h-6 sm:h-8 rounded-md transition-all duration-200
                        bg-gradient-to-r ${color.value}
                        hover:scale-105 focus:outline-none
                        transform hover:shadow-md
                        ${
                          selectedColor === color.value
                            ? "ring-2 ring-white ring-offset-1"
                            : ""
                        }
                      `}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6 bg-white shadow-md rounded-lg">
          <div className="flex flex-col items-center text-center w-full">
            <div className="-mt-10 sm:-mt-12 md:-mt-16 mb-3 sm:mb-4 md:mb-6">
              <Avatar
                className="ring-4 ring-purple-500"
                sx={{
                  width: { xs: "5rem", sm: "6rem", md: "8rem" },
                  height: { xs: "5rem", sm: "6rem", md: "8rem" },
                }}
                src={companyJwt?.logo}
              />
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 break-words max-w-full sm:max-w-2xl">
              {companyJwt?.companyName}
            </h1>

            <Button
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 sm:px-4 py-1 sm:py-2 rounded-lg mb-3 sm:mb-4 md:mb-6 mx-auto"
              onClick={handleOpenProfileModal}
            >
              Chỉnh sửa hồ sơ
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full max-w-full">
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:bg-purple-50 transition-colors max-w-full">
                <div className="flex items-start text-left">
                  <div className="p-1 sm:p-2 bg-purple-50 rounded-lg mr-1 sm:mr-2 shrink-0">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600">Ngày thành lập</p>
                    <p className="font-medium text-xs sm:text-sm break-words">
                      {companyJwt?.establishedTime
                        ? new Date(
                            companyJwt.establishedTime
                          ).toLocaleDateString("en-GB")
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:bg-purple-50 transition-colors max-w-full">
                <div className="flex items-start text-left">
                  <div className="p-1 sm:p-2 bg-purple-50 rounded-lg mr-1 sm:mr-2 shrink-0 mt-0.5 sm:mt-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600">Địa chỉ</p>
                    <p className="font-medium text-xs sm:text-sm break-words">
                      {companyJwt?.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:bg-purple-50 transition-colors max-w-full">
                <div className="flex items-start text-left">
                  <div className="p-1 sm:p-2 bg-purple-50 rounded-lg mr-1 sm:mr-2 shrink-0 mt-0.5 sm:mt-1">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600">Ngành nghề</p>
                    {companyJwt?.industry?.length > 0 ? (
                      <div className="font-medium text-xs sm:text-sm">
                        {companyJwt.industry.map((ind, index) => (
                          <div key={index} className="flex">
                            <span className="mr-1">•</span>
                            <span className="break-words">
                              {ind.industryName}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium text-xs sm:text-sm">
                        Chưa cập nhật
                      </p>
                    )}
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
      {companyJwt && (
        <Card className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 md:p-6 bg-white shadow-md rounded-lg">
          <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold">
              Hồ sơ công ty
            </h2>
            <Button onClick={() => handleEditDesClick()} variant="ghost">
              <PenSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Chỉnh sửa
            </Button>
          </div>
          {isEditingDes ? (
            <div>
              <textarea
                name="description"
                className="w-full p-2 sm:p-3 border rounded-md text-xs sm:text-sm"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả về công ty..."
              />
              <div className="mt-1 sm:mt-2 flex justify-end">
                <Button
                  onClick={handleSaveClick}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  Lưu
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              {companyJwt.description ||
                "Chưa có mô tả về công ty. Nhấn chỉnh sửa để thêm mô tả."}
            </p>
          )}
        </Card>
      )}

      {/* Contact Information */}
      <Card className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 md:p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold">
            Contact
          </h2>
          <Button onClick={() => handleEditInfoClick()} variant="ghost">
            <PenSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Chỉnh sửa
          </Button>
        </div>
        {isEditingInfo ? (
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <label className="block mb-1 text-xs sm:text-sm md:text-base">
                Số điện thoại
              </label>
              <input
                name="contact"
                type="tel"
                className={`border p-1 sm:p-2 w-full mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base ${
                  errors.contact ? "border-red-500" : ""
                }`}
                value={formData.contact}
                onChange={handleChange}
              />
              {errors.contact && (
                <p className="text-red-500 text-xs mt-0.5 sm:mt-1">
                  {errors.contact}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-xs sm:text-sm md:text-base">
                Email
              </label>
              <input
                name="email"
                type="email"
                className={`border p-1 sm:p-2 w-full mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base ${
                  errors.email ? "border-red-500" : ""
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5 sm:mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-xs sm:text-sm md:text-base">
                TaxCode
              </label>
              <input
                name="taxCode"
                type="text"
                className={`border p-1 sm:p-2 w-full mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base ${
                  errors.email ? "border-red-500" : ""
                }`}
                value={formData.taxCode}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5 sm:mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="mt-1 sm:mt-2 flex justify-end">
              <Button
                onClick={handleSaveClick}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                Lưu
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-2 md:space-y-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-xs sm:text-sm md:text-base">
                {companyJwt?.contact}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-xs sm:text-sm md:text-base">
                {companyJwt?.email}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <BanknoteIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-xs sm:text-sm md:text-base">
                {companyJwt?.taxCode}
              </span>
            </div>
            <p className="text-xs text-purple-500 mt-0.5 sm:mt-1">
              Hãy tự giác cung cấp chính xác mã số thuế, nếu không bạn sẽ không
              thể tuyển dụng.
            </p>
          </div>
        )}
      </Card>

      {/* Social Links */}
      <Card className="p-3 sm:p-4 md:p-6 bg-white shadow-md rounded-lg mb-3 sm:mb-4 md:mb-6">
        <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold">
            Liên kết xã hội
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleOpenSocialLinkModal}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Thêm liên kết
          </Button>
        </div>

        <CardContent className="space-y-2 sm:space-y-3 overflow-x-hidden">
          {socialLinks &&
          Array.isArray(socialLinks) &&
          socialLinks.length > 0 ? (
            socialLinks.map((link, index) => (
              <div
                key={index}
                className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden max-w-full"
              >
                <div
                  className="platform-icon-container"
                  style={{
                    width: "32px",
                    height: "32px",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={require(`../../assets/images/platforms/${link.platform.toLowerCase()}.png`)}
                    alt={link.platform.toLowerCase()}
                    className="h-full w-full object-contain rounded-full shadow-md"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="truncate">
                      <Label className="text-xs sm:text-sm font-medium">
                        {link.platform}
                      </Label>
                      <br />
                      <a
                        href={link.url}
                        className="text-xs text-blue-600 truncate block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.url}
                      </a>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-blue-100 transition-colors duration-200"
                        onClick={() => handleEditSocialLink(link)}
                      >
                        <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-red-100 transition-colors duration-200"
                        onClick={() => handleDeleteSocialLink(link.id)}
                      >
                        <DeleteIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-purple-500">
              Không có liên kết xã hội nào
            </p>
          )}
        </CardContent>

        <section>
          <SocialLinkModal
            open={openSocialLink}
            handleClose={handleCloseSocialLink}
            editingSocialLinkId={editingSocialLinkId}
            setEditingSocialLinkId={setEditingSocialLinkId}
            initialData={formData}
          />
        </section>
      </Card>

      {/* Reviews */}
      <Card className="p-3 sm:p-4 md:p-6 bg-white shadow-md rounded-lg mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">
          Đánh giá từ ứng viên
        </h2>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
              {averageStars.toFixed(1)}
            </div>
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarRounded
                  key={star}
                  className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                    star <= averageStars ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">
              {reviews.length} đánh giá
            </div>
          </div>
        </div>
      </Card>

      {/* Company Images */}
      <Card className="p-3 sm:p-4 md:p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold">
            Hình ảnh công ty
          </h2>
          {!isEditingImg ? (
            <Button onClick={() => handleEditImgClick()} variant="ghost">
              <PenSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <Button
              onClick={() => handleSave()}
              variant="primary"
              disabled={isLoading}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
                    className="absolute top-1 right-1 p-0.5 sm:p-1 bg-red-500 rounded-full text-white"
                    onClick={() => removeImage(image?.imgId)}
                  >
                    <X className="w-2 h-2 sm:w-3 sm:h-3" />
                  </button>
                )}
              </div>
            ))}
          {isEditingImg && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelectImage}
                style={{ display: "none" }}
                id="add-image-input"
              />
              <label
                htmlFor="add-image-input"
                className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </label>
            </>
          )}
          {isEditingImg && images.length > 0 && (
            <div className="mt-2 sm:mt-3 md:mt-4">
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
    </div>
  );
};

export default CompanyProfile_Management;
