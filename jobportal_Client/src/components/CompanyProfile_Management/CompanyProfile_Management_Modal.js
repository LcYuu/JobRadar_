import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { Avatar, IconButton, MenuItem, TextField } from "@mui/material";
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
import {
  getCompanyByJWT,
  updateCompanyProfile,
} from "../../redux/Company/company.action";
import { getAllIndustries, getIndustry } from "../../redux/Industry/industry.action";

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
  companyName: Yup.string().required("Company name is required"),
  establishedTime: Yup.date().required("Established time is required"),
  address: Yup.string().required("Address is required"),
});

export default function CompanyProfileModal({ open, handleClose }) {
  const [selectedLogo, setSelectedLogo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const dispatch = useDispatch();

  const { companyJwt } = useSelector((store) => store.company);
  const { allIndustries } = useSelector((store) => store.industry);

  useEffect(() => {
    dispatch(getAllIndustries());
  }, [dispatch]);

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
      industryId: companyJwt?.industry?.industryId || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await dispatch(updateCompanyProfile(values));
        dispatch(getCompanyByJWT());
        handleClose();
      } catch (error) {
        console.error("Update failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  console.log("asdasda" + companyJwt?.establishedTime);

  const handleSelectImage = async (event) => {
    setIsLoading(true);
    const imageUrl = await uploadToCloudinary(event.target.files[0]);
    setSelectedLogo(imageUrl);
    formik.setFieldValue("logo", imageUrl); // Cập nhật giá trị avatar trong formik
    setIsLoading(false);
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
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <Avatar
              className="transform mb-2"
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
              id="address"
              name="address"
              label="Địa chỉ"
              variant="outlined"
              value={formik.values.address}
              onChange={formik.handleChange}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
            <TextField
              fullWidth
              id="industryId"
              name="industryId"
              label="Lĩnh vực hoạt động"
              variant="outlined"
              value={formik.values.industryId}
              onChange={formik.handleChange}
              select
              error={
                formik.touched.industryId && Boolean(formik.errors.industryId)
              }
              helperText={formik.touched.industryId && formik.errors.industryId}
            >
              <MenuItem value="">Chọn chuyên ngành</MenuItem>
              {allIndustries?.map((industry) => (
                <MenuItem key={industry.industryId} value={industry.industryId}>
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
