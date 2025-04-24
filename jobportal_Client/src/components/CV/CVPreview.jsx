import React, { useContext } from "react";
import { CVInfoContext } from "../../context/CVInfoContext";
import PersonalDetail from "./Preview/PersonalDetail";
import SummeryPreview from "./Preview/SummeryPreview";
import ExperiencePreview from "./Preview/ExperiencePreview";
import EducationPreview from "./Preview/EducationPreview";
import SkillsPreview from "./Preview/SkillsPreview";

const CVPreview = () => {
  const { cvInfo, setCVInfo } = useContext(CVInfoContext);
  
  return (
    <div
      className="shadow-lg h-full p-10 border-t-[20px]"
      style={{
        borderColor: cvInfo?.themeColor,
      }}
    >
      <PersonalDetail cvInfo={cvInfo} />

      <SummeryPreview cvInfo={cvInfo}/>

      <ExperiencePreview cvInfo={cvInfo}/>

      <EducationPreview cvInfo={cvInfo}/>

      <SkillsPreview cvInfo={cvInfo}/>
    </div>
  );
};

export default CVPreview;
