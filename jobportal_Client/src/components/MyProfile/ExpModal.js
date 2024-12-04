import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  createExperience,
  getExpByUser,
  updateExperience,
} from "../../redux/Experience/exp.action";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "600px",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  borderRadius: "12px",
  p: 3,
  outline: "none",
  overflowY: "auto",
  border: "none",
};

export default function ExpModal({
  open,
  handleClose,
  editingExperienceId,
  setEditingExperienceId,
  initialData,
  showSuccessToast,
}) {
  const validationSchema = Yup.object({
    jobTitle: Yup.string().required("Vui lòng nhập tiêu đề công việc"),
    companyName: Yup.string().required("Vui lòng nhập tên công ty"),
    description: Yup.string()
      .required("Vui lòng nhập mô tả công việc")
      .min(10, "Mô tả công việc phải có ít nhất 10 ký tự"),
    startDate: Yup.date()
      .required("Ngày bắt đầu là bắt buộc.")
      .max(new Date(), "Ngày bắt đầu không được trong tương lai.")
      .typeError("Ngày bắt đầu không hợp lệ."),
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
      startDate: editingExperienceId ? initialData.startDate : "",
      endDate: editingExperienceId ? initialData.endDate : "",
      jobTitle: editingExperienceId ? initialData.jobTitle : "",
      companyName: editingExperienceId ? initialData.companyName : "",
      description: editingExperienceId ? initialData.description : "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (editingExperienceId) {
          await dispatch(updateExperience(editingExperienceId, values));
          setEditingExperienceId(null);
          showSuccessToast("Cập nhật kinh nghiệm thành công!");
        } else {
          await dispatch(createExperience(values));
          showSuccessToast("Cập nhật kinh nghiệm thành công!");
        }
        handleClose();
        dispatch(getExpByUser()); // Refresh the experience list
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Modal open={open} onClose={handleClose} className="animate-fadeIn">
      <Box sx={style} className="bg-white rounded-lg p-6 shadow-lg">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <IconButton onClick={handleClose} className="hover:bg-gray-100">
                <CloseIcon />
              </IconButton>
              <h2 className="text-xl mt-6 font-semibold text-gray-800">
                {editingExperienceId
                  ? "Chỉnh sửa kinh nghiệm"
                  : "Tạo kinh nghiệm"}
              </h2>
            </div>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: "#7c3aed", // Màu tím
                "&:hover": {
                  backgroundColor: "#6d28d9", // Màu tím đậm khi hover
                },
              }}
              className="text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Saving...</span>
                </div>
              ) : editingExperienceId ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              type="date"
              fullWidth
              id="startDate"
              name="startDate"
              InputLabelProps={{
                shrink: true,
                className: "font-semibold",
              }}
              label="Start Date"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              error={
                formik.touched.startDate && Boolean(formik.errors.startDate)
              }
              helperText={formik.touched.startDate && formik.errors.startDate}
              className="bg-white rounded-lg shadow-sm"
            />
            <TextField
              type="date"
              fullWidth
              id="endDate"
              name="endDate"
              InputLabelProps={{
                shrink: true,
                className: "font-semibold",
              }}
              label="End Date"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              helperText={formik.touched.endDate && formik.errors.endDate}
              className="bg-white rounded-lg shadow-sm"
            />
          </div>

          <div className="space-y-4">
            <TextField
              fullWidth
              id="jobTitle"
              name="jobTitle"
              label="Job Title"
              value={formik.values.jobTitle}
              onChange={formik.handleChange}
              error={formik.touched.jobTitle && Boolean(formik.errors.jobTitle)}
              helperText={formik.touched.jobTitle && formik.errors.jobTitle}
              className="bg-white rounded-lg shadow-sm"
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
              className="bg-white rounded-lg shadow-sm"
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
              className="bg-white rounded-lg shadow-sm"
            />
          </div>
        </form>
      </Box>
    </Modal>
  );
}
