
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { debounce } from "lodash";

import FormSection from "../../components/CV/FormSection";
import CVPreview from "../../components/CV/CVPreview";
import { CVInfoContext } from "../../context/CVInfoContext";
import { getGenCVById } from "../../redux/GeneratedCV/generated_cv.thunk";
import { resetGenCv } from "../../redux/GeneratedCV/generated_cvSlice";
import "./CVEditor.css"; // Import CSS
import { LoadingProvider } from "../../context/LoadingContext";
import LoadingOverlay from "../../components/CV/LoadingOverlay";

const CVEditor = () => {
  const { genCvId } = useParams();
  const dispatch = useDispatch();
  const { genCv, loading, error } = useSelector((store) => store.genCV);
  const [cvInfo, setCvInfo] = useState({});
  // Đặt minLoading thành true ngay từ đầu nếu có genCvId
  const [minLoading, setMinLoading] = useState(!!genCvId);
  // State để theo dõi trạng thái đang lưu
  const [globalSaving, setGlobalSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");
  
  console.log("CVEditor rendered, genCv:", genCv);
  
  const fetchCV = useMemo(
    () =>
      debounce((id) => {
        setMinLoading(true);
        setLoadingMessage("Đang tải CV...");
        dispatch(getGenCVById(id))
          .unwrap()
          .catch((err) => {
            if (!toast.isActive("cv-error")) {
              toast.error("Không thể tải dữ liệu CV: " + (err.message || err), {
                toastId: "cv-error",
              });
            }
          })
          .finally(() => {
            setTimeout(() => {
              setMinLoading(false);
            }, 1000); // Loading tối thiểu 1000ms
          });
      }, 300),
    [dispatch]
  );

  useEffect(() => {
    if (genCvId) {
      setCvInfo({}); // Reset cvInfo
      dispatch(resetGenCv()); // Reset genCv
      fetchCV(genCvId);
    }
    return () => fetchCV.cancel(); // Hủy debounce khi unmount
  }, [dispatch, genCvId, fetchCV]);

  useEffect(() => {
    console.log("useEffect for genCv triggered, genCv:", genCv);
    if (genCv && Object.keys(genCv).length > 0 && genCv.cvContent) {
      console.log("🚀 Dữ liệu từ Redux store:", genCv);
      try {
        const jsonCv = JSON.parse(
          genCv.cvContent.replace(/^"|"$/g, "") || "{}"
        );
        const newCvInfo = {
          firstName: "",
          lastName: "",
          jobTitle: "",
          address: "",
          phone: "",
          email: "",
          profileImage: "",
          themeColor: "",
          ...jsonCv,
        };
        setCvInfo((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newCvInfo)) {
            return newCvInfo;
          }
          return prev;
        });
      } catch (error) {
        console.error("Error parsing cvContent:", error);
        setCvInfo({
          firstName: "",
          lastName: "",
          jobTitle: "",
          address: "",
          phone: "",
          email: "",
          profileImage: "",
          themeColor: "",
        });
        toast.error("Dữ liệu CV không hợp lệ", { toastId: "cv-error" });
      }
    } else if (!loading && !minLoading) {
      setCvInfo({
        firstName: "",
        lastName: "",
        jobTitle: "",
        address: "",
        phone: "",
        email: "",
        profileImage: "",
        themeColor: "",
      });
    }
  }, [genCv, loading, minLoading]);

  // Hàm này sẽ được truyền vào context để các component con có thể gọi khi đang lưu
  const handleSaving = (isSaving, message = "Đang lưu...") => {
    console.log("CVEditor: handleSaving called", { isSaving, message });
    setGlobalSaving(isSaving);
    setLoadingMessage(message);
  };

  return (
    <LoadingProvider>
      <CVInfoContext.Provider value={{ cvInfo, setCvInfo, onSaving: handleSaving }}>
        <div className="relative grid grid-cols-1 md:grid-cols-2 p-10 gap-10 min-h-screen">
          {/* Global loading overlay - chỉ hiển thị khi loading ban đầu hoặc khi không có form nào đang lưu */}
          {(loading || minLoading) && !globalSaving && (
            <LoadingOverlay 
              isLoading={true} 
              message={loadingMessage}
              scope="global"
            />
          )}
          
          {/* Chỉ hiển thị nội dung khi KHÔNG loading ban đầu */}
          {!loading && !minLoading && (
            <>
              {error ? (
                <div className="flex items-center justify-center h-full col-span-2">
                  <p className="text-red-500">Lỗi: {error}</p>
                </div>
              ) : (
                <>
                  <FormSection />
                  <CVPreview />
                </>
              )}
            </>
          )}
        </div>
      </CVInfoContext.Provider>
    </LoadingProvider>
  );
};

export default CVEditor;
