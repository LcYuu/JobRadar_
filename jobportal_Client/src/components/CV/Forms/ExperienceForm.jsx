import React, { useContext, useEffect, useState, useRef } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Checkbox } from "../../../ui/checkbox";
import { Plus, Minus } from "lucide-react";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { LoaderCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCV,
  getGenCVById,
} from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingOverlay from "../LoadingOverlay";
import RichTextEditor from "../RichTextEditor";

const ExperienceForm = ({ enabledNext }) => {
  const [expList, setExpList] = useState([]);
  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState([]); // Track which fields have been touched

  const dispatch = useDispatch();
  const { genCvId } = useParams();
  const { cvInfo, setCvInfo, onSaving } = useContext(CVInfoContext);
  const { genCv } = useSelector((store) => store.genCV);

  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const isUpdating = useRef(false);

  useEffect(() => {
    if (genCv && genCv.cvContent && !isUpdating.current) {
      try {
        const content = JSON.parse(
          genCv.cvContent.replace(/^"|"$/g, "") || "{}"
        );
        if (content.experience && Array.isArray(content.experience)) {
          console.log("Syncing experience from Redux:", content.experience);
          setExpList(content.experience);
          setErrors(new Array(content.experience.length).fill({}));
          setTouched(new Array(content.experience.length).fill({}));
        }
      } catch (error) {
        console.error("Error parsing cvContent in ExperienceForm:", error);
      }
    }
  }, [genCv]);

  useEffect(() => {
    if (
      cvInfo?.experience &&
      Array.isArray(cvInfo.experience) &&
      !isUpdating.current
    ) {
      console.log("Syncing experience from Context:", cvInfo.experience);
      setExpList(cvInfo.experience);
      setErrors(new Array(cvInfo.experience.length).fill({}));
      setTouched(new Array(cvInfo.experience.length).fill({}));
    }
  }, [cvInfo?.experience]);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newEntries = [...expList];
    newEntries[index] = {
      ...newEntries[index],
      [name]: value,
    };

    isUpdating.current = true;
    setExpList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      experience: newEntries,
    }));
    
    // Mark this field as touched
    const newTouched = [...touched];
    newTouched[index] = { ...newTouched[index], [name]: true };
    setTouched(newTouched);
    
    // Validate the field as user types
    validateField(index, name, value);
    
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const validateField = (index, name, value) => {
    const newErrors = [...errors];
    const experience = expList[index];
    
    switch(name) {
      case "title":
        if (!value.trim()) {
          newErrors[index] = { ...newErrors[index], title: "Tên công việc không được để trống" };
        } else {
          delete newErrors[index].title;
        }
        break;
      
      case "companyName":
        if (!value.trim()) {
          newErrors[index] = { ...newErrors[index], companyName: "Tên công ty không được để trống" };
        } else {
          delete newErrors[index].companyName;
        }
        break;
      
      case "workSummery":
        if (!value.trim()) {
          newErrors[index] = { ...newErrors[index], workSummery: "Mô tả công việc không được để trống" };
        } else if (value.length > 500) {
          newErrors[index] = { ...newErrors[index], workSummery: "Mô tả công việc không được vượt quá 500 ký tự" };
        } else {
          delete newErrors[index].workSummery;
        }
        break;
      
      case "startDate":
        if (!value) {
          newErrors[index] = { ...newErrors[index], startDate: "Ngày bắt đầu không được để trống" };
        } else {
          const start = new Date(value);
          const today = new Date("2025-05-18");
          if (isNaN(start.getTime())) {
            newErrors[index] = { ...newErrors[index], startDate: "Ngày bắt đầu không hợp lệ" };
          } else if (start > today) {
            newErrors[index] = { ...newErrors[index], startDate: "Ngày bắt đầu không được ở tương lai" };
          } else {
            delete newErrors[index].startDate;
          }
          
          // Validate end date again if it exists
          if (experience.endDate && experience.endDate !== "Hiện tại") {
            validateField(index, "endDate", experience.endDate);
          }
        }
        break;
      
      case "endDate":
        if (!value && value !== "Hiện tại") {
          newErrors[index] = { ...newErrors[index], endDate: "Ngày kết thúc không được để trống" };
        } else if (value !== "Hiện tại") {
          const start = new Date(experience.startDate);
          const end = new Date(value);
          const today = Date.now();
          if (isNaN(end.getTime())) {
            newErrors[index] = { ...newErrors[index], endDate: "Ngày kết thúc không hợp lệ" };
          } else if (end < start) {
            newErrors[index] = { ...newErrors[index], endDate: "Ngày kết thúc không được trước ngày bắt đầu" };
          } else if (end > today) {
            newErrors[index] = { ...newErrors[index], endDate: "Ngày kết thúc không được ở tương lai" };
          } else {
            delete newErrors[index].endDate;
          }
        } else {
          delete newErrors[index].endDate;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleBlur = (index, name) => {
    const newTouched = [...touched];
    newTouched[index] = { ...newTouched[index], [name]: true };
    setTouched(newTouched);
    
    // Validate the field when it loses focus
    validateField(index, name, expList[index][name] || "");
  };

  const handleRichTextChange = (index, event) => {
    const value = event.target.value;
    const newEntries = [...expList];
    newEntries[index] = {
      ...newEntries[index],
      workSummery: value,
    };

    isUpdating.current = true;
    setExpList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      experience: newEntries,
    }));
    
    // Mark workSummery as touched
    const newTouched = [...touched];
    newTouched[index] = { ...newTouched[index], workSummery: true };
    setTouched(newTouched);
    
    // Validate workSummery
    validateField(index, "workSummery", value);
    
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const handleOngoingChange = (index, checked) => {
    const newEntries = [...expList];
    newEntries[index] = {
      ...newEntries[index],
      endDate: checked ? "Hiện tại" : "",
    };

    isUpdating.current = true;
    setExpList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      experience: newEntries,
    }));
    
    // Mark endDate as touched
    const newTouched = [...touched];
    newTouched[index] = { ...newTouched[index], endDate: true };
    setTouched(newTouched);
    
    // Validate endDate
    validateField(index, "endDate", checked ? "Hiện tại" : "");
    
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const AddNewExp = () => {
    const newEntry = {
      title: "",
      companyName: "",
      address: "",
      startDate: "",
      endDate: "",
      workSummery: "",
    };
    
    const newEntries = [...expList, newEntry];

    isUpdating.current = true;
    setExpList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      experience: newEntries,
    }));
    setErrors([...errors, {}]);
    setTouched([...touched, {}]);
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const RemoveExp = () => {
    if (expList.length <= 0) return;
    
    const newEntries = expList.slice(0, -1);
    const newErrors = errors.slice(0, -1);
    const newTouched = touched.slice(0, -1);

    isUpdating.current = true;
    setExpList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      experience: newEntries,
    }));
    setErrors(newErrors);
    setTouched(newTouched);
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const validateExperience = (experience) => {
    const newErrors = experience.map((exp, index) => {
      const errors = {};

      // Title
      if (!exp.title || !exp.title.trim()) {
        errors.title = "Tên công việc không được để trống";
      }

      // Company Name
      if (!exp.companyName || !exp.companyName.trim()) {
        errors.companyName = "Tên công ty không được để trống";
      }

      // Work Summary
      if (!exp.workSummery || !exp.workSummery.trim()) {
        errors.workSummery = "Mô tả công việc không được để trống";
      } else if (exp.workSummery.length > 500) {
        errors.workSummery = "Mô tả công việc không được vượt quá 500 ký tự";
      }

      // Start Date
      if (!exp.startDate) {
        errors.startDate = "Ngày bắt đầu không được để trống";
      } else {
        const start = new Date(exp.startDate);
        const today = new Date("2025-05-18");
        if (isNaN(start.getTime())) {
          errors.startDate = "Ngày bắt đầu không hợp lệ";
        } else if (start > today) {
          errors.startDate = "Ngày bắt đầu không được ở tương lai";
        }
      }

      // End Date
      if (!exp.endDate && exp.endDate !== "Hiện tại") {
        errors.endDate = "Ngày kết thúc không được để trống";
      } else if (exp.endDate !== "Hiện tại") {
        const start = new Date(exp.startDate);
        const end = new Date(exp.endDate);
        if (isNaN(end.getTime())) {
          errors.endDate = "Ngày kết thúc không hợp lệ";
        } else if (end < start) {
          errors.endDate = "Ngày kết thúc không được trước ngày bắt đầu";
        } 
      }

      return errors;
    });

    setErrors(newErrors);
    
    // Mark all fields as touched on validation
    const newTouched = experience.map(() => ({
      title: true,
      companyName: true,
      address: true,
      startDate: true,
      endDate: true,
      workSummery: true,
    }));
    setTouched(newTouched);

    // Show toast for each error

    return newErrors.every((error) => Object.keys(error).length === 0);
  };

  const onSave = async () => {
    console.log("ExperienceForm: onSave bắt đầu");

    if (expList.length === 0) {
      toast.error("Vui lòng thêm ít nhất một kinh nghiệm làm việc");
      return;
    }

    if (!validateExperience(expList)) {
      return;
    }

    setLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu kinh nghiệm làm việc...");

    const startTime = Date.now();

    try {
      isUpdating.current = true;
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("ExperienceForm: Đang cập nhật dữ liệu...");

      const updatedData = {
        ...cvInfo,
        experience: expList,
      };

      setCvInfo(updatedData);

      const cvData = JSON.stringify(updatedData);
      await dispatch(
        updateCV({
          genCvId: genCvId,
          cvData: `{ "cvContent": ${JSON.stringify(cvData)} }`,
        })
      );

      console.log(
        "ExperienceForm: UpdateCV đã hoàn thành, đang tải lại dữ liệu..."
      );

      await dispatch(getGenCVById(genCvId));

      enabledNext(true);
      toast.success("Thông tin cập nhật thành công");

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000;

      console.log(
        `ExperienceForm: Đã xử lý trong ${elapsedTime}ms, tối thiểu cần ${minLoadingTime}ms`
      );

      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        console.log(
          `ExperienceForm: Đợi thêm ${remainingTime}ms để hiển thị loading`
        );
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      console.log("ExperienceForm: Hoàn thành, tắt loading");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Cập nhật thất bại");
      isUpdating.current = false;
    } finally {
      isUpdating.current = false;
      setLoading(false);
      setUpdateLoading(false);
      if (onSaving) onSaving(false);
    }
  };

  // Helper function to determine if field should show error
  const shouldShowError = (index, fieldName) => {
    return touched[index]?.[fieldName] && errors[index]?.[fieldName];
  };

  // Empty experience placeholder
  const emptyExperience = (
    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500 mb-4">Chưa có kinh nghiệm làm việc nào</p>
      <Button
        variant="outline"
        onClick={AddNewExp}
        className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold px-4 py-2 rounded-md transition-colors flex items-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Thêm kinh nghiệm
      </Button>
    </div>
  );

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl border-t-4 border-purple-500 mt-10 relative max-w-4xl mx-auto">
      {(loading || updateLoading) &&
        console.log("ExperienceForm rendering: loading active", {
          loading,
          updateLoading,
        })}

      <LoadingOverlay
        isLoading={loading || updateLoading}
        message="Đang lưu kinh nghiệm làm việc..."
      />

      <h3 className="text-xl font-semibold text-gray-800">
        Kinh nghiệm làm việc
      </h3>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Thêm các kinh nghiệm làm việc để làm nổi bật hồ sơ của bạn
      </p>

      <div className="space-y-6">
        {expList.length === 0 ? (
          emptyExperience
        ) : (
          expList.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      Tên công việc (hoặc Tên project)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      name="title"
                      value={item?.title || ""}
                      onChange={(event) => handleChange(index, event)}
                      onBlur={() => handleBlur(index, "title")}
                      required
                      placeholder="Ví dụ: Backend Developer"
                      className={`w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors h-10 ${
                        shouldShowError(index, "title") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                    />
                    {shouldShowError(index, "title") && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[index].title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      Tên công ty (hoặc Tên công nghệ)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      name="companyName"
                      value={item?.companyName || ""}
                      onChange={(event) => handleChange(index, event)}
                      onBlur={() => handleBlur(index, "companyName")}
                      required
                      placeholder="Ví dụ: FPT Software"
                      className={`w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors h-10 ${
                        shouldShowError(index, "companyName") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                    />
                    {shouldShowError(index, "companyName") && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[index].companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5">
                      Vị trí (hoặc Vai trò)
                    </label>
                    <Input
                      name="address"
                      value={item?.address || ""}
                      onChange={(event) => handleChange(index, event)}
                      placeholder="Ví dụ: Thực tâp sinh"
                      className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      Ngày bắt đầu
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      name="startDate"
                      type="date"
                      value={item?.startDate || ""}
                      onChange={(event) => handleChange(index, event)}
                      onBlur={() => handleBlur(index, "startDate")}
                      required
                      className={`w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors h-10 ${
                        shouldShowError(index, "startDate") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                    />
                    {shouldShowError(index, "startDate") && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[index].startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      Ngày kết thúc
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-h-10">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={item?.endDate === "Hiện tại"}
                          onCheckedChange={(checked) =>
                            handleOngoingChange(index, checked)
                          }
                          className="h-5 w-5 border-2 border-gray-300 rounded-sm text-purple-600 focus:ring-2 focus:ring-purple-300"
                        />
                        <span className="text-sm text-gray-700">Đang làm</span>
                      </div>
                      <div className="w-full sm:w-36">
                        <Input
                          name="endDate"
                          type="date"
                          value={
                            item?.endDate === "Hiện tại"
                              ? ""
                              : item?.endDate || ""
                          }
                          onChange={(event) => handleChange(index, event)}
                          onBlur={() => handleBlur(index, "endDate")}
                          required={item?.endDate !== "Hiện tại"}
                          className={`w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-opacity h-10 ${
                            item?.endDate === "Hiện tại"
                              ? "opacity-0 pointer-events-none"
                              : "opacity-100"
                          } ${shouldShowError(index, "endDate") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                        />
                      </div>
                    </div>
                    {shouldShowError(index, "endDate") && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[index].endDate}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                    Mô tả công việc (hoặc Mô tả project)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <RichTextEditor
                    defaultValue={item?.workSummery || ""}
                    onRichTextEditorChange={(event) =>
                      handleRichTextChange(index, event)
                    }
                    onBlur={() => handleBlur(index, "workSummery")}
                    placeholder="Mô tả nhiệm vụ và thành tích chính trong công việc này"
                    className={`border-gray-300 rounded-md ${
                      shouldShowError(index, "workSummery") ? "border-red-500" : ""
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p
                      className={`text-xs ${
                        shouldShowError(index, "workSummery")
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {shouldShowError(index, "workSummery") ? errors[index].workSummery : "Tối đa 500 ký tự"}
                    </p>
                    <p
                      className={`text-xs ${
                        (item?.workSummery?.length || 0) > 500
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {(item?.workSummery?.length || 0)}/500
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={AddNewExp}
            className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold px-4 py-2.5 rounded-md transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Thêm kinh nghiệm
          </Button>
          <Button
            variant="outline"
            onClick={RemoveExp}
            disabled={expList.length <= 0}
            className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold px-4 py-2.5 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="h-5 w-5 mr-2" />
            Xóa kinh nghiệm
          </Button>
        </div>
        <Button
          disabled={loading || updateLoading}
          onClick={onSave}
          className="bg-purple-600 text-white hover:bg-purple-700 font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading || updateLoading ? (
            <>
              <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
              Đang lưu...
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