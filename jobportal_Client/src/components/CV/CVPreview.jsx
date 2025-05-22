import React, { useContext, memo } from "react";
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
  
  // Get the theme color directly from context each render
  const currentTheme = cvInfo?.themeColor || "#3357FF";
  
  // Generate a unique key whenever cvInfo changes
  const previewKey = JSON.stringify(cvInfo);
  
  console.log("Rendering CVPreview with theme:", currentTheme);
  
  return (
    <div
      key={previewKey}
      className="shadow-lg h-full p-10 border-t-[20px] transition-all duration-300 ease-in-out"
      style={{
        borderColor: currentTheme,
        backgroundColor: 'white',
      }}
    >
      <MemoizedPersonalDetail cvInfo={{...cvInfo, themeColor: currentTheme}} />
      <MemoizedSummeryPreview cvInfo={cvInfo} />
      <MemoizedExperiencePreview cvInfo={cvInfo} />
      <MemoizedEducationPreview cvInfo={cvInfo} />
      <MemoizedSkillsPreview cvInfo={cvInfo} />
    </div>
  );
};

export default CVPreview;