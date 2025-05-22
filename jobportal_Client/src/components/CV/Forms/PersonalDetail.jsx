import React, { useContext, useEffect, useState } from "react";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getGenCVById, updateCV } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { ImageIcon, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar } from "@mui/material";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import ThemeColor from "../ThemeColor";

const PersonalDetail = ({ enabledNext }) => {
  const { genCvId } = useParams();
  const dispatch = useDispatch();

  const { cvInfo, setCvInfo, onSaving } = useContext(CVInfoContext);
  const { genCv } = useSelector((store) => store.genCV);
  const [imageLoading, setImageLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    address: "",
  });

  const defaultAvatar =
    "https://res.cloudinary.com/ddqygrb0g/image/upload/v1739714221/avatar_fa4cj7.jpg";

  useEffect(() => {
    if (genCv && genCv.cvContent) {
      try {
        const cvContent = JSON.parse(genCv.cvContent.replace(/^"|"$/g, "") || "{}");
        setCvInfo({
          firstName: "",
          lastName: "",
          jobTitle: "",
          address: "",
          phone: "",
          email: "",
          profileImage: "",
          themeColor: "",
          ...cvContent,
        });
        setSelectedImage(cvContent.profileImage || null);
      } catch (error) {
        console.error("Error parsing cvContent:", error);
        setCvInfo({
          firstName: "",
          lastName: "",
          jobTitle: "",
          address: "",
          phone: "",
          email: "",
          profileImage: "",
          themeColor: "",
        });
      }
    }
  }, [genCv, setCvInfo]);

  const handleInputChange = (e) => {
    enabledNext(false);
    const { name, value } = e.target;

    setCvInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (
      ["email", "phone", "firstName", "lastName", "jobTitle", "address"].includes(name)
    ) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectImage = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newFile = files[0];
      const tempUrl = URL.createObjectURL(newFile);
      setSelectedFile(newFile);
      setSelectedImage(tempUrl);
      setCvInfo((prev) => ({
        ...prev,
        profileImage: tempUrl,
      }));
    }
  };

  const validateInputs = () => {
    const newErrors = {
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      jobTitle: "",
      address: "",
    };
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cvInfo.email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ";
      isValid = false;
    }

    if (!cvInfo.phone.match(/^\+?\d{10}$/)) {
      newErrors.phone = "Vui lòng nhập số điện thoại 10 chữ số";
      isValid = false;
    }

    if (!cvInfo.firstName.trim()) {
      newErrors.firstName = "Vui lòng nhập họ";
      isValid = false;
    }

    if (!cvInfo.lastName.trim()) {
      newErrors.lastName = "Vui lòng nhập tên";
      isValid = false;
    }

    if (!cvInfo.jobTitle.trim()) {
      newErrors.jobTitle = "Vui lòng nhập chức danh";
      isValid = false;
    }

    if (!cvInfo.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSave = async () => {
    if (!validateInputs()) return;

    setImageLoading(true);
    setSaveLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu thông tin cá nhân...");

    const startTime = Date.now();

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      let uploadedUrl = cvInfo?.profileImage;
      if (selectedFile) {
        uploadedUrl = await uploadToCloudinary(selectedFile);
      }

      const updatedCvInfo = {
        ...cvInfo,
        profileImage: uploadedUrl,
      };

      setCvInfo(updatedCvInfo);
      setSelectedImage(uploadedUrl);

      const cvData = JSON.stringify(updatedCvInfo).replace(/"/g, '\\"');
      await dispatch(updateCV({ genCvId, cvData: `{ "cvContent": "${cvData}" }` }));
      await dispatch(getGenCVById(genCvId));

      toast.success("Thông tin cập nhật thành công");
      enabledNext(true);

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }
    } catch (error) {
      console.error("Save preparation error:", error);
      toast.error("Cập nhật thất bại");
    } finally {
      setSaveLoading(false);
      setImageLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
    }
  };

  if (!cvInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Đang tải thông tin CV...</p>
      </div>
    );
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-purple-500 border-t-4 mt-10 relative">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Thông tin cá nhân</h3>
          <p>Hãy bắt đầu với các thông tin cá nhân</p>
        </div>
        <ThemeColor />
      </div>

      <div className="flex flex-col items-center mt-5">
        <Avatar
          className="mb-2"
          sx={{ width: "9rem", height: "9rem" }}
          src={selectedImage || cvInfo?.profileImage || defaultAvatar}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleSelectImage}
            style={{ display: "none" }}
            id="image-input"
          />
          <label
            htmlFor="image-input"
            className="p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50"
          >
            {imageLoading ? (
              <div className="animate-spin">⌛</div>
            ) : (
              <ImageIcon className="text-purple-600" />
            )}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-5 gap-3">
        <div>
          <label className="text-sm">First Name</label>
          <Input
            name="firstName"
            value={cvInfo?.firstName || ""}
            required
            onChange={handleInputChange}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="text-sm">Last Name</label>
          <Input
            name="lastName"
            value={cvInfo?.lastName || ""}
            required
            onChange={handleInputChange}
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
        <div className="col-span-2">
          <label className="text-sm">Job Title</label>
          <Input
            name="jobTitle"
            value={cvInfo?.jobTitle || ""}
            required
            onChange={handleInputChange}
            className={errors.jobTitle ? "border-red-500" : ""}
          />
          {errors.jobTitle && (
            <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>
          )}
        </div>
        <div className="col-span-2">
          <label className="text-sm">Address</label>
          <Input
            name="address"
            value={cvInfo?.address || ""}
            required
            onChange={handleInputChange}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>
        <div>
          <label className="text-sm">Phone</label>
          <Input
            name="phone"
            value={cvInfo?.phone || ""}
            required
            onChange={handleInputChange}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="text-sm">Email</label>
          <Input
            name="email"
            value={cvInfo?.email || ""}
            required
            onChange={handleInputChange}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button disabled={saveLoading || updateLoading} onClick={onSave}>
          {saveLoading || updateLoading ? (
            <>
              <LoaderCircle className="animate-spin mr-2" />
              <span>Đang lưu...</span>
            </>
          ) : (
            "Lưu"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PersonalDetail;
