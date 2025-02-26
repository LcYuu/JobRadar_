import React, { useContext, useEffect, useState } from "react";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getGenCVById,
  updateCV,
} from "../../../redux/GeneratedCV/generated_cv.thunk";
import { ImageIcon, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar } from "@mui/material";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";

const PersonalDetail = ({ enabledNext }) => {
  const { genCvId } = useParams();
  const dispatch = useDispatch();

  const { cvInfo, setCvInfo } = useContext(CVInfoContext);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(cvInfo?.profileImage);

  const handleInputChange = (e) => {
    enabledNext(false);
    const { name, value } = e.target;
    setCvInfo({
      ...cvInfo,
      [name]: value,
    });
  };

  const handleSelectImage = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newFile = files[0];
      const tempUrl = URL.createObjectURL(newFile);

      setSelectedFile(newFile);
      setSelectedImage(tempUrl);

      // Cập nhật profileImage trong cvInfo
      setCvInfo((prev) => ({
        ...prev,
        profileImage: tempUrl,
      }));

      console.log("🖼 Cập nhật ảnh tạm thời:", tempUrl);
    }
  };

  const onSave = async () => {
    setLoading(true);
    try {
      let uploadedUrl = cvInfo?.profileImage; // Mặc định giữ nguyên

      if (selectedFile) {
        uploadedUrl = await uploadToCloudinary(selectedFile);
      }
      const cvData = JSON.stringify({
        ...cvInfo,
        profileImage: uploadedUrl,
      }).replace(/"/g, '\\"');

      console.log("🚀 ~ onSave ~ cvData:", cvData);
      await dispatch(
        updateCV({ genCvId, cvData: `{ \"cvContent\": \"${cvData}\" }` })
      ).unwrap();
      toast.success("Thông tin cập nhật thành công");
      enabledNext(true);
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-5 shadow-lg rounded-lg border-t-purple-500
    border-t-4 mt-10"
    >
      <h3 className="font-bold text-lg">Thông tin cá nhân</h3>
      <p>Hãy bắt đầu với các thông tin cá nhân</p>

      <div className="flex flex-col items-center mt-5">
        <Avatar
          className="transform mb-2 ring-4 ring-purple-500"
          sx={{ width: "9rem", height: "9rem" }}
          src={selectedImage || cvInfo?.profileImage}
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
        <input
          type="file"
          id="image-input"
          accept="image/*"
          onChange={handleSelectImage}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 mt-5 gap-3">
        <div>
          <label className="text-sm">First Name</label>
          <Input
            name="firstName"
            defaultValue={cvInfo?.firstName}
            required
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="text-sm">Last Name</label>
          <Input
            name="lastName"
            defaultValue={cvInfo?.lastName}
            required
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm">Job Title</label>
          <Input
            name="jobTitle"
            defaultValue={cvInfo?.jobTitle}
            required
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm">Address</label>
          <Input
            name="address"
            defaultValue={cvInfo?.address}
            required
            onChange={handleInputChange}
          />
        </div>

        <div className="">
          <label className="text-sm">Phone</label>
          <Input
            name="phone"
            defaultValue={cvInfo?.phone}
            required
            onChange={handleInputChange}
          />
        </div>

        <div className="">
          <label className="text-sm">Email</label>
          <Input
            name="email"
            defaultValue={cvInfo?.email}
            required
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button disabled={loading} onClick={() => onSave()}>
          {loading ? <LoaderCircle className="animate-spin" /> : "Lưu"}
        </Button>
      </div>
    </div>
  );
};

export default PersonalDetail;
