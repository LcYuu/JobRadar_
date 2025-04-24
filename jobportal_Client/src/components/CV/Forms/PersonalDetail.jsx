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
  const defaultAvatar =
    "https://res.cloudinary.com/ddqygrb0g/image/upload/v1739714221/avatar_fa4cj7.jpg";

  // Track when Redux state changes
  useEffect(() => {
    if (genCv) {
      console.log("Redux genCv state changed:", genCv);
    }
  }, [genCv]);

  // Add a forceUpdate mechanism if needed
  const [, forceUpdate] = useState({});
  const forceRerender = () => forceUpdate({});

  useEffect(() => {
    console.log("cvInfo in PersonalDetail updated:", cvInfo);
  }, [cvInfo]);

  useEffect(() => {
    if (genCv && genCv.cvContent) {
      console.log("Syncing genCv:", genCv);
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

  const onSave = async () => {
    // Set local loading states
    setImageLoading(true);
    setSaveLoading(true);
    setUpdateLoading(true);
    
    // Set global loading state
    if (onSaving) onSaving(true, "Đang lưu thông tin cá nhân...");
    
    // Đảm bảo loading hiển thị ít nhất 2 giây
    const startTime = Date.now();

    try {
      // Đợi một chút để đảm bảo loading được hiển thị
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 1: Upload image if needed
      let uploadedUrl = cvInfo?.profileImage;
      if (selectedFile) {
        uploadedUrl = await uploadToCloudinary(selectedFile);
      }
      
      // Step 2: Create updated data object with the image URL
      const updatedCvInfo = {
        ...cvInfo,
        profileImage: uploadedUrl,
      };
      
      // Step 3: Update context state immediately for the preview
      setCvInfo(updatedCvInfo);
      
      // Step 4: Set updated image
      setSelectedImage(uploadedUrl);
      
      // Step 5: Prepare data for API call
      const cvData = JSON.stringify(updatedCvInfo).replace(/"/g, '\\"');
      
      // Step 6: Make API call and wait for it to complete
      await dispatch(
        updateCV({ genCvId, cvData: `{ "cvContent": "${cvData}" }` })
      );
      
      // Step 7: Force a refresh by refetching the CV
      await dispatch(getGenCVById(genCvId));
      
      // Step 8: Force a re-render after update completes
      forceRerender();
      
      toast.success("Thông tin cập nhật thành công");
      enabledNext(true);
      
      // Đảm bảo loading hiển thị đủ lâu
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 2 giây
      
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
    } catch (error) {
      console.error("Save preparation error:", error);
      toast.error("Cập nhật thất bại");
    } finally {
      // Tắt loading
      setSaveLoading(false);
      setImageLoading(false);
      setUpdateLoading(false);
      
      // Tắt global loading
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
          />
        </div>
        <div>
          <label className="text-sm">Last Name</label>
          <Input
            name="lastName"
            value={cvInfo?.lastName || ""}
            required
            onChange={handleInputChange}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm">Job Title</label>
          <Input
            name="jobTitle"
            value={cvInfo?.jobTitle || ""}
            required
            onChange={handleInputChange}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm">Address</label>
          <Input
            name="address"
            value={cvInfo?.address || ""}
            required
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="text-sm">Phone</label>
          <Input
            name="phone"
            value={cvInfo?.phone || ""}
            required
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <Input
            name="email"
            value={cvInfo?.email || ""}
            required
            onChange={handleInputChange}
          />
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