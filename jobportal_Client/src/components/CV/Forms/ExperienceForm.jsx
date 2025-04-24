import React, { useContext, useEffect, useState, useRef } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import RichTextEditor from "../RichTextEditor";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { LoaderCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateCV, getGenCVById } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingOverlay from "../LoadingOverlay";

const ExperienceForm = ({ enabledNext }) => {
  const [expList, setExpList] = useState([]);
  
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
        if (content.experience && Array.isArray(content.experience)) {
          console.log("Syncing experience from Redux:", content.experience);
          setExpList(content.experience);
        }
      } catch (error) {
        console.error("Error parsing cvContent in ExperienceForm:", error);
      }
    }
  }, [genCv]);

  // Sync with cvInfo when it changes
  useEffect(() => {
    if (cvInfo?.experience && Array.isArray(cvInfo.experience) && !isUpdating.current) {
      console.log("Syncing experience from Context:", cvInfo.experience);
      setExpList(cvInfo.experience);
    }
  }, [cvInfo?.experience]);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newEntries = [...expList]; // Clone array
    newEntries[index] = {
      ...newEntries[index], // Clone the object to modify
      [name]: value,
    };
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setExpList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      experience: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when changes are made
    if (enabledNext) enabledNext(false);
  };

  const handleDateChange = (index, name, date) => {
    const newEntries = [...expList]; // Clone array
    if (date) {
      newEntries[index] = {
        ...newEntries[index], // Clone the object to modify
        [name]: date,
      };
      
      // Set flag to prevent infinite loop
      isUpdating.current = true;
      
      setExpList(newEntries);
      
      // Update context immediately for real-time preview
      setCvInfo(prev => ({
        ...prev,
        experience: newEntries
      }));
      
      // Reset flag after update
      setTimeout(() => {
        isUpdating.current = false;
      }, 0);
      
      // Disable next button when changes are made
      if (enabledNext) enabledNext(false);
    }
  };

  const AddNewExp = () => {
    const newEntries = [
      ...expList,
      {
        title: "",
        companyName: "",
        address: "",
        startDate: "",
        endDate: "",
        workSummery: "",
      },
    ];
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setExpList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      experience: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when adding new experience
    if (enabledNext) enabledNext(false);
  };

  const RemoveExp = () => {
    const newEntries = expList.slice(0, -1);
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setExpList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      experience: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when removing experience
    if (enabledNext) enabledNext(false);
  };

  const onSave = async () => {
    // In log để debug
    console.log("ExperienceForm: onSave bắt đầu");
    
    // Đặt trạng thái loading trước - cả local và global
    setLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu kinh nghiệm làm việc...");
    
    // Đảm bảo loading hiển thị ít nhất 2 giây
    const startTime = Date.now();
    
    try {
      // Set flag to prevent sync conflicts
      isUpdating.current = true;
      
      // Đợi một chút để đảm bảo loading được hiển thị
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("ExperienceForm: Đang cập nhật dữ liệu...");
      
      // Create updated data
      const updatedData = {
        ...cvInfo,
        experience: expList
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
      
      console.log("ExperienceForm: UpdateCV đã hoàn thành, đang tải lại dữ liệu...");
      
      // Force refresh by fetching the CV again
      await dispatch(getGenCVById(genCvId));
      
      // Force re-render
      forceRerender();
      
      // Enable next button after successful save
      enabledNext(true);
      
      // Đảm bảo loading hiển thị đủ lâu
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 2 giây
      
      console.log(`ExperienceForm: Đã xử lý trong ${elapsedTime}ms, tối thiểu cần ${minLoadingTime}ms`);
      
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        console.log(`ExperienceForm: Đợi thêm ${remainingTime}ms để hiển thị loading`);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Tắt loading trước khi hiển thị toast
      setLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
      
      // Hiển thị toast thành công ngay lập tức không cần setTimeout
      console.log("ExperienceForm: Hoàn thành, hiển thị toast thành công");
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
      {(loading || updateLoading) && console.log("ExperienceForm rendering: loading active", {loading, updateLoading})}
      
      <LoadingOverlay 
        isLoading={loading || updateLoading} 
        message="Đang lưu kinh nghiệm làm việc..." 
      />
      
      <h3 className="font-bold text-lg">Kinh nghiệm làm việc</h3>
      <p>Thêm kinh nghiệm làm việc của bạn</p>
      <div>
        {expList.map((item, index) => (
          <div key={index} className="mt-5 border p-3 shadow-md rounded-lg">
            <div className="grid gap-3 mt-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1">Tên công việc</label>
                  <Input
                    name="title"
                    value={item?.title || ""}
                    onChange={(event) => handleChange(index, event)}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1">Tên công ty</label>
                  <Input
                    name="companyName"
                    value={item?.companyName || ""}
                    onChange={(event) => handleChange(index, event)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs mb-1">Vị trí</label>
                  <Input
                    name="address"
                    value={item?.address || ""}
                    onChange={(event) => handleChange(index, event)}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1">Ngày bắt đầu</label>
                  <Input
                    name="startDate"
                    type="date"
                    value={item?.startDate || ""}
                    onChange={(event) => handleChange(index, event)}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1">Ngày kết thúc</label>
                  <Input
                    name="endDate"
                    type="date"
                    value={item?.endDate || ""}
                    onChange={(event) => handleChange(index, event)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1">Mô tả</label>
                <Textarea
                  name="workSummery"
                  rows={3}
                  value={item?.workSummery || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewExp}>
            + Thêm kinh nghiệm
          </Button>
          <Button variant="outline" onClick={RemoveExp}>
            - Xóa kinh nghiệm
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

export default ExperienceForm;
