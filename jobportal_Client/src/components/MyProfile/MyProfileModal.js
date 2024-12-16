import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { Avatar, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  getProfileAction,
  updateProfileAction,
} from "../../redux/Auth/auth.action";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import {
  getSeekerByUser,
  updateSeekerAction,
} from "../../redux/Seeker/seeker.action";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  p: 4,
  outline: "none",
  overflowY: "auto",
  borderRadius: 2,
  border: "none",
};

const validationSchema = Yup.object({
  userName: Yup.string().required("Username is required"),
  address: Yup.string().required("Address is required"),
  specificAddress: Yup.string().when("isEditingInfo", {
    is: true,
    then: Yup.string().required("Số nhà, tên đường là bắt buộc"),
  }),
});

export default function ProfileModal({ open, handleClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
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
  const [isEditingInfo, setIsEditingInfo] = useState(true);

  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { seeker } = useSelector((store) => store.seeker);

  const formik = useFormik({
    initialValues: {
      userName: user?.userName || "",
      avatar: user?.avatar || "",
      address: seeker?.address || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await Promise.all([
          dispatch(
            updateProfileAction({
              userName: values.userName,
              avatar: selectedAvatar || values.avatar,
            })
          ),
          handleSaveClick(values),
        ]);
        await dispatch(getProfileAction());
        handleClose();
      } catch (error) {
        console.error("Update failed:", error);
      } finally {
        setIsLoading(false);
        Swal.fire({
          icon: "success",
          title: "Cập nhật",
          text: "Cập nhật thông tin thành công",
          customClass: {
            popup: "z-[9999]", // Sử dụng lớp z-index của Tailwind
            backdrop: "bg-black bg-opacity-50",
          },
        });
      }
    },
  });

  const handleSelectImage = async (event) => {
    setIsLoading(true);
    const imageUrl = await uploadToCloudinary(event.target.files[0]);
    setSelectedAvatar(imageUrl);
    formik.setFieldValue("avatar", imageUrl); // Cập nhật giá trị avatar trong formik
    setIsLoading(false);
  };
  console.log("🚀 ~ useEffect ~ seeker?.address:", seeker?.address);
  useEffect(() => {
    if (seeker?.address) {
      const addressParts = seeker?.address
        .split(",")
        .map((part) => part.trim());
      // console.log("addressParts:", addressParts);  // Log provinces
      if (addressParts.length >= 3) {
        const [ward, district, province] = addressParts.slice(-3);
        const specificAddressPart = addressParts.slice(0, -3).join(", ");

        setSpecificAddress(specificAddressPart);
        setLocation({
          ward,
          district,
          province,
        });

        const matchingProvince = provinces.find((p) => p.name === province);
        console.log("addressParts:", provinces, "a", province); // Log provinces
        if (matchingProvince) {
          setSelectedProvince(matchingProvince.code);
        }
      }
    }
  }, [seeker, provinces]);
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
        console.log("Fetched provinces:", data); // Log provinces
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
          setLocation((prev) => ({ ...prev, province: data.name }));

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
  }, [selectedProvince, location.district]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
          );
          const data = await response.json();
          setWards(data.wards);
          setLocation((prev) => ({ ...prev, district: data.name }));

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
  }, [selectedDistrict, location.ward]);

  const handleSaveClick = async (values) => {
    const fullAddress =
      specificAddress && location.ward && location.district && location.province
        ? `${specificAddress}, ${location.ward}, ${location.district}, ${location.province}`.trim()
        : seeker?.address || "";

    try {
      await dispatch(
        updateSeekerAction({
          ...values,
          address: fullAddress,
        })
      );
      await dispatch(getSeekerByUser());
      handleClose();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Update failed: ", error);
      toast.error("Cập nhật thất bại!");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-profile-modal"
    >
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
              <h2 className="text-xl font-semibold">Chỉnh sửa hồ sơ</h2>
            </div>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || imageLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Đang lưu" : "Lưu những thay đổi"}
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <Avatar
              className="transform"
              sx={{ width: "10rem", height: "10rem" }}
              src={selectedAvatar || user?.avatar}
            />
            <div className="mt-3">
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
                  <ImageIcon className="text-gray-600" />
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

          <div className="space-y-4">
            <TextField
              fullWidth
              id="userName"
              name="userName"
              label="Username"
              variant="outlined"
              value={formik.values.userName}
              onChange={formik.handleChange}
              error={formik.touched.userName && Boolean(formik.errors.userName)}
              helperText={formik.touched.userName && formik.errors.userName}
            />
            {isEditingInfo ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium block mb-1">
                    Tỉnh/Thành phố
                  </Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
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
                  <Label className="text-sm font-medium block mb-1">
                    Quận/Huyện
                  </Label>
                  <select
                    className="w-full p-2 border rounded-md"
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
                  <Label className="text-sm font-medium block mb-1">
                    Phường/Xã
                  </Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedWard}
                    onChange={(e) => {
                      setSelectedWard(e.target.value);
                      const selectedWardData = wards.find(
                        (w) => w.code === Number(e.target.value)
                      );
                      if (selectedWardData) {
                        setLocation((prev) => ({
                          ...prev,
                          ward: selectedWardData.name,
                        }));
                      }
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
                  <Label className="text-sm font-medium block mb-1">
                    Số nhà, tên đường
                  </Label>
                  <Input
                    type="text"
                    value={specificAddress}
                    onChange={(e) => setSpecificAddress(e.target.value)}
                    placeholder="Nhập địa chỉ cụ thể"
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-sm font-medium">Địa chỉ</Label>
                <div className="mt-1 text-sm text-gray-600">
                  {seeker?.address}
                </div>
              </div>
            )}
          </div>
        </form>
      </Box>
    </Modal>
  );
}
