import React, { useContext, useEffect, useState, useRef } from "react";
import { Button } from "../../../ui/button";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { updateCV, getGenCVById } from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import LoadingOverlay from "../LoadingOverlay";
import RichTextEditor from "../RichTextEditor.js"; // Adjust the import path as needed

const SummaryForm = ({ enabledNext }) => {
  const { genCvId } = useParams();
  const { cvInfo, setCvInfo, onSaving } = useContext(CVInfoContext);
  const [summery, setSummary] = useState(cvInfo?.summery || "");
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [summeryError, setSummeryError] = useState("");
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
          console.log("Syncing summery from Redux:", content.summery);
          setSummary(content.summery);
          // Clear error if summary is valid
          if (content.summery.trim()) {
            setSummeryError("");
          }
        }
      } catch (error) {
        console.error("Error parsing cvContent in SummaryForm:", error);
      }
    }
  }, [genCv]);

  // Sync with cvInfo when it changes
  useEffect(() => {
    if (cvInfo?.summery !== undefined && !isUpdating.current) {
      console.log("Syncing summery from Context:", cvInfo.summery);
      setSummary(cvInfo.summery);
      // Clear error if summary is valid
      if (cvInfo.summery.trim()) {
        setSummeryError("");
      }
    }
  }, [cvInfo?.summery]);

  const validateSummary = (value) => {
    // Strip HTML tags if RichTextEditor returns HTML
    const plainText = value.replace(/<[^>]+>/g, "").trim();
    if (!plainText) {
      return "Vui lòng nhập mô tả về bản thân";
    }
    return "";
  };

  const handleSummaryChange = (e) => {
    const newSummary = e.target.value;
    console.log("New summery input:", newSummary);
    setSummary(newSummary);

    // Real-time validation
    const error = validateSummary(newSummary);
    setSummeryError(error);

    // Set flag to prevent infinite loop
    isUpdating.current = true;

    // Update context immediately for real-time preview
    setCvInfo((prev) => ({
      ...prev,
      summery: newSummary,
    }));

    // Reset flag after update
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    // Enable/disable next button based on validation
    if (enabledNext) enabledNext(!error && newSummary.trim());
  };

  const handleSummaryBlur = () => {
    // Validate on blur
    const error = validateSummary(summery);
    setSummeryError(error);
  };

  const onSave = async () => {
    console.log("SummaryForm: onSave bắt đầu, summery:", summery);

    // Validate summery
    const error = validateSummary(summery);
    if (error) {
      setSummeryError(error);
      return;
    }

    setLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu thông tin giới thiệu...");

    const startTime = Date.now();

    try {
      isUpdating.current = true;
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("SummaryForm: Đang cập nhật dữ liệu, summery length:", summery.length);

      // Create updated data
      const updatedData = {
        ...cvInfo,
        summery: summery,
      };

      // Update context immediately
      setCvInfo(updatedData);

      // Properly escape the entire JSON string for the API
      const cvData = JSON.stringify(updatedData);
      await dispatch(
        updateCV({
          genCvId: genCvId,
          cvData: `{ "cvContent": ${JSON.stringify(cvData)} }`,
        })
      );

      console.log("SummaryForm: UpdateCV đã hoàn thành, đang tải lại dữ liệu...");

      await dispatch(getGenCVById(genCvId));
      forceRerender();

      toast.success("Thông tin cập nhật thành công");
      enabledNext(true);

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000;

      console.log(`SummaryForm: Đã xử lý trong ${elapsedTime}ms, tối thiểu cần ${minLoadingTime}ms`);

      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        console.log(`SummaryForm: Đợi thêm ${remainingTime}ms để hiển thị loading`);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      console.log("SummaryForm: Hoàn thành, tắt loading");
    } catch (error) {
      console.error("Save error:", error);
      console.error("Failed summery:", summery);
      toast.error("Cập nhật thất bại");
      isUpdating.current = false;
    } finally {
      isUpdating.current = false;
      setLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-purple-500 border-t-4 mt-10 relative">
        {(loading || updateLoading) &&
          console.log("SummaryForm rendering: loading active", { loading, updateLoading })}

        <LoadingOverlay isLoading={loading || updateLoading} message="Đang lưu thông tin..." />

        <h3 className="font-bold text-lg">Giới thiệu</h3>
        <p>Thêm giới thiệu về bản thân</p>

        <div className="mt-7">
          <div className="flex justify-between items-end">
            <label>
              Thêm giới thiệu <span className="text-red-500">*</span>
            </label>
          </div>
          <RichTextEditor
            onRichTextEditorChange={handleSummaryChange}
            onBlur={handleSummaryBlur}
            defaultValue={summery}
          />
          {summeryError && (
            <p className="text-red-500 text-xs mt-1">{summeryError}</p>
          )}
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
              "Lưu"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummaryForm;