import React, { useContext, useEffect, useState, useRef } from "react";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { updateCV, getGenCVById } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Brain, LoaderCircle } from "lucide-react";
import LoadingOverlay from "../LoadingOverlay";

const SummeryForm = ({ enabledNext }) => {
  const { genCvId } = useParams();
  const { cvInfo, setCvInfo, onSaving } = useContext(CVInfoContext);
  const [summery, setSummery] = useState(cvInfo?.summery || "");
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const dispatch = useDispatch();
  const { genCv } = useSelector((store) => store.genCV);
  
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
        if (content.summery !== undefined) {
          console.log("Syncing summary from Redux:", content.summery);
          setSummery(content.summery);
        }
      } catch (error) {
        console.error("Error parsing cvContent in SummeryForm:", error);
      }
    }
  }, [genCv]);

  // Sync with cvInfo when it changes
  useEffect(() => {
    if (cvInfo?.summery !== undefined && !isUpdating.current) {
      console.log("Syncing summary from Context:", cvInfo.summery);
      setSummery(cvInfo.summery);
    }
  }, [cvInfo?.summery]);

  const handleSummeryChange = (e) => {
    const newSummery = e.target.value;
    setSummery(newSummery);
    
    // Set flag to prevent infinite loop
    isUpdating.current = true;
    
    // Update context immediately for real-time preview
    setCvInfo(prev => ({
      ...prev,
      summery: newSummery
    }));
    
    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
    
    // Disable next button when changes are made
    if (enabledNext) enabledNext(false);
  };

  const onSave = async () => {
    // In log để debug
    console.log("SummeryForm: onSave bắt đầu");
    
    // Đặt trạng thái loading trước - cả local và global
    setLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu thông tin giới thiệu...");
    
    // Đảm bảo loading hiển thị ít nhất 2 giây
    const startTime = Date.now();
    
    try {
      // Set flag to prevent sync conflicts
      isUpdating.current = true;
      
      // Đợi một chút để đảm bảo loading được hiển thị
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("SummeryForm: Đang cập nhật dữ liệu...");
      
      // Create updated data
      const updatedData = {
        ...cvInfo,
        summery: summery
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
      
      console.log("SummeryForm: UpdateCV đã hoàn thành, đang tải lại dữ liệu...");
      
      // Force refresh by fetching the CV again
      await dispatch(getGenCVById(genCvId));
      
      // Force re-render
      forceRerender();
      
      toast.success("Thông tin cập nhật thành công");
      enabledNext(true);
      
      // Đảm bảo loading hiển thị đủ lâu
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 2 giây
      
      console.log(`SummeryForm: Đã xử lý trong ${elapsedTime}ms, tối thiểu cần ${minLoadingTime}ms`);
      
      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        console.log(`SummeryForm: Đợi thêm ${remainingTime}ms để hiển thị loading`);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      console.log("SummeryForm: Hoàn thành, tắt loading");
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Cập nhật thất bại");
      
      // Reset updating flag in case of error
      isUpdating.current = false;
    } finally {
      // Reset updating flag
      isUpdating.current = false;
      
      // Tắt loading sau khi xử lý hoàn tất
      setLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-purple-500 border-t-4 mt-10 relative">
        {(loading || updateLoading) && console.log("SummeryForm rendering: loading active", {loading, updateLoading})}
        
        <LoadingOverlay 
          isLoading={loading || updateLoading} 
          message="Đang lưu thông tin..." 
        />
        
        <h3 className="font-bold text-lg">About me</h3>
        <p>Thêm giới thiệu về bản thân</p>

        <div className="mt-7">
          <div className="flex justify-between items-end">
            <label>Thêm giới thiệu</label>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="border-purple-500 text-purple-500 flex gap-2"
            >
              <Brain className="h-4 w-4" />
              Tạo từ AI
            </Button>
          </div>
          <Textarea
            className="mt-5"
            required
            value={summery}
            onChange={handleSummeryChange}
            placeholder="Write something about yourself..."
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Button 
            disabled={loading || updateLoading} 
            onClick={onSave}
            className="relative overflow-hidden"
          >
            {loading || updateLoading ? (
              <>
                <LoaderCircle className="animate-spin mr-2" />
                <span>Đang lưu...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummeryForm;