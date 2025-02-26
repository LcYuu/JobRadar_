import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import FormSection from "../../components/CV/FormSection";
import CVPreview from "../../components/CV/CVPreview";
import { CVInfoContext } from "../../context/CVInfoContext";
import { getGenCVById } from "../../redux/GeneratedCV/generated_cv.thunk";

const CVEditor = () => {
  const { genCvId } = useParams();

  const dispatch = useDispatch();
  const { genCv, loading } = useSelector((store) => store.genCV);

  // Set giá trị mặc định để tránh lỗi render
  const [cvInfo, setCvInfo] = useState(null);
  

  useEffect(() => {
    if (genCvId) {
      dispatch(getGenCVById(genCvId));
    }
  }, [dispatch, genCvId]);

  useEffect(() => {
    if (genCv && Object.keys(genCv).length > 0) {
      console.log("🚀 Dữ liệu từ Redux store:", genCv);
      const jsonCv = JSON.parse(genCv?.cvContent.replace(/^"|"$/g, ""))
      setCvInfo(jsonCv);
    }
  }, [genCv]);


  return (
    <CVInfoContext.Provider value={{ cvInfo, setCvInfo }}>
      <div className="grid grid-cols-1 md:grid-cols-2 p-10 gap-10">
        {loading ? <p>Đang tải...</p> : <>
          <FormSection />
          <CVPreview />
        </>}
      </div>
    </CVInfoContext.Provider>
  );
};

export default CVEditor;
