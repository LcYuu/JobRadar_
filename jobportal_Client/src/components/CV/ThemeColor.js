
import React, { useContext, useState, useEffect } from "react";

import { Button } from "../../ui/button";
import { LayoutGrid } from "lucide-react";
import { CVInfoContext } from "../../context/CVInfoContext";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateCV } from "../../redux/GeneratedCV/generated_cv.thunk";

const ThemeColor = () => {
  const colors = [

    "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF",
    "#33FFA1", "#FF7133", "#71FF33", "#7133FF", "#FF3371",
    "#33FF71", "#3371FF", "#A1FF33", "#33A1FF", "#FF5733",
    "#5733FF", "#33FF5A", "#5A33FF", "#FF335A", "#335AFF",
  ];

  const { cvInfo, setCvInfo } = useContext(CVInfoContext);
  const [selectedColor, setSelectedColor] = useState(cvInfo?.themeColor || colors[0]);
  const [isOpen, setIsOpen] = useState(false);
  const { genCvId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (cvInfo?.themeColor) {
      setSelectedColor(cvInfo.themeColor);
    }
  }, [cvInfo?.themeColor]);

  const onColorSelect = async (color) => {
    // Update local state first for immediate feedback
    setSelectedColor(color);
    setIsOpen(false);
    
    // Update context immediately
    const updatedCvInfo = {
      ...cvInfo,
      themeColor: color,
    };
    setCvInfo(updatedCvInfo);

    // Then update the backend
    try {
      const cvData = JSON.stringify({
        ...updatedCvInfo,
        themeColor: color,
      }).replace(/"/g, '\\"');
      
      await dispatch(
        updateCV({
          genCvId: genCvId,
          cvData: `{ \"cvContent\": \"${cvData}\" }`,
        })
      );
    } catch (error) {
      console.error("Error updating theme color:", error);
      // Revert to previous state if update fails
      setCvInfo(cvInfo);
      setSelectedColor(cvInfo?.themeColor || colors[0]);
    }
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.theme-color-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative theme-color-container">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex gap-2 items-center"
        style={{
          borderColor: selectedColor,
          color: selectedColor
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <LayoutGrid style={{ color: selectedColor }} /> 
        Theme
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] bg-white rounded-lg shadow-lg p-4 z-50 border">
          <h2 className="mb-2 text-sm font-bold">Select Theme Color</h2>
          <div className="grid grid-cols-5 gap-3" style={{ width: '256px' }}>
            {colors.map((color, index) => (
              <div
                key={index}
                onClick={() => onColorSelect(color)}
                className={`h-8 w-8 rounded-full cursor-pointer transition-all duration-200
                  ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'}
                `}
                style={{
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeColor;
