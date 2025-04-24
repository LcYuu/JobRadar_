import { LoaderCircle } from "lucide-react";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import { toast } from "react-toastify";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { useDispatch, useSelector } from "react-redux";
import { updateCV, getGenCVById } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";
import LoadingOverlay from "../LoadingOverlay";

const EducationForm = ({ enabledNext }) => {
  const [eduList, setEduList] = useState([]);

  const dispatch = useDispatch();
  const { genCvId } = useParams();
  const { cvInfo, setCvInfo, onSaving } = useContext(CVInfoContext);
  const { genCv } = useSelector((store) => store.genCV);

  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Flag to control when to sync with cvInfo
  const isUpdating = useRef(false);
  
  // Add forceUpdate mechanism
  const [, forceUpdate] = useState({});
  const forceRerender = () => forceUpdate({});

  // Sync with genCv when it changes from Redux
  useEffect(() => {
    if (genCv && genCv.cvContent && !isUpdating.current) {
      try {
        const content = JSON.parse(genCv.cvContent.replace(/^"|"$/g, "") || "{}");
        if (content.education && Array.isArray(content.education)) {
          console.log("Syncing education from Redux:", content.education);
          setEduList(content.education);
        }
      } catch (error) {
        console.error("Error parsing cvContent in EducationForm:", error);
      }
    }
  }, [genCv]);

  // Sync with cvInfo when it changes
  useEffect(() => {
    if (cvInfo?.education && Array.isArray(cvInfo.education) && !isUpdating.current) {
      console.log("Syncing education from Context:", cvInfo.education);
      setEduList(cvInfo.education);
    }
  }, [cvInfo?.education]);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newEntries = [...eduList]; // Clone array
    newEntries[index] = {
      ...newEntries[index], // Clone the object to modify
      [name]: value,
    };
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setEduList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      education: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when changes are made
    if (enabledNext) enabledNext(false);
  };

  const AddNewEducation = () => {
    const newEntries = [
      ...eduList,
      {
        universityName: "",
        degree: "",
        major: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ];
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setEduList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      education: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when adding new education
    if (enabledNext) enabledNext(false);
  };

  const RemoveEducation = () => {
    const newEntries = eduList.slice(0, -1);
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setEduList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      education: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when removing education
    if (enabledNext) enabledNext(false);
  };

  const onSave = async () => {
    // In log để debug
    console.log("EducationForm: onSave bắt đầu");
    
    // Đặt trạng thái loading trước - cả local và global
    setLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu học vấn...");
    
    // Đảm bảo loading hiển thị ít nhất 2 giây
    const startTime = Date.now();

    try {
      // Set flag to prevent sync conflicts
      isUpdating.current = true;
      
      // Đợi một chút để đảm bảo loading được hiển thị
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("EducationForm: Đang cập nhật dữ liệu...");
      
      // Create updated data
      const updatedData = {
        ...cvInfo,
        education: eduList
      };

      // Update context immediately
      setCvInfo(updatedData);

      // Update backend - now we await to ensure we get the updated data
      const cvData = JSON.stringify(updatedData).replace(/"/g, '\\"');
      await dispatch(
        updateCV({
          genCvId: genCvId,
          cvData: `{ \"cvContent\": \"${cvData}\" }`,
        })
      );
      
      console.log("EducationForm: UpdateCV đã hoàn thành, đang tải lại dữ liệu...");
      
      // Force refresh by fetching the CV again
      await dispatch(getGenCVById(genCvId));
      
      // Force re-render
      forceRerender();
      
      // Enable next button after successful save
      if (enabledNext) enabledNext(true);
      
      // Đảm bảo loading hiển thị đủ lâu
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 2 giây
      
      console.log(`EducationForm: Đã xử lý trong ${elapsedTime}ms, tối thiểu cần ${minLoadingTime}ms`);
      
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        console.log(`EducationForm: Đợi thêm ${remainingTime}ms để hiển thị loading`);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Tắt loading trước khi hiển thị toast
      setLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
      
      // Hiển thị toast thành công ngay lập tức không cần setTimeout
      console.log("EducationForm: Hoàn thành, hiển thị toast thành công");
      toast.success("Thông tin cập nhật thành công");
      
    } catch (error) {
      console.error("Save error:", error);
      
      // Tắt loading trước khi hiển thị toast lỗi
      setLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
      
      // Hiển thị toast lỗi ngay lập tức không cần setTimeout
      toast.error("Cập nhật thất bại");
      
      // Reset updating flag in case of error
      isUpdating.current = false;
    } finally {
      // Reset updating flag
      isUpdating.current = false;
      
      // Các trạng thái loading đã được xử lý trong try/catch
    }
  };

  return (
    <div
      className="p-5 shadow-lg rounded-lg border-t-purple-500
  border-t-4 mt-10 relative"
    >
      {(loading || updateLoading) && console.log("EducationForm rendering: loading active", {loading, updateLoading})}
      
      <LoadingOverlay 
        isLoading={loading || updateLoading} 
        message="Đang lưu học vấn..." 
      />
      
      <h3 className="font-bold text-lg">Học vấn</h3>
      <p>Thêm chi tiết trình độ học vấn</p>
      <div>
        {eduList.map((item, index) => (
          <div key={index}>
            <div className="grid grid-cols-2 gap-3 border p-3 my-5 shadow-lg  rounded-lg">
              <div>
                <label className="text-xs">University Name</label>
                <Input
                  name="universityName"
                  value={item?.universityName || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Bằng cấp</label>
                <Input
                  name="degree"
                  value={item?.degree || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Lĩnh vực</label>
                <Input
                  name="major"
                  value={item?.major || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Ngày bắt đầu</label>
                <Input
                  name="startDate"
                  type="date"
                  value={item?.startDate || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs">Ngày kết thúc</label>
                <Input
                  name="endDate"
                  type="date"
                  value={item?.endDate || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div>
                <label className="text-xs mb-1">Mô tả</label>
                <Textarea
                  name="description"
                  rows={3}
                  value={item?.description || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewEducation}>
            + Thêm học vấn
          </Button>
          <Button variant="outline" onClick={RemoveEducation}>
            - Xóa học vấn
          </Button>
        </div>
        <Button 
          disabled={loading || updateLoading} 
          onClick={() => onSave()}
          className="relative overflow-hidden"
        >
          {loading || updateLoading ? (
            <>
              <LoaderCircle className="animate-spin mr-2" />
              <span>Đang lưu...</span>
            </>
          ) : (
            "Lưu"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EducationForm;
