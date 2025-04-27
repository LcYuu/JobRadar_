import React, { useEffect, useState } from "react";
import PersonalDetail from "./Forms/PersonalDetail";
import ExperienceForm from "./Forms/ExperienceForm";
import EducationForm from "./Forms/EducationForm";
import SkillsForm from "./Forms/SkillsForm";


import { ArrowLeft, ArrowRight, Home, LayoutGrid, User, FileText, Briefcase, GraduationCap, Star } from "lucide-react";
import { Button } from "../../ui/button";
import SummeryForm from "./Forms/SummeryForm";
import { Link, Navigate, useParams } from "react-router-dom";
import ThemeColor from "./ThemeColor";

const FormSection = () => {

  const { genCvId } = useParams();
  
  // Khóa localStorage riêng cho từng CV
  const activeFormKey = `activeFormIndex_${genCvId}`;
  
  const [activeFormIndex, setActiveFormIndex] = useState(() => {
    // Khôi phục activeFormIndex từ localStorage cho CV cụ thể
    const savedIndex = localStorage.getItem(activeFormKey);
    return savedIndex ? parseInt(savedIndex, 10) : 1;
  });
  
  const [enabledNext, setEnabledNext] = useState(true);

  // Lưu activeFormIndex vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    localStorage.setItem(activeFormKey, activeFormIndex.toString());
  }, [activeFormIndex, activeFormKey]);
  
  // Xóa dữ liệu localStorage khi component unmount hoặc khi chuyển sang view
  useEffect(() => {
    return () => {
      // Chỉ xóa khi chuyển sang tab view (activeFormIndex === 6)
      if (activeFormIndex === 6) {
        localStorage.removeItem(activeFormKey);
      }
    };
  }, [activeFormIndex, activeFormKey]);
  
  // Hàm để thay đổi tab an toàn
  const changeTab = (newIndex) => {
    setActiveFormIndex(newIndex);
    localStorage.setItem(activeFormKey, newIndex.toString());
  };

  // Danh sách các tab
  const tabs = [
    { id: 1, name: "Personal", icon: <User size={16} /> },
    { id: 2, name: "About Me", icon: <FileText size={16} /> },
    { id: 3, name: "Experience", icon: <Briefcase size={16} /> },
    { id: 4, name: "Education", icon: <GraduationCap size={16} /> },
    { id: 5, name: "Skills", icon: <Star size={16} /> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex gap-5">
          <Link to="/create-cv">
            <Button>
              <Home />
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          {activeFormIndex > 1 && (
            <Button
              size="sm"
              onClick={() => changeTab(activeFormIndex - 1)}
            >
              <ArrowLeft />
            </Button>
          )}
          <Button
            disabled={!enabledNext}
            className="flex gap-2"
            size="sm"
            onClick={() => changeTab(activeFormIndex + 1)}
          >
            Next <ArrowRight />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mt-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-1 px-4 py-2 font-medium text-sm ${
              activeFormIndex === tab.id
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-purple-500"
            }`}
            onClick={() => changeTab(tab.id)}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>
      {activeFormIndex === 1 ? (
        <PersonalDetail enabledNext={setEnabledNext} />
      ) : activeFormIndex === 2 ? (
        <SummeryForm enabledNext={setEnabledNext} />
      ) : activeFormIndex === 3 ? (
        <ExperienceForm enabledNext={setEnabledNext} />
      ) : activeFormIndex === 4 ? (
        <EducationForm enabledNext={setEnabledNext} />
      ) : activeFormIndex === 5 ? (
        <SkillsForm enabledNext={setEnabledNext} />
      ) : activeFormIndex === 6 ? (
        <Navigate to={`/create-cv/view/${genCvId}`} />
      ) : null}
    </div>
  );
};

export default FormSection;
