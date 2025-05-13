import React, { useState, useEffect, useMemo, useRef } from "react";
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
  
  // State cho mobile view
  const [showPreview, setShowPreview] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  
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

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50; // Minimum swipe distance required (in px)
    
    if (swipeDistance > minSwipeDistance) {
      // Swipe right-to-left (show form)
      setShowPreview(false);
    } else if (swipeDistance < -minSwipeDistance) {
      // Swipe left-to-right (show preview)
      setShowPreview(true);
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };
  
  // Toggle view button handler
  const toggleView = () => {
    setShowPreview(prev => !prev);
  };

  return (
    <LoadingProvider>
      <CVInfoContext.Provider value={{ cvInfo, setCvInfo, onSaving: handleSaving }}>
        {/* Không có loading */}
        {!loading && !minLoading && !error && (
          <div className="md:hidden flex justify-center mb-4 z-10 sticky top-0 bg-white py-2 shadow-md">
            <div className="flex space-x-2 bg-gray-200 p-1 rounded-full">
              <button 
                className={`px-4 py-2 rounded-full transition-colors ${!showPreview ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
                onClick={() => setShowPreview(false)}
              >
                Form
              </button>
              <button 
                className={`px-4 py-2 rounded-full transition-colors ${showPreview ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
                onClick={() => setShowPreview(true)}
              >
                Preview
              </button>
            </div>
          </div>
        )}
        
        <div 
          className="relative grid grid-cols-1 md:grid-cols-2 p-10 gap-10 min-h-screen"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
                  {/* Responsive mobile view with swipe */}
                  <div className={`md:block ${!showPreview ? 'block' : 'hidden'}`}>
                    <FormSection />
                  </div>
                  <div className={`md:block ${showPreview ? 'block' : 'hidden'}`}>
                    <CVPreview />
                  </div>
                </>
              )}
            </>
          )}
          
          {/* Swipe indicator for mobile */}
          {!loading && !minLoading && !error && (
            <div className="fixed bottom-5 left-0 right-0 flex justify-center md:hidden">
              <div className="text-sm text-gray-500 bg-white bg-opacity-70 px-3 py-1 rounded-full shadow">
                {showPreview ? 'Quẹt sang trái để xem Form' : 'Quẹt sang phải để xem Preview'}
              </div>
            </div>
          )}
        </div>
      </CVInfoContext.Provider>
    </LoadingProvider>
  );
};

export default CVEditor;