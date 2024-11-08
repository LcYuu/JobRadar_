import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { Avatar, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { getProfileAction, updateProfileAction } from "../../redux/Auth/auth.action";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { getSeekerByUser, updateSeekerAction } from "../../redux/Seeker/seeker.action";
import { getUserProfileAction } from "../../redux/Auth/auth.action"; // Hàm lấy dữ liệu người dùng

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

export default function ProfileModal({ open, handleClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { seeker } = useSelector((store) => store.seeker);

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      userName: user?.userName || '',
      avatar: user?.avatar || '',
      address: seeker?.address || '',
    },
    enableReinitialize: true, // Để form tự động cập nhật khi Redux store thay đổi
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Gọi các action để cập nhật hồ sơ
        await Promise.all([
          dispatch(updateProfileAction({ userName: values.userName, avatar: values.avatar })),
          dispatch(updateSeekerAction({ address: values.address })),
        ]);
        dispatch(getProfileAction()); // Tải lại dữ liệu người dùng sau khi cập nhật
        dispatch(getSeekerByUser());
      } catch (error) {
        console.error("Cập nhật không thành công:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại!"); // Thông báo lỗi
      } finally {
        setIsLoading(false);
        handleClose();
      }
    },
  });
  

  const handleSelectImage = async (event) => {
    setIsLoading(true);
    const imageUrl = await uploadToCloudinary(event.target.files[0], "image");
    setSelectedAvatar(imageUrl);
    formik.setFieldValue("avatar", imageUrl); // Cập nhật giá trị avatar trong formik
    setIsLoading(false);
  };

  

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
              <p>Edit Profile</p>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <Avatar
              className="transform"
              sx={{ width: "10rem", height: "10rem" }}
              src={selectedAvatar || user.avatar}
            />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelectImage}
                style={{ display: "none" }}
                id="image-input"
              />
              <label htmlFor="image-input">
                <IconButton color="primary" component="span">
                  <ImageIcon />
                </IconButton>
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <TextField
              fullWidth
              id="userName"
              name="userName"
              label="Username"
              value={formik.values.userName}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              id="address"
              name="address"
              label="Address"
              value={formik.values.address}
              onChange={formik.handleChange}
            />
          </div>
        </form>
      </Box>
    </Modal>
  );
}
