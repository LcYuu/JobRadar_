import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import Swal from "sweetalert2";

import CloseIcon from "@mui/icons-material/Close";
import { blockCompany } from "../../redux/Auth/auth.thunk";

import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { getCompanyProfile } from "../../redux/Company/company.thunk";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const blockDurations = [
  { label: "3 ngày", value: 3 },
  { label: "7 ngày", value: 7 },
  { label: "15 ngày", value: 15 },
  { label: "30 ngày", value: 30 },
  { label: "1 năm", value: 365 },
  { label: "Vĩnh viễn", value: "Vĩnh viễn" },
];

const blockReasons = [
  { label: "Vi phạm điều khoản sử dụng", value: "Vi phạm điều khoản" },
  { label: "Cung cấp thông tin sai lệch", value: "Cung cấp sai thông tin" },
  { label: "Lừa đảo, gian lận", value: "Lừa đảo, gian lận" },
  { label: "Báo cáo từ người dùng", value: "Báo cáo người dùng" },
  { label: "Khác", value: "Khác" },
];

export default function BlockedCompanyModal({
  open,
  handleClose,
  companyId,
  company,
}) {
  const [selectedDuration, setSelectedDuration] = useState(
    blockDurations[0].value
  );
  const [selectedReason, setSelectedReason] = useState(blockReasons[0].value);
  const [customReason, setCustomReason] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const blockedUntil =
      selectedDuration !== "Vĩnh viễn"
        ? dayjs().add(selectedDuration, "day").toISOString()
        : dayjs().add(99, "year").toISOString();
  
    const reasonText =
      selectedReason === "Khác" && customReason.trim()
        ? customReason
        : selectedReason;
  
    if (!reasonText) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Vui lòng chọn hoặc nhập lý do khóa tài khoản!",
      });
      return;
    }

    handleClose();
  
    const blockedData = {
      blockedReason: reasonText,
      blockedUntil,
    };
  
    // Hiển thị loading
    Swal.fire({
      title: "Đang xử lý...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    
  
    try {
      await dispatch(blockCompany({ companyId, blockedData }));
  
      // Hiển thị thông báo thành công
      Swal.fire({
        icon: "success",
        title: "Tài khoản bị khóa",
        text: `Tài khoản đã bị khóa ${
          selectedDuration !== "Vĩnh viễn"
            ? `đến ${dayjs(blockedUntil).format("DD/MM/YYYY HH:mm")}`
            : "đến năm " + dayjs(blockedUntil).format("YYYY")
        } với lý do: ${blockedData.blockedReason}`,
      });
  
      // Cập nhật lại thông tin công ty
      await dispatch(getCompanyProfile(companyId));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Đã có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  
    
  };
  

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <form onSubmit={handleSubmit}>
          {/* Tiêu đề */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold">
              Khóa tài khoản
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Nội dung chính */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Chọn thời gian khóa */}
            <FormControl fullWidth>
              <label>Thời gian khóa</label>
              <Select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
              >
                {blockDurations.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Chọn lý do khóa */}
            <FormControl fullWidth>
              <label>Lý do khóa</label>
              <Select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                {blockReasons.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Nhập lý do nếu chọn "Khác" */}
            {selectedReason === "Khác" && (
              <TextField
                fullWidth
                label="Nhập lý do"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                multiline
                rows={3}
                required
              />
            )}
          </Box>

          {/* Nút xác nhận */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, textTransform: "none", fontSize: 16 }}
          >
            Xác nhận khóa
          </Button>
        </form>
      </Box>
    </Modal>
  );
}
