import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import {
  createSocialLink,
  fetchPlatforms,
  fetchSocialLinks,
  updateSocialLink,
} from "../../redux/SocialLink/socialLink.thunk";
import { SelectTrigger, SelectValue } from "../../ui/select";
import { Label } from "../../ui/label";
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

export default function SocialLinkModal({
  open,
  handleClose,
  editingSocialLinkId,
  setEditingSocialLinkId,
  initialData,
}) {
  const validationSchema = Yup.object({
    platform: Yup.string().required("Vui lòng chọn ít nhất một ứng dụng"),
    url: Yup.string().required("Vui lòng nhập link"),
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { platforms } = useSelector((store) => store.socialLink);

  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // Formik initialization

  const formik = useFormik({
    initialValues: {
      platform: editingSocialLinkId ? initialData?.platform : "",
      url: editingSocialLinkId ? initialData?.url : "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (editingSocialLinkId) {
          const socialLinkData = values;
          await dispatch(
            updateSocialLink({
              id: editingSocialLinkId,
              socialLink: socialLinkData,
            })
          );
          setEditingSocialLinkId(null);
          toast.success("Cập nhật link thành công!");
        } else {
          const linkData = values;
          await dispatch(createSocialLink(linkData));
          toast.success("Thêm link thành công!");
        }
        handleClose();
        dispatch(fetchSocialLinks()); // Refresh the experience list
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
                {editingSocialLinkId ? "Chỉnh sửa link" : "Thêm link"}
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
                  <span>Đang Lưu...</span>
                </div>
              ) : editingSocialLinkId ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
          <div className="space-y-4">
            <FormControl
              fullWidth
              error={formik.touched.platform && Boolean(formik.errors.platform)}
            >
              <InputLabel id="platform-label">Select Platform</InputLabel>
              <Select
                label="Select Platform"
                id="platform"
                name="platform"
                value={formik.values.platform} // Đảm bảo giá trị là một trong các platform
                onChange={formik.handleChange}
                className="bg-white rounded-lg shadow-sm"
              >
                {platforms && platforms.length > 0 ? (
                  platforms.map((platform, index) => (
                    <MenuItem key={index} value={platform}>
                      {platform} {/* Hiển thị tên nền tảng */}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Không có dữ liệu</MenuItem>
                )}
              </Select>

              {formik.touched.platform && formik.errors.platform && (
                <FormHelperText>{formik.errors.platform}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              id="url"
              name="url"
              label="url Name"
              value={formik.values.url}
              onChange={formik.handleChange}
              error={formik.touched.url && Boolean(formik.errors.url)}
              helperText={formik.touched.url && formik.errors.url}
              className="bg-white rounded-lg shadow-sm"
            />
          </div>
        </form>
      </Box>
    </Modal>
  );
}
