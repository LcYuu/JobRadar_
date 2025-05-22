import { Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";

import { Checkbox } from "../../ui/checkbox";
import { getDetailJobById, updateJob } from "../../redux/JobPost/jobPost.thunk";
import { getCompanyByJWT } from "../../redux/Company/company.thunk";

const IndustryPostModal = ({ open, handleClose, postId }) => {
  const dispatch = useDispatch();
  const { companyJwt } = useSelector((store) => store.company);
  const { detailJob } = useSelector((store) => store.jobPost);
  const [selectedIndustry, setSelectedIndustry] = useState(detailJob?.industry || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && detailJob?.industry) {
      // Giữ toàn bộ thông tin kỹ năng từ danh sách của seeker
      setSelectedIndustry(detailJob?.industry);
    }
  }, [open, detailJob?.industry]);

  useEffect(() => {
     dispatch(getCompanyByJWT());
  }, [dispatch]);

  const handleSaveIndustry = async () => {
    try {
      const industryIds = selectedIndustry.map((industry) => industry?.industryId);
      await dispatch(
        updateJob({
          postId, // Truyền postId
          jobPostData: { industryIds }, // Đảm bảo định dạng `jobPostData`
        })
      );
      dispatch(getDetailJobById(postId)); // Tải lại chi tiết công việc
    } catch (error) {
      console.error("Error updating skills:", error);
    } finally {
      setIsLoading(false);
      handleClose(); // Đóng modal hoặc xử lý UI sau khi hoàn tất
    }
  };

  console.log("All skills:", companyJwt?.industry); // Kiểm tra toàn bộ kỹ năng từ store
  console.log("Selected skills:", selectedIndustry); // Kiểm tra danh sách skill đã chọn

  if (!companyJwt || !Array.isArray(companyJwt?.industry)) {
    return (
      <Modal open={open} onClose={handleClose}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <p className="text-gray-500">Đang tải dữ liệu hoặc không có dữ liệu công ty.</p>
        </div>
      </Modal>
    );
  }
  return (
    <Modal open={open} onClose={handleClose} className="animate-fadeIn">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl mt-5 font-semibold text-gray-800">
            Chọn chuyên ngành
          </h2>
          <IconButton onClick={handleClose} className="hover:bg-gray-100">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {companyJwt?.industry.map((industry) => (
            <div
              key={industry.industryId}
              className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selectedIndustry.some(
                  (selectedIndustry) => selectedIndustry.industryId === industry.industryId
                )}
                onCheckedChange={(checked) => {
                  const update = checked
                    ? [...selectedIndustry, industry]
                    : selectedIndustry.filter(
                        (selectedIndustry) =>
                            selectedIndustry.industryId !== industry.industryId
                      );
                  setSelectedIndustry(update);
                }}
                className="mr-3"
              />
              <span className="text-gray-700">{industry.industryName}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              color: "#8B5CF6", // Màu chữ tím
              borderColor: "#8B5CF6", // Màu viền tím
              "&:hover": {
                backgroundColor: "#E0D9F9", // Màu nền khi hover
                borderColor: "#7C3AED", // Màu viền đậm khi hover
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveIndustry}
            sx={{
              backgroundColor: "#8B5CF6", // Màu tím
              "&:hover": {
                backgroundColor: "#7C3AED", // Màu tím đậm khi hover
              },
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>Đang lưu...</span>
              </div>
            ) : (
              "Lưu"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IndustryPostModal;
