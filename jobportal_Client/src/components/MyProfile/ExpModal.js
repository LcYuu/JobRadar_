import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from 'yup';
import { createExperience, getExpByUser } from "../../redux/Experience/exp.action";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
  outline: "none",
  overflow: "scroll-y",
  borderRadius: 3,
};

export default function ExpModal({ open, handleClose }) {
  const validationSchema = Yup.object({
    jobTitle: Yup.string().required("Vui lòng nhập tiêu đề công việc"),
    companyName: Yup.string().required("Vui lòng nhập tên công ty"),
    description: Yup.string()
      .required("Vui lòng nhập mô tả công việc")
      .min(10, "Mô tả công việc phải có ít nhất 10 ký tự"),
    startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
    endDate: Yup.date()
      .required("Vui lòng chọn ngày kết thúc")
      .min(Yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
  });

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { exp } = useSelector((store) => store.exp);

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      startDate: exp?.startDate || "",
      endDate: exp?.endDate || "",
      jobTitle: exp?.jobTitle || "",
      companyName: exp?.companyName || "",
      description: exp?.description || "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Gọi các action để cập nhật hồ sơ
        await dispatch(createExperience(values))
        dispatch(getExpByUser())
        formik.resetForm();
      } catch (error) {
        console.error("Cập nhật không thành công:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại!"); // Thông báo lỗi
      } finally {
        setIsLoading(false);
        handleClose();
      }
    },
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
              <p>Add Experience</p>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Create"}
            </Button>
          </div>
          <div className="space-y-3">
            <TextField
              type="date" // Đặt type là "date" để chọn ngày
              fullWidth
              id="startDate"
              name="startDate"
              InputLabelProps={{ shrink: true }}
              label="StartDate"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              error={
                formik.touched.startDate && Boolean(formik.errors.startDate)
              }
              helperText={formik.touched.startDate && formik.errors.startDate}
            />
            <TextField
              type="date" 
              fullWidth
              id="endDate"
              InputLabelProps={{ shrink: true }}
              name="endDate"
              label="EndDate"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              helperText={formik.touched.endDate && formik.errors.endDate}
            />
            <TextField
              fullWidth
              id="jobTitle"
              name="jobTitle"
              label="Job Title"
              value={formik.values.jobTitle}
              onChange={formik.handleChange}
              error={formik.touched.jobTitle && Boolean(formik.errors.jobTitle)}
              helperText={formik.touched.jobTitle && formik.errors.jobTitle}
            />
            <TextField
              fullWidth
              id="companyName"
              name="companyName"
              label="Company Name"
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
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
          </div>
        </form>
      </Box>
    </Modal>
  );
}
