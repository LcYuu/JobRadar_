import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import {
  Avatar,
  Checkbox,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { getAllIndustries } from "../../redux/Industry/industry.thunk";
import {
  getCompanyByJWT,
  updateCompanyProfile,
} from "../../redux/Company/company.thunk";

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
  companyName: Yup.string().required("Tên công ty là bắt buộc"),
  establishedTime: Yup.date()
    .transform((value, originalValue) =>
      originalValue ? new Date(originalValue) : null
    )
    .required("Ngày thành lập là bắt buộc")
    .max(new Date(), "Ngày thành lập không được trong tương lai"),
  address: Yup.string().required("Địa chỉ là bắt buộc"),
  industryIds: Yup.array()
    .of(Yup.string())
    .min(1, "Vui lòng chọn ít nhất một ngành") // Bắt buộc chọn ít nhất 1 ngành
    .required("Lĩnh vực hoạt động không được để trống"),
});

export default function CompanyProfileModal({ open, handleClose }) {
  const [selectedLogo, setSelectedLogo] = useState("");
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

  const dispatch = useDispatch();

  const { companyJwt } = useSelector((store) => store.company);
  const { allIndustries } = useSelector((store) => store.industry);

  useEffect(() => {
    dispatch(getAllIndustries());
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
    const initializeAddress = async () => {
      if (companyJwt?.address) {
        const addressParts = companyJwt.address
          .split(",")
          .map((part) => part.trim());

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
          if (matchingProvince) {
            setSelectedProvince(matchingProvince.code);

            try {
              const districtResponse = await fetch(
                `https://provinces.open-api.vn/api/p/${matchingProvince.code}?depth=2`
              );
              const districtData = await districtResponse.json();
              setDistricts(districtData.districts);

              const matchingDistrict = districtData.districts.find(
                (d) => d.name === district
              );
              if (matchingDistrict) {
                setSelectedDistrict(matchingDistrict.code);

                const wardResponse = await fetch(
                  `https://provinces.open-api.vn/api/d/${matchingDistrict.code}?depth=2`
                );
                const wardData = await wardResponse.json();
                setWards(wardData.wards);

                const matchingWard = wardData.wards.find(
                  (w) => w.name === ward
                );
                if (matchingWard) {
                  setSelectedWard(matchingWard.code);
                }
              }
            } catch (error) {
              console.error("Error fetching address data:", error);
            }
          }
        }
      }
    };

    initializeAddress();
  }, [companyJwt, provinces]);

  const formik = useFormik({
    initialValues: {
      logo: companyJwt?.logo || "",
      companyName: companyJwt?.companyName || "",
      establishedTime:
        companyJwt?.establishedTime &&
        !isNaN(new Date(companyJwt?.establishedTime).getTime())
          ? new Date(companyJwt?.establishedTime).toISOString().split("T")[0] // Chuyển sang định dạng YYYY-MM-DD
          : "",
      address: companyJwt?.address || "",
      industryIds:
        companyJwt?.industry?.length > 0
          ? companyJwt.industry.map((ind) => ind.industryId)
          : [],
    },

    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log("🔥 onSubmit called!", values); // Kiểm tra Formik có gọi không
      setIsLoading(true);
      try {
        const fullAddress =
          `${specificAddress}, ${location.ward}, ${location.district}, ${location.province}`.trim();

        const companyData = {
          ...values,
          address: fullAddress || "", // Đảm bảo chuỗi không bị null/undefined
          cityId: cityCodeMapping[selectedProvince] || null, // Xử lý nếu không tìm thấy mã tỉnh
          industryId: values.industryIds,
        };
        console.log("🚀 ~ onSubmit: ~ companyData:", companyData);

        await dispatch(updateCompanyProfile(companyData));
        dispatch(getCompanyByJWT());
        handleClose();
      } catch (error) {
        console.error("Update failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSelectImage = async (event) => {
    setIsLoading(true);
    const imageUrl = await uploadToCloudinary(event.target.files[0]);
    setSelectedLogo(imageUrl);
    formik.setFieldValue("logo", imageUrl); // Cập nhật giá trị avatar trong formik
    setIsLoading(false);
  };

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

          // Tìm và thiết lập district ban đầu
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

          // Tìm và thiết lập ward ban đầu
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

  console.log("isLoading:", isLoading, "imageLoading:", imageLoading);


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
              <h2 className="text-xl font-semibold mt-4">Chỉnh sửa hồ sơ</h2>
            </div>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || imageLoading}
              disableElevation
              sx={{
                backgroundColor: "#6b46c1", // Màu tím
                "&:hover": {
                  backgroundColor: "#553c9a", // Tím đậm hơn khi hover
                },
                "&.Mui-disabled": {
                  backgroundColor: "#a3a3a3", // Màu xám khi bị vô hiệu hóa
                },
                color: "#fff", // Màu chữ trắng
              }}
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <Avatar
              className="transform mb-2 ring-4 ring-purple-500"
              sx={{ width: "10rem", height: "10rem" }}
              src={selectedLogo || companyJwt?.logo}
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
              id="companyName"
              name="companyName"
              label="Tên công ty"
              variant="outlined"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              error={
                formik.touched.companyName && Boolean(formik.errors.companyName)
              }
              helperText={
                formik.touched.companyName && formik.errors.companyName
              }
            />

            <TextField
              fullWidth
              id="establishedTime"
              name="establishedTime"
              label="Thời gian thành lập"
              variant="outlined"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={formik.values.establishedTime}
              onChange={formik.handleChange}
              error={
                formik.touched.establishedTime &&
                Boolean(formik.errors.establishedTime)
              }
              helperText={
                formik.touched.establishedTime && formik.errors.establishedTime
              }
            />

            <TextField
              fullWidth
              select
              label="Tỉnh/Thành phố"
              value={selectedProvince}
              onChange={(e) => {
                const newProvinceCode = e.target.value;
                setSelectedProvince(newProvinceCode);
                // Reset district and ward when province changes
                setSelectedDistrict("");
                setSelectedWard("");
                setDistricts([]);
                setWards([]);
                // Find province name from code
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
            >
              <MenuItem value="">Chọn tỉnh/thành phố</MenuItem>
              {provinces.map((province) => (
                <MenuItem key={province.code} value={province.code}>
                  {province.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Quận/Huyện"
              value={selectedDistrict}
              onChange={(e) => {
                const newDistrictCode = e.target.value;
                setSelectedDistrict(newDistrictCode);
                // Reset ward when district changes
                setSelectedWard("");
                setWards([]);
                // Find district name from code
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
            >
              <MenuItem value="">Chọn quận/huyện</MenuItem>
              {districts.map((district) => (
                <MenuItem key={district.code} value={district.code}>
                  {district.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Phường/Xã"
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
              <MenuItem value="">Chọn phường/xã</MenuItem>
              {wards.map((ward) => (
                <MenuItem key={ward.code} value={ward.code}>
                  {ward.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Số nhà, tên đường"
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
            />

            <TextField
              fullWidth
              id="industryIds"
              name="industryIds" // Đổi từ industryId -> industryIds
              label="Lĩnh vực hoạt động"
              variant="outlined"
              select
              SelectProps={{
                multiple: true, // Cho phép chọn nhiều
                renderValue: (selected) =>
                  allIndustries
                    ?.filter((industry) =>
                      selected.includes(industry.industryId)
                    )
                    .map((industry) => industry.industryName)
                    .join(", "), // Hiển thị tên ngành nghề được chọn
              }}
              value={formik.values.industryIds} // Đảm bảo industryIds đồng bộ với Formik
              onChange={(event) => {
                formik.setFieldValue("industryIds", event.target.value); // Đảm bảo cập nhật industryIds
              }}
              error={
                formik.touched.industryIds && Boolean(formik.errors.industryIds)
              }
              helperText={
                formik.touched.industryIds && formik.errors.industryIds
              }
            >
              {allIndustries?.map((industry) => (
                <MenuItem key={industry.industryId} value={industry.industryId}>
                  <Checkbox
                    checked={formik.values.industryIds.includes(
                      industry.industryId
                    )}
                  />
                  {industry.industryName}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
