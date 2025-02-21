import React, { useContext, useEffect, useState } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import RichTextEditor from "../RichTextEditor";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { LoaderCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateCV } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ExperienceForm = () => {
  const [expList, setExpList] = useState([]);
  const { cvInfo, setCvInfo } = useContext(CVInfoContext);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { genCvId } = useParams();

  const handleChange = (index, event) => {
    const newEntries = expList.slice();
    const { name, value } = event.target;
    newEntries[index][name] = value;
    setExpList(newEntries);
  };

  useEffect(() => {
    if (cvInfo?.experience) {
      setExpList(cvInfo.experience);
    }
  }, [cvInfo]); // Theo dõi cvInfo, nếu thay đổi thì cập nhật expList
  

  const AddNewExperience = () => {
    setExpList([
      ...expList,
      {
        title: "",
        companyName: "",
        address:"",
        startDate: "",
        endDate: "",
        workSummery: "",
      },
    ]);
  };

  const RemoveExperience = () => {
    setExpList((expList) => expList.slice(0, -1));
  };

  const handleRichTextEditor = (e, name, index) => {
    const newEntries = expList.slice();
    newEntries[index][name] = e.target.value;
    setExpList(newEntries);
  };

  useEffect(() => {
    if (expList.length > 0) {
      setCvInfo((prev) => ({
        ...prev,
        experience: expList,
      }));
    }
  }, [expList]);
  

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
    toast.success("Thông tin cập nhật thành công 3");
  };

  return (
    <div>
      <div
        className="p-5 shadow-lg rounded-lg border-t-purple-500
    border-t-4 mt-10"
      >
        <h3 className="font-bold text-lg">Kinh nghiệm</h3>
        <p>Thêm các kinh nghiệm làm việc</p>
        <div>
          {expList.map((item, index) => (
            <div key={item.id || index}>
              <div className="grid grid-cols-2 gap-3 border p-3 my-5 shadow-lg  rounded-lg">
                <div>
                  <label className="text-xs">Tên chức vụ</label>
                  <Input
                    name="title"
                    defaultValue={item?.title}
                    onChange={(event) => handleChange(index, event)}
                  />
                </div>
                <div>
                  <label className="text-xs">Tên công ty</label>
                  <Input
                    name="companyName"
                    defaultValue={item?.companyName}
                    onChange={(event) => handleChange(index, event)}
                  />
                </div>
                <div>
                  <label className="text-xs">Địa chỉ</label>
                  <Input
                    name="address"
                    defaultValue={item?.address}
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
                <div className="col-span-2">
                  <RichTextEditor
                    index={index}
                    defaultValue={item?.workSummery}
                    onRichTextEditorChange={(event) =>
                      handleRichTextEditor(event, "workSummery", index)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={AddNewExperience}

            >
              {" "}
              + Thêm kinh nghiệm
            </Button>
            <Button
              variant="outline"
              onClick={RemoveExperience}

            >
              {" "}
              - Xóa kinh nghiệm
            </Button>
          </div>
          <Button disabled={loading} onClick={() => onSave()}>
            {loading ? <LoaderCircle className="animate-spin" /> : "Lưu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;
