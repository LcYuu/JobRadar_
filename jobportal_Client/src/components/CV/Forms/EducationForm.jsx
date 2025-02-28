import { LoaderCircle, University } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import { toast } from "react-toastify";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { useDispatch } from "react-redux";
import { updateCV } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";

const EducationForm = () => {
  const [eduList, setEduList] = useState([]);

  const dispatch = useDispatch();
  const { genCvId } = useParams();
  const { cvInfo, setCvInfo } = useContext(CVInfoContext);

  const [loading, setLoading] = useState(false);

  const handleChange = (index, event) => {
    const newEntries = eduList.slice();
    const { name, value } = event.target;
    newEntries[index][name] = value;
    setEduList(newEntries);
  };

  useEffect(() => {
      if (cvInfo?.education) {
        setEduList(cvInfo.education);
      }
    }, [cvInfo]); // Theo dõi cvInfo, nếu thay đổi thì cập nhật expList

  console.log("🚀 ~ EducationForm ~ eduList:", eduList);

   useEffect(() => {
      if (eduList.length > 0) {
        setCvInfo((prev) => ({
          ...prev,
          education: eduList,
        }));
      }
    }, [eduList]);

  const AddNewEducation = () => {
    setEduList([
      ...eduList,
      {
        universityName: "",
        degree: "",
        major: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const RemoveEducation = () => {
    setEduList((eduList) => eduList.slice(0, -1));
  };

  const onSave = async () => {
    setLoading(true);

    const cvData = JSON.stringify(cvInfo).replace(/"/g, '\\"'); // Escape dấu "
    await dispatch(
      updateCV({
        genCvId: genCvId,
        cvData: `{ \"cvContent\": \"${cvData}\" }`, // Định dạng đúng như Postman yêu cầu
      })
    );
    setLoading(false);
    toast.success("Thông tin cập nhật thành công 4");
  };

  return (
    <div
      className="p-5 shadow-lg rounded-lg border-t-purple-500
  border-t-4 mt-10"
    >
      <h3 className="font-bold text-lg">Học vấn</h3>
      <p>Thêm chi tiết trình độ học vấn</p>
      <div>
        {eduList.map((item, index) => (
          <div>
            <div className="grid grid-cols-2 gap-3 border p-3 my-5 shadow-lg  rounded-lg">
              <div>
                <label className="text-xs">University Name</label>
                <Input
                  name="universityName"
                  defaultValue={item?.universityName}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Bằng cấp</label>
                <Input
                  name="degree"
                  defaultValue={item?.degree}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Lĩnh vực</label>
                <Input
                  name="major"
                  defaultValue={item?.major}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Ngày bắt đầu</label>
                <Input
                  name="startDate"
                  type="date"
                  defaultValue={item?.startDate}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Ngày kết thúc</label>
                <Input
                  name="endDate"
                  type="date"
                  defaultValue={item?.endDate}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Mô tả</label>
                <Textarea
                  name="description"
                  defaultValue={item?.description}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewEducation}>
            + Thêm học vấn
          </Button>
          <Button variant="outline"  onClick={RemoveEducation}>
            - Xóa học vấn
          </Button>
        </div>
        <div className="mt-3 flex justify-end">
          <Button disabled={loading} onClick={() => onSave()}>
            {loading ? <LoaderCircle className="animate-spin" /> : "Lưu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EducationForm;
