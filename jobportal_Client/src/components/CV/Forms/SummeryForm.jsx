import React, { useContext, useEffect, useState } from "react";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { updateCV } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Brain, LoaderCircle } from "lucide-react";

const SummeryForm = ({ enabledNext }) => {
  const { genCvId } = useParams();
  const { cvInfo, setCvInfo } = useContext(CVInfoContext);
  const [summery, setSummery] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    summery &&
      setCvInfo({
        ...cvInfo,
        summery: summery,
      });
  }, [summery]);

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
    enabledNext(true);
    toast.success("Thông tin cập nhật thành công 2");
  };
  return (
    <div>
      <div
        className="p-5 shadow-lg rounded-lg border-t-purple-500
  border-t-4 mt-10"
      >
        <h3 className="font-bold text-lg">About me</h3>
        <p>Thêm giới thiệu về bản thân</p>

        <div className="mt-7">
          <div className="flex justify-between items-end">
            <label>Thêm giới thiệu</label>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="border-purple-500 text-purple-500
              flex gap-2"
            >
              <Brain className="h-4 w-4" />
              Tạo từ AI
            </Button>
          </div>
          <Textarea
            className="mt-5"
            required
            defaultValue={cvInfo?.summery}
            onChange={(e) => setSummery(e.target.value)}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Button disabled={loading} onClick={() => onSave()}>
            {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummeryForm;
