import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { Avatar, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from 'yup';
import { getProfileAction, updateProfileAction } from "../../redux/Auth/auth.action";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { getSeekerByUser, updateSeekerAction } from "../../redux/Seeker/seeker.action";

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
});

export default function ProfileModal({ open, handleClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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
          dispatch(updateProfileAction({ 
            userName: values.userName, 
            avatar: selectedAvatar || values.avatar 
          })),
          dispatch(updateSeekerAction({ address: values.address })),
        ]);
        await dispatch(getProfileAction());
        await dispatch(getSeekerByUser());
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
    setSelectedAvatar(imageUrl);
    formik.setFieldValue("avatar", imageUrl); // Cập nhật giá trị avatar trong formik
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
              <h2 className="text-xl font-semibold">Edit Profile</h2>
            </div>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isLoading || imageLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : "Save Changes"}
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
            <TextField
              fullWidth
              id="address"
              name="address"
              label="Address"
              variant="outlined"
              value={formik.values.address}
              onChange={formik.handleChange}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
          </div>
        </form>
      </Box>
    </Modal>
  );
}
