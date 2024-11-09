import { Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../redux/store";
import { CheckBox } from "@mui/icons-material";
import { getAllSkill } from "../../redux/Skills/skill.action";
import { Checkbox } from "../../ui/checkbox";
import {
  getSeekerByUser,
  updateSeekerAction,
} from "../../redux/Seeker/seeker.action";

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
    try {
      const skillIds = selectedSkills.map((skill) => skill.skillId);
      await dispatch(updateSeekerAction({ skillIds }));
      dispatch(getSeekerByUser()); // Sau khi cập nhật seeker, tải lại dữ liệu seeker
    } catch (error) {
      console.error("Error updating skills:", error);
    } finally {
      handleClose();
    }
  };

  console.log("All skills:", skills); // Kiểm tra toàn bộ kỹ năng từ store
  console.log("Selected skills:", selectedSkills); // Kiểm tra danh sách skill đã chọn

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="modal-content p-4 max-w-md mx-auto mt-16 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Select Skills</h2>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {skills.map((skill) => (
            <div key={skill.skillId} className="flex items-center">
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
              />
              <span>{skill.skillName}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSkills}
          >
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillModal;
