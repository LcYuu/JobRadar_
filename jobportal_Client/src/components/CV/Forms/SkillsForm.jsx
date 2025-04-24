
import React, { useContext, useEffect, useState, useRef } from "react";

import { Input } from "../../../ui/input";
import { Rating } from "@smastrom/react-rating";

import "@smastrom/react-rating/style.css";
import { Button } from "../../../ui/button";
import { LoaderCircle } from "lucide-react";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import { updateCV, getGenCVById } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";
import LoadingOverlay from "../LoadingOverlay";

const SkillsForm = ({ enabledNext }) => {
  const [skillList, setSkillList] = useState([]);

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
        if (content.skills && Array.isArray(content.skills)) {
          console.log("Syncing skills from Redux:", content.skills);
          setSkillList(content.skills);
        }
      } catch (error) {
        console.error("Error parsing cvContent in SkillsForm:", error);
      }
    }
  }, [genCv]);

  // Sync with cvInfo when it changes
  useEffect(() => {
    if (cvInfo?.skills && Array.isArray(cvInfo.skills) && !isUpdating.current) {
      console.log("Syncing skills from Context:", cvInfo.skills);
      setSkillList(cvInfo.skills);
    }
  }, [cvInfo?.skills]);

  const handleChange = (index, event) => {
    const newEntries = skillList.slice();
    const { name, value } = event.target;
    newEntries[index][name] = value;
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setSkillList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      skills: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when changes are made
    if (enabledNext) enabledNext(false);
  };

  const AddNewSkill = () => {
    const newEntries = [
      ...skillList,
      {
        name: "",
        rating: 0
      },
    ];
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setSkillList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      skills: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when adding new skill
    if (enabledNext) enabledNext(false);
  };

  const RemoveSkill = () => {
    const newEntries = skillList.slice(0, -1);
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setSkillList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      skills: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when removing skill
    if (enabledNext) enabledNext(false);
  };

  const handleLevel = (index, ratingValue) => {
    const newEntries = skillList.slice();
    
    // Gán giá trị rating trực tiếp
    newEntries[index] = {
      ...newEntries[index],
      rating: ratingValue
    };
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    setSkillList(newEntries);
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      skills: newEntries
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when changes are made
    if (enabledNext) enabledNext(false);
  };

  // Hàm helper để lấy level name từ rating
  const getLevelNameFromRating = (rating) => {
    switch (rating) {
      case 1: return "Beginner";
      case 2: return "Elementary";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Expert";
      default: return "";
    }
  };

  const onSave = async () => {
    // In log để debug
    console.log("SkillsForm: onSave bắt đầu");
    
    // Đặt trạng thái loading trước - cả local và global
    setLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu kỹ năng...");
    
    // Đảm bảo loading hiển thị ít nhất 2 giây
    const startTime = Date.now();

    try {
      // Set flag to prevent sync conflicts
      isUpdating.current = true;
      
      // Đợi một chút để đảm bảo loading được hiển thị
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("SkillsForm: Đang cập nhật dữ liệu...");
      
      // Create updated data
      const updatedData = {
        ...cvInfo,
        skills: skillList
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
      
      console.log("SkillsForm: UpdateCV đã hoàn thành, đang tải lại dữ liệu...");
      
      // Force refresh by fetching the CV again
      await dispatch(getGenCVById(genCvId));
      
      // Force re-render
      forceRerender();
      
      // Enable next button after successful save
      if (enabledNext) enabledNext(true);
      
      // Đảm bảo loading hiển thị đủ lâu
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 2 giây
      
      console.log(`SkillsForm: Đã xử lý trong ${elapsedTime}ms, tối thiểu cần ${minLoadingTime}ms`);
      
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        console.log(`SkillsForm: Đợi thêm ${remainingTime}ms để hiển thị loading`);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Tắt loading trước khi hiển thị toast
      setLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
      
      // Hiển thị toast thành công ngay lập tức không cần setTimeout
      console.log("SkillsForm: Hoàn thành, hiển thị toast thành công");
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
      {(loading || updateLoading) && console.log("SkillsForm rendering: loading active", {loading, updateLoading})}
      
      <LoadingOverlay 
        isLoading={loading || updateLoading} 
        message="Đang lưu kỹ năng..." 
      />
      
      <h3 className="font-bold text-lg">Kỹ năng</h3>
      <p>Thêm các kỹ năng của bạn</p>
      <div>
        {skillList.map((item, index) => (
          <div key={index} className="mt-5 border p-3 shadow-md rounded-lg">
            <div className="">
              <div>
                <label className="text-xs mb-1">Tên kỹ năng</label>
                <Input
                  name="name"
                  value={item?.name || ""}
                  onChange={(event) => handleChange(index, event)}
                />
              </div>
              <div className="mt-2">
                <label className="text-xs mb-1">Level</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={item.rating === 1 ? "default" : "outline"}
                    onClick={() => handleLevel(index, 1)}
                  >
                    Beginner
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={item.rating === 2 ? "default" : "outline"}
                    onClick={() => handleLevel(index, 2)}
                  >
                    Elementary
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={item.rating === 3 ? "default" : "outline"}
                    onClick={() => handleLevel(index, 3)}
                  >
                    Intermediate
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={item.rating === 4 ? "default" : "outline"}
                    onClick={() => handleLevel(index, 4)}
                  >
                    Advanced
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={item.rating === 5 ? "default" : "outline"}
                    onClick={() => handleLevel(index, 5)}
                  >
                    Expert
                  </Button>
                </div>
                {item.rating > 0 && (
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-600">
                      {getLevelNameFromRating(item.rating)}
                    </div>
                    <div className="relative w-full max-w-[200px] h-2 bg-gray-200 rounded-full">
                      <div
                        className="absolute top-0 left-0 h-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: '#8b5cf6',
                          width: `${item.rating * 20}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewSkill}>
            + Thêm kỹ năng
          </Button>
          <Button variant="outline" onClick={RemoveSkill}>
            - Xóa kỹ năng
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

export default SkillsForm;
