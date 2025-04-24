
import React, { useContext, useEffect, useState, memo } from "react";

import { CVInfoContext } from "../../context/CVInfoContext";
import PersonalDetail from "./Preview/PersonalDetail";
import SummeryPreview from "./Preview/SummeryPreview";
import ExperiencePreview from "./Preview/ExperiencePreview";
import EducationPreview from "./Preview/EducationPreview";
import SkillsPreview from "./Preview/SkillsPreview";

// Create memoized child components for better performance
const MemoizedPersonalDetail = memo(PersonalDetail);
const MemoizedSummeryPreview = memo(SummeryPreview);
const MemoizedExperiencePreview = memo(ExperiencePreview);
const MemoizedEducationPreview = memo(EducationPreview);
const MemoizedSkillsPreview = memo(SkillsPreview);

const CVPreview = () => {
  const { cvInfo } = useContext(CVInfoContext);
  const [currentTheme, setCurrentTheme] = useState(cvInfo?.themeColor || "#3357FF");
  const [localCvInfo, setLocalCvInfo] = useState(cvInfo || {});
  
  // Update local state when context changes
  useEffect(() => {
    console.log("CVPreview: cvInfo changed", cvInfo);
    setLocalCvInfo({...cvInfo});
    
    if (cvInfo?.themeColor) {
      setCurrentTheme(cvInfo.themeColor);
    }
  }, [cvInfo]);

  // Force re-render every time cvInfo changes
  const previewKey = JSON.stringify(localCvInfo);
  
  return (
    <div
      key={previewKey}
      className="shadow-lg h-full p-10 border-t-[20px] transition-all duration-300 ease-in-out"
      style={{
        borderColor: currentTheme,
        backgroundColor: 'white',
      }}
    >
      <MemoizedPersonalDetail cvInfo={{...localCvInfo, themeColor: currentTheme}} />
      <MemoizedSummeryPreview cvInfo={localCvInfo} />
      <MemoizedExperiencePreview cvInfo={localCvInfo} />
      <MemoizedEducationPreview cvInfo={localCvInfo} />
      <MemoizedSkillsPreview cvInfo={localCvInfo} />
    </div>
  );
};

export default CVPreview;
