import { Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { getAllSkill } from "../../redux/Skills/skill.action";
import { Checkbox } from "../../ui/checkbox";
import {
  getDetailJobById,
  updateJob,
} from "../../redux/JobPost/jobPost.action";

const SkillJobPostModal = ({ open, handleClose, postId }) => {
  const dispatch = useDispatch();
  const { skills } = useSelector((store) => store.skill);
  const { detailJob } = useSelector((store) => store.jobPost);
  const [selectedSkills, setSelectedSkills] = useState(detailJob?.skills || []);
  const [isLoading] = useState(false);

  useEffect(() => {
    if (open && detailJob.skills) {
      setSelectedSkills(detailJob.skills);
    }
  }, [open, detailJob?.skills]);

  // Thêm useEffect để theo dõi sự thay đổi của selectedSkills
  // useEffect(() => {
  //   console.log("Updated selectedSkills:", selectedSkills);
  // }, [selectedSkills]);

  useEffect(() => {
    dispatch(getAllSkill());
  }, [dispatch]);

  const handleSaveSkills = async () => {
    try {

      const skillIds =
        selectedSkills.length > 0
          ? selectedSkills.map((skill) => skill.skillId)
          : [];
      await dispatch(updateJob(postId, { skillIds }));
      dispatch(getDetailJobById(postId));
    } catch (error) {
      console.error("Error updating skills:", error);
    } finally {
      handleClose();
    }
  };

  console.log("All skills:", skills); // Kiểm tra toàn bộ kỹ năng từ store
  console.log("Selected skills:", selectedSkills); // Kiểm tra danh sách skill đã chọn

  return (
    <Modal open={open} onClose={handleClose} className="animate-fadeIn">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">Select Skills</h2>
          <IconButton onClick={handleClose} className="hover:bg-gray-100">
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
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
            className="hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSkills}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillJobPostModal;
