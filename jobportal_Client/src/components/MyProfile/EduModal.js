import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { createEducation, getEduByUser, updateEducation } from "../../redux/Education/edu.thunk";
import { toast } from "react-toastify";

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

export default function EduModal({
  open,
  handleClose,
  editingEducationId,
  setEditingEducationId,
  initialData,
}) {
  const validationSchema = Yup.object({
    certificateDegreeName: Yup.string().required("Bằng cấp là bắt buộc."),
    major: Yup.string().required("Chuyên ngành là bắt buộc."),
    universityName: Yup.string().required(
      "Tên trường/tên tổ chức là bắt buộc."
    ),
    startDate: Yup.date()
      .required("Ngày bắt đầu là bắt buộc.")
      .max(new Date(), "Ngày bắt đầu không được trong tương lai.")
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
      certificateDegreeName: editingEducationId
        ? initialData.certificateDegreeName
        : "",
      major: editingEducationId ? initialData.major : "",
      universityName: editingEducationId ? initialData.universityName : "",
      startDate: editingEducationId ? initialData.startDate : "",
      endDate: editingEducationId ? initialData.endDate : "",
      gpa: editingEducationId ? initialData.gpa : "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (editingEducationId) {
          await dispatch(updateEducation({educationId:editingEducationId, educationData:values}));
          setEditingEducationId(null);
          toast.success("Cập nhật học vấn thành công!");
        } else {
          const eduData = values
          await dispatch(createEducation(eduData));
          toast.success("Cập nhật học vấn thành công!");
        }
        handleClose();
        dispatch(getEduByUser()); // Refresh the education list
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Modal open={open} onClose={handleClose} className="animate-fadeIn">
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <IconButton onClick={handleClose} className="hover:bg-gray-100">
                <CloseIcon />
              </IconButton>
              <h2 className="text-xl mt-6 font-semibold">
                {editingEducationId ? "Chỉnh sửa học vấn" : "Tạo học vấn"}
              </h2>
            </div>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: "#8B5CF6", // Màu tím
                "&:hover": {
                  backgroundColor: "#7C3AED", // Màu tím đậm khi hover
                },
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Đang lưu...</span>
                </div>
              ) : editingEducationId ? (
                "Cập nhật"
              ) : (
                "Thêm mới"
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
              label="Ngày bắt đầu"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              error={
                formik.touched.startDate && Boolean(formik.errors.startDate)
              }
              helperText={formik.touched.startDate ? formik.errors.startDate: "Ví dụ: 09/01/2019"}
              className="bg-white rounded-lg"
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
              label="Ngày kết thúc"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              helperText={formik.touched.endDate ? formik.errors.endDate: "Ví dụ: 06/30/2023"
              }
              className="bg-white rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <TextField
              fullWidth
              id="certificateDegreeName"
              name="certificateDegreeName"
              label="Tên bằng cấp/chứng chỉ"
              value={formik.values.certificateDegreeName}
              onChange={formik.handleChange}
              error={
                formik.touched.certificateDegreeName &&
                Boolean(formik.errors.certificateDegreeName)
              }
              helperText={
                formik.touched.certificateDegreeName &&
                formik.errors.certificateDegreeName ? formik.errors.certificateDegreeName : "Ví dụ: Bằng Cử nhân / CCNA"
              }
              className="bg-white rounded-lg"
            />
            <TextField
              fullWidth
              id="major"
              name="major"
              label="Chuyên ngành"
              value={formik.values.major}
              onChange={formik.handleChange}
              error={formik.touched.major && Boolean(formik.errors.major)}
              helperText={formik.touched.major ? formik.errors.major: "Ví dụ: Công nghệ thông tin"}
              className="bg-white rounded-lg"
            />
            <TextField
              fullWidth
              id="universityName"
              name="universityName"
              label="Tên trường/tên tổ chức"
              value={formik.values.universityName}
              onChange={formik.handleChange}
              error={
                formik.touched.universityName &&
                Boolean(formik.errors.universityName)
              }
              helperText={
                formik.touched.universityName ? formik.errors.universityName: "Ví dụ: Đại học Khoa học tự nhiên TPHCM/ Cisco Academy"
              }
              className="bg-white rounded-lg"
            />
            <TextField
              fullWidth
              id="gpa"
              name="gpa"
              label="Điểm"
              type="number"
              value={formik.values.gpa}
              onChange={formik.handleChange}
              error={formik.touched.gpa && Boolean(formik.errors.gpa)}
              helperText={formik.touched.gpa ? formik.errors.gpa: "Ví dụ: 3.5 / 4.0 hoặc 8.0 / 10"}
              inputProps={{
                min: 0,
                step: 0.01,
              }}
              className="bg-white rounded-lg"
            />
          </div>
        </form>
      </Box>
    </Modal>
  );
}
