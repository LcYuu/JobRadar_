import React, { useContext, useEffect, useState, useRef } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Checkbox } from "../../../ui/checkbox";
import { Plus, Minus, LoaderCircle } from "lucide-react";
import { CVInfoContext } from "../../../context/CVInfoContext";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCV,
  getGenCVById,
} from "../../../redux/GeneratedCV/generated_cv.thunk";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingOverlay from "../LoadingOverlay";
import RichTextEditor from "../RichTextEditor"; // Import the RichTextEditor component

const EducationForm = ({ enabledNext }) => {
  const [eduList, setEduList] = useState([]);
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
        if (content.education && Array.isArray(content.education)) {
          setEduList(content.education);
          setErrors(new Array(content.education.length).fill({}));
          setTouched(new Array(content.education.length).fill({}));
        }
      } catch (error) {
        console.error("Error parsing cvContent in EducationForm:", error);
      }
    }
  }, [genCv]);

  useEffect(() => {
    if (
      cvInfo?.education &&
      Array.isArray(cvInfo.education) &&
      !isUpdating.current
    ) {
      setEduList(cvInfo.education);
      setErrors(new Array(cvInfo.education.length).fill({}));
      setTouched(new Array(cvInfo.education.length).fill({}));
    }
  }, [cvInfo?.education]);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newEntries = [...eduList];
    newEntries[index] = {
      ...newEntries[index],
      [name]: value,
    };

    isUpdating.current = true;
    setEduList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      education: newEntries,
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

  // Handle the rich text editor change specifically
  const handleRichTextChange = (index, event) => {
    const value = event.target.value;
    const newEntries = [...eduList];
    newEntries[index] = {
      ...newEntries[index],
      description: value,
    };

    isUpdating.current = true;
    setEduList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      education: newEntries,
    }));
    
    // Mark description as touched
    const newTouched = [...touched];
    newTouched[index] = { ...newTouched[index], description: true };
    setTouched(newTouched);
    
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const validateField = (index, name, value) => {
    const newErrors = [...errors];
    const education = eduList[index];
    
    switch(name) {
      case "universityName":
        if (!value.trim()) {
          newErrors[index] = { ...newErrors[index], universityName: "Tên trường không được để trống" };
        } else {
          delete newErrors[index].universityName;
        }
        break;
      
      case "degree":
        if (!value.trim()) {
          newErrors[index] = { ...newErrors[index], degree: "Bằng cấp không được để trống" };
        } else {
          delete newErrors[index].degree;
        }
        break;
      
      case "startDate":
        if (!value) {
          newErrors[index] = { ...newErrors[index], startDate: "Ngày bắt đầu không được để trống" };
        } else {
          const start = new Date(value);
          const today = new Date();
          if (isNaN(start.getTime())) {
            newErrors[index] = { ...newErrors[index], startDate: "Ngày bắt đầu không hợp lệ" };
          } else if (start > today) {
            newErrors[index] = { ...newErrors[index], startDate: "Ngày bắt đầu không được ở tương lai" };
          } else {
            delete newErrors[index].startDate;
          }
          
          // Validate end date again if it exists
          if (education.endDate && education.endDate !== "Hiện tại") {
            validateField(index, "endDate", education.endDate);
          }
        }
        break;
      
      case "endDate":
        if (!value && value !== "Hiện tại") {
          newErrors[index] = { ...newErrors[index], endDate: "Ngày kết thúc không được để trống" };
        } else if (value !== "Hiện tại") {
          const start = new Date(education.startDate);
          const end = new Date(value);
          const today = new Date();
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
    validateField(index, name, eduList[index][name] || "");
  };

  const handleOngoingChange = (index, checked) => {
    const newEntries = [...eduList];
    newEntries[index] = {
      ...newEntries[index],
      endDate: checked ? "Hiện tại" : "",
    };

    isUpdating.current = true;
    setEduList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      education: newEntries,
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

  const AddNewEducation = () => {
    const newEntry = {
      universityName: "",
      degree: "",
      major: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    
    const newEntries = [...eduList, newEntry];

    isUpdating.current = true;
    setEduList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      education: newEntries,
    }));
    setErrors([...errors, {}]);
    setTouched([...touched, {}]);
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const RemoveEducation = () => {
    if (eduList.length <= 0) return;
    
    const newEntries = eduList.slice(0, -1);
    const newErrors = errors.slice(0, -1);
    const newTouched = touched.slice(0, -1);

    isUpdating.current = true;
    setEduList(newEntries);
    setCvInfo((prev) => ({
      ...prev,
      education: newEntries,
    }));
    setErrors(newErrors);
    setTouched(newTouched);
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);

    if (enabledNext) enabledNext(false);
  };

  const validateEducation = (education) => {
    const newErrors = education.map((edu, index) => {
      const errors = {};

      // University Name
      if (!edu.universityName || !edu.universityName.trim()) {
        errors.universityName = "Tên trường không được để trống";
      }

      // Degree
      if (!edu.degree || !edu.degree.trim()) {
        errors.degree = "Bằng cấp không được để trống";
      }

      // Start Date
      if (!edu.startDate) {
        errors.startDate = "Ngày bắt đầu không được để trống";
      } else {
        const start = new Date(edu.startDate);
        const today = new Date();
        if (isNaN(start.getTime())) {
          errors.startDate = "Ngày bắt đầu không hợp lệ";
        } else if (start > today) {
          errors.startDate = "Ngày bắt đầu không được ở tương lai";
        }
      }

      // End Date
      if (!edu.endDate && edu.endDate !== "Hiện tại") {
        errors.endDate = "Ngày kết thúc không được để trống";
      } else if (edu.endDate !== "Hiện tại") {
        const start = new Date(edu.startDate);
        const end = new Date(edu.endDate);
        const today = new Date();
        if (isNaN(end.getTime())) {
          errors.endDate = "Ngày kết thúc không hợp lệ";
        } else if (end < start) {
          errors.endDate = "Ngày kết thúc không được trước ngày bắt đầu";
        } else if (end > today) {
          errors.endDate = "Ngày kết thúc không được ở tương lai";
        }
      }

      return errors;
    });

    setErrors(newErrors);
    
    // Mark all fields as touched on validation
    const newTouched = education.map(() => ({
      universityName: true,
      degree: true,
      major: true,
      startDate: true,
      endDate: true,
      description: true,
    }));
    setTouched(newTouched);

    return newErrors.every((error) => Object.keys(error).length === 0);
  };

  const onSave = async () => {
    if (eduList.length === 0) {
      toast.error("Vui lòng thêm ít nhất một thông tin học vấn");
      return;
    }

    if (!validateEducation(eduList)) {
      return;
    }

    setLoading(true);
    setUpdateLoading(true);
    if (onSaving) onSaving(true, "Đang lưu học vấn...");

    const startTime = Date.now();

    try {
      isUpdating.current = true;
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedData = {
        ...cvInfo,
        education: eduList,
      };

      setCvInfo(updatedData);

      const cvData = JSON.stringify(updatedData);
      await dispatch(
        updateCV({
          genCvId: genCvId,
          cvData: `{ "cvContent": ${JSON.stringify(cvData)} }`,
        })
      );

      await dispatch(getGenCVById(genCvId));

      enabledNext(true);
      toast.success("Thông tin cập nhật thành công");

      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000;

      if (elapsedTime < minLoadingTime) {
        const remainingTime = minLoadingTime - elapsedTime;
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
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

  // Empty education placeholder
  const emptyEducation = (
    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500 mb-4">Chưa có thông tin học vấn nào</p>
      <Button
        variant="outline"
        onClick={AddNewEducation}
        className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold px-4 py-2 rounded-md transition-colors flex items-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Thêm học vấn
      </Button>
    </div>
  );

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl border-t-4 border-purple-500 mt-10 relative max-w-4xl mx-auto">
      <LoadingOverlay
        isLoading={loading || updateLoading}
        message="Đang lưu học vấn..."
      />

      <h3 className="text-xl font-semibold text-gray-800">Học vấn</h3>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Thêm chi tiết trình độ học vấn để hoàn thiện CV của bạn
      </p>

      <div className="space-y-6">
        {eduList.length === 0 ? (
          emptyEducation
        ) : (
          eduList.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      Tên trường
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      name="universityName"
                      value={item?.universityName || ""}
                      onChange={(event) => handleChange(index, event)}
                      onBlur={() => handleBlur(index, "universityName")}
                      required
                      placeholder="Nhập tên trường"
                      className={`w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors h-10 ${
                        shouldShowError(index, "universityName") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                    />
                    {shouldShowError(index, "universityName") && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[index].universityName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      Bằng cấp
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      name="degree"
                      value={item?.degree || ""}
                      onChange={(event) => handleChange(index, event)}
                      onBlur={() => handleBlur(index, "degree")}
                      required
                      placeholder="Nhập bằng cấp"
                      className={`w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors h-10 ${
                        shouldShowError(index, "degree") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                    />
                    {shouldShowError(index, "degree") && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[index].degree}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5">
                    Lĩnh vực
                  </label>
                  <Input
                    name="major"
                    value={item?.major || ""}
                    onChange={(event) => handleChange(index, event)}
                    placeholder="Nhập lĩnh vực chuyên môn"
                    className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-colors h-10"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
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
                        <span className="text-sm text-gray-700">Đang học</span>
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
                  <label className="text-sm font-semibold text-gray-700 mb-1.5">
                    Mô tả
                  </label>
                  {/* Replace textarea with RichTextEditor */}
                  <RichTextEditor
                    onRichTextEditorChange={(event) => handleRichTextChange(index, event)}
                    defaultValue={item?.description || ""}
                  />
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
            onClick={AddNewEducation}
            className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold px-4 py-2.5 rounded-md transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Thêm học vấn
          </Button>
          <Button
            variant="outline"
            onClick={RemoveEducation}
            disabled={eduList.length <= 0}
            className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold px-4 py-2.5 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="h-5 w-5 mr-2" />
            Xóa học vấn
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

export default EducationForm;