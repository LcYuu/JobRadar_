import React, { useContext, useEffect, useState } from "react";
import { Input } from "../../../ui/input";
import { Rating } from "@smastrom/react-rating";

import "@smastrom/react-rating/style.css";
import { Button } from "../../../ui/button";
import { LoaderCircle } from "lucide-react";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateCV } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";

const SkillsForm = () => {
  const [skillList, setSkillList] = useState([
  ]);
  const [loading, setLoading] = useState(false);
  const { cvInfo, setCvInfo } = useContext(CVInfoContext);
  const { genCvId } = useParams();
  const dispatch = useDispatch();

  const handleChange = (index, name, value) => {
    const newEntries = skillList.slice();
    newEntries[index][name] = value;
    setSkillList(newEntries);
  };

  const AddNewSkill = () => {
    setSkillList([...skillList, { name: "", rating: 0 }]); // Tạo object mới hoàn toàn
  };

  const RemoveSkill = () => {
    setSkillList((skillList) => skillList.slice(0, -1));
  };

  useEffect(() => {
    if (cvInfo?.skills) {
      setSkillList(cvInfo.skills);
    }
  }, [cvInfo]); // Theo dõi cvInfo, nếu thay đổi thì cập nhật expList

  useEffect(() => {
    if (skillList.length > 0) {
      setCvInfo((prev) => ({
        ...prev,
        skills: skillList,
      }));
    }
  }, [skillList]);

  const onSave = async () => {
    setLoading(true);

    // Chuyển đổi cvInfo thành JSON dạng string
    const cvData = JSON.stringify(cvInfo).replace(/"/g, '\\"'); // Escape dấu "
    await dispatch(
      updateCV({
        genCvId: genCvId,
        cvData: `{ \"cvContent\": \"${cvData}\" }`, // Định dạng đúng như Postman yêu cầu
      })
    );
    setLoading(false);
    toast.success("Thông tin cập nhật thành công 5");
  };
  return (
    <div
      className="p-5 shadow-lg rounded-lg border-t-purple-500
  border-t-4 mt-10"
    >
      <h3 className="font-bold text-lg">Kỹ năng</h3>
      <p>Thêm các kỹ năng mà bạn có</p>
      <div>
        {skillList.map((item, index) => (
          <div className="flex justify-between mb-2 shadow-lg border rounded-lg p-3 ">
            <div>
              <label className="text-xs">Tên kỹ năng</label>
              <Input
                className="w-full"
                defaultValue={item.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
            </div>
            <Rating
              style={{ maxWidth: 150 }}
              value={item.rating}
              onChange={(v) => handleChange(index, "rating", v)}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" className="" onClick={AddNewSkill}>
            + Thêm kỹ năng
          </Button>
          <Button variant="outline" className="" onClick={RemoveSkill}>
            - Xóa kỹ năng
          </Button>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={() => onSave()} disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : "Lưu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;
