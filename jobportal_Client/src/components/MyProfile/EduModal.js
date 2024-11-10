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
  createEducation,
  getEduByUser,
} from "../../redux/Education/edu.action";

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

export default function EduModal({ open, handleClose }) {
  const validationSchema = Yup.object({
    certificateDegreeName: Yup.string().required("Bằng cấp là bắt buộc."),
    major: Yup.string().required("Chuyên ngành là bắt buộc."),
    universityName: Yup.string().required(
      "Tên trường/tên tổ chức là bắt buộc."
    ),
    startDate: Yup.date()
      .required("Ngày bắt đầu là bắt buộc.")
      .typeError("Ngày bắt đầu không hợp lệ."),
    endDate: Yup.date()
      .required("Ngày kết thúc là bắt buộc.")
      .min(Yup.ref("startDate"), "Ngày kết thúc không thể trước ngày bắt đầu.")
      .typeError("Ngày kết thúc không hợp lệ."),
    gpa: Yup.number()
      .required("GPA là bắt buộc.")
      .typeError("GPA phải là một số."),
  });

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { edu } = useSelector((store) => store.edu);

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      certificateDegreeName: edu?.certificateDegreeName || "",
      major: edu?.major || "",
      universityName: edu?.universityName || "",
      startDate: edu?.startDate || "",
      endDate: edu?.endDate || "",
      gpa: edu?.gpa || "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Gọi các action để cập nhật hồ sơ
        await dispatch(createEducation(values));
        dispatch(getEduByUser());
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
      className="animate-fadeIn"
    >
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <IconButton onClick={handleClose} className="hover:bg-gray-100">
                <CloseIcon />
              </IconButton>
              <h2 className="text-xl font-semibold">Add Education</h2>
            </div>
            <Button 
              type="submit" 
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Saving...</span>
                </div>
              ) : 'Create'}
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
                className: "font-semibold"
              }}
              label="Start Date"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              helperText={formik.touched.startDate && formik.errors.startDate}
              className="bg-white rounded-lg"
            />
            <TextField
              type="date"
              fullWidth
              id="endDate"
              name="endDate"
              InputLabelProps={{ 
                shrink: true,
                className: "font-semibold"
              }}
              label="End Date"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              helperText={formik.touched.endDate && formik.errors.endDate}
              className="bg-white rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <TextField
              fullWidth
              id="certificateDegreeName"
              name="certificateDegreeName"
              label="Certificate/Degree Name"
              value={formik.values.certificateDegreeName}
              onChange={formik.handleChange}
              error={formik.touched.certificateDegreeName && Boolean(formik.errors.certificateDegreeName)}
              helperText={formik.touched.certificateDegreeName && formik.errors.certificateDegreeName}
              className="bg-white rounded-lg"
            />
            <TextField
              fullWidth
              id="major"
              name="major"
              label="Major"
              value={formik.values.major}
              onChange={formik.handleChange}
              error={formik.touched.major && Boolean(formik.errors.major)}
              helperText={formik.touched.major && formik.errors.major}
              className="bg-white rounded-lg"
            />
            <TextField
              fullWidth
              id="universityName"
              name="universityName"
              label="Organization Name"
              value={formik.values.universityName}
              onChange={formik.handleChange}
              error={formik.touched.universityName && Boolean(formik.errors.universityName)}
              helperText={formik.touched.universityName && formik.errors.universityName}
              className="bg-white rounded-lg"
            />
            <TextField
              fullWidth
              id="gpa"
              name="gpa"
              label="Score"
              type="number"
              value={formik.values.gpa}
              onChange={formik.handleChange}
              error={formik.touched.gpa && Boolean(formik.errors.gpa)}
              helperText={formik.touched.gpa && formik.errors.gpa}
              inputProps={{
                min: 0,
              }}
              className="bg-white rounded-lg"
            />
          </div>
        </form>
      </Box>
    </Modal>
  );
}
