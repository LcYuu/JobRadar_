import { Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "../../ui/checkbox";

import Swal from "sweetalert2";
import { getAllSkill } from "../../redux/Skills/skill.thunk";
import { getSeekerByUser, updateSeekerAction } from "../../redux/Seeker/seeker.thunk";

const SkillModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { skills } = useSelector((store) => store.skill);
  const { seeker } = useSelector((store) => store.seeker);
  const [selectedSkills, setSelectedSkills] = useState(seeker.skills || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && seeker.skills) {
      // Giữ toàn bộ thông tin kỹ năng từ danh sách của seeker
      setSelectedSkills(seeker.skills);
    }
  }, [open, seeker.skills]);

  // Thêm useEffect để theo dõi sự thay đổi của selectedSkills
  // useEffect(() => {
  //   console.log("Updated selectedSkills:", selectedSkills);
  // }, [selectedSkills]);

  useEffect(() => {
    dispatch(getAllSkill());
  }, [dispatch]);

  const handleSaveSkills = async () => {
    if (selectedSkills.length === 0) {
      handleClose();
      Swal.fire({
        icon: "warning",
        title: "Lỗi",
        text: "Bạn phải chọn ít nhất một kỹ năng!",
        customClass: {
          popup: "z-[9999]", // Sử dụng lớp z-index của Tailwind
          backdrop: "bg-black bg-opacity-50",
        },
      });
      return; // Dừng hàm nếu không có kỹ năng nào được chọn
    }
  
    try {
      const skillIds = selectedSkills.map((skill) => skill.skillId);
      const userData = {
        skillIds,
      };
      await dispatch(updateSeekerAction({ userData }));
      dispatch(getSeekerByUser()); // Sau khi cập nhật seeker, tải lại dữ liệu seeker
    } catch (error) {
      console.error("Error updating skills:", error);
    } finally {
      handleClose();
      Swal.fire({
        icon: "success",
        title: "Cập nhật",
        text: "Cập nhật kỹ năng thành công",
        customClass: {
          popup: "z-[9999]", // Sử dụng lớp z-index của Tailwind
          backdrop: "bg-black bg-opacity-50",
        },
      });
    }
  };
  

  return (
    <Modal open={open} onClose={handleClose} className="animate-fadeIn fixed inset-0 z-50">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl mt-5 font-semibold text-gray-800">Chọn kĩ năng</h2>
          <IconButton onClick={handleClose} className="hover:bg-gray-100">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {skills.map((skill) => (
            <div
              key={skill.skillId}
              className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selectedSkills.some(
                  (selectedSkill) => selectedSkill.skillId === skill.skillId
                )}
                onCheckedChange={(checked) => {
                  const update = checked
                    ? [...selectedSkills, skill]
                    : selectedSkills.filter(
                        (selectedSkill) =>
                          selectedSkill.skillId !== skill.skillId
                      );
                  setSelectedSkills(update);
                }}
                className="mr-3"
              />
              <span className="text-gray-700">{skill.skillName}</span>
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
            onClick={handleSaveSkills}
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
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillModal;
